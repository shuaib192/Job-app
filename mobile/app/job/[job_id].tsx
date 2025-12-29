import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { MapPin, Briefcase, DollarSign, Clock, ArrowLeft, Share2, Bookmark, CheckCircle, Trash2, Users } from 'lucide-react-native';
import { useAuth } from '../../src/store/AuthContext';

export default function JobDetailsScreen() {
    const { job_id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [job_id]);

    const fetchJobDetails = async () => {
        try {
            const response = await client.get(`/jobs/${job_id}`);
            setJob(response.data);
            setApplied(response.data.has_applied);

            // Check if bookmarked
            const bookmarkedJobs = await client.get('/jobs/bookmarked');
            const isBookmarked = bookmarkedJobs.data.some((j: any) => j.id == job_id);
            setBookmarked(isBookmarked);
        } catch (err) {
            console.log('Fetch job error:', err);
            Alert.alert('Error', 'Failed to load job details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            await client.post(`/jobs/${job_id}/apply`);
            setApplied(true);
            Alert.alert('Success', 'Your application has been submitted!');
        } catch (err: any) {
            console.log('Apply error:', err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.error || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const handleBookmark = async () => {
        try {
            const response = await client.post(`/jobs/${job_id}/bookmark`);
            setBookmarked(response.data.is_bookmarked);
            Alert.alert('Success', response.data.message);
        } catch (err) {
            Alert.alert('Error', 'Failed to bookmark job');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Job',
            'Are you sure you want to delete this job listing? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/jobs/${job_id}`);
                            Alert.alert('Success', 'Job deleted successfully');
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete job');
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this job: ${job.title} at ${job.employer?.name} on NexaWork!`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!job) return null;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    {(user?.id === job.employer_id || user?.role === 'admin') && (
                        <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                            <Trash2 size={22} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                        <Share2 size={22} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleBookmark} style={styles.iconButton}>
                        <Bookmark size={22} color={bookmarked ? theme.colors.primary : theme.colors.text} fill={bookmarked ? theme.colors.primary : 'transparent'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Job Title & Company */}
                <View style={styles.heroSection}>
                    <View style={styles.companyLogo}>
                        <Text style={styles.logoText}>{job.employer?.name?.[0] || 'C'}</Text>
                    </View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <TouchableOpacity onPress={() => router.push(`/company/${job.company_id}`)}>
                        <Text style={styles.companyName}>{job.company?.name || job.employer?.name || 'Company Name'}</Text>
                    </TouchableOpacity>

                </View>

                {/* Tags/Badges */}
                <View style={styles.badgesRow}>
                    <View style={styles.badge}>
                        <MapPin size={14} color={theme.colors.primary} />
                        <Text style={styles.badgeText}>{job.location || 'Remote'}</Text>
                    </View>
                    <View style={styles.badge}>
                        <Briefcase size={14} color={theme.colors.primary} />
                        <Text style={styles.badgeText}>{job.type || 'Full-time'}</Text>
                    </View>
                    <View style={styles.badge}>
                        <DollarSign size={14} color={theme.colors.primary} />
                        <Text style={styles.badgeText}>{job.salary_range || 'Competitive'}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About the Role</Text>
                    <Text style={styles.descriptionText}>{job.description}</Text>
                </View>

                {/* Requirements */}
                {job.requirements && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        <Text style={styles.descriptionText}>{job.requirements}</Text>
                    </View>
                )}
                {/* Company Info Card */}
                {job.company && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About the Company</Text>
                        <TouchableOpacity
                            style={styles.companySummary}
                            onPress={() => router.push(`/company/${job.company_id}`)}
                        >
                            <View style={styles.companySummaryHeader}>
                                <Text style={styles.companySummaryName}>{job.company.name}</Text>
                                <Text style={styles.companySummaryIndustry}>{job.company.industry}</Text>
                            </View>
                            <Text style={styles.companySummaryDesc} numberOfLines={3}>
                                {job.company.description}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}


                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.footer}>
                {user?.id === job.employer_id ? (
                    <TouchableOpacity
                        style={[styles.applyButton, { backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.primary }]}
                        onPress={() => router.push(`/job/applications/${job.id}`)}
                    >
                        <View style={styles.row}>
                            {/* Import Users icon first, assuming I'll add it to imports next */}
                            <Text style={[styles.applyButtonText, { color: theme.colors.primary }]}>View Applicants</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.applyButton, (applied || applying) && styles.applyButtonDisabled]}
                        onPress={handleApply}
                        disabled={applied || applying}
                    >
                        {applying ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : applied ? (
                            <View style={styles.row}>
                                <CheckCircle size={20} color={theme.colors.white} />
                                <Text style={styles.applyButtonText}>Applied</Text>
                            </View>
                        ) : (
                            <Text style={styles.applyButtonText}>Apply Now</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    headerActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
    },
    content: {
        padding: theme.spacing.lg,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    companyLogo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    jobTitle: {
        ...theme.typography.h1,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    companyName: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        marginBottom: theme.spacing.md,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    badgeText: {
        ...theme.typography.captionMedium,
        color: theme.colors.textSecondary,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    descriptionText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
    },
    applyButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.md,
    },
    applyButtonDisabled: {
        backgroundColor: theme.colors.success,
        opacity: 0.9,
    },
    applyButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    companySummary: {
        backgroundColor: theme.colors.surfaceAlt,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    companySummaryHeader: {
        marginBottom: theme.spacing.xs,
    },
    companySummaryName: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    companySummaryIndustry: {
        ...theme.typography.small,
        color: theme.colors.primary,
    },
    companySummaryDesc: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    }
});

