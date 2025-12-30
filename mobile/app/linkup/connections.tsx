import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { Users, MapPin, MessageSquare, Briefcase, ShieldCheck, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../../src/store/AuthContext';

export default function ConnectionsScreen() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConnections = useCallback(async () => {
        if (!token) return;
        try {
            const response = await client.get('/connections');
            // Extract the user object from the connection record
            const formatted = (response.data || []).map((c: any) => {
                const otherUser = c.user_id === user?.id ? c.connection : c.user;
                return { ...otherUser, connection_id: c.id };
            });
            setConnections(formatted);
        } catch (err) {
            console.log('Connections fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, user]);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const renderConnection = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.connectionCard}
            onPress={() => router.push(`/profile/${item.id}`)}
        >
            <View style={styles.avatarWrapper}>
                {item.avatar ? (
                    <RNImage source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>{item.name?.[0] || 'U'}</Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.verified && <ShieldCheck size={14} color={theme.colors.primary} fill={theme.colors.primaryLight} />}
                </View>
                <Text style={styles.role}>{item.profile?.headline || item.profile?.industry || 'Professional'}</Text>
            </View>

            <TouchableOpacity style={styles.messageBtn} onPress={() => router.push(`/messages/${item.id}`)}>
                <MessageSquare size={20} color={theme.colors.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: 'My Connections',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                        <ChevronLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                ),
            }} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={connections}
                    renderItem={renderConnection}
                    keyExtractor={item => `conn-${item.id}`}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchConnections} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.empty}>
                            <Users size={60} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>No Connections Yet</Text>
                            <Text style={styles.emptySubtitle}>Start connecting with professionals in the Linkup tab.</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    connectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12, ...theme.shadows.sm },
    avatarWrapper: { marginRight: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { color: theme.colors.primary, fontWeight: 'bold' },
    info: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    role: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    messageBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginTop: 20 },
    emptySubtitle: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, paddingHorizontal: 40 },
});
