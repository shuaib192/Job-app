/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';
import client from '../../src/api/client';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRequestCode = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await client.post('/auth/forgot-password', { email });
            setSuccess('Reset code sent! Redirecting...');

            setTimeout(() => {
                router.push({
                    pathname: '/(auth)/reset',
                    params: { email }
                });
            }, 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to send reset code';
            setError(errorMsg);
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
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Enter your email to receive a 6-digit verification code</Text>
                    </View>

                    <View style={styles.form}>
                        {error ? <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View> : null}
                        {success ? <View style={styles.successContainer}><Text style={styles.successText}>{success}</Text></View> : null}

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Mail size={20} color={theme.colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    placeholderTextColor={theme.colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleRequestCode}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Text style={styles.submitButtonText}>Send Reset Code</Text>
                                    <ArrowRight size={20} color="#fff" />
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
    header: { marginBottom: 40 },
    title: { ...theme.typography.h1, color: theme.colors.text, marginBottom: 10 },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary },
    form: { gap: 20 },
    inputWrapper: { gap: 8 },
    inputLabel: { ...theme.typography.captionMedium, color: theme.colors.text },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidh: 1.5, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 15, height: 56, gap: 10 },
    input: { flex: 1, ...theme.typography.body, color: theme.colors.text },
    submitButton: { backgroundColor: theme.colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...theme.shadows.md },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { ...theme.typography.button, color: '#fff' },
    errorContainer: { backgroundColor: '#FEE2E2', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
    errorText: { color: '#B91C1C', fontSize: 13 },
    successContainer: { backgroundColor: '#ECFDF5', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#10B981' },
    successText: { color: '#047857', fontSize: 13 },
});
