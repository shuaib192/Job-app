import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { MessageSquare, Search } from 'lucide-react-native';

export default function MessagesScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await client.get('/messages');
            setConversations(response.data || []);
        } catch (err) {
            console.log('Conversations fetch error:', err);
            setConversations([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderConversation = ({ item }: { item: any }) => {
        const otherUser = item.other_user;

        return (
            <TouchableOpacity
                style={styles.conversationCard}
                onPress={() => router.push(`/messages/${otherUser.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    {otherUser?.avatar ? (
                        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
                    ) : otherUser?.profile?.avatar ? (
                        <Image source={{ uri: otherUser.profile.avatar }} style={styles.avatar} />
                    ) : (
                        <Text style={styles.avatarText}>{otherUser?.name?.[0] || '?'}</Text>
                    )}
                </View>

                <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.userName} numberOfLines={1}>{otherUser?.name || 'Unknown'}</Text>
                        <Text style={styles.timeText}>{formatTime(item.last_message?.created_at)}</Text>
                    </View>
                    <View style={styles.messagePreviewRow}>
                        <Text style={[styles.lastMessage, item.unread_count > 0 && styles.unreadLastMessage]} numberOfLines={1}>
                            {item.last_message?.message || 'No messages yet'}
                        </Text>
                        {item.unread_count > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.unread_count}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <MessageSquare size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptyText}>
                Start a conversation by connecting with professionals in your network.
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={theme.colors.textMuted} />
                    <Text style={styles.searchPlaceholder}>Search messages...</Text>
                </View>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.other_user.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
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
        backgroundColor: theme.colors.background,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    searchPlaceholder: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
    },
    listContent: {
        paddingHorizontal: theme.spacing.md,
        flexGrow: 1,
    },
    conversationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    avatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    conversationInfo: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    timeText: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    messagePreviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    lastMessage: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        flex: 1,
        marginRight: theme.spacing.md,
    },
    unreadLastMessage: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    badge: {
        backgroundColor: theme.colors.primary,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxxl,
        paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
