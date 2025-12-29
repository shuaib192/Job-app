import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

export default function DashboardLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackTitleVisible: false,
            }}
        />
    );
}
