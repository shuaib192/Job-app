import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { UserPlus, UserCheck, MessageSquare, X } from 'lucide-react-native';
import { theme } from '../theme';
import client from '../api/client';

interface ConnectButtonProps {
    userId: number;
    initialStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | null;
    onStatusChange?: (newStatus: string | null) => void;
    size?: 'small' | 'medium';
    showIcon?: boolean;
}

export const ConnectButton = ({
    userId,
    initialStatus,
    onStatusChange,
    size = 'medium',
    showIcon = true
}: ConnectButtonProps) => {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        setLoading(true);
        try {
            let nextStatus = status;
            if (!status || status === 'none') {
                await client.post(`/connections/send/${userId}`);
                nextStatus = 'pending_sent';
            } else if (status === 'pending_sent') {
                await client.delete(`/connections/${userId}/cancel`);
                nextStatus = null;
            } else if (status === 'pending_received') {
                // For simplicity, we navigate to requests or accept here
                // But usually, a separate "Accept" UI is better.
                // Let's just accept for now to make it "work"
                await client.post(`/connections/send/${userId}`); // This auto-accepts mutual
                nextStatus = 'accepted';
            } else if (status === 'accepted') {
                // Maybe don't allow remove from a simple button to prevent accidents
                // Or just show "Message"
                return;
            }

            setStatus(nextStatus);
            if (onStatusChange) onStatusChange(nextStatus);
        } catch (err) {
            console.log('Connect action error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'accepted') {
        return (
            <TouchableOpacity
                style={[styles.button, styles.connected, size === 'small' && styles.small]}
                disabled
            >
                {showIcon && <UserCheck size={size === 'small' ? 14 : 18} color={theme.colors.success} />}
                <Text style={[styles.text, styles.connectedText, size === 'small' && styles.smallText]}>Connected</Text>
            </TouchableOpacity>
        );
    }

    const getButtonContent = () => {
        if (loading) return <ActivityIndicator size="small" color={status === 'pending_sent' ? theme.colors.textMuted : theme.colors.white} />;

        switch (status) {
            case 'pending_sent':
                return (
                    <>
                        <Text style={[styles.text, styles.pendingText, size === 'small' && styles.smallText]}>Pending</Text>
                        <X size={14} color={theme.colors.textMuted} />
                    </>
                );
            case 'pending_received':
                return (
                    <>
                        <UserPlus size={size === 'small' ? 14 : 18} color={theme.colors.white} />
                        <Text style={[styles.text, size === 'small' && styles.smallText]}>Accept</Text>
                    </>
                );
            default:
                return (
                    <>
                        <UserPlus size={size === 'small' ? 14 : 18} color={theme.colors.white} />
                        <Text style={[styles.text, size === 'small' && styles.smallText]}>Connect</Text>
                    </>
                );
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                status === 'pending_sent' ? styles.pending : styles.primary,
                size === 'small' && styles.small
            ]}
            onPress={handlePress}
            disabled={loading}
        >
            {getButtonContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
        gap: theme.spacing.xs,
        minWidth: 100,
    },
    small: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        minWidth: 80,
    },
    primary: {
        backgroundColor: theme.colors.primary,
    },
    pending: {
        backgroundColor: theme.colors.borderLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    connected: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.success,
    },
    text: {
        ...theme.typography.captionMedium,
        color: theme.colors.white,
    },
    smallText: {
        fontSize: 11,
    },
    pendingText: {
        color: theme.colors.textSecondary,
    },
    connectedText: {
        color: theme.colors.success,
    }
});
