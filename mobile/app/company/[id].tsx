import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Building2, Globe, MapPin, Briefcase, Users, Calendar } from 'lucide-react-native';

export default function CompanyDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [company, setCompany] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompanyDetails();
    }, [id]);

    const fetchCompanyDetails = async () => {
        try {
            const [companyRes, jobsRes] = await Promise.all([
                client.get(`/companies/${id}`),
                client.get(`/companies/${id}/jobs`)
            ]);
            setCompany(companyRes.data);
            setJobs(jobsRes.data);
        } catch (err) {
            console.log('Fetch company error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
            </View>
        );
    }

    if (!company) {
        return (
            <View style={styles.centered}>
                <Text>Company not found</Text>
            </View>
        );
    }

    const renderJobItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => router.push(`/job/${item.id}`)}
        >
            <Text style={styles.jobTitle}>{item.title}</Text>
            <View style={styles.jobMeta}>
                <MapPin size={12} color={theme.colors.textMuted} />
                <Text style={styles.jobMetaText}>{item.location}</Text>
                <Text style={styles.jobMetaDot}>•</Text>
                <Text style={styles.jobMetaText}>{item.type}</Text>
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
                <Text style={styles.headerTitle} numberOfLines={1}>{company.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <Building2 size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.name}>{company.name}</Text>
                    <Text style={styles.industryText}>{company.industry}</Text>

                    <View style={styles.socialRow}>
                        <View style={styles.socialItem}>
                            <MapPin size={16} color={theme.colors.textMuted} />
                            <Text style={styles.socialText}>{company.location || 'Distributed'}</Text>
                        </View>
                        {company.website && (
                            <View style={styles.socialItem}>
                                <Globe size={16} color={theme.colors.textMuted} />
                                <Text style={styles.socialText}>{company.website.replace('https://', '')}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.descriptionText}>{company.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Open Positions ({jobs.length})</Text>
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                style={styles.jobCard}
                                onPress={() => router.push(`/job/${job.id}`)}
                            >
                                <View style={styles.jobInfo}>
                                    <Text style={styles.jobTitle}>{job.title}</Text>
                                    <Text style={styles.jobLocation}>{job.location} • {job.type}</Text>
                                </View>
                                <ArrowLeft size={20} color={theme.colors.border} style={{ transform: [{ rotate: '180deg' }] }} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No open positions at the moment.</Text>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
    },
    heroSection: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
        ...theme.shadows.sm,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    name: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    industryText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        marginBottom: theme.spacing.md,
    },
    socialRow: {
        flexDirection: 'row',
        gap: theme.spacing.lg,
    },
    socialItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    socialText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    section: {
        padding: theme.spacing.lg,
        marginTop: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    descriptionText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    jobCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.sm,

    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    jobLocation: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    jobMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    jobMetaText: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    jobMetaDot: {
        fontSize: 12,
        color: theme.colors.border,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
    }
});
