import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image as RNImage, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/store/AuthContext';
import client from '../../src/api/client';
import { Send, ArrowLeft, Image as ImageIcon, FileText, Plus, X, Reply, Copy, Download, Smile, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ImageViewer } from '../../src/components/ImageViewer';
import { EmojiPicker } from '../../src/components/EmojiPicker';
import { useNotifications } from '../../src/store/NotificationContext';
import { SERVER_URL } from '../../src/api/client';

export default function ChatScreen() {
    const { user_id } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const { refresh: refreshNotifications } = useNotifications();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerImages, setViewerImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        fetchMessages();

        // Polling for new messages every 8 seconds to stay within rate limits
        const interval = setInterval(fetchMessages, 8000);
        return () => clearInterval(interval);
    }, [user_id]);

    const fetchMessages = async () => {
        try {
            const response = await client.get(`/messages/${user_id}`);
            const msgs = response.data || [];

            if (msgs.length !== messages.length || loading) {
                // Messages from API are oldest first, keep that order for chat display
                setMessages(msgs);

                // Trigger global refresh to update badges
                refreshNotifications();
            }

            // Get other user info from first message
            if (msgs.length > 0 && !otherUser) {
                const firstMsg = msgs[0];
                setOtherUser(firstMsg.sender_id == user_id ? firstMsg.sender : firstMsg.receiver);
            }
        } catch (err) {
            console.log('Messages fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
        });


        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setSelectedFile(null);
        }
    };

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
        });

        if (!result.canceled) {
            setSelectedFile(result.assets[0]);
            setSelectedImage(null);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() && !selectedImage && !selectedFile) return;
        if (sending) return;

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('message', newMessage.trim());

            if (selectedImage) {
                const filename = selectedImage.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                formData.append('image_file', {
                    uri: Platform.OS === 'ios' ? selectedImage.replace('file://', '') : selectedImage,
                    name: filename,
                    type,
                } as any);
            }

            if (selectedFile) {
                formData.append('file', {
                    uri: Platform.OS === 'ios' ? selectedFile.uri.replace('file://', '') : selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.mimeType || 'application/octet-stream',
                } as any);
            }

            // Detect type
            let msgType = 'text';
            if (selectedFile) msgType = 'file';
            else if (selectedImage) msgType = 'image';
            formData.append('type', msgType);

            const response = await client.post(`/messages/${user_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            setSelectedImage(null);
            setSelectedFile(null);
            setReplyingTo(null);
        } catch (err) {
            console.log('Send message error:', err);
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const downloadFile = async (url: string, fileName?: string) => {
        try {
            // If it's already a local file, just share it
            if (url.startsWith('file://')) {
                if (Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(url);
                } else {
                    Alert.alert('Info', 'File is already local: ' + url);
                }
                return;
            }

            // If it's base64, we need to save it first (simplifying: just alert for now or ignore)
            if (url.startsWith('data:')) {
                Alert.alert('Info', 'Direct download for unsaved media is not supported yet.');
                return;
            }

            // Ensure absolute URL
            let absoluteUrl = url;
            if (!url.startsWith('http')) {
                absoluteUrl = SERVER_URL + (url.startsWith('/') ? '' : '/') + url;
            }

            const name = fileName || absoluteUrl.split('/').pop() || 'download';
            const fileUri = FileSystem.documentDirectory + name;

            console.log('Downloading from:', absoluteUrl);
            const downloadRes = await FileSystem.downloadAsync(absoluteUrl, fileUri);

            if (Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                Alert.alert('Success', 'File downloaded to ' + downloadRes.uri);
            }
        } catch (err) {
            console.log('Download error:', err);
            Alert.alert('Error', 'Failed to download file');
        }
    };

    const handleLongPress = (message: any) => {
        setSelectedMessage(message);
        const isMe = message.sender_id === user?.id;

        const options: import('react-native').AlertButton[] = [
            { text: 'Reply', onPress: () => setReplyingTo(message) },
            { text: 'Copy Text', onPress: () => copyMessage(message) },
        ];

        if (message.image || message.file_url) {
            options.push({
                text: 'Download File',
                onPress: () => downloadFile(message.image || message.file_url, message.image ? 'image.jpg' : undefined)
            });
        }

        if (isMe) {
            options.push({ text: 'Delete', onPress: () => deleteMessage(message), style: 'destructive' as const });
        }

        options.push({ text: 'Cancel', style: 'cancel' as const });

        Alert.alert('Message Actions', undefined, options);
    };

    const copyMessage = async (message: any) => {
        // In a real app, use Clipboard API
        Alert.alert('Copied', 'Message copied to clipboard');
    };

    const forwardMessage = (message: any) => {
        Alert.alert('Forward', 'Forward feature coming soon!');
    };

    const deleteMessage = async (message: any) => {
        try {
            await client.delete(`/messages/${message.id}`);
            setMessages(prev => prev.filter(m => m.id !== message.id));
            Alert.alert('Deleted', 'Message deleted');
        } catch (err) {
            console.log('Delete error:', err);
            Alert.alert('Error', 'Could not delete message');
        }
    };

    const reactToMessage = async (message: any, reaction: string) => {
        // Placeholder for reaction logic
        Alert.alert('Reacted', `You reacted with ${reaction}`);
    };

    const openFile = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open file'));
    };


    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.sender_id === user?.id;
        const getStatusText = () => {
            if (!isMe) return null;
            if (item.is_read) return 'Viewed';
            return 'Sent';
        };

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onLongPress={() => handleLongPress(item)}
                delayLongPress={300}
            >
                <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
                    <View style={styles.messageContentContainer}>
                        {!isMe && (
                            <View style={styles.bubbleAvatarContainer}>
                                {otherUser?.avatar || item.sender?.avatar ? (
                                    <RNImage source={{ uri: otherUser?.avatar || item.sender?.avatar }} style={styles.bubbleAvatar} />
                                ) : (
                                    <View style={styles.bubbleAvatarPlaceholder}>
                                        <Text style={styles.bubbleAvatarText}>
                                            {(otherUser?.name || item.sender?.name)?.[0] || '?'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                            {item.image && item.image.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setViewerImages([item.image]);
                                        setViewerVisible(true);
                                    }}
                                >
                                    <RNImage source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover" />
                                    <View style={styles.imageOverlay}>
                                        <Text style={styles.tapToView}>Tap to view</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            {item.file_url && item.file_url.length > 0 && (
                                item.type === 'audio' ? (
                                    <View style={styles.voiceMessageContainer}>
                                        <View style={[styles.playButton, isMe && styles.myPlayButton]}>
                                            <TouchableOpacity onPress={() => {/* Handle play */ }}>
                                                <View style={{ width: 12, height: 12, backgroundColor: isMe ? theme.colors.primary : '#fff', transform: [{ rotate: '45deg' }], marginLeft: 4 }} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={[styles.waveformContainer, isMe && styles.myWaveformContainer]}>
                                            <View style={[styles.waveformProgress, { width: '40%' }]} />
                                        </View>
                                        <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText, { alignSelf: 'flex-end', marginTop: 10 }]}>0:12</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.fileContainer}
                                        onPress={() => {
                                            if (item.file_url) {
                                                Linking.openURL(item.file_url).catch(() => {
                                                    Alert.alert('Error', 'Cannot open this file');
                                                });
                                            }
                                        }}
                                    >
                                        <FileText size={24} color={isMe ? theme.colors.white : theme.colors.primary} />
                                        <View style={styles.fileInfo}>
                                            <Text style={[styles.fileText, isMe && { color: theme.colors.white }]} numberOfLines={1}>Document</Text>
                                            <Text style={[styles.fileTap, isMe && { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>Tap to download</Text>
                                        </View>
                                        <Download size={16} color={isMe ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted} />
                                    </TouchableOpacity>
                                )
                            )}
                            {item.message && item.message.length > 0 && (
                                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                                    {item.message}
                                </Text>
                            )}
                            <View style={styles.messageFooter}>
                                <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                                    {formatTime(item.created_at)}
                                </Text>
                                {isMe && (
                                    <Text style={[styles.statusText, item.is_read && styles.statusRead]}>
                                        {getStatusText()}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {isMe && (
                            <View style={styles.bubbleAvatarContainer}>
                                {user?.avatar ? (
                                    <RNImage source={{ uri: user.avatar }} style={styles.bubbleAvatar} />
                                ) : (
                                    <View style={[styles.bubbleAvatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                                        <Text style={[styles.bubbleAvatarText, { color: '#fff' }]}>{user?.name?.[0] || '?'}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };



    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: otherUser?.name || 'Chat',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.container} edges={['bottom']}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={90}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
                            </View>
                        )}
                        onContentSizeChange={() => {
                            if (!showScrollBottom) {
                                flatListRef.current?.scrollToEnd();
                            }
                        }}
                        onScroll={(event) => {
                            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

                            // Show scroll to bottom if we are far from the bottom (e.g. 200px)
                            const isFarFromBottom = contentOffset.y < contentSize.height - layoutMeasurement.height - 200;
                            setShowScrollBottom(isFarFromBottom);

                            // Show scroll to top if we are far from the top (e.g. 500px)
                            const isFarFromTop = contentOffset.y > 500;
                            setShowScrollTop(isFarFromTop);
                        }}
                        scrollEventThrottle={16}
                    />

                    {/* Scroll Buttons */}
                    {showScrollBottom && (
                        <TouchableOpacity
                            style={[styles.scrollFab, styles.scrollBottomFab]}
                            onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        >
                            <ChevronDown size={24} color={theme.colors.white} />
                        </TouchableOpacity>
                    )}

                    {showScrollTop && (
                        <TouchableOpacity
                            style={[styles.scrollFab, styles.scrollTopFab]}
                            onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
                        >
                            <ChevronUp size={24} color={theme.colors.white} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.inputWrapper}>
                        {selectedImage && (
                            <View style={styles.previewContainer}>
                                <RNImage source={{ uri: selectedImage }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removePreview} onPress={() => setSelectedImage(null)}>
                                    <X size={16} color={theme.colors.white} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {selectedFile && (
                            <View style={styles.previewContainer}>
                                <View style={styles.filePreview}>
                                    <FileText size={24} color={theme.colors.primary} />
                                    <Text style={styles.filePreviewText} numberOfLines={1}>{selectedFile.name}</Text>
                                </View>
                                <TouchableOpacity style={styles.removePreview} onPress={() => setSelectedFile(null)}>
                                    <X size={16} color={theme.colors.white} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {/* Reply Preview Bar */}
                        {replyingTo && (
                            <View style={styles.replyBar}>
                                <View style={styles.replyBarContent}>
                                    <Reply size={16} color={theme.colors.primary} />
                                    <View style={styles.replyBarText}>
                                        <Text style={styles.replyBarLabel}>Replying to {replyingTo.sender_id === user?.id ? 'yourself' : otherUser?.name}</Text>
                                        <Text style={styles.replyBarMessage} numberOfLines={1}>{replyingTo.message || 'Media'}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                    <X size={20} color={theme.colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <TouchableOpacity style={styles.attachButton} onPress={() => setShowEmojiPicker(true)}>
                                <Smile size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
                                <ImageIcon size={24} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.attachButton} onPress={pickFile}>
                                <Plus size={24} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                placeholder="Type a message..."
                                placeholderTextColor={theme.colors.textMuted}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                                maxLength={1000}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, (!newMessage.trim() && !selectedImage && !selectedFile) && styles.sendButtonDisabled]}
                                onPress={sendMessage}
                                disabled={sending || (!newMessage.trim() && !selectedImage && !selectedFile)}
                            >
                                {sending ? (
                                    <ActivityIndicator size="small" color={theme.colors.white} />
                                ) : (
                                    <Send size={20} color={theme.colors.white} />
                                )}
                            </TouchableOpacity>

                        </View>
                    </View>
                </KeyboardAvoidingView>

                <ImageViewer
                    visible={viewerVisible}
                    images={viewerImages}
                    onClose={() => setViewerVisible(false)}
                />

                <EmojiPicker
                    visible={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onEmojiSelect={(emoji) => {
                        setNewMessage(prev => prev + emoji);
                    }}
                />
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
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    backButton: {
        marginRight: theme.spacing.sm,
    },
    messagesList: {
        padding: theme.spacing.md,
        paddingBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    messageContentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        maxWidth: '85%',
    },
    fileInfo: {
        flex: 1,
        minWidth: 120,
    },
    bubbleAvatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginHorizontal: 8,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
    },
    bubbleAvatar: {
        width: 32,
        height: 32,
    },
    bubbleAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleAvatarText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748B',
    },
    messageBubble: {
        padding: theme.spacing.md,
        borderRadius: 20,
        flexShrink: 1,
    },
    myBubble: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 4,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    messageText: {
        ...theme.typography.body,
        lineHeight: 22,
    },
    logoutText: {
        color: theme.colors.error,
    },
    recordingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.primaryLight,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.error,
        marginRight: 8,
    },
    recordingText: {
        flex: 1,
        ...theme.typography.bodySemibold,
        color: theme.colors.primary,
    },
    cancelRecording: {
        ...theme.typography.captionMedium,
        color: theme.colors.error,
        padding: 4,
    },
    voiceMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 8,
        minWidth: 200,
    },
    myVoiceMessage: {
        // Additional styles for my voice messages if needed
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    myPlayButton: {
        backgroundColor: theme.colors.white,
    },
    waveformContainer: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    myWaveformContainer: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    waveformProgress: {
        height: '100%',
        backgroundColor: theme.colors.primary,
    },
    myWaveformProgress: {
        backgroundColor: theme.colors.white,
    },
    voiceDuration: {
        ...theme.typography.captionMedium,
        color: theme.colors.textSecondary,
        minWidth: 35,
    },
    myVoiceDuration: {
        color: theme.colors.white,
    },
    myMessageText: {
        color: theme.colors.white,
    },
    theirMessageText: {
        color: theme.colors.text,
    },
    timeText: {
        ...theme.typography.small,
        marginTop: theme.spacing.xs,
    },
    myTimeText: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    theirTimeText: {
        color: theme.colors.textMuted,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
    },
    inputWrapper: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        padding: theme.spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8,
        maxHeight: 100,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    attachButton: {
        padding: 8,
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        marginBottom: 8,
        position: 'relative',
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingRight: 30,
    },
    filePreviewText: {
        ...theme.typography.smallMedium,
        color: theme.colors.textSecondary,
    },
    removePreview: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 2,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginBottom: 8,
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    fileText: {
        ...theme.typography.smallMedium,
        color: theme.colors.text,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    // Reply Bar Styles
    replyBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.primaryLight,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    replyBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: theme.spacing.sm,
    },
    replyBarText: {
        flex: 1,
    },
    replyBarLabel: {
        ...theme.typography.small,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    replyBarMessage: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    // Reply Preview on Message
    replyPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
        paddingHorizontal: 8,
    },
    myReplyPreview: {
        alignSelf: 'flex-end',
    },
    theirReplyPreview: {
        alignSelf: 'flex-start',
    },
    replyPreviewText: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
    },
    // Image Overlay
    imageOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    tapToView: {
        ...theme.typography.small,
        color: 'rgba(255,255,255,0.8)',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    // File Info
    fileInfo: {
        flex: 1,
    },
    fileTap: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
        fontSize: 10,
    },
    // Message Footer
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    readReceipt: {
        fontSize: 10,
        color: theme.colors.primary,
    },
    statusText: {
        fontSize: 10,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
    },
    statusRead: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    // Scroll FABs
    scrollFab: {
        position: 'absolute',
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
        zIndex: 10,
    },
    scrollBottomFab: {
        bottom: 150, // Above the input wrapper
    },
    scrollTopFab: {
        top: 20,
    },
});


