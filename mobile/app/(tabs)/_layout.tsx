/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */
import { Tabs, useRouter } from 'expo-router';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../src/theme';
import { Briefcase, Users, MessageSquare, User, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../../src/store/NotificationContext';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { unreadCount, unreadMessageCount } = useNotifications();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    ...theme.typography.small,
                    marginTop: -4,
                },
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerShadowVisible: false,
                headerTitleStyle: {
                    ...theme.typography.h3,
                    color: theme.colors.text,
                },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => router.push('/notifications')}
                        style={{ marginRight: 20 }}
                    >
                        <View style={styles.notificationIcon}>
                            <Bell size={24} color={theme.colors.textSecondary} />
                            {unreadCount > 0 && <View style={styles.badge} />}
                        </View>
                    </TouchableOpacity>
                )
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Jobs',
                    tabBarIcon: ({ color, size }) => <Briefcase color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="network"
                options={{
                    title: 'Linkup',
                    tabBarIcon: ({ color, size }) => <Users color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={22} />,
                    tabBarBadge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    notificationIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.error,
        borderWidth: 2,
        borderColor: '#fff',
    }
});
