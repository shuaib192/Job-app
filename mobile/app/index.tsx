import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image as RNImage, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/theme';
import { ArrowRight, Briefcase, Users, Shield, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    const features = [
        { icon: <Briefcase size={20} color={theme.colors.primary} />, text: 'Job Matching', desc: 'AI-driven matches' },
        { icon: <Users size={20} color={theme.colors.primary} />, text: 'Linkup Feed', desc: 'Professional network' },
        { icon: <Shield size={20} color={theme.colors.primary} />, text: 'Verified', desc: 'Secure profiles' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ImageBackground
                source={require('../assets/welcome-bg.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.95)']}
                    style={styles.gradient}
                >
                    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                        <View style={styles.content}>
                            {/* Logo Section */}
                            <View style={styles.header}>
                                <RNImage
                                    source={require('../assets/nobg-mainlogo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                                <View style={styles.badge}>
                                    <Sparkles size={12} color={theme.colors.warning} />
                                    <Text style={styles.badgeText}>PREMIUM</Text>
                                </View>
                            </View>

                            {/* Hero Text */}
                            <View style={styles.heroSection}>
                                <Text style={styles.tagline}>NEXA WORK</Text>
                                <Text style={styles.title}>
                                    Elevate Your{'\n'}<Text style={styles.titleHighlight}>Career</Text> Today.
                                </Text>
                                <Text style={styles.subtitle}>
                                    The next generation of professional networking. Discover openings and linkup with the best talent globally.
                                </Text>
                            </View>

                            {/* Features Grid */}
                            <View style={styles.featuresContainer}>
                                {features.map((feature, index) => (
                                    <View key={index} style={styles.featureCard}>
                                        <View style={styles.featureIconWrapper}>
                                            {feature.icon}
                                        </View>
                                        <Text style={styles.featureTitle}>{feature.text}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.spacer} />

                            {/* Action Area */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() => router.push('/(auth)/register')}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={[theme.colors.primary, '#4F46E5']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.primaryButtonText}>Get Started</Text>
                                        <ArrowRight size={20} color={theme.colors.white} />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={() => router.push('/(auth)/login')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        Already have an account? <Text style={styles.loginText}>Sign In</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.footerNote}>
                                Trusted by 10k+ professionals worldwide
                            </Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    logo: {
        width: 200,
        height: 70,
        marginLeft: -10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeText: {
        color: theme.colors.white,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    heroSection: {
        marginBottom: 35,
    },
    tagline: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 4,
        marginBottom: 12,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: theme.colors.white,
        lineHeight: 50,
        letterSpacing: -1,
    },
    titleHighlight: {
        color: theme.colors.primary,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 15,
        lineHeight: 24,
        maxWidth: '90%',
    },
    featuresContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    featureCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    featureIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    featureTitle: {
        color: theme.colors.white,
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    spacer: {
        flex: 1,
    },
    actions: {
        gap: 16,
        marginBottom: 20,
    },
    primaryButton: {
        width: '100%',
        height: 64,
        borderRadius: 22,
        overflow: 'hidden',
        ...theme.shadows.lg,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    primaryButtonText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryButton: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 15,
        fontWeight: '500',
    },
    loginText: {
        color: theme.colors.white,
        fontWeight: '800',
    },
    footerNote: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '500',
    },
});
