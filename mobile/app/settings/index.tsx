import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/store/AuthContext';
import { ArrowLeft, Bell, Lock, CircleHelp as HelpCircle, FileText, ChevronRight, LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const [notifications, setNotifications] = React.useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/');
                    }
                },
            ]
        );
    };

    const SettingItem = ({ icon: Icon, label, onPress, value }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Icon size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            {value !== undefined ? (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
            ) : (
                <ChevronRight size={20} color={theme.colors.textMuted} />
            )}
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: 'Settings',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.container} edges={['bottom']}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <SettingItem
                            icon={Bell}
                            label="Notifications"
                            value={notifications}
                            onPress={() => setNotifications(!notifications)}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <SettingItem icon={Lock} label="Privacy & Security" onPress={() => router.push('/settings/privacy')} />
                        <SettingItem icon={HelpCircle} label="Help & Support" onPress={() => router.push('/settings/help')} />
                        <SettingItem icon={FileText} label="Terms of Service" onPress={() => router.push('/settings/terms')} />
                    </View>


                    <View style={styles.section}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <LogOut size={20} color={theme.colors.error} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.versionText}>Version 1.0.0</Text>
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    logoutText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.error,
    },
    versionText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
});
