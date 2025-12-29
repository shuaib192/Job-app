import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../src/theme';
import client from '../../../src/api/client';
import { ArrowLeft, Calendar, Briefcase, Building } from 'lucide-react-native';

export default function AddExperienceScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [description, setDescription] = useState('');

    const handleSave = async () => {
        if (!title || !company || !startDate) {
            Alert.alert('Error', 'Please fill in the title, company, and start date');
            return;
        }

        setLoading(true);
        try {
            await client.post('/profile/experience', {
                title,
                company,
                location,
                start_date: startDate,
                end_date: isCurrent ? null : endDate,
                description
            });

            Alert.alert('Success', 'Experience added to your profile!');
            router.back();
        } catch (err: any) {
            console.log('Add experience error:', err.response?.data || err.message);
            Alert.alert('Error', 'Failed to save experience. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Add Experience',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: theme.colors.background }
                }}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Job Title *</Text>
                    <View style={styles.inputWrapper}>
                        <Briefcase size={20} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Senior Software Engineer"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Company *</Text>
                    <View style={styles.inputWrapper}>
                        <Building size={20} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Google"
                            value={company}
                            onChangeText={setCompany}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.simpleInput}
                        placeholder="e.g. Lagos, Nigeria"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View style={styles.currentRoleRow}>
                    <Text style={styles.currentRoleText}>I am currently working in this role</Text>
                    <Switch
                        value={isCurrent}
                        onValueChange={setIsCurrent}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    />
                </View>

                <View style={styles.dateRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Start Date *</Text>
                        <TextInput
                            style={styles.simpleInput}
                            placeholder="MM/YYYY"
                            value={startDate}
                            onChangeText={setStartDate}
                        />
                    </View>

                    {!isCurrent && (
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>End Date</Text>
                            <TextInput
                                style={styles.simpleInput}
                                placeholder="MM/YYYY"
                                value={endDate}
                                onChangeText={setEndDate}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.simpleInput, styles.textArea]}
                        placeholder="What did you do in this role?"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Experience</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.captionMedium,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    simpleInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    dateRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    currentRoleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
    },
    currentRoleText: {
        ...theme.typography.caption,
        color: theme.colors.text,
    },
    textArea: {
        minHeight: 120,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        ...theme.shadows.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
});
