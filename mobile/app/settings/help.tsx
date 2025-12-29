import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import { ArrowLeft, MessageCircle, Mail, Phone, FileText, ExternalLink, ChevronRight } from 'lucide-react-native';

export default function HelpSupportScreen() {
    const router = useRouter();

    const handleEmail = () => {
        Linking.openURL('mailto:support@nexawork.com?subject=NexaWork Support Request');
    };

    const faqs = [
        { q: 'How do I connect with other professionals?', a: 'Go to the Linkup tab and swipe right on profiles you want to connect with, or use the "Nearby" feature to find people in your area.' },
        { q: 'How do I apply for jobs?', a: 'Browse jobs in the Jobs tab, tap on a job to see details, and click "Apply Now" to submit your application.' },
        { q: 'How do I change my password?', a: 'Go to Settings > Privacy & Security > Change Password to update your credentials.' },
        { q: 'How do I delete my account?', a: 'Contact support at support@nexawork.com to request account deletion. This action is irreversible.' },
        { q: 'How do I post a job?', a: 'You need an employer account. Tap the + button in the Jobs tab to create a new job listing.' },
        { q: 'Why can\'t I see some features?', a: 'Some features are only available to specific account types (employer vs applicant). Contact support for account upgrade.' },
    ];

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: 'Help & Support',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.container} edges={['bottom']}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Contact Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Us</Text>
                        <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                            <View style={styles.contactLeft}>
                                <View style={styles.iconContainer}>
                                    <Mail size={20} color={theme.colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.contactLabel}>Email Support</Text>
                                    <Text style={styles.contactValue}>support@nexawork.com</Text>
                                </View>
                            </View>
                            <ExternalLink size={18} color={theme.colors.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.contactItem}>
                            <View style={styles.contactLeft}>
                                <View style={styles.iconContainer}>
                                    <MessageCircle size={20} color={theme.colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.contactLabel}>Live Chat</Text>
                                    <Text style={styles.contactValue}>Available 9AM - 6PM WAT</Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color={theme.colors.textMuted} />
                        </View>
                    </View>

                    {/* FAQ Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                        {faqs.map((faq, index) => (
                            <View key={index} style={styles.faqItem}>
                                <Text style={styles.faqQuestion}>{faq.q}</Text>
                                <Text style={styles.faqAnswer}>{faq.a}</Text>
                            </View>
                        ))}
                    </View>

                    {/* App Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.infoTitle}>NexaWork</Text>
                        <Text style={styles.infoText}>Version 1.0.0</Text>
                        <Text style={styles.infoText}>© 2024 NexaWork. All rights reserved.</Text>
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
    section: {
        marginBottom: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    sectionTitle: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactLabel: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    contactValue: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    faqItem: {
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    faqQuestion: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    faqAnswer: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    infoSection: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    infoTitle: {
        ...theme.typography.h3,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    infoText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
});
