import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
    Image as RNImage,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Send, Sparkles, Bot, User, Zap, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/store/AuthContext';

const { width } = Dimensions.get('window');

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface AiConfig {
    enabled: boolean;
    name: string;
    greeting: string;
    suggested_prompts: string[];
}

// Typing indicator component
const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
                ])
            ).start();
        };
        animate(dot1, 0);
        animate(dot2, 150);
        animate(dot3, 300);
    }, []);

    const getStyle = (dot: Animated.Value) => ({
        transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
    });

    return (
        <View style={styles.typingContainer}>
            <Animated.View style={[styles.typingDot, getStyle(dot1)]} />
            <Animated.View style={[styles.typingDot, getStyle(dot2)]} />
            <Animated.View style={[styles.typingDot, getStyle(dot3)]} />
        </View>
    );
};

export default function AiChatScreen() {
    const router = useRouter();
    const { prompt } = useLocalSearchParams();
    const { user } = useAuth();
    const [config, setConfig] = useState<AiConfig | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (prompt && !loading && config?.enabled && messages.length === 0) {
            sendMessage(prompt as string);
        }
    }, [prompt, loading, config]);

    const fetchConfig = async () => {
        try {
            const response = await client.get('/ai/config');
            setConfig(response.data);
        } catch (err) {
            console.log('AI config error:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (text?: string) => {
        const messageText = text || inputText.trim();
        if (!messageText || sending) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setSending(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await client.post('/ai/chat', {
                message: messageText,
                history,
            });

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.response,
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err: any) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: err.response?.data?.error || 'Sorry, I encountered an issue. Please try again.',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';

        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
                {!isUser && (
                    <View style={styles.aiAvatar}>
                        <LinearGradient
                            colors={['#8B5CF6', '#6366F1']}
                            style={styles.aiAvatarGradient}
                        >
                            <Sparkles size={16} color="#fff" />
                        </LinearGradient>
                    </View>
                )}
                
                <View style={[
                    styles.messageBubble, 
                    isUser ? styles.userBubble : styles.aiBubble,
                    !isUser && { borderTopLeftRadius: 4 },
                    isUser && { borderTopRightRadius: 4 }
                ]}>
                    <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                        {item.content}
                    </Text>
                </View>

                {isUser && (
                    <View style={styles.userAvatar}>
                        {user?.avatar ? (
                            <RNImage source={{ uri: user.avatar }} style={styles.userAvatarImage} />
                        ) : (
                            <View style={styles.userAvatarGradient}>
                                <Text style={styles.userAvatarText}>{user?.name?.[0] || 'U'}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderSuggestedPrompts = () => {
        if (messages.length > 0 || !config?.suggested_prompts) return null;

        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Try asking...</Text>
                {config.suggested_prompts.map((prompt, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.suggestionChip}
                        onPress={() => sendMessage(prompt)}
                    >
                        <Zap size={14} color={theme.colors.primary} />
                        <Text style={styles.suggestionText}>{prompt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!config?.enabled) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.disabledContainer}>
                    <Bot size={60} color={theme.colors.textMuted} />
                    <Text style={styles.disabledTitle}>AI Assistant Unavailable</Text>
                    <Text style={styles.disabledText}>The AI assistant is currently disabled. Please check back later.</Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <LinearGradient
                    colors={['#8B5CF6', '#6366F1', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <View style={styles.headerAvatar}>
                            <Sparkles size={20} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>{config.name}</Text>
                            <Text style={styles.headerSubtitle}>Your AI Career Assistant</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setMessages([])} style={styles.headerAction}>
                        <RefreshCw size={20} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </LinearGradient>

                <KeyboardAvoidingView
                    style={styles.chatContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                        ListHeaderComponent={() => (
                            <View style={styles.welcomeContainer}>
                                <View style={styles.welcomeIconContainer}>
                                    <LinearGradient
                                        colors={['#8B5CF6', '#6366F1']}
                                        style={styles.welcomeIcon}
                                    >
                                        <Sparkles size={32} color="#fff" />
                                    </LinearGradient>
                                </View>
                                <Text style={styles.welcomeTitle}>Hi, I'm {config.name}! 👋</Text>
                                <Text style={styles.welcomeText}>{config.greeting}</Text>
                            </View>
                        )}
                        ListFooterComponent={() => (
                            <>
                                {renderSuggestedPrompts()}
                                {sending && (
                                    <View style={[styles.messageRow]}>
                                        <View style={styles.aiAvatar}>
                                            <LinearGradient
                                                colors={['#8B5CF6', '#6366F1']}
                                                style={styles.aiAvatarGradient}
                                            >
                                                <Sparkles size={16} color="#fff" />
                                            </LinearGradient>
                                        </View>
                                        <View style={[styles.messageBubble, styles.aiBubble]}>
                                            <TypingIndicator />
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    />

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ask me anything..."
                                placeholderTextColor={theme.colors.textMuted}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={2000}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
                                onPress={() => sendMessage()}
                                disabled={!inputText.trim() || sending}
                            >
                                <LinearGradient
                                    colors={inputText.trim() && !sending ? ['#8B5CF6', '#6366F1'] : ['#CBD5E1', '#94A3B8']}
                                    style={styles.sendButtonGradient}
                                >
                                    <Send size={18} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.poweredBy}>Powered by NexaWork AI</Text>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: Platform.OS === 'android' ? 50 : 16,
    },
    headerBack: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        gap: 12,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        padding: 20,
        paddingBottom: 20,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    welcomeIconContainer: {
        marginBottom: 16,
    },
    welcomeIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    suggestionsContainer: {
        marginTop: 10,
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...theme.shadows.sm,
    },
    suggestionText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
        width: '100%',
    },
    messageRowAi: {
        justifyContent: 'flex-start',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    aiAvatar: {
        marginRight: 8,
    },
    aiAvatarGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginLeft: 8,
        overflow: 'hidden',
    },
    userAvatarGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    userAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    messageBubble: {
        maxWidth: width * 0.75,
        padding: 14,
        borderRadius: 18,
        flexShrink: 1,
    },
    aiBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...theme.shadows.sm,
    },
    userBubble: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        color: theme.colors.text,
    },
    userMessageText: {
        color: '#fff',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#94A3B8',
    },
    inputContainer: {
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 15,
        maxHeight: 100,
        color: theme.colors.text,
    },
    sendButton: {
        overflow: 'hidden',
        borderRadius: 22,
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonGradient: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    poweredBy: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 11,
        color: theme.colors.textMuted,
        fontWeight: '500',
    },
    disabledContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    disabledTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    disabledText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
    },
    backBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 16,
    },
    backBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
