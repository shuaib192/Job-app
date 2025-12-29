import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/store/AuthContext';
import { LogOut, Key, ChevronRight, ArrowLeft, Shield } from 'lucide-react-native';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useAuth();

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
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Settings', headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/profile/change-password')}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F0F9FF' }]}>
                                <Key size={20} color="#0EA5E9" />
                            </View>
                            <Text style={styles.menuItemText}>Change Password</Text>
                        </View>
                        <ChevronRight size={20} color={theme.colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/settings/privacy')}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
                                <Shield size={20} color="#10B981" />
                            </View>
                            <Text style={styles.menuItemText}>Privacy Settings</Text>
                        </View>
                        <ChevronRight size={20} color={theme.colors.border} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { marginTop: 20 }]}>
                    <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                                <LogOut size={20} color="#EF4444" />
                            </View>
                            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
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
    content: { flex: 1, padding: theme.spacing.md },
    section: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        ...theme.shadows.sm,
    },
    sectionTitle: {
        ...theme.typography.smallSemibold,
        color: theme.colors.textMuted,
        marginLeft: 12,
        marginTop: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    logoutItem: {
        marginTop: 0,
    }
});
