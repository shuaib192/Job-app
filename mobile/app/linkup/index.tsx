import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Animated, PanResponder, Image, Modal, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/store/AuthContext';
import client from '../../src/api/client';
import { ArrowLeft, X, MapPin, Heart, RefreshCw, Search, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

// Isolated Search Bar Component to prevent re-renders in the main list
const LinkupSearchBar = memo(({ visible, onSearch }: { visible: boolean; onSearch: (query: string) => void }) => {
    const [localQuery, setLocalQuery] = useState('');

    if (!visible) return null;

    const handleSearch = () => {
        onSearch(localQuery);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <View style={styles.searchIcon}>
                    <Search size={20} color={theme.colors.textMuted} />
                </View>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search roles, industry..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={localQuery}
                    onChangeText={setLocalQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />
                {localQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setLocalQuery('')}>
                        <View style={{ padding: 4 }}>
                            <Text style={{ color: theme.colors.textMuted }}>✕</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.goButton} onPress={handleSearch}>
                <Text style={styles.goButtonText}>Go</Text>
            </TouchableOpacity>
        </View>
    );
});

export default function LinkupScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const position = useRef(new Animated.ValueXY()).current;

    const [lastCandidate, setLastCandidate] = useState<any>(null);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchedUser, setMatchedUser] = useState<any>(null);

    const [searchBarVisible, setSearchBarVisible] = useState(false);
    const [activeQuery, setActiveQuery] = useState('');

    const fetchCandidates = useCallback(async (query = '') => {
        try {
            setLoading(true);
            const url = query ? `/feed/candidates?search=${query}` : '/feed/candidates';
            const response = await client.get(url);
            const data = response?.data || [];
            setCandidates(Array.isArray(data) ? data : []);
            setCurrentIndex(0);
        } catch (err) {
            console.log('Candidates fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const onSearchTrigger = (query: string) => {
        setActiveQuery(query);
        fetchCandidates(query);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    forceSwipe('left');
                } else {
                    resetPosition();
                }
            },
        })
    ).current;

    const forceSwipe = (direction: 'right' | 'left') => {
        const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = (direction: 'right' | 'left') => {
        const item = candidates[currentIndex];
        if (!item) return;

        if (direction === 'right') {
            handleLike(item.id);
        } else {
            setLastCandidate(item);
        }

        position.setValue({ x: 0, y: 0 });
        setCurrentIndex((prev) => prev + 1);
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    };

    const handleLike = async (userId: number) => {
        try {
            const response = await client.post(`/connections/send/${userId}`);
            if (response.data.is_match) {
                setMatchedUser(candidates.find(c => c.id === userId));
                setShowMatchModal(true);
            }
        } catch (err) {
            console.log('Like error:', err);
        }
    };

    const handleUndo = () => {
        if (!lastCandidate || currentIndex === 0) return;
        setCurrentIndex(prev => prev - 1);
        setLastCandidate(null);
        position.setValue({ x: 0, y: 0 });
    };

    const getCardStyle = () => {
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-30deg', '0deg', '30deg'],
        });

        return {
            ...position.getLayout(),
            transform: [{ rotate }],
        };
    };

    const renderCard = (item: any, isTop: boolean) => {
        if (!item) return null;

        const cardContent = (
            <View style={styles.cardContent}>
                {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#E2E8F0' }]}>
                        <View style={styles.placeholderAvatar}>
                            <Text style={styles.placeholderText}>{item.name?.[0] || 'U'}</Text>
                        </View>
                    </View>
                )}

                {/* Safer LinearGradient - Fixed props to avoid Android crash */}
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
                    locations={[0, 0.6, 1]}
                    style={styles.gradient}
                >
                    <View style={styles.infoContainer}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{item.name}</Text>
                            {item.age && <Text style={styles.age}>, {item.age}</Text>}
                        </View>
                        <Text style={styles.role}>{item.profile?.headline || item.profile?.industry || 'Professional'}</Text>
                        {item.location && (
                            <View style={styles.row}>
                                <MapPin size={14} color="#CBD5E1" />
                                <Text style={styles.location}>{item.location}</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                {isTop && (
                    <>
                        <Animated.View style={[styles.likeLabel, { opacity: position.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1] }) }]}>
                            <Text style={styles.likeText}>LIKE</Text>
                        </Animated.View>
                        <Animated.View style={[styles.nopeLabel, { opacity: position.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0] }) }]}>
                            <Text style={styles.nopeText}>NOPE</Text>
                        </Animated.View>
                    </>
                )}
            </View>
        );

        if (!isTop) {
            return <View style={[styles.card, styles.cardBehind]}>{cardContent}</View>;
        }

        return (
            <Animated.View {...panResponder.panHandlers} style={[styles.card, getCardStyle()]}>
                {cardContent}
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>Linkup</Text>
                        <View style={styles.onlineBadge} />
                    </View>
                    <TouchableOpacity onPress={() => setSearchBarVisible(!searchBarVisible)} style={[styles.iconButton, searchBarVisible && styles.activeButton]}>
                        <Search size={24} color={searchBarVisible ? theme.colors.primary : theme.colors.text} />
                    </TouchableOpacity>
                </View>

                <LinkupSearchBar visible={searchBarVisible} onSearch={onSearchTrigger} />

                <View style={styles.deckContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.loadingText}>Loading professionals...</Text>
                        </View>
                    ) : currentIndex >= candidates.length ? (
                        <View style={styles.noMoreContainer}>
                            <View style={styles.emptyIcon}><RefreshCw size={40} color={theme.colors.primary} /></View>
                            <Text style={styles.noMoreTitle}>All caught up!</Text>
                            <Text style={styles.noMoreText}>No more profiles to show right now.</Text>
                            <TouchableOpacity style={styles.refreshButton} onPress={() => fetchCandidates(activeQuery)}>
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        candidates.slice(currentIndex, currentIndex + 2).reverse().map((item, index) => {
                            const isTop = index === 1 || candidates.length - currentIndex === 1;
                            return <View key={item.id} style={StyleSheet.absoluteFill}>{renderCard(item, isTop)}</View>;
                        })
                    )}
                </View>

                {!loading && currentIndex < candidates.length && (
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.controlButtonSmall} onPress={handleUndo} disabled={!lastCandidate}>
                            <RefreshCw size={22} color={lastCandidate ? '#F59E0B' : '#94A3B8'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.controlButton, styles.passButton]} onPress={() => forceSwipe('left')}>
                            <X size={32} color="#EF4444" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.controlButton, styles.likeButton]} onPress={() => forceSwipe('right')}>
                            <Heart size={32} color="#10B981" fill="#10B981" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.controlButtonSmall} onPress={() => console.log('Star')}>
                            <Star size={22} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>
                )}

                <Modal visible={showMatchModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Heart size={50} color={theme.colors.primary} fill={theme.colors.primary} />
                            <Text style={styles.matchTitle}>Matched!</Text>
                            <Text style={styles.matchSubtitle}>You and {matchedUser?.name} linked up.</Text>
                            <View style={styles.matchAvatars}>
                                {user?.avatar && <Image source={{ uri: user.avatar }} style={styles.matchAvatar} />}
                                {matchedUser?.avatar && <Image source={{ uri: matchedUser.avatar }} style={styles.matchAvatar} />}
                            </View>
                            <TouchableOpacity style={styles.messageButton} onPress={() => { setShowMatchModal(false); router.push(`/messages/${matchedUser?.id}`); }}>
                                <Text style={styles.messageButtonText}>Chat Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowMatchModal(false)}><Text style={styles.keepSwipingText}>Keep Swiping</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    logoText: { fontSize: 24, fontWeight: '900', color: theme.colors.primary, letterSpacing: -1 },
    onlineBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
    iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
    activeButton: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: theme.colors.primary },
    deckContainer: { flex: 1, marginVertical: 10 },
    card: { width: SCREEN_WIDTH * 0.92, height: '100%', maxHeight: 600, borderRadius: 28, backgroundColor: '#fff', ...theme.shadows.md, alignSelf: 'center', position: 'absolute', overflow: 'hidden' },
    cardBehind: { transform: [{ scale: 0.96 }, { translateY: 15 }], opacity: 0.8, zIndex: -1 },
    cardContent: { flex: 1 },
    placeholderAvatar: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 120, fontWeight: 'bold', color: theme.colors.primary, opacity: 0.2 },
    gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%', justifyContent: 'flex-end', padding: 24 },
    infoContainer: { marginBottom: 10 },
    nameRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
    name: { fontSize: 32, fontWeight: '800', color: '#fff' },
    age: { fontSize: 26, color: '#E2E8F0' },
    role: { fontSize: 18, color: '#E2E8F0', fontWeight: '600', marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    location: { fontSize: 16, color: '#CBD5E1' },
    controls: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingBottom: 30 },
    controlButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.md },
    controlButtonSmall: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
    passButton: { backgroundColor: '#FEF2F2' },
    likeButton: { backgroundColor: '#F0FDF4' },
    likeLabel: { position: 'absolute', top: 50, left: 30, borderWidth: 5, borderColor: '#10B981', padding: 10, borderRadius: 10, transform: [{ rotate: '-25deg' }] },
    likeText: { fontSize: 40, fontWeight: '900', color: '#10B981' },
    nopeLabel: { position: 'absolute', top: 50, right: 30, borderWidth: 5, borderColor: '#EF4444', padding: 10, borderRadius: 10, transform: [{ rotate: '25deg' }] },
    nopeText: { fontSize: 40, fontWeight: '900', color: '#EF4444' },
    searchContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 15, gap: 10 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 50, ...theme.shadows.sm },
    searchInput: { flex: 1, fontSize: 16, color: '#1E293B', height: '100%' },
    goButton: { backgroundColor: theme.colors.primary, borderRadius: 16, paddingHorizontal: 20, height: 50, justifyContent: 'center', alignItems: 'center' },
    goButtonText: { color: '#fff', fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: '#64748B', fontWeight: '500' },
    noMoreContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    noMoreTitle: { fontSize: 24, fontWeight: '800', marginTop: 20 },
    noMoreText: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 10, marginBottom: 30 },
    refreshButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
    refreshButtonText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 32, padding: 32, alignItems: 'center' },
    matchTitle: { fontSize: 36, fontWeight: '900', color: theme.colors.primary, marginTop: 15 },
    matchSubtitle: { fontSize: 18, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    matchAvatars: { flexDirection: 'row', gap: -20, marginBottom: 30 },
    matchAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
    messageButton: { width: '100%', backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
    messageButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    keepSwipingText: { color: '#94A3B8', fontWeight: '600' },
});
