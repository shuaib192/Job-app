import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Search, Briefcase, User } from 'lucide-react-native';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'people' | 'jobs'>('people');
    const [recentSearches, setRecentSearches] = useState<string[]>(['React Developer', 'Lagos', 'UI/UX']);
    const [filters, setFilters] = useState<string[]>([]);

    const filterChips = activeTab === 'people'
        ? ['Nearby', 'Open to work', 'Expert']
        : ['Full-time', 'Remote', 'Freelance'];

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await client.get(`/feed/search`, {
                params: {
                    q: searchQuery,
                    type: activeTab,
                    filters: filters.join(',')
                }
            });
            setResults(response.data || []);

            if (searchQuery.length > 3 && !recentSearches.includes(searchQuery)) {
                setRecentSearches(prev => [searchQuery, ...prev].slice(0, 5));
            }
        } catch (err) {
            console.log('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderPerson = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultCard}
            onPress={() => router.push(`/profile/${item.id}`)}
        >
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.name?.[0] || 'U'}</Text>
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultDetail}>{item.profile?.industry || 'Professional'}</Text>
                <Text style={styles.resultLocation}>{item.location}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderJob = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultCard}
            onPress={() => router.push(`/job/${item.id}`)}
        >
            <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primaryLight }]}>
                <Briefcase size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.title}</Text>
                <Text style={styles.resultDetail}>{item.employer?.name}</Text>
                <Text style={styles.resultLocation}>{item.location}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.searchContainer}>
                        <Search size={20} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for people or jobs..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={query}
                            onChangeText={(text) => {
                                setQuery(text);
                                handleSearch(text);
                            }}
                            autoFocus
                        />
                    </View>
                </View>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'people' && styles.activeTab]}
                        onPress={() => setActiveTab('people')}
                    >
                        <User size={18} color={activeTab === 'people' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'people' && styles.activeTabText]}>People</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
                        onPress={() => setActiveTab('jobs')}
                    >
                        <Briefcase size={18} color={activeTab === 'jobs' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Chips */}
                <View style={styles.filterSection}>
                    <FlatList
                        data={filterChips}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.filterChip, filters.includes(item) && styles.activeFilterChip]}
                                onPress={() => {
                                    const newFilters = filters.includes(item)
                                        ? filters.filter(f => f !== item)
                                        : [...filters, item];
                                    setFilters(newFilters);
                                    handleSearch(query);
                                }}
                            >
                                <Text style={[styles.filterChipText, filters.includes(item) && styles.activeFilterChipText]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.filterList}
                    />
                </View>

                {!query && recentSearches.length > 0 && (
                    <View style={styles.recentSection}>
                        <Text style={styles.recentTitle}>Recent Searches</Text>
                        <View style={styles.recentList}>
                            {recentSearches.map((s, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.recentItem}
                                    onPress={() => {
                                        setQuery(s);
                                        handleSearch(s);
                                    }}
                                >
                                    <Search size={14} color={theme.colors.textMuted} />
                                    <Text style={styles.recentText}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        renderItem={activeTab === 'people' ? renderPerson : renderJob}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Search size={48} color={theme.colors.textMuted} />
                                <Text style={styles.emptyText}>
                                    {query ? 'No results found' : 'Start typing to search'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView >
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    backButton: {
        padding: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.xs,
    },
    activeTab: {
        backgroundColor: theme.colors.primaryLight,
    },
    tabText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.textMuted,
    },
    activeTabText: {
        color: theme.colors.primary,
    },
    list: {
        padding: theme.spacing.md,
        flexGrow: 1,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.white,
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    resultDetail: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    resultLocation: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.md,
    },
    filterSection: {
        marginBottom: theme.spacing.md,
    },
    filterList: {
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    filterChip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeFilterChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterChipText: {
        ...theme.typography.small,
        color: theme.colors.textSecondary,
    },
    activeFilterChipText: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    recentSection: {
        padding: theme.spacing.md,
    },
    recentTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    recentList: {
        gap: theme.spacing.sm,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: 8,
    },
    recentText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
});
