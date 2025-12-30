import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions, Image as RNImage } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';
import { Mail, Lock, User, Briefcase, MapPin, FileText, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import client from '../../src/api/client';
import { useAuth } from '../../src/store/AuthContext';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
    const router = useRouter();
    const { login } = useAuth();

    // Step management
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    // Step 1: Basic Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 2: Role & Location
    const [role, setRole] = useState<'applicant' | 'employer'>('applicant');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');

    // Step 3: Professional Info (CV)
    const [headline, setHeadline] = useState('');
    const [skills, setSkills] = useState('');
    const [bio, setBio] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!name || !email || !password || !confirmPassword) {
                setError('Please fill in all fields');
                return false;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
        }
        if (step === 2) {
            if (!location) {
                setError('Please enter your location');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleRegister = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError('');

        try {
            const response = await client.post('/auth/register', {
                name,
                email,
                password,
                password_confirmation: confirmPassword,
                role,
                location,
                phone,
                headline,
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                bio,
            });

            if (response.data.requires_verification) {
                router.push({
                    pathname: '/(auth)/verify',
                    params: { email: email }
                });
                return;
            }

            await login(response.data.token, response.data.user);
            router.replace('/(tabs)');

        } catch (err: any) {
            const errorMsg = err.response?.data?.email?.[0] ||
                err.response?.data?.message ||
                'Registration failed. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
                <View key={s} style={styles.stepRow}>
                    <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
                        {step > s ? (
                            <CheckCircle size={16} color={theme.colors.white} />
                        ) : (
                            <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>
                        )}
                    </View>
                    {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
                </View>
            ))}
        </View>
    );

    const renderStep1 = () => (
        <>
            <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                    <User size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={theme.colors.textMuted}
                        value={name}
                        onChangeText={setName}
                        autoComplete="name"
                    />
                </View>
            </View>

            <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                    <Mail size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
            </View>

            <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                    <Lock size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={styles.input}
                        placeholder="Min 6 characters"
                        placeholderTextColor={theme.colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ?
                            <EyeOff size={20} color={theme.colors.textMuted} /> :
                            <Eye size={20} color={theme.colors.textMuted} />
                        }
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                    <Lock size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={styles.input}
                        placeholder="Re-enter password"
                        placeholderTextColor={theme.colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>I am a...</Text>
                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[styles.roleCard, role === 'applicant' && styles.roleCardActive]}
                        onPress={() => setRole('applicant')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.roleIcon, role === 'applicant' && styles.roleIconActive]}>
                            <User size={24} color={role === 'applicant' ? theme.colors.white : theme.colors.primary} />
                        </View>
                        <Text style={[styles.roleTitle, role === 'applicant' && styles.roleTitleActive]}>Job Seeker</Text>
                        <Text style={styles.roleDesc}>Looking for opportunities</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.roleCard, role === 'employer' && styles.roleCardActive]}
                        onPress={() => setRole('employer')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.roleIcon, role === 'employer' && styles.roleIconActive]}>
                            <Briefcase size={24} color={role === 'employer' ? theme.colors.white : theme.colors.primary} />
                        </View>
                        <Text style={[styles.roleTitle, role === 'employer' && styles.roleTitleActive]}>Employer</Text>
                        <Text style={styles.roleDesc}>Hiring talent</Text>
                    </TouchableOpacity>
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
                <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="+234 xxx xxx xxxx"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>
            </View>
        </>
    );

    const renderStep3 = () => (
        <>
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
                        placeholder="Tell us about yourself and your experience..."
                        placeholderTextColor={theme.colors.textMuted}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={bio}
                        onChangeText={setBio}
                    />
                </View>
            </View>
        </>
    );

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Create Account';
            case 2: return 'About You';
            case 3: return 'Professional Info';
            default: return '';
        }
    };

    const getStepSubtitle = () => {
        switch (step) {
            case 1: return 'Enter your basic information';
            case 2: return 'Tell us about yourself';
            case 3: return 'Build your professional profile';
            default: return '';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={step === 1 ? () => router.back() : prevStep}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        {renderStepIndicator()}
                    </View>

                    {/* Title */}
                    <View style={styles.titleSection}>
                        <RNImage
                            source={require('../../assets/nobg-mainlogo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>{getStepTitle()}</Text>
                        <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            {step < totalSteps ? (
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={nextStep}
                                    activeOpacity={0.9}
                                >
                                    <Text style={styles.submitButtonText}>Continue</Text>
                                    <ArrowRight size={20} color={theme.colors.white} />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                    onPress={handleRegister}
                                    disabled={loading}
                                    activeOpacity={0.9}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={theme.colors.white} />
                                    ) : (
                                        <>
                                            <Text style={styles.submitButtonText}>Create Account</Text>
                                            <ArrowRight size={20} color={theme.colors.white} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Footer - only on step 1 */}
                    {step === 1 && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.footerLink}>Sign in</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
    },
    stepIndicator: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 44,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    stepCircleActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    stepNumber: {
        ...theme.typography.smallMedium,
        color: theme.colors.textMuted,
    },
    stepNumberActive: {
        color: theme.colors.white,
    },
    stepLine: {
        width: 32,
        height: 2,
        backgroundColor: theme.colors.border,
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: theme.colors.primary,
    },
    titleSection: {
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    logoImage: {
        width: 180,
        height: 60,
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        gap: theme.spacing.lg,
    },
    errorContainer: {
        backgroundColor: theme.colors.errorLight,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
    },
    errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
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
        height: 120,
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
    roleContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    roleCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    roleCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    roleIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    roleIconActive: {
        backgroundColor: theme.colors.primary,
    },
    roleTitle: {
        ...theme.typography.bodySemibold,
        color: theme.colors.text,
        marginBottom: 2,
    },
    roleTitleActive: {
        color: theme.colors.primary,
    },
    roleDesc: {
        ...theme.typography.small,
        color: theme.colors.textMuted,
    },
    buttonContainer: {
        marginTop: theme.spacing.md,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.sm,
        ...theme.shadows.md,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingVertical: theme.spacing.xl,
    },
    footerText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    footerLink: {
        ...theme.typography.captionMedium,
        color: theme.colors.primary,
    },
});
