import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { Trash2, Heart, MessageSquare } from 'lucide-react-native';

export default function MyPostsScreen() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            // Need a way to get *only* my posts.
            // Currently /feed returns mixed.
            // I'll filter client side from /feed OR add ?user_id=me support to feed.
            // Actually, /profile/[id] shows posts? No, it just shows profile info.
            // I should add a backend endpoint or filter.
            // Let's add ?my_posts=true to FeedController or create new endpoint.
            const response = await client.get('/feed?my_posts=true');
            setPosts(response.data.data || []);
        } catch (err) {
            console.log('Error fetching my posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Post',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/posts/${id}`);
                            setPosts(prev => prev.filter(p => p.id !== id));
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete post');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Trash2 size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            {item.images && item.images.length > 0 && (
                <Image source={{ uri: item.images[0] }} style={styles.image} />
            )}
            <View style={styles.stats}>
                <View style={styles.stat}>
                    <Heart size={16} color={theme.colors.textMuted} />
                    <Text style={styles.statText}>{item.likes_count}</Text>
                </View>
                <View style={styles.stat}>
                    <MessageSquare size={16} color={theme.colors.textMuted} />
                    <Text style={styles.statText}>{item.comments_count}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    !loading ? (
                        <Text style={styles.emptyText}>You haven't posted anything yet.</Text>
                    ) : null
                }
            />
            {loading && <ActivityIndicator style={styles.loader} color={theme.colors.primary} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    list: {
        padding: theme.spacing.md,
    },
    loader: {
        marginTop: 20,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    date: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    content: {
        ...theme.typography.body,
        color: theme.colors.text,
        marginBottom: 12,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    stats: {
        flexDirection: 'row',
        gap: 16,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        marginTop: 40,
    },
});
