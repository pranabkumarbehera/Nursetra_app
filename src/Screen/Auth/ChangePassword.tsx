import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, theme } from '../../Themes';
import { changePasswordRequest, changePasswordSuccess, resetPasswordRequest, resetPasswordSuccess } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';
import { ROUTES } from '../../Navigation/RouteNames';

type ChangePasswordErrors = {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/;
const HERO_GRADIENT = ['#07182E', '#0B5FA8', '#18B5A5'];
const ACCENT_GRADIENT = ['rgba(11,95,168,0.16)', 'rgba(24,181,165,0.10)'];
const CARD_GRADIENT = ['rgba(255,255,255,0.98)', 'rgba(247,251,255,0.95)'];
const TIP_GRADIENT = ['rgba(245,158,11,0.16)', 'rgba(251,191,36,0.08)'];

export const ChangePassword = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch();
    const { isLoading, changePasswordResponse, resetPasswordResponse, token } = useSelector((state: RootState) => state.AuthReducer);
    const resetToken = route.params?.token;
    const isResetMode = !!resetToken;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secureCurrent, setSecureCurrent] = useState(true);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);
    const [touched, setTouched] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    useEffect(() => {
        dispatch(changePasswordSuccess(null));
        dispatch(resetPasswordSuccess(null));
    }, [dispatch]);

    useEffect(() => {
        if (changePasswordResponse?.success || changePasswordResponse?.message) {
            if (token) {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            {
                                name: ROUTES.BOTTOM_TABS,
                                state: {
                                    index: 0,
                                    routes: [{ name: ROUTES.PROFILE }],
                                },
                            },
                        ],
                    })
                );
            } else {
                navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] }));
            }
        }
    }, [changePasswordResponse, navigation, token]);

    useEffect(() => {
        if (resetPasswordResponse?.success || resetPasswordResponse?.message) {
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] }));
        }
    }, [resetPasswordResponse, navigation]);

    const getErrors = (): ChangePasswordErrors => {
        const errors: ChangePasswordErrors = {};

        if (!isResetMode) {
            if (!currentPassword) {
                errors.currentPassword = 'Current password is required';
            } else if (currentPassword.length < 7) {
                errors.currentPassword = 'Current password must be at least 7 characters';
            }
        }

        if (!newPassword) {
            errors.newPassword = 'New password is required';
        } else if (newPassword.length < 7) {
            errors.newPassword = 'New password must be at least 7 characters';
        } else if (!passwordRegex.test(newPassword)) {
            errors.newPassword = 'Password must include uppercase, lowercase, and number';
        } else if (!isResetMode && newPassword === currentPassword) {
            errors.newPassword = 'New password must be different from current password';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Confirm password is required';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    const errors = getErrors();

    const updateTouched = (field: keyof typeof touched) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleChangePassword = async () => {
        const nextErrors = getErrors();
        if (Object.keys(nextErrors).length > 0) {
            setTouched({
                currentPassword: true,
                newPassword: true,
                confirmPassword: true,
            });
            return;
        }

        if (isResetMode) {
            dispatch(resetPasswordRequest({
                token: resetToken,
                newPassword,
            }));
        } else {
            dispatch(changePasswordRequest({
                oldPassword: currentPassword,
                newPassword,
            }));
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#07182E" />

            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                        <View style={styles.heroGlowOne} />
                        <View style={styles.heroGlowTwo} />

                        <View style={styles.headerRow}>
                            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Icon name="arrow-back" size={22} color="#FFFFFF" />
                            </Pressable>
                            <Text style={styles.headerTitle}>{isResetMode ? 'Reset Password' : 'Change Password'}</Text>
                            <View style={styles.headerSpacer} />
                        </View>

                        <View style={styles.heroCenter}>
                            <LinearGradient colors={ACCENT_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIconWrap}>
                                <Icon name="lock-closed-outline" size={30} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={styles.heroTitle}>{isResetMode ? 'Create your new password' : 'Update your password'}</Text>
                            <Text style={styles.heroSubtitle}>
                                {isResetMode
                                    ? 'Set a strong password to secure your account again.'
                                    : 'Enter your current password and choose a stronger one.'}
                            </Text>
                        </View>
                    </LinearGradient>

                    <View style={styles.contentWrap}>
                        <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card}>
                            <View style={styles.cardTopBadge}>
                                <LinearGradient colors={TIP_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tipPill}>
                                    <Icon name="shield-checkmark-outline" size={14} color="#D97706" />
                                    <Text style={styles.tipPillText}>Secure password update</Text>
                                </LinearGradient>
                            </View>

                            <Text style={styles.sectionTitle}>{isResetMode ? 'Reset password' : 'Change password'}</Text>
                            <Text style={styles.sectionSubtitle}>
                                {isResetMode
                                    ? 'Use the OTP-verified link to create a fresh password.'
                                    : 'Keep your account protected by updating your password.'}
                            </Text>

                            <View style={styles.formContainer}>
                                {!isResetMode && (
                                    <View style={styles.fieldWrapper}>
                                        <Text style={styles.inputLabel}>Current Password</Text>
                                        <View style={[styles.inputContainer, touched.currentPassword && errors.currentPassword ? styles.inputContainerError : null]}>
                                            <Icon name="lock-closed" size={18} color="#9CA3AF" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter current password"
                                                placeholderTextColor="#9CA3AF"
                                                secureTextEntry={secureCurrent}
                                                value={currentPassword}
                                                onChangeText={(value) => {
                                                    updateTouched('currentPassword');
                                                    setCurrentPassword(value);
                                                }}
                                                onFocus={() => updateTouched('currentPassword')}
                                                onBlur={() => updateTouched('currentPassword')}
                                            />
                                            <Pressable onPress={() => setSecureCurrent(!secureCurrent)} style={styles.eyeIcon}>
                                                <Icon name={secureCurrent ? 'eye-off' : 'eye'} size={18} color="#9CA3AF" />
                                            </Pressable>
                                        </View>
                                        {touched.currentPassword && errors.currentPassword ? <Text style={styles.errorText}>{errors.currentPassword}</Text> : null}
                                    </View>
                                )}

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.inputLabel}>New Password</Text>
                                    <View style={[styles.inputContainer, touched.newPassword && errors.newPassword ? styles.inputContainerError : null]}>
                                        <Icon name="key-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter new password"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry={secureNew}
                                            value={newPassword}
                                            onChangeText={(value) => {
                                                updateTouched('newPassword');
                                                setNewPassword(value);
                                            }}
                                            onFocus={() => updateTouched('newPassword')}
                                            onBlur={() => updateTouched('newPassword')}
                                        />
                                        <Pressable onPress={() => setSecureNew(!secureNew)} style={styles.eyeIcon}>
                                            <Icon name={secureNew ? 'eye-off' : 'eye'} size={18} color="#9CA3AF" />
                                        </Pressable>
                                    </View>
                                    {touched.newPassword && errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                                    <View style={[styles.inputContainer, touched.confirmPassword && errors.confirmPassword ? styles.inputContainerError : null]}>
                                        <Icon name="key-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Re-enter new password"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry={secureConfirm}
                                            value={confirmPassword}
                                            onChangeText={(value) => {
                                                updateTouched('confirmPassword');
                                                setConfirmPassword(value);
                                            }}
                                            onFocus={() => updateTouched('confirmPassword')}
                                            onBlur={() => updateTouched('confirmPassword')}
                                        />
                                        <Pressable onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeIcon}>
                                            <Icon name={secureConfirm ? 'eye-off' : 'eye'} size={18} color="#9CA3AF" />
                                        </Pressable>
                                    </View>
                                    {touched.confirmPassword && errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                                </View>

                                <View style={styles.hintBox}>
                                    <View style={styles.hintItem}>
                                        <View style={styles.hintDot} />
                                        <Text style={styles.hintText}>Use at least 7 characters with uppercase, lowercase, and numbers.</Text>
                                    </View>
                                    <View style={styles.hintItem}>
                                        <View style={styles.hintDot} />
                                        <Text style={styles.hintText}>Make sure both password fields match exactly before saving.</Text>
                                    </View>
                                </View>

                                <Pressable style={styles.submitButton} onPress={handleChangePassword} disabled={isLoading}>
                                    <LinearGradient colors={['#0B5FA8', '#18B5A5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitButtonGradient}>
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>{isResetMode ? 'Reset Password' : 'Update Password'}</Text>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        </LinearGradient>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F7FB',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    hero: {
        paddingBottom: 28,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    heroGlowOne: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 180,
        backgroundColor: 'rgba(255,255,255,0.12)',
        top: -40,
        right: -35,
    },
    heroGlowTwo: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 140,
        backgroundColor: 'rgba(255,255,255,0.08)',
        left: -30,
        bottom: -20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.14)',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: Fonts.interbold,
        textAlign: 'center',
        flex: 1,
    },
    headerSpacer: {
        width: 42,
        height: 42,
    },
    heroCenter: {
        paddingHorizontal: 24,
        paddingTop: 18,
        alignItems: 'center',
    },
    heroIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#0B5FA8',
        shadowOpacity: 0.24,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: Fonts.interbold,
        textAlign: 'center',
        marginBottom: 10,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.86)',
        fontSize: 14,
        fontFamily: Fonts.interregular,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 320,
    },
    contentWrap: {
        paddingHorizontal: 16,
        marginTop: -18,
        paddingBottom: 18,
    },
    card: {
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.95)',
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
    },
    cardTopBadge: {
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tipPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
    },
    tipPillText: {
        color: '#92400E',
        fontSize: 12,
        fontFamily: Fonts.interbold,
    },
    sectionTitle: {
        color: theme.colors.text,
        fontSize: 20,
        fontFamily: Fonts.interbold,
        marginBottom: 6,
    },
    sectionSubtitle: {
        color: theme.colors.textLight,
        fontSize: 14,
        fontFamily: Fonts.interregular,
        lineHeight: 22,
        marginBottom: 18,
    },
    formContainer: {
        width: '100%',
    },
    fieldWrapper: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        fontFamily: Fonts.interbold,
        color: '#334155',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.18)',
        paddingHorizontal: 14,
        height: 58,
    },
    inputContainerError: {
        borderColor: theme.colors.error,
        backgroundColor: '#FFF7F7',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 15,
        fontFamily: Fonts.interregular,
        paddingVertical: 0,
    },
    eyeIcon: {
        paddingLeft: 10,
        paddingVertical: 10,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        fontFamily: Fonts.interregular,
        marginTop: 6,
    },
    hintBox: {
        gap: 10,
        marginTop: 4,
        marginBottom: 16,
    },
    hintItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    hintDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginTop: 7,
    },
    hintText: {
        flex: 1,
        color: '#516074',
        fontSize: 13,
        fontFamily: Fonts.interregular,
        lineHeight: 20,
    },
    submitButton: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#0B5FA8',
        shadowOpacity: 0.22,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    submitButtonGradient: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.interbold,
    },
});
