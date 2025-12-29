/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../src/theme';
import { AuthProvider, useAuth } from '../src/store/AuthContext';
import { NotificationProvider } from '../src/store/NotificationContext';

function RootLayoutNav() {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';

        if (!user && inTabsGroup) {
            // User logged out, redirect to welcome
            router.replace('/');
        } else if (user && !inTabsGroup && !inAuthGroup && segments[0] !== 'messages') {
            // User is logged in but on welcome/auth screen, redirect to tabs
            // This handles the case after login
        }
    }, [user, segments, isLoading]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.surface,
                    },
                    headerShadowVisible: false,
                    headerTitleStyle: {
                        color: theme.colors.text,
                        fontWeight: '600',
                    },
                    contentStyle: {
                        backgroundColor: theme.colors.background,
                    },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="messages/[user_id]"
                    options={{
                        headerShown: true,
                        title: 'Chat',
                    }}
                />
                <Stack.Screen
                    name="job/[job_id]"
                    options={{
                        headerShown: true,
                        title: 'Job Details',
                    }}
                />
                <Stack.Screen
                    name="edit-profile"
                    options={{
                        headerShown: true,
                        title: 'Edit Profile',
                    }}
                />
                <Stack.Screen
                    name="settings/index"
                    options={{
                        headerShown: true,
                        title: 'Settings',
                    }}
                />
                <Stack.Screen
                    name="profile/[id]"
                    options={{
                        headerShown: true,
                        title: 'Profile',
                    }}
                />
                <Stack.Screen
                    name="linkup/index"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="linkup/nearby"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="linkup/quick-match"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NotificationProvider>
                    <RootLayoutNav />
                </NotificationProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
