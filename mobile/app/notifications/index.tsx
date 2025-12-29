import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { useNotifications } from '../../src/store/NotificationContext';
import { ArrowLeft, Bell, UserPlus, MessageSquare, Briefcase, Heart, Trash2, RefreshCw, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react-native';

export default function NotificationsScreen() {
    const router = useRouter();
    const { notifications, loading, refresh, markAsRead, markAllRead, deleteAll } = useNotifications();

    const getNotificationStyles = (type: string) => {
        switch (type) {
            case 'connection_request':
            case 'linkup_request':
                return { icon: <UserPlus size={18} color="#3B82F6" />, bg: '#EFF6FF', color: '#3B82F6' };
            case 'message':
                return { icon: <MessageSquare size={18} color="#10B981" />, bg: '#F0FDF4', color: '#10B981' };
            case 'application_status':
                return { icon: <Briefcase size={18} color="#F59E0B" />, bg: '#FFFBEB', color: '#F59E0B' };
            case 'post_liked':
                return { icon: <Heart size={18} color="#EF4444" fill="#EF4444" />, bg: '#FEF2F2', color: '#EF4444' };
            case 'connection_accepted':
                return { icon: <CheckCircle2 size={18} color="#10B981" />, bg: '#F0FDF4', color: '#10B981' };
            default:
                return { icon: <Bell size={18} color="#6366F1" />, bg: '#EEF2FF', color: '#6366F1' };
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const renderNotification = ({ item }: { item: any }) => {
        const styles_notif = getNotificationStyles(item.type);
        return (
            <TouchableOpacity
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                activeOpacity={0.7}
                onPress={() => {
                    if (!item.read) markAsRead(item.id);
                    if (item.type === 'connection_request' || item.type === 'linkup_request' || item.type === 'connection_accepted') {
                        router.push(`/profile/${item.data?.from_id || item.from?.id}`);
                    } else if (item.type === 'message') {
                        router.push(`/messages/${item.data?.from_id || item.from?.id}`);
                    } else if (item.type === 'post_liked' || item.type === 'post_commented') {
                        router.push(`/posts/${item.data?.post_id}`);
                    } else if (item.type === 'application_status') {
                        router.push('/dashboard/applications');
                    }
                }}
            >
                <View style={[styles.iconBox, { backgroundColor: styles_notif.bg }]}>
                    {styles_notif.icon}
                </View>

                <View style={styles.notificationContent}>
                    <Text style={[styles.notificationText, !item.read && styles.unreadText]}>
                        {item.data?.message || item.content || 'You have a new alert'}
                    </Text>
                    <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
                </View>

                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: 'Notifications',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                ),
                headerTitleStyle: { fontWeight: '800', fontSize: 18 },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', gap: 10, marginRight: 15 }}>
                        <TouchableOpacity onPress={refresh}>
                            <RefreshCw size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={markAllRead}>
                            <Bell size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={deleteAll}>
                            <Trash2 size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                )
            }} />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Bell size={40} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>Stay Tuned!</Text>
                            <Text style={styles.emptyText}>When you receive alerts, they will appear here.</Text>
                        </View>
                    }
                />
            )}
        </View>
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
    list: {
        padding: theme.spacing.md,
        flexGrow: 1,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unreadCard: {
        backgroundColor: '#F8FAFC',
        borderColor: theme.colors.primaryLight,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    notificationContent: {
        flex: 1,
    },
    notificationText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: 4,
        lineHeight: 20,
    },
    unreadText: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    timeText: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginLeft: theme.spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: 8,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
