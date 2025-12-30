import React, { useEffect, useState, useCallback, memo, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Image as RNImage, Dimensions, Keyboard, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { Briefcase, MapPin, DollarSign, Clock, Bookmark, Plus, Search, Filter, AlertCircle, TrendingUp, Building2, Heart, ClipboardList, Sparkles, ChevronUp, Bell } from 'lucide-react-native';
import { useAuth } from '../../src/store/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Isolated Search Bar
const JobsSearchBar = memo(({ onSearch }: { onSearch: (query: string) => void }) => {
    const [localQuery, setLocalQuery] = useState('');

    const handleSearch = () => {
        onSearch(localQuery);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Search size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search roles, companies..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={localQuery}
                    onChangeText={setLocalQuery}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />
                {localQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setLocalQuery(''); onSearch(''); }}>
                        <View style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>✕</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.goButton} onPress={handleSearch}>
                <Text style={styles.goButtonText}>Go</Text>
            </TouchableOpacity>
        </View>
    );
});

export default function JobsScreen() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeQuery, setActiveQuery] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [aiConfig, setAiConfig] = useState<any>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchAiConfig();
    }, []);

    const fetchAiConfig = async () => {
        try {
            const response = await client.get('/ai/config');
            setAiConfig(response.data);
        } catch (err) {
            console.log('AI config fetch error:', err);
        }
    };

    const fetchJobs = useCallback(async (query = '') => {
        if (authLoading) return;
        try {
            setError(null);
            // Only show loader if we don't have jobs yet to make it feel snappier
            if (jobs.length === 0) setLoading(true);
            const url = query ? `/jobs?search=${query}` : '/jobs';
            const response = await client.get(url);
            const data = response.data?.data || response.data || [];

            // Normalize data to ensure it's an array for the FlatList
            const jobsArray = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);
            setJobs(jobsArray);
        } catch (err: any) {
            console.log('Jobs fetch error:', err);
            setError('Unable to load jobs. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [authLoading]);

    useFocusEffect(
        useCallback(() => {
            fetchJobs(activeQuery);
        }, [fetchJobs, activeQuery])
    );

    const handleToggleBookmark = async (jobId: number) => {
        try {
            // Optimistic update
            setJobs(prev => prev.map(job =>
                job.id === jobId ? { ...job, has_bookmarked: !job.has_bookmarked } : job
            ));

            await client.post(`/jobs/${jobId}/bookmark`);
        } catch (err) {
            console.error('Bookmark toggle error:', err);
            // Revert on error
            setJobs(prev => prev.map(job =>
                job.id === jobId ? { ...job, has_bookmarked: !job.has_bookmarked } : job
            ));
        }
    };

    const onSearchTrigger = (query: string) => {
        setActiveQuery(query);
        fetchJobs(query);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs(activeQuery);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Member'} 👋</Text>
                        {aiConfig?.enabled && (
                            <TouchableOpacity
                                style={styles.aiHeaderBtn}
                                onPress={() => router.push('/messages/ai')}
                            >
                                <Sparkles size={18} color={theme.colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.subtitle}>Let's find your next opportunity</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                    <View style={styles.avatarWrapper}>
                        {user?.avatar ? (
                            <RNImage source={{ uri: user.avatar }} style={styles.avatarImage} />
                        ) : user?.profile?.avatar ? (
                            <RNImage source={{ uri: user.profile.avatar }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{user?.name?.[0] || 'U'}</Text>
                            </View>
                        )}
                        <View style={styles.onlineBadge} />
                    </View>
                </TouchableOpacity>
            </View>

            <JobsSearchBar onSearch={onSearchTrigger} />

            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/jobs/saved')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                        <Bookmark size={22} color="#10B981" fill="#10B981" />
                    </View>
                    <Text style={styles.actionLabel}>Saved</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/dashboard/applications')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                        <ClipboardList size={22} color="#3B82F6" />
                    </View>
                    <Text style={styles.actionLabel}>Applied</Text>
                </TouchableOpacity>

                {(user?.role === 'employer' || user?.role === 'admin') && (
                    <>
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/jobs/manage')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F0F9FF' }]}>
                                <Briefcase size={22} color="#0EA5E9" />
                            </View>
                            <Text style={styles.actionLabel}>Manage</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/jobs/create')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
                                <Plus size={22} color="#8B5CF6" />
                            </View>
                            <Text style={styles.actionLabel}>Post Job</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity style={styles.actionItem} onPress={() => console.log('Filters')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
                        <Filter size={22} color="#F97316" />
                    </View>
                    <Text style={styles.actionLabel}>Filter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFeaturedJobs = () => {
        const featured = jobs.slice(0, 5);
        if (featured.length === 0 || activeQuery) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Opportunities</Text>
                    <Sparkles size={18} color={theme.colors.warning} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredContent}>
                    {featured.map((item) => (
                        <TouchableOpacity
                            key={`featured-${item.id}`}
                            style={styles.featuredCard}
                            onPress={() => router.push(`/job/${item.id}`)}
                        >
                            <LinearGradient
                                colors={['#6366F1', '#4F46E5']}
                                style={styles.featuredGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.featuredTop}>
                                    <View style={styles.featuredLogo}>
                                        {(item.employer?.avatar || item.employer?.profile?.avatar) ? (
                                            <RNImage
                                                source={{ uri: item.employer.avatar || item.employer.profile.avatar }}
                                                style={styles.featuredLogoImage}
                                            />
                                        ) : (
                                            <Text style={styles.featuredLogoText}>{item.employer?.name?.[0] || 'C'}</Text>
                                        )}
                                    </View>
                                    <View style={styles.featuredBadge}>
                                        <Text style={styles.featuredBadgeText}>HOT</Text>
                                    </View>
                                </View>
                                <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.featuredCompany} numberOfLines={1}>{item.employer?.name || 'Top Company'}</Text>
                                <View style={styles.featuredFooter}>
                                    <Text style={styles.featuredSalary}>{item.salary_range || 'Competitive'}</Text>
                                    <View style={styles.featuredLocation}>
                                        <MapPin size={12} color="#fff" />
                                        <Text style={styles.featuredLocationText}>{item.location || 'Remote'}</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderJobItem = ({ item, index }: { item: any, index: number }) => {
        // Skip featured items in the vertical list if not searching
        if (!activeQuery && index < 5) return null;

        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => router.push(`/job/${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.jobCardTop}>
                    <View style={styles.jobLogo}>
                        {(item.employer?.avatar || item.employer?.profile?.avatar) ? (
                            <RNImage
                                source={{ uri: item.employer.avatar || item.employer.profile.avatar }}
                                style={styles.jobLogoImage}
                            />
                        ) : (
                            <Text style={styles.jobLogoText}>{item.employer?.name?.[0] || 'C'}</Text>
                        )}
                    </View>
                    <View style={styles.jobCardMeta}>
                        <Text style={styles.jobCardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.jobCardCompany} numberOfLines={1}>{item.employer?.name || 'Company'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.bookmarkButton}
                        onPress={() => handleToggleBookmark(item.id)}
                    >
                        <Bookmark size={20} color={item.has_bookmarked ? theme.colors.primary : theme.colors.textMuted} fill={item.has_bookmarked ? theme.colors.primary : 'transparent'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.jobTags}>
                    <View style={styles.jobTag}>
                        <MapPin size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.jobTagText}>{item.location || 'Remote'}</Text>
                    </View>
                    <View style={styles.jobTag}>
                        <Clock size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.jobTagText}>{item.type || 'Full-time'}</Text>
                    </View>
                    <View style={[styles.jobTag, { backgroundColor: '#F0FDF4' }]}>
                        <DollarSign size={12} color="#10B981" />
                        <Text style={[styles.jobTagText, { color: '#10B981', fontWeight: 'bold' }]}>{item.salary_range || 'Negotiable'}</Text>
                    </View>
                </View>

                <View style={styles.jobFooter}>
                    <Text style={styles.jobPosted}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}</Text>
                    <View style={styles.applySmall}>
                        <Text style={styles.applySmallText}>View Details</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['top']}>
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Loading opportunities...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={jobs}
                        renderItem={renderJobItem}
                        keyExtractor={(item) => `job-${item.id}`}
                        ListHeaderComponent={() => (
                            <>
                                {renderHeader()}
                                {renderFeaturedJobs()}
                                {jobs.length > 5 && !activeQuery && (
                                    <View style={styles.listSectionHeader}>
                                        <Text style={styles.sectionTitle}>All Openings</Text>
                                    </View>
                                )}
                            </>
                        )}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Building2 size={60} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>{error ? 'Connection Error' : 'No Jobs Found'}</Text>
                                <Text style={styles.emptySubtitle}>{error || 'Try searching for something else or check back later.'}</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={() => fetchJobs(activeQuery)}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                        }
                        onScroll={(event) => {
                            const offsetY = event.nativeEvent.contentOffset.y;
                            setShowScrollTop(offsetY > 500);
                        }}
                        scrollEventThrottle={16}
                    />
                )}

                {showScrollTop && (
                    <TouchableOpacity
                        style={styles.scrollTopFab}
                        onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
                        activeOpacity={0.9}
                    >
                        <ChevronUp size={24} color={theme.colors.white} />
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: theme.colors.textMuted, fontWeight: '500' },
    headerContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
    aiHeaderBtn: {
        backgroundColor: '#EEF2FF',
        padding: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
    avatarWrapper: { position: 'relative' },
    avatarImage: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
    avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' },
    searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 50, ...theme.shadows.sm },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: theme.colors.text, height: '100%' },
    clearButton: { padding: 4, backgroundColor: '#F1F5F9', borderRadius: 10 },
    clearButtonText: { fontSize: 10, color: '#64748B' },
    goButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    goButtonText: { color: '#fff', fontWeight: 'bold' },
    quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
    actionItem: { alignItems: 'center', gap: 6 },
    actionIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
    actionLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
    section: { marginTop: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
    featuredContent: { paddingLeft: 20, paddingRight: 10, paddingBottom: 10 },
    featuredCard: { width: width * 0.7, height: 160, marginRight: 15, borderRadius: 24, overflow: 'hidden', ...theme.shadows.md },
    featuredGradient: { flex: 1, padding: 20, justifyContent: 'space-between' },
    featuredTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    featuredLogo: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    featuredLogoImage: { width: '100%', height: '100%' },
    featuredLogoText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    featuredBadge: { backgroundColor: '#FF4D4D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    featuredBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    featuredTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 10 },
    featuredCompany: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    featuredSalary: { color: '#fff', fontWeight: '700', fontSize: 14 },
    featuredLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    featuredLocationText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    listSectionHeader: { paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
    listContent: { paddingBottom: 100 },
    jobCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 24, padding: 20, ...theme.shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
    jobCardTop: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 15 },
    jobLogo: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    jobLogoImage: { width: '100%', height: '100%' },
    jobLogoText: { color: theme.colors.primary, fontSize: 22, fontWeight: 'bold' },
    jobCardMeta: { flex: 1 },
    jobCardTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
    jobCardCompany: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    jobTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 15 },
    jobTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    jobTagText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
    jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    jobPosted: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
    bookmarkButton: { padding: 4 },
    applySmall: { backgroundColor: theme.colors.text, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    applySmallText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginTop: 20 },
    emptySubtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
    retryButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
    retryButtonText: { color: '#fff', fontWeight: 'bold' },
    scrollTopFab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
        zIndex: 100,
    },
});
