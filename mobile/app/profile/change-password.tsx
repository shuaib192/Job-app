import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const [errors, setErrors] = useState<any>({});

    const handleUpdatePassword = async () => {
        setErrors({});
        if (form.new_password !== form.new_password_confirmation) {
            setErrors({ new_password_confirmation: ['Passwords do not match'] });
            return;
        }

        setLoading(true);
        try {
            const response = await client.post('/settings/change-password', form);
            Alert.alert('Success', 'Password updated successfully');
            router.back();
        } catch (err: any) {
            if (err.response?.data) {
                setErrors(err.response.data);
            } else {
                Alert.alert('Error', 'Failed to update password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.infoCard}>
                        <Lock size={40} color={theme.colors.primary} />
                        <Text style={styles.infoTitle}>Secure Your Account</Text>
                        <Text style={styles.infoSubtitle}>Choose a strong password with at least 6 characters.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <View style={[styles.inputWrapper, errors.current_password && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter current password"
                                    secureTextEntry={!showCurrent}
                                    value={form.current_password}
                                    onChangeText={(val) => setForm({ ...form, current_password: val })}
                                />
                                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                    {showCurrent ? <EyeOff size={20} color={theme.colors.textMuted} /> : <Eye size={20} color={theme.colors.textMuted} />}
                                </TouchableOpacity>
                            </View>
                            {errors.current_password && <Text style={styles.errorText}>{errors.current_password[0]}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={[styles.inputWrapper, errors.new_password && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    secureTextEntry={!showNew}
                                    value={form.new_password}
                                    onChangeText={(val) => setForm({ ...form, new_password: val })}
                                />
                                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                    {showNew ? <EyeOff size={20} color={theme.colors.textMuted} /> : <Eye size={20} color={theme.colors.textMuted} />}
                                </TouchableOpacity>
                            </View>
                            {errors.new_password && <Text style={styles.errorText}>{errors.new_password[0]}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={[styles.inputWrapper, errors.new_password_confirmation && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    secureTextEntry={!showConfirm}
                                    value={form.new_password_confirmation}
                                    onChangeText={(val) => setForm({ ...form, new_password_confirmation: val })}
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={20} color={theme.colors.textMuted} /> : <Eye size={20} color={theme.colors.textMuted} />}
                                </TouchableOpacity>
                            </View>
                            {errors.new_password_confirmation && <Text style={styles.errorText}>{errors.new_password_confirmation[0]}</Text>}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleUpdatePassword}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Update Password</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    content: { padding: 20 },
    infoCard: { alignItems: 'center', marginBottom: 30, padding: 20 },
    infoTitle: { ...theme.typography.h2, color: theme.colors.text, marginTop: 15 },
    infoSubtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { ...theme.typography.bodySemibold, color: theme.colors.text },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        ...theme.shadows.sm,
    },
    input: { flex: 1, height: '100%', color: theme.colors.text, fontSize: 16 },
    inputError: { borderColor: theme.colors.error },
    errorText: { color: theme.colors.error, fontSize: 12 },
    submitButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        ...theme.shadows.md,
    },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    disabledButton: { opacity: 0.7 },
});
