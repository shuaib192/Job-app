import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Check, X } from 'lucide-react-native';

export default function LinkupRequestsScreen() {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await client.get('/connections/pending');
            setRequests(response.data || []);
        } catch (err) {
            console.log('Requests error:', err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (connectionId: number) => {
        try {
            await client.post(`/connections/${connectionId}/accept`);
            setRequests(prev => prev.filter(r => r.id !== connectionId));
            Alert.alert('Success', 'Linkup request accepted!');
        } catch (err) {
            console.log('Accept error:', err);
            Alert.alert('Error', 'Failed to accept request');
        }
    };

    const handleDecline = async (connectionId: number) => {
        try {
            await client.post(`/connections/${connectionId}/ignore`);
            setRequests(prev => prev.filter(r => r.id !== connectionId));
        } catch (err) {
            console.log('Decline error:', err);
        }
    };

    const renderRequest = ({ item }: { item: any }) => {
        const user = item.user || item.sender;

        return (
            <View style={styles.requestCard}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => router.push(`/profile/${user.id}`)}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
                    </View>
                    <View style={styles.textInfo}>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userRole}>{user?.role || 'Professional'}</Text>
                        {user?.location && <Text style={styles.userLocation}>{user.location}</Text>}
                    </View>
                </TouchableOpacity>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAccept(item.id)}
                    >
                        <Check size={20} color={theme.colors.white} />
                        <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => handleDecline(item.id)}
                    >
                        <X size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Linkup Requests</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={requests}
                        renderItem={renderRequest}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No pending requests</Text>
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
    requestCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.white,
    },
    textInfo: {
        flex: 1,
    },
    userName: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
        marginBottom: 2,
    },
    userRole: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    userLocation: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.xs,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    acceptText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.white,
    },
    declineButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md,
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
    },
});
