import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Image as RNImage, Dimensions, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { Users, MapPin, Search, Filter, UserPlus, Heart, MessageSquare, Briefcase, Zap, Star, ShieldCheck, Clock } from 'lucide-react-native';
import { useAuth } from '../../src/store/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Isolated Search Bar
const LinkupSearchBar = memo(({ onSearch }: { onSearch: (query: string) => void }) => {
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
                    placeholder="Search name, role, industry..."
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

export default function NetworkScreen() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeQuery, setActiveQuery] = useState('');

    const fetchCandidates = useCallback(async (query = '') => {
        if (authLoading) return;
        try {
            setError(null);
            setLoading(true);
            const url = query ? `/feed/candidates?search=${query}` : '/feed/candidates';
            const response = await client.get(url);
            const data = response.data || [];
            setCandidates(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.log('Candidates fetch error:', err);
            setError('Unable to load profiles.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [authLoading]);

    useEffect(() => {
        if (!authLoading) {
            fetchCandidates();
        }
    }, [authLoading, fetchCandidates]);

    const onSearchTrigger = (query: string) => {
        setActiveQuery(query);
        fetchCandidates(query);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCandidates(activeQuery);
    };

    const handleConnect = async (userId: number, currentStatus: string) => {
        try {
            const response = await client.post(`/connections/send/${userId}`);

            // If it was pending_received, it will now be accepted
            if (currentStatus === 'pending_received' || response.data.status === 'accepted') {
                setCandidates(prev => prev.filter(c => c.id !== userId));
            } else {
                // Mark as pending_sent
                setCandidates(prev => prev.map(c =>
                    c.id === userId ? { ...c, connection_status: 'pending_sent' } : c
                ));
            }
        } catch (err) {
            console.log('Connect error:', err);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>Linkup</Text>
                    <Text style={styles.subtitle}>Discover & Connect with Professionals</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={styles.requestsButton} onPress={() => router.push('/linkup/connections')}>
                        <Users size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.requestsButton} onPress={() => router.push('/linkup/requests')}>
                        <UserPlus size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <LinkupSearchBar onSearch={onSearchTrigger} />

            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    <TouchableOpacity style={[styles.filterTag, styles.filterTagActive]}>
                        <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTag}>
                        <Text style={styles.filterText}>Recommended</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTag}>
                        <Text style={styles.filterText}>Nearby</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTag}>
                        <Text style={styles.filterText}>Same Industry</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );

    const renderCandidate = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.personCard}
            onPress={() => router.push(`/profile/${item.id}`)}
            activeOpacity={0.8}
        >
            <View style={styles.imageWrapper}>
                {item.avatar ? (
                    <RNImage source={{ uri: item.avatar }} style={styles.personImage} />
                ) : item.profile?.avatar ? (
                    <RNImage source={{ uri: item.profile.avatar }} style={styles.personImage} />
                ) : (
                    <View style={styles.personPlaceholder}>
                        <Text style={styles.personInitial}>{item.name?.[0] || 'U'}</Text>
                    </View>
                )}
                {item.is_online && <View style={styles.onlineStatus} />}
            </View>

            <View style={styles.personInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.personName} numberOfLines={1}>{item.name}</Text>
                    {item.verified && <ShieldCheck size={14} color={theme.colors.primary} fill={theme.colors.primaryLight} />}
                </View>
                <Text style={styles.personRole} numberOfLines={1}>{item.profile?.headline || item.profile?.industry || 'Professional'}</Text>

                <View style={styles.personStats}>
                    <View style={styles.statItem}>
                        <MapPin size={12} color={theme.colors.textMuted} />
                        <Text style={styles.statText}>{item.location || 'Unknown'}</Text>
                    </View>
                    {item.profile?.experience_years && (
                        <View style={styles.statItem}>
                            <Briefcase size={12} color={theme.colors.textMuted} />
                            <Text style={styles.statText}>{item.profile.experience_years}y Exp</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.actionButtons}>
                {item.connection_status === 'none' ? (
                    <TouchableOpacity style={styles.connectBtn} onPress={() => handleConnect(item.id, 'none')}>
                        <UserPlus size={20} color="#fff" />
                    </TouchableOpacity>
                ) : item.connection_status === 'pending_sent' ? (
                    <View style={[styles.connectBtn, { backgroundColor: '#F1F5F9' }]}>
                        <Clock size={20} color={theme.colors.textMuted} />
                    </View>
                ) : item.connection_status === 'pending_received' ? (
                    <TouchableOpacity style={[styles.connectBtn, { backgroundColor: theme.colors.success || '#10B981' }]} onPress={() => handleConnect(item.id, 'pending_received')}>
                        <Zap size={20} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.connectBtn, { backgroundColor: theme.colors.primaryLight }]}>
                        <ShieldCheck size={20} color={theme.colors.primary} />
                    </View>
                )}
                <TouchableOpacity style={styles.messageBtn} onPress={() => router.push(`/messages/${item.id}`)}>
                    <MessageSquare size={20} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['top']}>
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Finding best matches...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={candidates}
                        renderItem={renderCandidate}
                        keyExtractor={(item) => `person-${item.id}`}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Users size={60} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No One Found</Text>
                                <Text style={styles.emptySubtitle}>We couldn't find any professionals matching your search or location.</Text>
                                <TouchableOpacity style={styles.refreshBtnLarge} onPress={() => fetchCandidates(activeQuery)}>
                                    <Text style={styles.refreshBtnText}>Refresh Discover</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: theme.colors.textMuted, fontWeight: '500' },
    headerContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 28, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
    requestsButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
    searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 50, ...theme.shadows.sm },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: theme.colors.text, height: '100%' },
    clearButton: { padding: 4, backgroundColor: '#F1F5F9', borderRadius: 10 },
    clearButtonText: { fontSize: 10, color: '#64748B' },
    goButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    goButtonText: { color: '#fff', fontWeight: 'bold' },
    filtersWrapper: { marginTop: 5 },
    filterContent: { gap: 10 },
    filterTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
    filterTagActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
    filterTextActive: { color: '#fff' },
    listContent: { paddingBottom: 100 },
    personCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', ...theme.shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
    imageWrapper: { position: 'relative' },
    personImage: { width: 64, height: 64, borderRadius: 32 },
    personPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F3FF', justifyContent: 'center', alignItems: 'center' },
    personInitial: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary },
    onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' },
    personInfo: { flex: 1, marginLeft: 16 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    personName: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
    personRole: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    personStats: { flexDirection: 'row', gap: 12, marginTop: 8 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500' },
    actionButtons: { gap: 10 },
    connectBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
    messageBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginTop: 20 },
    emptySubtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
    refreshBtnLarge: { backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
    refreshBtnText: { color: '#fff', fontWeight: 'bold' },
});
