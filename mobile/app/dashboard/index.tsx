import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';
import { Briefcase, FileText, MessageSquare, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../src/store/AuthContext';

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const menuItems = [
        {
            title: 'My Posts',
            subtitle: 'Manage your social posts',
            icon: MessageSquare,
            route: '/dashboard/posts',
            show: true
        },
        {
            title: 'My Jobs',
            subtitle: 'Manage posted jobs & applicants',
            icon: Briefcase,
            route: '/dashboard/jobs',
            show: user?.role === 'employer' || user?.role === 'admin'
        },
        {
            title: 'My Applications',
            subtitle: 'Track your job applications',
            icon: FileText,
            route: '/dashboard/applications',
            show: true
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.content}>
                <Text style={styles.headerTitle}>Dashboard</Text>

                <View style={styles.menuContainer}>
                    {menuItems.filter(item => item.show).map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => router.push(item.route)}
                        >
                            <View style={styles.iconContainer}>
                                <item.icon size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.subtitle}>{item.subtitle}</Text>
                            </View>
                            <ChevronRight size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.xl,
    },
    menuContainer: {
        gap: theme.spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        ...theme.typography.h3,
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 4,
    },
    subtitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
});
