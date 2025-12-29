import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, MapPin, Briefcase, Mail, UserPlus, MessageSquare, Heart, ShieldAlert } from 'lucide-react-native';

import { ConnectButton } from '../../src/components/ConnectButton';

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await client.get(`/users/${id}/profile`);
            setProfileData(response.data);
        } catch (err) {
            console.log('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            await client.post(`/connections/send/${id}`);
            // Show success feedback
        } catch (err) {
            console.log('Connect error:', err);
        }
    };

    const handleMessage = () => {
        router.push(`/messages/${id}`);
    };

    const handleBlock = async () => {
        Alert.alert(
            'Block User',
            'Are you sure you want to block this user? They will no longer be able to see your posts or message you.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.post(`/blocks/${id}`);
                            Alert.alert('Blocked', 'User has been blocked.');
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to block user.');
                        }
                    }
                }
            ]
        );
    };


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.centered}>
                <Text>User not found</Text>
            </View>
        );
    }

    const { user, profile } = profileData;
    const skills = profile?.skills || [];

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: '',
                    headerTransparent: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.container} edges={['bottom']}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header Card */}
                    <View style={styles.headerCard}>
                        {profile?.avatar ? (
                            <Image
                                source={{ uri: profile.avatar }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
                            </View>
                        )}


                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{user?.name || 'User'}</Text>
                            {user?.connection_status === 'accepted' && (
                                <View style={styles.degreeBadge}>
                                    <Text style={styles.degreeText}>1st</Text>
                                </View>
                            )}
                        </View>

                        {profile?.industry && (
                            <View style={styles.headlineContainer}>
                                <Briefcase size={16} color={theme.colors.textMuted} />
                                <Text style={styles.headline}>{profile.industry}</Text>
                            </View>
                        )}

                        {user?.location && (
                            <View style={styles.locationContainer}>
                                <MapPin size={16} color={theme.colors.textMuted} />
                                <Text style={styles.location}>{user.location}</Text>
                            </View>
                        )}

                        {profileData.mutual_count > 0 && (
                            <View style={styles.mutualRow}>
                                <View style={styles.mutualAvatars}>
                                    {profileData.mutual_connections.map((m: any, i: number) => (
                                        <View key={i} style={[styles.mutualAvatar, { marginLeft: i > 0 ? -10 : 0 }]}>
                                            <Text style={styles.mutualAvatarText}>{m.name[0]}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.mutualText}>
                                    {profileData.mutual_count} mutual connections
                                </Text>
                            </View>
                        )}

                        <View style={styles.statsRow}>
                            <ConnectButton
                                userId={parseInt(id as string)}
                                initialStatus={user?.connection_status}
                            />

                            <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={handleMessage}>
                                <MessageSquare size={20} color={theme.colors.primary} />
                                <Text style={[styles.actionButtonText, styles.messageButtonText]}>Message</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, styles.blockButton]} onPress={handleBlock}>
                                <ShieldAlert size={20} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>

                    </View>

                    {/* Bio Section */}
                    {profile?.bio && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.bioText}>{profile.bio}</Text>
                        </View>
                    )}

                    {/* Skills Section */}
                    {skills.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Skills</Text>
                            <View style={styles.skillsContainer}>
                                {skills.map((skill: string, index: number) => (
                                    <View key={index} style={styles.skillChip}>
                                        <Text style={styles.skillText}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 60, // For transparent header
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    backButton: {
        marginLeft: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        padding: 8,
        borderRadius: 20,
        ...theme.shadows.sm,
    },
    headerCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
        ...theme.shadows.md,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: theme.spacing.md,
    },
    avatarContainer: {

        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: theme.colors.white,
    },
    name: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    degreeBadge: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    degreeText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    headlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    headline: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.md,
    },
    location: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    mutualRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    mutualAvatars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mutualAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 2,
        borderColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mutualAvatarText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    mutualText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: theme.spacing.md,
        gap: theme.spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.xs,
        ...theme.shadows.sm,
    },
    messageButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    pendingButton: {
        backgroundColor: theme.colors.textMuted,
        opacity: 0.8,
    },
    blockButton: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.error,
        borderWidth: 1,
        paddingHorizontal: theme.spacing.md,
    },
    actionButtonText: {

        ...theme.typography.bodySemibold,
        color: theme.colors.white,
    },
    messageButtonText: {
        color: theme.colors.primary,
    },
    section: {
        backgroundColor: theme.colors.surface,
        margin: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    bioText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    skillChip: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
    },
    skillText: {
        ...theme.typography.captionMedium,
        color: theme.colors.primary,
    },
});
