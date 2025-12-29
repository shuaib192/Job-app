import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, MapPin, UserPlus, Search } from 'lucide-react-native';
import { Alert } from 'react-native';

export default function NearbyScreen() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNearbyUsers();
    }, []);

    const fetchNearbyUsers = async () => {
        try {
            const response = await client.get('/feed/nearby');
            setUsers(response.data || []);
        } catch (err) {
            console.log('Nearby error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId: number) => {
        try {
            await client.post(`/connections/send/${userId}`);
            Alert.alert('Success', 'Connection request sent!');
            // Refresh list to remove the user
            fetchNearbyUsers();
        } catch (err) {
            Alert.alert('Error', 'Failed to send connection request');
        }
    };

    const renderUser = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/profile/${item.user_id}`)}
        >
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.user?.name?.[0] || 'U'}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.user?.name}</Text>
                <Text style={styles.role}>{item.industry}</Text>
                <View style={styles.locationContainer}>
                    <MapPin size={14} color={theme.colors.primary} />
                    <Text style={styles.location}>Nearby • {item.user?.location || 'Unknown'}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => handleConnect(item.user_id)}>
                <UserPlus size={20} color={theme.colors.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nearby Professionals</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        renderItem={renderUser}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.centered}>
                                <Text style={styles.emptyText}>No users found nearby</Text>
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
        padding: 20,
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
        padding: theme.spacing.md,
        gap: theme.spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    info: {
        flex: 1,
    },
    name: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    role: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    addButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
    },
    emptyText: {
        color: theme.colors.textMuted,
    }
});
