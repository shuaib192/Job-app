import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Building2, Globe, MapPin, Briefcase } from 'lucide-react-native';

export default function CreateCompanyScreen() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        website: '',
        location: '',
    });

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Company name is required');
            return;
        }

        setSubmitting(true);
        try {
            await client.post('/companies', formData);
            Alert.alert('Success', 'Company profile created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            console.log('Create company error:', err);
            Alert.alert('Error', 'Failed to create company profile.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Company</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.iconSection}>
                    <View style={styles.iconContainer}>
                        <Building2 size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.iconText}>Business Profile</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company Name *</Text>
                        <View style={styles.inputContainer}>
                            <Building2 size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Acme Corporation"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Industry</Text>
                        <View style={styles.inputContainer}>
                            <Briefcase size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Technology, Healthcare"
                                value={formData.industry}
                                onChangeText={(text) => setFormData({ ...formData, industry: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Website</Text>
                        <View style={styles.inputContainer}>
                            <Globe size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="https://www.example.com"
                                keyboardType="url"
                                autoCapitalize="none"
                                value={formData.website}
                                onChangeText={(text) => setFormData({ ...formData, website: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.inputContainer}>
                            <MapPin size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. San Francisco, CA"
                                value={formData.location}
                                onChangeText={(text) => setFormData({ ...formData, location: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>About the Company</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe what your company does..."
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Profile</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    backButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    iconSection: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    iconText: {
        ...theme.typography.captionMedium,
        color: theme.colors.primary,
    },
    form: {
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    inputGroup: {
        gap: theme.spacing.sm,
    },
    label: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        height: 56,
        gap: theme.spacing.sm,
    },
    input: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    textArea: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.text,
        minHeight: 120,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.md,
        ...theme.shadows.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    }
});
