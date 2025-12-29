import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react-native';

export default function ApplicationsScreen() {
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await client.get('/jobs/applications');
            setApplications(response.data || []);
        } catch (err) {
            console.log('Applications error:', err);
            // Mock data
            setApplications([
                {
                    id: 1,
                    job: {
                        id: 1,
                        title: 'Senior Software Engineer',
                        employer: { name: 'Tech Corp' },
                        location: 'Lagos, Nigeria',
                    },
                    status: 'pending',
                    applied_at: new Date().toISOString(),
                },
                {
                    id: 2,
                    job: {
                        id: 2,
                        title: 'Product Designer',
                        employer: { name: 'Design Studio' },
                        location: 'Remote',
                    },
                    status: 'reviewed',
                    applied_at: new Date(Date.now() - 86400000 * 2).toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} color="#F59E0B" />;
            case 'reviewed':
                return <CheckCircle size={16} color="#3B82F6" />;
            case 'accepted':
                return <CheckCircle size={16} color="#10B981" />;
            case 'rejected':
                return <XCircle size={16} color="#EF4444" />;
            default:
                return <Clock size={16} color={theme.colors.textMuted} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#FEF3C7';
            case 'reviewed':
                return '#DBEAFE';
            case 'accepted':
                return '#D1FAE5';
            case 'rejected':
                return '#FEE2E2';
            default:
                return theme.colors.surface;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderApplication = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.applicationCard}
            onPress={() => router.push(`/job/${item.job.id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Briefcase size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.jobTitle}>{item.job.title}</Text>
                    <Text style={styles.companyName}>{item.job.employer?.name}</Text>
                    <Text style={styles.location}>{item.job.location}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    {getStatusIcon(item.status)}
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.dateText}>Applied {formatDate(item.applied_at)}</Text>
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
                    <Text style={styles.headerTitle}>My Applications</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={applications}
                        renderItem={renderApplication}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Briefcase size={48} color={theme.colors.textMuted} />
                                <Text style={styles.emptyText}>No applications yet</Text>
                                <Text style={styles.emptySubtext}>Start applying to jobs to see them here</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    backButton: {
        padding: 8,
    },
    list: {
        padding: theme.spacing.lg,
        flexGrow: 1,
    },
    applicationCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    headerInfo: {
        flex: 1,
    },
    jobTitle: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    companyName: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    location: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text,
    },
    dateText: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    emptyText: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
    },
    emptySubtext: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
    },
});
