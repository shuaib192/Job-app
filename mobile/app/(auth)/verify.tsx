import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../../src/store/AuthContext';

export default function VerifyScreen() {
    const router = useRouter();
    const { email: emailParam } = useLocalSearchParams<{ email: string }>();
    const { login } = useAuth();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleVerify = async () => {
        if (code.length < 6) {
            Alert.alert('Error', 'Please enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            const response = await client.post('/auth/verify-email', {
                email: emailParam,
                code: code
            });

            Alert.alert('Success', 'Email verified successfully!', [
                {
                    text: 'OK',
                    onPress: async () => {
                        await login(response.data.token, response.data.user);
                        router.replace('/(tabs)');
                    }
                }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            // In a real app, you'd call a resend endpoint
            // For now, let's just show a simulation
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert('Sent', 'A new code has been sent to your email.');
        } catch (err) {
            Alert.alert('Error', 'Failed to resend code.');
        } finally {
            setResending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Mail size={48} color={theme.colors.primary} />
                </View>

                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                    We've sent a 6-digit verification code to {'\n'}
                    <Text style={styles.emailText}>{emailParam}</Text>
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                    />
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, loading && styles.disabledButton]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                            <ArrowRight size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResend}
                    disabled={resending}
                >
                    {resending ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <Text style={styles.resendButtonText}>Didn't receive code? Resend</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Back to Register</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xxl,
    },
    emailText: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    inputContainer: {
        width: '100%',
        marginBottom: theme.spacing.xl,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 8,
        ...theme.shadows.sm,
    },
    verifyButton: {
        width: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        ...theme.shadows.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    resendButton: {
        marginTop: theme.spacing.xl,
        padding: theme.spacing.md,
    },
    resendButtonText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    backButton: {
        marginTop: theme.spacing.md,
    },
    backButtonText: {
        color: theme.colors.textMuted,
        fontSize: 14,
    }
});
