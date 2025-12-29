/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/theme';
import { ArrowRight, Briefcase, Users, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    const features = [
        { icon: <Briefcase size={20} color={theme.colors.primary} />, text: 'Job Matching' },
        { icon: <Users size={20} color={theme.colors.primary} />, text: 'Linkup Feed' },
        { icon: <Shield size={20} color={theme.colors.primary} />, text: 'Verified Profiles' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Hero Section with Gradient */}
            <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={styles.heroSection}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.heroContent}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <Briefcase size={28} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.logoText}>NexaWork</Text>
                        </View>

                        <Text style={styles.heroTitle}>
                            Professional{'\n'}Networking,{'\n'}Simplified.
                        </Text>

                        <Text style={styles.heroSubtitle}>
                            Discover opportunities, linkup with top talent, and grow your career.
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                {/* Features */}
                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIcon}>{feature.icon}</View>
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/(auth)/register')}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.primaryButtonText}>Create Account</Text>
                        <ArrowRight size={20} color={theme.colors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/(auth)/login')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>I already have an account</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <Text style={styles.footerText}>
                    By continuing, you agree to our Terms & Privacy Policy
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    heroSection: {
        height: height * 0.55,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    heroContent: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xxl,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logoIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.md,
    },
    logoText: {
        marginLeft: theme.spacing.sm,
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.white,
        letterSpacing: -0.5,
    },
    heroTitle: {
        ...theme.typography.display,
        color: theme.colors.white,
        marginBottom: theme.spacing.md,
    },
    heroSubtitle: {
        ...theme.typography.body,
        color: 'rgba(255,255,255,0.85)',
        maxWidth: '85%',
    },
    bottomSection: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        justifyContent: 'space-between',
        paddingBottom: theme.spacing.xl,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: theme.spacing.xl,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    featureText: {
        ...theme.typography.smallMedium,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    actionsContainer: {
        gap: theme.spacing.md,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.sm,
        ...theme.shadows.md,
    },
    primaryButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
    },
    secondaryButtonText: {
        ...theme.typography.captionMedium,
        color: theme.colors.primary,
    },
    footerText: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
});
