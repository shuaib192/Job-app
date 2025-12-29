import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { Trash2, Users, Eye } from 'lucide-react-native';

export default function MyJobsScreen() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            // Assuming we can filter jobs by current user or create a new endpoint.
            // Using existing /jobs endpoint and filtering for now, or creating a new endpoint /jobs/my
            // Let's assume we filter or backend supports it. Ideally backend should have /jobs/me
            // Since I don't recall /jobs/me, I'll filter client side for now OR check backend.
            // Backend JobController::index doesn't filter by 'me'.
            // I should probably add `employer_id` filter to index or a new endpoint.
            // For now, let's try `GET /jobs?employer_id=ME` if supported, or just fetch all and filter.
            // Actually, let's create a new endpoint in backend quickly or just filter client side if list is small.
            // Let's filter client side for safety first since I didn't edit backend for /jobs/me.
            // Wait, JobController::index handles `request->has('type')` etc.
            // I will update JobController to support `employer_id` or `my_jobs`.
            // For now, I'll fetch `/jobs` and filter by user.id in render if easy, but pagination makes that hard.
            // Better: Update Backend to support ?my_jobs=true.

            const response = await client.get('/jobs?my_jobs=true'); // I will add this support
            setJobs(response.data.data || []);
        } catch (err) {
            console.log('Error fetching my jobs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Job',
            'Are you sure? This will remove the job and all applications.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/jobs/${id}`);
                            setJobs(prev => prev.filter(j => j.id !== id));
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete job');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.title}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Trash2 size={20} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
            <Text style={styles.company}>{item.company?.name || 'Posted as Individual'}</Text>
            <Text style={styles.date}>Posted: {new Date(item.created_at).toLocaleDateString()}</Text>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/job/${item.id}`)}
                >
                    <Eye size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}>View Job</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.applicantButton]}
                    onPress={() => router.push(`/job/applications/${item.id}`)}
                >
                    <Users size={18} color={theme.colors.white} />
                    <Text style={[styles.actionText, { color: theme.colors.white }]}>
                        Applicants ({item.applications_count || 0})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={jobs}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyJobs} />}
                ListEmptyComponent={
                    !loading ? (
                        <Text style={styles.emptyText}>You haven't posted any jobs yet.</Text>
                    ) : null
                }
            />
            {loading && <ActivityIndicator style={styles.loader} color={theme.colors.primary} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    list: {
        padding: theme.spacing.md,
    },
    loader: {
        marginTop: 20,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        ...theme.typography.h3,
        fontSize: 18,
        flex: 1,
        marginRight: 8,
    },
    company: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    date: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.primaryLight,
    },
    applicantButton: {
        backgroundColor: theme.colors.primary,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        marginTop: 40,
    },
});
