import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft } from 'lucide-react-native';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await client.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
            });
            Alert.alert('Success', 'Password changed successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            console.log('Password error:', err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter current password"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Change Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.captionMedium,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        ...theme.shadows.md,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
});
