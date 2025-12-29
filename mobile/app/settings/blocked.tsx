import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, UserX, Ban } from 'lucide-react-native';

export default function BlockedUsersScreen() {
    const router = useRouter();
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const response = await client.get('/users/blocked');
            setBlockedUsers(response.data || []);
        } catch (err) {
            console.log('Blocked users error:', err);
            setBlockedUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (userId: number) => {
        Alert.alert(
            'Unblock User',
            'Are you sure you want to unblock this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        try {
                            await client.delete(`/users/${userId}/block`);
                            setBlockedUsers(prev => prev.filter(u => u.id !== userId));
                        } catch (err) {
                            Alert.alert('Error', 'Failed to unblock user');
                        }
                    },
                },
            ]
        );
    };

    const renderUser = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{item.name?.[0] || 'U'}</Text>
                </View>
                <View style={styles.textInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userRole}>{item.role || 'User'}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.unblockButton}
                onPress={() => handleUnblock(item.id)}
            >
                <Text style={styles.unblockText}>Unblock</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Blocked Users</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={blockedUsers}
                        renderItem={renderUser}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ban size={48} color={theme.colors.textMuted} />
                                <Text style={styles.emptyText}>No blocked users</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    backButton: {
        padding: 8,
    },
    list: {
        padding: theme.spacing.lg,
        flexGrow: 1,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.white,
    },
    textInfo: {
        flex: 1,
    },
    userName: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    userRole: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    unblockButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
    },
    unblockText: {
        ...theme.typography.captionMedium,
        color: theme.colors.primary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.md,
    },
});
