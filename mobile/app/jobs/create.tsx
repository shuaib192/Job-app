import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../../src/theme';
import client from '../../src/api/client';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, FileText, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../src/store/AuthContext';

export default function CreateJobScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        salary_range: '',
        type: 'Full-time',
        skills: '',
        company_id: '',
    });

    useEffect(() => {
        if (user?.role === 'employer' || user?.role === 'admin') {
            fetchCompanies();
        }
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await client.get('/companies/my');
            setCompanies(response.data);
            if (response.data.length > 0) {
                setFormData(prev => ({ ...prev, company_id: response.data[0].id.toString() }));
            }
        } catch (err) {
            console.log('Fetch companies error:', err);
        } finally {
            setLoading(false);
        }
    };

    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.description.trim()) {
            Alert.alert('Error', 'Please fill in title and description');
            return;
        }



        setSubmitting(true);
        try {
            await client.post('/jobs', {
                ...formData,
                company_id: formData.company_id || null,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
            });
            Alert.alert('Success', 'Job posted successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            console.log('Post job error:', err);
            if (err.response?.status === 403) {
                Alert.alert('Error', 'Only employers can post jobs. Please upgrade your account.');
            } else {
                Alert.alert('Error', 'Failed to post job. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (user?.role !== 'employer' && user?.role !== 'admin') {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Post a Job</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={styles.upgradeContainer}>
                        <Briefcase size={64} color={theme.colors.primary} />
                        <Text style={styles.upgradeTitle}>Employer Account Required</Text>
                        <Text style={styles.upgradeText}>
                            Only employer accounts can post jobs. Upgrade your account to start hiring.
                        </Text>
                        <TouchableOpacity style={styles.upgradeButton}>
                            <Text style={styles.upgradeButtonText}>Upgrade to Employer</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Post a Job</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                    {/* Company Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Posting As *</Text>

                        <View style={styles.companyGrid}>
                            {/* Option: Post as Myself */}
                            <TouchableOpacity
                                style={[
                                    styles.companyCard,
                                    !formData.company_id && styles.companyCardActive
                                ]}
                                onPress={() => setFormData({ ...formData, company_id: '' })}
                            >
                                <Text style={[
                                    styles.companyCardText,
                                    !formData.company_id && styles.companyCardTextActive
                                ]}>
                                    Myself ({user?.name})
                                </Text>
                            </TouchableOpacity>

                            {/* User's Companies */}
                            {companies.map((company) => (
                                <TouchableOpacity
                                    key={company.id}
                                    style={[
                                        styles.companyCard,
                                        formData.company_id === company.id.toString() && styles.companyCardActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, company_id: company.id.toString() })}
                                >
                                    <Text style={[
                                        styles.companyCardText,
                                        formData.company_id === company.id.toString() && styles.companyCardTextActive
                                    ]}>
                                        {company.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            {/* Create New Company */}
                            <TouchableOpacity
                                style={styles.addCompanyMinimal}
                                onPress={() => router.push('/company/create')}
                            >
                                <Text style={styles.addCompanyMinimalText}>+ Company</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Job Title *</Text>
                        <View style={styles.inputContainer}>
                            <Briefcase size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Senior Software Engineer"
                                placeholderTextColor={theme.colors.textMuted}
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe the role, responsibilities, and requirements..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.inputContainer}>
                            <MapPin size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Lagos, Nigeria or Remote"
                                placeholderTextColor={theme.colors.textMuted}
                                value={formData.location}
                                onChangeText={(text) => setFormData({ ...formData, location: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Salary Range</Text>
                        <View style={styles.inputContainer}>
                            <DollarSign size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. ₦500,000 - ₦800,000"
                                placeholderTextColor={theme.colors.textMuted}
                                value={formData.salary_range}
                                onChangeText={(text) => setFormData({ ...formData, salary_range: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Job Type</Text>
                        <View style={styles.typeContainer}>
                            {jobTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
                                    onPress={() => setFormData({ ...formData, type })}
                                >
                                    <Text style={[styles.typeButtonText, formData.type === type && styles.typeButtonTextActive]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Required Skills</Text>
                        <View style={styles.inputContainer}>
                            <FileText size={20} color={theme.colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. React, Node.js, Python (comma-separated)"
                                placeholderTextColor={theme.colors.textMuted}
                                value={formData.skills}
                                onChangeText={(text) => setFormData({ ...formData, skills: text })}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <>
                                <CheckCircle size={20} color={theme.colors.white} />
                                <Text style={styles.submitButtonText}>Post Job</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
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
    form: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    textArea: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.text,
        minHeight: 150,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    companyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    companyCard: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    companyCardActive: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    companyCardText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    companyCardTextActive: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    createCompanyButton: {
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    createCompanyButtonText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    addCompanyMinimal: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    addCompanyMinimalText: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    typeButton: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    typeButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeButtonText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    typeButtonTextActive: {
        color: theme.colors.white,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.white,
    },
    upgradeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    upgradeTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginTop: theme.spacing.lg,
        textAlign: 'center',
    },
    upgradeText: {
        ...theme.typography.body,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
    },
    upgradeButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        marginTop: theme.spacing.xl,
    },
    upgradeButtonText: {
        ...theme.typography.bodySemibold,
        color: theme.colors.white,
    },
});