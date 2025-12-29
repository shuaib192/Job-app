import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Briefcase, Users, Plus, ChevronRight, Clock } from 'lucide-react-native';

export default function ManageJobsScreen() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyJobs = useCallback(async () => {
        try {
            const response = await client.get('/jobs/my-posted-jobs');
            setJobs(response.data || []);
        } catch (err) {
            console.log('Error fetching my jobs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMyJobs();
    }, [fetchMyJobs]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyJobs();
    };

    const renderJob = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => router.push(`/job/applications/${item.id}`)}
        >
            <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <View style={styles.jobMeta}>
                    <View style={styles.metaItem}>
                        <Clock size={14} color={theme.colors.textMuted} />
                        <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Briefcase size={14} color={theme.colors.textMuted} />
                        <Text style={styles.metaText}>{item.type}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.applicantBadge}>
                <Users size={18} color={theme.colors.primary} />
                <Text style={styles.applicantCount}>{item.applications_count || 0}</Text>
                <ChevronRight size={18} color={theme.colors.border} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Posted Jobs</Text>
                <TouchableOpacity onPress={() => router.push('/jobs/create')} style={styles.addButton}>
                    <Plus size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJob}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Briefcase size={60} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>No Jobs Posted</Text>
                            <Text style={styles.emptySubtitle}>You haven't posted any jobs yet. Create your first posting to find talent.</Text>
                            <TouchableOpacity
                                style={styles.createBtn}
                                onPress={() => router.push('/jobs/create')}
                            >
                                <Text style={styles.createBtnText}>Post a Job</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    backButton: { padding: 4 },
    headerTitle: { ...theme.typography.h3, color: theme.colors.text },
    addButton: { padding: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: theme.spacing.md },
    jobCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        ...theme.shadows.sm,
    },
    jobInfo: { flex: 1 },
    jobTitle: { ...theme.typography.bodySemibold, color: theme.colors.text },
    jobMeta: { flexDirection: 'row', marginTop: 6, gap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { ...theme.typography.small, color: theme.colors.textMuted },
    applicantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    applicantCount: { ...theme.typography.bodySemibold, color: theme.colors.primary },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { ...theme.typography.h3, color: theme.colors.text, marginTop: 20 },
    emptySubtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 },
    createBtn: {
        marginTop: 24,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
    },
    createBtnText: { color: '#fff', fontWeight: '700' },
});
