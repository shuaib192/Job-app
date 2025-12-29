import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Star, TrendingUp, UserPlus } from 'lucide-react-native';
import { Alert } from 'react-native';

export default function QuickMatchScreen() {
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const response = await client.get('/feed/matching');
            setMatches(response.data.recommended_people || []);
        } catch (err) {
            console.log('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId: number) => {
        try {
            await client.post(`/connections/send/${userId}`);
            Alert.alert('Success', 'Connection request sent!');
            // Refresh matches
            fetchMatches();
        } catch (err) {
            Alert.alert('Error', 'Failed to send connection request');
        }
    };

    const renderCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/profile/${item.user_id}`)}
            activeOpacity={0.9}
        >
            <View style={styles.cardHeader}>
                <View style={styles.matchBadge}>
                    <TrendingUp size={14} color={theme.colors.white} />
                    <Text style={styles.matchText}>{item.match_score > 0 ? 'High Match' : 'Potential Match'}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{item.user?.name?.[0] || 'U'}</Text>
                </View>
                <Text style={styles.name}>{item.user?.name}</Text>
                <Text style={styles.role}>{item.industry}</Text>

                <View style={styles.skillsContainer}>
                    {(item.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                        <View key={idx} style={styles.skillChip}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => handleConnect(item.user_id)}
                >
                    <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
            </View>
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
                    <View>
                        <Text style={styles.headerTitle}>Daily Quick Match</Text>
                        <Text style={styles.headerSubtitle}>Curated picks for you</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={matches}
                        renderItem={renderCard}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
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
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    headerSubtitle: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    backButton: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        ...theme.shadows.sm,
    },
    list: {
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        ...theme.shadows.md,
        overflow: 'hidden',
    },
    cardHeader: {
        height: 80,
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        alignItems: 'flex-end',
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    matchText: {
        color: theme.colors.white,
        fontWeight: '700',
        fontSize: 12,
    },
    cardContent: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        marginTop: -40,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: theme.colors.surface,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    name: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: 4,
    },
    role: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    skillChip: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    skillText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    connectButton: {
        marginTop: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    connectButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
        fontSize: 14,
    },
});
