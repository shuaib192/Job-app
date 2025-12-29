import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { Bookmark, MapPin, DollarSign, Clock, ChevronLeft, Building2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SavedJobsScreen() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSavedJobs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await client.get('/jobs/bookmarked');
            const data = response.data;
            setJobs(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Fetch saved jobs error:', err);
            setError('Unable to load saved jobs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedJobs();
    }, [fetchSavedJobs]);

    const handleRemoveBookmark = async (jobId: number) => {
        try {
            setJobs(prev => prev.filter(job => job.id !== jobId));
            await client.post(`/jobs/${jobId}/bookmark`);
        } catch (err) {
            console.error('Remove bookmark error:', err);
            fetchSavedJobs();
        }
    };

    const renderJobItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => router.push(`/job/${item.id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.jobCardTop}>
                <View style={styles.jobLogo}>
                    {(item.employer?.avatar || item.employer?.profile?.avatar) ? (
                        <Image
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
                    onPress={() => handleRemoveBookmark(item.id)}
                >
                    <Bookmark size={22} color={theme.colors.primary} fill={theme.colors.primary} />
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
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: 'Saved Jobs',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                        <ChevronLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                ),
                headerTitleStyle: { fontWeight: '800', fontSize: 18 }
            }} />

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : jobs.length === 0 ? (
                <View style={styles.centerContainer}>
                    <View style={styles.emptyIcon}>
                        <Bookmark size={40} color="#CBD5E1" />
                    </View>
                    <Text style={styles.emptyTitle}>No Saved Jobs</Text>
                    <Text style={styles.emptySubtitle}>Opportunities you bookmark will appear here.</Text>
                    <TouchableOpacity style={styles.browseButton} onPress={() => router.replace('/(tabs)/')}>
                        <Text style={styles.browseButtonText}>Browse Jobs</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJobItem}
                    keyExtractor={(item) => `saved-${item.id}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    listContent: { paddingVertical: 20 },
    jobCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 24, padding: 20, ...theme.shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
    jobCardTop: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 15 },
    jobLogo: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    jobLogoImage: { width: '100%', height: '100%' },
    jobLogoText: { color: theme.colors.primary, fontSize: 22, fontWeight: 'bold' },
    jobCardMeta: { flex: 1 },
    jobCardTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
    jobCardCompany: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    jobTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    jobTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    jobTagText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
    bookmarkButton: { padding: 4 },
    emptyIcon: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
    emptySubtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
    browseButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
    browseButtonText: { color: '#fff', fontWeight: 'bold' },
});
