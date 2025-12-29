import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { MapPin, Calendar, Clock, ChevronLeft, Building2 } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

export default function MyApplicationsScreen() {
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await client.get('/jobs/my-applications');
            setApplications(response.data || []);
        } catch (err) {
            console.log('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'accepted': return { color: '#10B981', bg: '#F0FDF4', label: 'Accepted' };
            case 'rejected': return { color: '#EF4444', bg: '#FEF2F2', label: 'Rejected' };
            case 'shortlisted': return { color: '#F59E0B', bg: '#FFFBEB', label: 'Shortlisted' };
            case 'reviewed': return { color: '#3B82F6', bg: '#EFF6FF', label: 'Reviewed' };
            default: return { color: '#64748B', bg: '#F8FAFC', label: 'Pending' };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const styles_status = getStatusStyles(item.status);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/job/${item.job?.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.employerLogo}>
                        {(item.job?.employer?.avatar || item.job?.employer?.profile?.avatar) ? (
                            <Image
                                source={{ uri: item.job.employer.avatar || item.job.employer.profile.avatar }}
                                style={styles.logoImage}
                            />
                        ) : (
                            <Text style={styles.logoPlaceholder}>{item.job?.employer?.name?.[0] || 'C'}</Text>
                        )}
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.jobTitle} numberOfLines={1}>{item.job?.title || 'Unknown Job'}</Text>
                        <Text style={styles.companyName} numberOfLines={1}>{item.job?.employer?.name || 'Top Company'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: styles_status.bg }]}>
                        <Text style={[styles.statusText, { color: styles_status.color }]}>{styles_status.label}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <MapPin size={12} color={theme.colors.textMuted} />
                        <Text style={styles.metaText}>{item.job?.location || 'Remote'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Calendar size={12} color={theme.colors.textMuted} />
                        <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                {item.feedback && (
                    <View style={styles.feedbackBox}>
                        <Text style={styles.feedbackLabel}>Feedback from employer:</Text>
                        <Text style={styles.feedbackText}>"{item.feedback}"</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: 'Applications',
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
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Building2 size={60} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>No Applications Yet</Text>
                            <Text style={styles.emptySubtitle}>Start applying to jobs to track your progress here.</Text>
                            <TouchableOpacity style={styles.browseButton} onPress={() => router.replace('/(tabs)/')}>
                                <Text style={styles.browseButtonText}>Browse Jobs</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingVertical: 20 },
    card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 24, padding: 20, ...theme.shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
    employerLogo: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#E0E7FF' },
    logoImage: { width: '100%', height: '100%' },
    logoPlaceholder: { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' },
    titleContainer: { flex: 1 },
    jobTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    companyName: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    metaRow: { flexDirection: 'row', gap: 15 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
    feedbackBox: { marginTop: 15, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
    feedbackLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 4 },
    feedbackText: { fontSize: 12, color: theme.colors.text, fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginTop: 20 },
    emptySubtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
    browseButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
    browseButtonText: { color: '#fff', fontWeight: 'bold' },
});
