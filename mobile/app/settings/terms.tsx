import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsOfServiceScreen() {
    const router = useRouter();

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: 'Terms of Service',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.container} edges={['bottom']}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

                    <View style={styles.section}>
                        <Text style={styles.heading}>1. Acceptance of Terms</Text>
                        <Text style={styles.paragraph}>
                            By accessing and using NexaWork ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>2. User Accounts</Text>
                        <Text style={styles.paragraph}>
                            • You must be at least 18 years old to create an account.{'\n'}
                            • You are responsible for maintaining the confidentiality of your login credentials.{'\n'}
                            • You agree to provide accurate and complete information during registration.{'\n'}
                            • One person may only have one account (unless authorized for employer accounts).
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>3. Acceptable Use</Text>
                        <Text style={styles.paragraph}>
                            You agree NOT to:{'\n'}
                            • Post false, misleading, or fraudulent content.{'\n'}
                            • Harass, threaten, or discriminate against other users.{'\n'}
                            • Share inappropriate, illegal, or copyrighted content.{'\n'}
                            • Attempt to access accounts or data belonging to other users.{'\n'}
                            • Use the App for any illegal activities.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>4. Job Postings & Applications</Text>
                        <Text style={styles.paragraph}>
                            • Employers are responsible for the accuracy of job listings.{'\n'}
                            • NexaWork does not guarantee employment or job placement.{'\n'}
                            • All employment decisions are made solely between employers and applicants.{'\n'}
                            • We reserve the right to remove any job posting that violates our guidelines.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>5. Content Ownership</Text>
                        <Text style={styles.paragraph}>
                            • You retain ownership of content you post on NexaWork.{'\n'}
                            • By posting, you grant NexaWork a license to display your content.{'\n'}
                            • NexaWork may remove content that violates these terms.{'\n'}
                            • You must have rights to any content you post.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>6. Privacy</Text>
                        <Text style={styles.paragraph}>
                            Your privacy is important to us. Please review our Privacy Policy for information about how we collect, use, and protect your data.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>7. Termination</Text>
                        <Text style={styles.paragraph}>
                            NexaWork reserves the right to suspend or terminate your account at any time for violation of these terms or any other reason at our discretion.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>8. Limitation of Liability</Text>
                        <Text style={styles.paragraph}>
                            NexaWork is provided "as is" without warranties. We are not liable for any damages arising from your use of the App, including but not limited to direct, indirect, or consequential damages.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>9. Changes to Terms</Text>
                        <Text style={styles.paragraph}>
                            We may update these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>10. Contact</Text>
                        <Text style={styles.paragraph}>
                            For questions about these Terms of Service, contact us at:{'\n'}
                            support@nexawork.com
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>© 2024 NexaWork. All rights reserved.</Text>
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
    scrollView: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    backButton: {
        marginRight: theme.spacing.sm,
    },
    lastUpdated: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    heading: {
        ...theme.typography.h3,

        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    paragraph: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },
    footer: {
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
});
