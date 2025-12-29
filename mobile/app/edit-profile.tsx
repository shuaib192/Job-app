import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../src/theme';
import { useAuth } from '../src/store/AuthContext';
import client from '../src/api/client';
import { ArrowLeft, Save, User, Briefcase, MapPin, FileText } from 'lucide-react-native';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [location, setLocation] = useState(user?.location || '');
    const [headline, setHeadline] = useState(user?.profile?.industry || '');
    const [bio, setBio] = useState(user?.profile?.bio || '');
    const [skills, setSkills] = useState(
        Array.isArray(user?.profile?.skills) ? user.profile.skills.join(', ') : ''
    );
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await client.put('/profile', {
                name,
                location,
                headline,
                bio,
                skills: skills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
            });

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err) {
            console.log('Update error:', err);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: 'Edit Profile',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.container} edges={['bottom']}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <User size={20} color={theme.colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your full name"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Location</Text>
                            <View style={styles.inputContainer}>
                                <MapPin size={20} color={theme.colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Lagos, Nigeria"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={location}
                                    onChangeText={setLocation}
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Professional Headline</Text>
                            <View style={styles.inputContainer}>
                                <Briefcase size={20} color={theme.colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Software Engineer at Google"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={headline}
                                    onChangeText={setHeadline}
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Skills</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. JavaScript, React, Node.js"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={skills}
                                    onChangeText={setSkills}
                                />
                            </View>
                            <Text style={styles.inputHint}>Separate skills with commas</Text>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Tell us about yourself..."
                                    placeholderTextColor={theme.colors.textMuted}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    value={bio}
                                    onChangeText={setBio}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <>
                                    <Save size={20} color={theme.colors.white} />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    backButton: {
        marginRight: theme.spacing.sm,
    },
    form: {
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    inputWrapper: {
        gap: theme.spacing.sm,
    },
    inputLabel: {
        ...theme.typography.captionMedium,
        color: theme.colors.text,
    },
    inputHint: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
        marginTop: -4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        height: 56,
        gap: theme.spacing.sm,
    },
    textAreaContainer: {
        height: 140,
        alignItems: 'flex-start',
        paddingVertical: theme.spacing.md,
    },
    input: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    textArea: {
        height: '100%',
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
        ...theme.shadows.md,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
});
