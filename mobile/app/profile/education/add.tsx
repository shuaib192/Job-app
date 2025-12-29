import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../src/theme';
import client from '../../../src/api/client';
import { ArrowLeft, GraduationCap, School } from 'lucide-react-native';

export default function AddEducationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [school, setSchool] = useState('');
    const [degree, setDegree] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = async () => {
        if (!school || !degree || !startDate) {
            Alert.alert('Error', 'Please fill in the school, degree, and start date');
            return;
        }

        setLoading(true);
        try {
            await client.post('/profile/education', {
                school,
                degree,
                field_of_study: fieldOfStudy,
                start_date: startDate,
                end_date: endDate,
                description
            });

            Alert.alert('Success', 'Education added to your profile!');
            router.back();
        } catch (err: any) {
            console.log('Add education error:', err.response?.data || err.message);
            Alert.alert('Error', 'Failed to save education. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Add Education',
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
                    <Text style={styles.label}>School / University *</Text>
                    <View style={styles.inputWrapper}>
                        <School size={20} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. University of Lagos"
                            value={school}
                            onChangeText={setSchool}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Degree *</Text>
                    <View style={styles.inputWrapper}>
                        <GraduationCap size={20} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Bachelor of Science"
                            value={degree}
                            onChangeText={setDegree}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Field of Study</Text>
                    <TextInput
                        style={styles.simpleInput}
                        placeholder="e.g. Computer Science"
                        value={fieldOfStudy}
                        onChangeText={setFieldOfStudy}
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

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>End Date (or expected)</Text>
                        <TextInput
                            style={styles.simpleInput}
                            placeholder="MM/YYYY"
                            value={endDate}
                            onChangeText={setEndDate}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.simpleInput, styles.textArea]}
                        placeholder="Activities, societies, etc."
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
                        <Text style={styles.saveButtonText}>Save Education</Text>
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
