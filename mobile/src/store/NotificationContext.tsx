import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface NotificationContextType {
    unreadCount: number;
    unreadMessageCount: number;
    notifications: any[];
    loading: boolean;
    refresh: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllRead: () => Promise<void>;
    deleteAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);

    const registerForPushNotificationsAsync = async () => {
        if (!Device.isDevice) {
            console.log('Push Notifications require a physical device');
            return;
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token: permission not granted');
                return;
            }

            // Dynamically get Project ID from app.json
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;

            if (!projectId) {
                console.log('Push Info: No Project ID. Run "eas project:init" to enable notifications.');
                return;
            }

            if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
                console.log('Push Info: Android notifications require a Development Build (not Expo Go).');
                return;
            }

            console.log('Attempting to fetch Expo Push Token...');
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: projectId
            });

            const pushToken = tokenData.data;
            console.log('Push Token Obtained:', pushToken);

            await client.post('/auth/push-token', { token: pushToken });
        } catch (err: any) {
            console.log('Push Registration Info:', err.message);
        }
    };

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const [notifRes, msgRes] = await Promise.all([
                client.get('/notifications'),
                client.get('/messages/unread-count')
            ]);

            const data = notifRes.data || [];

            setNotifications(data);
            const unread = data.filter((n: any) => !n.read).length;
            setUnreadCount(unread);
            setUnreadMessageCount(msgRes.data.unread_count || 0);
        } catch (err) {
            console.log('Notification fetch error:', err);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
            registerForPushNotificationsAsync();
            const interval = setInterval(fetchNotifications, 20000);
            return () => clearInterval(interval);
        } else {
            setUnreadCount(0);
            setNotifications([]);
        }
    }, [token, fetchNotifications]);

    const markAsRead = async (id: number) => {
        try {
            await client.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.log('Error marking as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await client.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.log('Error marking all read:', err);
        }
    };

    const deleteAll = async () => {
        try {
            await client.delete('/notifications/delete-all');
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.log('Error deleting all notifications:', err);
        }
    };

    const refresh = async () => {
        setLoading(true);
        await fetchNotifications();
        setLoading(false);
    };

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            unreadMessageCount,
            notifications,
            loading,
            refresh,
            markAsRead,
            markAllRead,
            deleteAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
