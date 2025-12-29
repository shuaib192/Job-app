import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Lock, Eye, Users, MessageSquare } from 'lucide-react-native';

export default function PrivacySettingsScreen() {
    const router = useRouter();
    const [profileVisibility, setProfileVisibility] = useState('public');
    const [whoCanMessage, setWhoCanMessage] = useState('everyone');
    const [showEmail, setShowEmail] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    const handleSave = async () => {
        try {
            await client.put('/settings/privacy', {
                profile_visibility: profileVisibility,
                who_can_message: whoCanMessage,
                show_email: showEmail,
                show_phone: showPhone,
            });
            Alert.alert('Success', 'Privacy settings updated!');
        } catch (err) {
            console.log('Privacy error:', err);
            Alert.alert('Error', 'Failed to update settings');
        }
    };

    const SettingOption = ({ label, selected, onPress }: any) => (
        <TouchableOpacity
            style={[styles.optionButton, selected && styles.optionButtonSelected]}
            onPress={onPress}
        >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {label}
            </Text>
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
                    <Text style={styles.headerTitle}>Privacy Settings</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Eye size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>Profile Visibility</Text>
                        </View>
                        <Text style={styles.sectionDesc}>Who can see your profile</Text>
                        <View style={styles.optionsRow}>
                            <SettingOption
                                label="Public"
                                selected={profileVisibility === 'public'}
                                onPress={() => setProfileVisibility('public')}
                            />
                            <SettingOption
                                label="Linkups Only"
                                selected={profileVisibility === 'linkups'}
                                onPress={() => setProfileVisibility('linkups')}
                            />
                            <SettingOption
                                label="Private"
                                selected={profileVisibility === 'private'}
                                onPress={() => setProfileVisibility('private')}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MessageSquare size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>Who Can Message You</Text>
                        </View>
                        <View style={styles.optionsRow}>
                            <SettingOption
                                label="Everyone"
                                selected={whoCanMessage === 'everyone'}
                                onPress={() => setWhoCanMessage('everyone')}
                            />
                            <SettingOption
                                label="Linkups Only"
                                selected={whoCanMessage === 'linkups'}
                                onPress={() => setWhoCanMessage('linkups')}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Lock size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                        </View>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Show Email</Text>
                            <Switch
                                value={showEmail}
                                onValueChange={setShowEmail}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            />
                        </View>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Show Phone Number</Text>
                            <Switch
                                value={showPhone}
                                onValueChange={setShowPhone}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
    saveText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.primary,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    sectionTitle: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    sectionDesc: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.md,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    optionButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    optionButtonSelected: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    optionText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    optionTextSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
    },
    toggleLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
});
