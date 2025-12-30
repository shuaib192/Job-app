import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/store/AuthContext';
import client from '../../src/api/client';
import { LogOut, MapPin, Briefcase, Mail, Edit, Settings, Plus, GraduationCap, Camera, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
    const { user, updateUser, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [gallery, setGallery] = useState<any[]>([]);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    const pickProfileImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            uploadAvatar(result.assets[0].base64);
        }
    };

    const uploadAvatar = async (base64: string) => {
        setUploadingAvatar(true);
        try {
            const response = await client.post('/profile/avatar', {
                avatar: `data:image/jpeg;base64,${base64}`,
            });
            setAvatarUrl(response.data.avatar_url);
            await updateUser({ avatar: response.data.avatar_url });
            Alert.alert('Success', 'Profile picture updated!');
        } catch (err) {
            console.log('Avatar upload error:', err);
            Alert.alert('Error', 'Failed to upload profile picture');
        } finally {
            setUploadingAvatar(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const response = await client.get('/profile/gallery');
            setGallery(response.data);
        } catch (err) {
            console.log('Gallery fetch error:', err);
        }
    };

    const pickGalleryImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            uploadGallery(result.assets[0].base64);
        }
    };

    const uploadGallery = async (base64: string) => {
        setUploadingGallery(true);
        try {
            const response = await client.post('/profile/gallery', {
                image: `data:image/jpeg;base64,${base64}`,
                title: 'New Project',
            });
            setGallery(prev => [response.data, ...prev]);
        } catch (err) {
            console.log('Gallery upload error:', err);
            Alert.alert('Error', 'Failed to add image to gallery');
        } finally {
            setUploadingGallery(false);
        }
    };

    const deleteGalleryItem = (id: number) => {
        Alert.alert('Delete Image', 'Remove this from your portfolio?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/profile/gallery/${id}`);
                        setGallery(prev => prev.filter(item => item.id !== id));
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete image');
                    }
                }
            }
        ]);
    };

    const fetchProfile = async () => {
        try {
            const response = await client.get('/auth/me');
            setProfile(response.data);
        } catch (err) {
            console.log('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and will delete all your data. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete('/profile/delete-account');
                            await logout();
                            router.replace('/');
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete account.');
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {

        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/');
                    },
                },
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

    const skills = profile?.profile?.skills || [];
    const displaySkills = Array.isArray(skills) ? skills : [];

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <TouchableOpacity
                        style={styles.settingsIcon}
                        onPress={() => router.push('/profile/settings')}
                    >
                        <Settings size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.avatarContainer} onPress={pickProfileImage}>
                        {avatarUrl || user?.avatar ? (
                            <RNImage source={{ uri: avatarUrl || user?.avatar }} style={styles.avatarImage} />
                        ) : profile?.profile?.avatar ? (
                            <RNImage source={{ uri: profile.profile.avatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
                        )}
                        <View style={styles.cameraOverlay}>
                            {uploadingAvatar ? (
                                <ActivityIndicator size="small" color={theme.colors.white} />
                            ) : (
                                <Camera size={16} color={theme.colors.white} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.name}>{user?.name || 'User'}</Text>

                    {profile?.profile?.industry && (
                        <View style={styles.headlineContainer}>
                            <Briefcase size={16} color={theme.colors.textMuted} />
                            <Text style={styles.headline}>{profile.profile.industry}</Text>
                        </View>
                    )}

                    {user?.location && (
                        <View style={styles.locationContainer}>
                            <MapPin size={16} color={theme.colors.textMuted} />
                            <Text style={styles.location}>{user.location}</Text>
                        </View>
                    )}

                    {user?.email && (
                        <View style={styles.locationContainer}>
                            <Mail size={16} color={theme.colors.textMuted} />
                            <Text style={styles.location}>{user.email}</Text>
                        </View>
                    )}

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.connections_count || 0}</Text>
                            <Text style={styles.statLabel}>Connections</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.posts_count || 0}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.role || 'User'}</Text>
                            <Text style={styles.statLabel}>Role</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.aiOptimizeBtn}
                        onPress={() => router.push({
                            pathname: '/messages/ai',
                            params: { prompt: `Hi ${config?.name || 'NexaBot'}! Can you look at my profile (Bio: ${profile?.profile?.bio || 'None'}, Skills: ${profile?.profile?.skills?.join(', ') || 'None'}) and suggest how I can improve it to get more job offers?` }
                        })}
                    >
                        <Sparkles size={18} color="#fff" />
                        <Text style={styles.aiOptimizeText}>Optimize with AI</Text>
                    </TouchableOpacity>
                </View>

                {/* Gallery Section */}
                <View style={[styles.section, { paddingRight: 0 }]}>
                    <View style={[styles.sectionHeader, { paddingRight: theme.spacing.lg }]}>
                        <Text style={styles.sectionTitle}>Portfolio Gallery</Text>
                        <TouchableOpacity onPress={pickGalleryImage} disabled={uploadingGallery}>
                            {uploadingGallery ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <Plus size={20} color={theme.colors.primary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {gallery.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                            {gallery.map((item) => (
                                <View key={item.id} style={styles.galleryItem}>
                                    <RNImage source={{ uri: item.image_url }} style={styles.galleryImage} />
                                    <TouchableOpacity
                                        style={styles.deleteGalleryBtn}
                                        onPress={() => deleteGalleryItem(item.id)}
                                    >
                                        <Plus size={14} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={{ paddingRight: theme.spacing.lg }}>
                            <Text style={styles.emptyText}>Showcase your work projects here</Text>
                        </View>
                    )}
                </View>

                {/* Bio Section */}
                {profile?.profile?.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.bioText}>{profile.profile.bio}</Text>
                    </View>
                )}

                {/* Experience Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        <TouchableOpacity onPress={() => router.push('/profile/experience/add')}>
                            <Plus size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                    {profile?.profile?.experience && Array.isArray(profile.profile.experience) && profile.profile.experience.length > 0 ? (
                        profile.profile.experience.map((exp: any, index: number) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={styles.itemTitle}>{exp.title}</Text>
                                <Text style={styles.itemSubtitle}>{exp.company}</Text>
                                <Text style={styles.itemMeta}>
                                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                                </Text>
                                {exp.description && <Text style={styles.itemDescription}>{exp.description}</Text>}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No experience added yet</Text>
                    )}
                </View>

                {/* Education Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        <TouchableOpacity onPress={() => router.push('/profile/education/add')}>
                            <Plus size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                    {profile?.profile?.education && Array.isArray(profile.profile.education) && profile.profile.education.length > 0 ? (
                        profile.profile.education.map((edu: any, index: number) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={styles.itemTitle}>{edu.school}</Text>
                                <Text style={styles.itemSubtitle}>{edu.degree} • {edu.field_of_study}</Text>
                                <Text style={styles.itemMeta}>
                                    {edu.start_date} - {edu.end_date}
                                </Text>
                                {edu.description && <Text style={styles.itemDescription}>{edu.description}</Text>}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No education added yet</Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push('/dashboard')}
                    >
                        <Briefcase size={20} color={theme.colors.primary} />
                        <Text style={styles.actionButtonText}>Manage Content</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push('/edit-profile')}
                    >
                        <Edit size={20} color={theme.colors.primary} />
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
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
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    headerCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
        ...theme.shadows.md,
        position: 'relative',
    },
    settingsIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 8,
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
        marginBottom: theme.spacing.xs,
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
        marginBottom: theme.spacing.sm,
    },
    location: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: theme.colors.borderLight,
    },
    statValue: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    statLabel: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
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
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
    },
    itemContainer: {
        marginBottom: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    itemTitle: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    itemSubtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    itemMeta: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    itemDescription: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
        lineHeight: 20,
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
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    actionButtonText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    logoutButton: {
    },
    deleteButton: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    deleteText: {
        color: theme.colors.error,
    },

    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    galleryScroll: {
        gap: 12,
        paddingBottom: 10,
    },
    galleryItem: {
        width: 140,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        position: 'relative',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    deleteGalleryBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiOptimizeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 15,
        gap: 8,
        ...theme.shadows.sm,
    },
    aiOptimizeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
