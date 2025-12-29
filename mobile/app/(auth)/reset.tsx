/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react-native';
import client from '../../src/api/client';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();

    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleReset = async () => {
        if (!code || !password || !passwordConfirmation) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await client.post('/auth/reset-password', {
                email,
                code,
                password,
                password_confirmation: passwordConfirmation
            });
            setSuccess('Password updated! You can now sign in.');
            setTimeout(() => {
                router.replace('/(auth)/login');
            }, 2500);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Set New Password</Text>
                        <Text style={styles.subtitle}>Enter the code sent to {email} and choose a new password</Text>
                    </View>

                    <View style={styles.form}>
                        {error ? <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View> : null}
                        {success ? <View style={styles.successContainer}><Text style={styles.successText}>{success}</Text></View> : null}

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Verification Code</Text>
                            <TextInput
                                style={styles.inputBox}
                                placeholder="123456"
                                maxLength={6}
                                keyboardType="number-pad"
                                value={code}
                                onChangeText={setCode}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={theme.colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Min 6 characters"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Confirm New Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={theme.colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Repeat password"
                                    secureTextEntry
                                    value={passwordConfirmation}
                                    onChangeText={setPasswordConfirmation}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleReset}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Text style={styles.submitButtonText}>Update Password</Text>
                                    <CheckCircle size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { flexGrow: 1, padding: theme.spacing.lg },
    backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 30, ...theme.shadows.sm },
    header: { marginBottom: 30 },
    title: { ...theme.typography.h1, color: theme.colors.text, marginBottom: 10 },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary },
    form: { gap: 20 },
    inputWrapper: { gap: 8 },
    inputLabel: { ...theme.typography.captionMedium, color: theme.colors.text },
    inputBox: { height: 56, backgroundColor: '#fff', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 15, textAlign: 'center', fontSize: 24, fontWeight: 'bold', letterSpacing: 5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 15, height: 56, gap: 10 },
    input: { flex: 1, ...theme.typography.body, color: theme.colors.text },
    submitButton: { backgroundColor: theme.colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...theme.shadows.md, marginTop: 10 },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { ...theme.typography.button, color: '#fff' },
    errorContainer: { backgroundColor: '#FEE2E2', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
    errorText: { color: '#B91C1C', fontSize: 13 },
    successContainer: { backgroundColor: '#ECFDF5', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#10B981' },
    successText: { color: '#047857', fontSize: 13 },
});
