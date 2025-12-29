import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../src/theme';
import client from '../../../src/api/client';
import { ArrowLeft, Mail, Phone, ExternalLink, CheckCircle, XCircle, Clock, FileText } from 'lucide-react-native';

export default function JobApplicationsScreen() {
    const { id } = useLocalSearchParams(); // Job ID
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplicants();
    }, [id]);

    const fetchApplicants = async () => {
        try {
            // First fetch job details to get title if needed (or backend sends it)
            // But we can get applicants directly
            const response = await client.get(`/jobs/${id}/applicants`);
            setApplications(response.data || []);

            // Fetch job info for the header
            const jobRes = await client.get(`/jobs/${id}`);
            setJobTitle(jobRes.data.title);

        } catch (err: any) {
            console.log('Error fetching applicants:', err);
            Alert.alert('Error', 'Failed to load applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (applicationId: number, status: string) => {
        try {
            await client.put(`/applications/${applicationId}/status`, { status });
            setApplications(prev => prev.map(app =>
                app.id === applicationId ? { ...app, status } : app
            ));
            Alert.alert('Success', `Application updated to ${status}`);
        } catch (err) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const renderApplicant = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => router.push(`/profile/${item.user_id}`)}
                >
                    {item.user?.avatar ? (
                        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                    ) : item.user?.profile?.avatar ? (
                        <Image source={{ uri: item.user.profile.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{item.user.name?.[0] || '?'}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.userName}>{item.user.name}</Text>
                        <Text style={styles.userHeadline}>{item.user.profile?.headline || 'No headline'}</Text>
                    </View>
                </TouchableOpacity>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.contactRow}>
                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${item.user.email}`)} style={styles.contactItem}>
                    <Mail size={16} color={theme.colors.textMuted} />
                    <Text style={styles.contactText}>{item.user.email}</Text>
                </TouchableOpacity>
            </View>

            {item.resume_path && (
                <TouchableOpacity style={styles.resumeButton}>
                    <FileText size={16} color={theme.colors.primary} />
                    <Text style={styles.resumeText}>View Resume</Text>
                </TouchableOpacity>
            )}

            <View style={styles.actions}>
                {item.status !== 'accepted' && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={() => handleUpdateStatus(item.id, 'accepted')}
                    >
                        <CheckCircle size={18} color="white" />
                        <Text style={styles.actionBtnText}>Accept</Text>
                    </TouchableOpacity>
                )}
                {item.status !== 'rejected' && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleUpdateStatus(item.id, 'rejected')}
                    >
                        <XCircle size={18} color="white" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#FEF3C7';
            case 'reviewed': return '#DBEAFE';
            case 'accepted': return '#D1FAE5';
            case 'rejected': return '#FEE2E2';
            default: return theme.colors.surface;
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={styles.headerTitle}>Applicants</Text>
                    <Text style={styles.headerSubtitle}>for {jobTitle}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={applications}
                renderItem={renderApplicant}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No applications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
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
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        backgroundColor: theme.colors.background,
    },
    backButton: {
        padding: 8,
    },
    headerTitles: {
        alignItems: 'center',
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    list: {
        padding: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: theme.spacing.sm,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    avatarText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    userName: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    userHeadline: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    contactRow: {
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.md,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    resumeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.md,
    },
    resumeText: {
        ...theme.typography.body,
        color: theme.colors.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: theme.borderRadius.md,
        gap: 6,
    },
    acceptBtn: {
        backgroundColor: theme.colors.success,
    },
    rejectBtn: {
        backgroundColor: theme.colors.error,
    },
    actionBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textMuted,
        fontSize: 16,
    },
});
