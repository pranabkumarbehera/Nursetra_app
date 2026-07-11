import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    StatusBar,
    Image,
    ActivityIndicator,
    Modal,
    TextInput,
    Linking,
    Share,
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logoutRequest, logoutSuccess } from '../../Redux/Reducers/AuthReducer';
import {
    getProfileRequest,
    updateProfileRequest,
    sendDeleteAccountOtpRequest,
    verifyDeleteAccountOtpRequest,
    deleteAccountRequest,
    setDeleteAccountStep,
} from '../../Redux/Reducers/ProfileReducer';
import { RootState } from '../../Redux/Store';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import {
    getAvatarBackgroundColor,
    getInitials,
    getProfileImageUri,
    getProfileName,
    normalizeProfileData,
} from '../../Utils/Helpers/home';
import { CommonActions } from '@react-navigation/native';
import { ROUTES } from '../../Navigation/RouteNames';
import { reset as resetNavigation } from '../../Navigation/NavigationService';

type EditableProfile = {
    firstName: string;
    lastName: string;
    phone: string;
    bio: string;
    avatarUrl: string;
    email: string;
};

const DEFAULT_FORM: EditableProfile = {
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    avatarUrl: '',
    email: '',
};

const HEADER_GRADIENT = ['#06172C', '#0B5FA8', '#14B8A6'];
// const HEADER_ORANGE_GRADIENT = ['rgba(245, 158, 11, 0.98)', 'rgba(249, 115, 22, 0.86)'];
const CARD_GRADIENT = ['rgba(255, 255, 255, 0.99)', 'rgba(244, 249, 255, 0.96)'];
const CARD_SHEEN_GRADIENT = ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.0)'];
const SOFT_BLUE_GRADIENT = ['rgba(11, 95, 168, 0.18)', 'rgba(20, 184, 166, 0.08)'];
const SOFT_PURPLE_GRADIENT = ['rgba(59, 130, 246, 0.16)', 'rgba(34, 211, 238, 0.08)'];
const SOFT_GOLD_GRADIENT = ['rgba(245, 158, 11, 0.22)', 'rgba(251, 191, 36, 0.10)'];
const SOFT_RED_GRADIENT = ['rgba(254, 226, 226, 0.98)', 'rgba(255, 237, 213, 0.95)'];

const formatPhoneForDisplay = (phone?: string | null) => {
    const value = (phone || '').trim();
    if (!value) {
        return '';
    }

    return value.startsWith('+91') ? value : `+91 ${value}`;
};

export const ProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { logoutResponse, isLoading: isAuthLoading } = useSelector((state: RootState) => state.AuthReducer);
    const profileState = useSelector((state: RootState) => state.ProfileReducer);
    const profileData = profileState.profileData;
    const authToken = useSelector((state: RootState) => state.AuthReducer.token);
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [form, setForm] = useState<EditableProfile>(DEFAULT_FORM);
    const [imageError, setImageError] = useState(false);
    const [editImageError, setEditImageError] = useState(false);

    // Account Deletion States
    const {
        deleteAccountStep,
        sendOtpLoading,
        verifyOtpLoading,
        deleteAccountLoading,
        deleteVerificationToken,
    } = useSelector((state: RootState) => state.ProfileReducer);

    const [isDeleteVisible, setIsDeleteVisible] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState('');
    const [deleteOtp, setDeleteOtp] = useState('');
    const redirectingRef = useRef(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const openDeleteModal = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account from NURSETRA?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Delete",
                    style: "destructive",
                    onPress: () => {
                        const userEmail = mappedProfile.email || profileData?.email || profileData?.user?.email || '';
                        setDeleteEmail(userEmail);
                        setDeleteOtp('');

                        if (userEmail) {
                            dispatch(setDeleteAccountStep('otp'));
                            setIsDeleteVisible(true);
                            dispatch(sendDeleteAccountOtpRequest({ email: userEmail }));
                        } else {
                            dispatch(setDeleteAccountStep('email'));
                            setIsDeleteVisible(true);
                        }
                    }
                }
            ]
        );
    };

    const handleSendOtp = () => {
        const trimmedEmail = deleteEmail.trim();
        if (!trimmedEmail) {
            Toast.show({ type: 'error', text1: 'Email address is required' });
            return;
        }
        if (!emailRegex.test(trimmedEmail)) {
            Toast.show({ type: 'error', text1: 'Please enter a valid email address' });
            return;
        }
        dispatch(sendDeleteAccountOtpRequest({ email: trimmedEmail }));
    };

    const handleVerifyOtp = () => {
        const trimmedOtp = deleteOtp.trim();
        if (!trimmedOtp) {
            Toast.show({ type: 'error', text1: 'OTP is required' });
            return;
        }
        dispatch(verifyDeleteAccountOtpRequest({ email: deleteEmail.trim(), otp: trimmedOtp }));
    };

    const handleConfirmDelete = () => {
        dispatch(deleteAccountRequest({ verificationToken: deleteVerificationToken }));
    };

    const handleReturnToHome = () => {
        setIsDeleteVisible(false);
        dispatch(logoutSuccess('logout'));
    };

    const handleNavigationReset = () => {
        if (redirectingRef.current) {
            return;
        }

        redirectingRef.current = true;
        setTimeout(() => {
            resetNavigation({
                index: 0,
                routes: [
                    {
                        name: ROUTES.AUTH_STACK,
                        state: {
                            index: 0,
                            routes: [{ name: ROUTES.LOGIN }],
                        },
                    },
                ],
            });
        }, 0);
    };

    useEffect(() => {
        if (!authToken || logoutResponse === 'logout') {
            handleNavigationReset();
        } else {
            redirectingRef.current = false;
        }
    }, [authToken, logoutResponse]);

    useEffect(() => {
        if (!authToken) return;
        if (!profileData && !profileState.isLoading) {
            dispatch(getProfileRequest({}));
        }
    }, [authToken, dispatch, profileData, profileState.isLoading]);

    const mappedProfile = useMemo<EditableProfile>(() => normalizeProfileData(profileData), [profileData]);

    useEffect(() => {
        if (!isEditVisible) {
            setForm(mappedProfile);
        }
    }, [isEditVisible, mappedProfile]);

    useEffect(() => {
        if (profileState.status === 'Profile/updateProfileSuccess' && isEditVisible) {
            setIsEditVisible(false);
        }
    }, [isEditVisible, profileState.status]);

    const profileName = useMemo(
        () => getProfileName({ ...profileData, ...mappedProfile }),
        [mappedProfile, profileData],
    );
    const displayedAvatar = useMemo(
        () => form.avatarUrl || mappedProfile.avatarUrl || getProfileImageUri(profileData),
        [form.avatarUrl, mappedProfile.avatarUrl, profileData],
    );
    const initials = useMemo(() => getInitials(profileName), [profileName]);
    const avatarBackground = useMemo(() => getAvatarBackgroundColor(profileName), [profileName]);

    useEffect(() => {
        setImageError(false);
    }, [displayedAvatar]);

    useEffect(() => {
        setEditImageError(false);
    }, [form.avatarUrl]);

    const handleLogout = () => {
        dispatch(logoutRequest({}));
    };

    const handleSupportPress = async () => {
        const mailUrl = 'mailto:support@nursetra.in';
        try {
            await Linking.openURL(mailUrl);
        } catch {
            // Ignore if mail app is unavailable.
        }
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'Prepare for your nursing career with Nursetra! Download the app now: https://play.google.com/store/apps/details?id=com.nursetra.app',
            });
        } catch (error) {
            console.log('Error sharing app:', error);
        }
    };

    const updateField = (field: keyof EditableProfile, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const openEditModal = () => {
        setForm(mappedProfile);
        setIsEditVisible(true);
    };

    const closeEditModal = () => {
        setIsEditVisible(false);
    };

    const handlePickImage = async () => {
        Toast.show({ type: 'info', text1: 'Image uploading is coming soon!' });
    };

    const handleSaveProfile = () => {
        dispatch(updateProfileRequest({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
            bio: form.bio.trim(),
            avatarUrl: form.avatarUrl.trim(),
        }));
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
            <StatusBar barStyle="light-content" backgroundColor={Colorpath.Primary} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <LinearGradient colors={HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerBackground}>
                    <View style={styles.headerGlowOne} />
                    <View style={styles.headerGlowTwo} />
                    <View style={{ paddingTop: insets.top }}>
                        <View style={styles.topBar}>
                            <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Profile</Text>
                            <View style={styles.headerRightSpacer} />
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.profileCardWrapper}>
                    <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.profileCard}>
                        <LinearGradient colors={CARD_SHEEN_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardSheen} />
                        <Pressable onPress={openEditModal} style={styles.editIconButton} hitSlop={10}>
                            <Icon name="edit-2" size={normalize(16)} color={Colorpath.Primary} />
                        </Pressable>
                        <LinearGradient colors={SOFT_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarRing}>
                            <View style={[styles.avatarContainer, (!displayedAvatar || imageError) ? { backgroundColor: avatarBackground } : null]}>
                                {(displayedAvatar && !imageError) ? (
                                    <Image
                                        source={{ uri: displayedAvatar }}
                                        style={styles.avatarImage}
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <Text style={styles.avatarFallbackText}>{initials}</Text>
                                )}
                            </View>
                        </LinearGradient>
                        <Text style={styles.userName}>{profileName}</Text>
                        <Text style={styles.userMeta}>{formatPhoneForDisplay(mappedProfile.phone) || 'Add phone number'}</Text>
                        {!!mappedProfile.bio && <Text style={styles.bioText}>{mappedProfile.bio}</Text>}

                        <View style={styles.heroPillsRow}>
                            <LinearGradient colors={SOFT_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroPill}>
                                <Icon name="shield" size={normalize(12)} color={Colorpath.Primary} />
                                <Text style={styles.heroPillText}>Secure</Text>
                            </LinearGradient>
                            <LinearGradient colors={SOFT_GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroPill}>
                                <Icon name="sun" size={normalize(12)} color="#D97706" />
                                <Text style={styles.heroPillText}>Shining UI</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.badgeContainer}>
                            <Icon name="award" size={normalize(14)} color="#FFFFFF" />
                            <Text style={styles.badgeText}>Profile Active</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.statsRow}>
                        <LinearGradient colors={SOFT_PURPLE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statBox}>
                            <View style={styles.statIconWrapper}>
                                <Icon name="user" size={normalize(20)} color={Colorpath.Primary} />
                            </View>
                            <View>
                                <Text style={styles.statBoxLabel}>First Name</Text>
                                <Text style={styles.statBoxValue}>{mappedProfile.firstName || '--'}</Text>
                            </View>
                        </LinearGradient>
                        <LinearGradient colors={SOFT_GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statBox}>
                            <View style={styles.statIconWrapper}>
                                <Icon name="users" size={normalize(20)} color={Colorpath.Primary} />
                            </View>
                            <View>
                                <Text style={styles.statBoxLabel}>Last Name</Text>
                                <Text style={styles.statBoxValue}>{mappedProfile.lastName || '--'}</Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    <View style={styles.performanceCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{formatPhoneForDisplay(mappedProfile.phone) || '--'}</Text>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Bio</Text>
                            <Text style={styles.detailValue}>{mappedProfile.bio || '--'}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>My Learning</Text>
                    <View style={styles.settingsContainer}>
                        <Pressable style={styles.settingItem} onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon' })}>
                            <LinearGradient colors={SOFT_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="book" size={normalize(18)} color={Colorpath.Primary} />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>My Courses</Text>
                                <Text style={styles.settingSubText}>Open your course bundles</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={[styles.settingItem, styles.settingItemLast]} onPress={() => navigation.navigate(ROUTES.MY_RESULTS)}>
                            <LinearGradient colors={SOFT_GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="bar-chart-2" size={normalize(18)} color="#34C759" />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>My Results</Text>
                                <Text style={styles.settingSubText}>Track your mock test progress</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <View style={styles.settingsContainer}>
                        <Pressable style={styles.settingItem} onPress={openEditModal}>
                            <LinearGradient colors={SOFT_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="edit-3" size={normalize(18)} color={Colorpath.Primary} />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Edit Profile</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)}>
                            <LinearGradient colors={SOFT_PURPLE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="lock" size={normalize(18)} color={Colorpath.Primary} />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Change Password</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate(ROUTES.COURSES_PAYMENT_HISTORY as any)}>
                            <LinearGradient colors={SOFT_GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="credit-card" size={normalize(18)} color={Colorpath.Primary} />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Courses Payment History</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate(ROUTES.ABOUT_US as any)}>
                            <LinearGradient colors={SOFT_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="info" size={normalize(18)} color={Colorpath.Primary} />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>About Us</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={handleShareApp}>
                            <LinearGradient colors={SOFT_GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="share-2" size={normalize(18)} color={Colorpath.Primary} />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Refer Now</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={handleSupportPress}>
                            <LinearGradient colors={SOFT_PURPLE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="mail" size={normalize(18)} color={Colorpath.Primary} />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Support</Text>
                                <Text style={styles.settingSubText}>support@nursetra.in</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={openDeleteModal}>
                            <LinearGradient colors={SOFT_RED_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                <Icon name="trash-2" size={normalize(18)} color="#EF4444" />
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: '#EF4444' }]}>Delete Account</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable
                            style={[styles.settingItem, styles.settingItemLast]}
                            onPress={handleLogout}
                            disabled={isAuthLoading}>
                            <LinearGradient colors={SOFT_RED_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingIconBg}>
                                {isAuthLoading ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <Icon name="log-out" size={normalize(18)} color="#EF4444" />
                                )}
                            </LinearGradient>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: '#EF4444' }]}>Logout</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <View style={{ height: verticalScale(100) }} />
                </View>
            </ScrollView>

            <Modal
                visible={isEditVisible}
                animationType="slide"
                transparent
                onRequestClose={closeEditModal}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <Pressable onPress={closeEditModal} style={styles.closeButton}>
                                <Icon name="x" size={normalize(20)} color="#6B7280" />
                            </Pressable>
                        </View>

                        <Pressable onPress={handlePickImage} style={styles.imagePickerButton}>
                            <View style={[styles.editAvatarPreview, (!form.avatarUrl || editImageError) ? { backgroundColor: avatarBackground } : null]}>
                                {(form.avatarUrl && !editImageError) ? (
                                    <Image
                                        source={{ uri: form.avatarUrl }}
                                        style={styles.avatarImage}
                                        onError={() => setEditImageError(true)}
                                    />
                                ) : (
                                    <Text style={styles.avatarFallbackText}>
                                        {getInitials(`${form.firstName} ${form.lastName}`.trim() || profileName)}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.imagePickerCopy}>
                                <Text style={styles.imagePickerTitle}>Profile photo</Text>
                                <Text style={styles.imagePickerSubtitle}>Tap to choose image</Text>
                            </View>
                            <Icon name="camera" size={normalize(18)} color={Colorpath.Primary} />
                        </Pressable>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>First name</Text>
                            <TextInput
                                value={form.firstName}
                                onChangeText={(value) => updateField('firstName', value)}
                                style={styles.input}
                                placeholder="Enter first name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Last name</Text>
                            <TextInput
                                value={form.lastName}
                                onChangeText={(value) => updateField('lastName', value)}
                                style={styles.input}
                                placeholder="Enter last name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone number</Text>
                            <View style={styles.phoneInputRow}>
                                <View style={styles.phonePrefixBox}>
                                    <Text style={styles.phonePrefixText}>+91</Text>
                                </View>
                                <TextInput
                                    value={form.phone}
                                    onChangeText={(value) => updateField('phone', value.replace(/^\+91\s*/, ''))}
                                    style={[styles.input, styles.phoneInput]}
                                    placeholder="Enter phone number"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                value={form.bio}
                                onChangeText={(value) => updateField('bio', value)}
                                style={[styles.input, styles.bioInput]}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <Pressable onPress={handleSaveProfile} style={styles.saveButtonPressable} disabled={profileState.isLoading}>
                            <LinearGradient
                                colors={profileState.isLoading ? ['#9CA3AF', '#6B7280'] : HEADER_GRADIENT}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.saveButton, profileState.isLoading ? styles.saveButtonDisabled : null]}>
                                {profileState.isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isDeleteVisible}
                animationType="slide"
                transparent
                onRequestClose={() => {
                    if (deleteAccountStep !== 'success' && !deleteAccountLoading) {
                        setIsDeleteVisible(false);
                    }
                }}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        {deleteAccountStep !== 'success' && (
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Delete Account</Text>
                                <Pressable
                                    disabled={sendOtpLoading || verifyOtpLoading || deleteAccountLoading}
                                    onPress={() => setIsDeleteVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Icon name="x" size={normalize(20)} color="#6B7280" />
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'email' && (
                            <View style={{ width: '100%' }}>
                                <Text style={styles.inputLabel}>Enter email address associated with your account</Text>
                                <TextInput
                                    value={deleteEmail}
                                    onChangeText={setDeleteEmail}
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <Pressable onPress={handleSendOtp} style={styles.saveButtonPressable} disabled={sendOtpLoading}>
                                    <LinearGradient
                                        colors={sendOtpLoading ? ['#9CA3AF', '#6B7280'] : HEADER_GRADIENT}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[styles.saveButton, sendOtpLoading ? styles.saveButtonDisabled : null]}>
                                        {sendOtpLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Send OTP</Text>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'otp' && (
                            <View style={{ width: '100%' }}>
                                <Text style={styles.inputLabel}>Enter the OTP sent to {deleteEmail}</Text>
                                <TextInput
                                    value={deleteOtp}
                                    onChangeText={setDeleteOtp}
                                    style={styles.input}
                                    placeholder="Enter OTP"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="number-pad"
                                />
                                <Pressable onPress={handleVerifyOtp} style={styles.saveButtonPressable} disabled={verifyOtpLoading}>
                                    <LinearGradient
                                        colors={verifyOtpLoading ? ['#9CA3AF', '#6B7280'] : HEADER_GRADIENT}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[styles.saveButton, verifyOtpLoading ? styles.saveButtonDisabled : null]}>
                                        {verifyOtpLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Verify OTP</Text>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                                <Pressable
                                    style={{ marginTop: verticalScale(14), alignItems: 'center' }}
                                    onPress={() => dispatch(setDeleteAccountStep('email'))}
                                >
                                    <Text style={{ color: Colorpath.Primary, fontWeight: 'bold' }}>Change Email</Text>
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'confirm' && (
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <View style={styles.warningIconContainer}>
                                    <Icon name="alert-triangle" size={normalize(28)} color="#EF4444" />
                                </View>
                                <Text style={[styles.modalTitle, { color: '#EF4444', textAlign: 'center', marginBottom: verticalScale(12) }]}>
                                    Permanently Delete Account?
                                </Text>
                                <Text style={{ fontSize: normalize(14), color: '#4B5563', textAlign: 'center', marginBottom: verticalScale(16) }}>
                                    You have successfully verified your identity.
                                </Text>
                                <Text style={{ fontSize: normalize(15), fontWeight: 'bold', color: '#111827', alignSelf: 'flex-start', marginBottom: verticalScale(8) }}>
                                    Deleting your NURSETRA account is permanent.
                                </Text>
                                <Text style={{ fontSize: normalize(13), color: '#6B7280', alignSelf: 'flex-start', marginBottom: verticalScale(12) }}>
                                    Once deleted:
                                </Text>
                                <ScrollView style={{ maxHeight: verticalScale(180), width: '100%', marginBottom: verticalScale(20) }} showsVerticalScrollIndicator={true}>
                                    {[
                                        'Your profile will be permanently removed.',
                                        'Your enrolled courses will be deleted.',
                                        'Course progress will be deleted.',
                                        'Quiz history will be deleted.',
                                        'Certificates will be deleted.',
                                        'Bookmarks will be deleted.',
                                        'Notifications will be deleted.',
                                        'Saved preferences will be deleted.',
                                        'Active sessions will be terminated.',
                                        'You will immediately lose access to your account.'
                                    ].map((item, idx) => (
                                        <View key={idx} style={{ flexDirection: 'row', marginBottom: verticalScale(6), paddingRight: normalize(10) }}>
                                            <Text style={{ fontSize: normalize(14), color: '#4B5563', marginRight: normalize(6) }}>•</Text>
                                            <Text style={{ fontSize: normalize(13), color: '#4B5563', flex: 1, lineHeight: normalize(18) }}>{item}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                <View style={{ flexDirection: 'row', width: '100%', gap: normalize(12), borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: verticalScale(16) }}>
                                    <Pressable
                                        onPress={() => setIsDeleteVisible(false)}
                                        style={{ flex: 1, paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: normalize(15), fontWeight: 'bold', color: '#374151' }}>Cancel</Text>
                                    </Pressable>
                                    <Pressable onPress={handleConfirmDelete} style={styles.deleteButtonPressable} disabled={deleteAccountLoading}>
                                        <LinearGradient
                                            colors={deleteAccountLoading ? ['#FCA5A5', '#EF4444'] : ['#F97316', '#EF4444']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.deleteButton}>
                                            {deleteAccountLoading ? (
                                                <ActivityIndicator color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.saveButtonText}>
                                                    Permanently Delete Account
                                                </Text>
                                            )}
                                        </LinearGradient>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {deleteAccountStep === 'success' && (
                            <View style={{ width: '100%', alignItems: 'center', paddingVertical: verticalScale(20) }}>
                                <View style={{ width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) }}>
                                    <Icon name="trash" size={normalize(28)} color="#D97706" />
                                </View>
                                <Text style={{ fontSize: normalize(22), fontWeight: 'bold', color: '#EF4444', marginBottom: verticalScale(4) }}>
                                    Delete Your Account
                                </Text>
                                <Text style={{ fontSize: normalize(13), color: '#6B7280', marginBottom: verticalScale(24) }}>
                                    Your request was processed successfully.
                                </Text>
                                <View style={{ width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) }}>
                                    <Icon name="check" size={normalize(32)} color="#10B981" />
                                </View>
                                <Text style={{ fontSize: normalize(20), fontWeight: 'bold', color: '#111827', marginBottom: verticalScale(8) }}>
                                    Account Deleted Successfully
                                </Text>
                                <Text style={{ fontSize: normalize(14), color: '#4B5563', textAlign: 'center', lineHeight: normalize(20), marginBottom: verticalScale(28) }}>
                                    your NURSETRA account has been permanently deleted. We're sorry to see you go.
                                </Text>
                                <Pressable onPress={handleReturnToHome} style={styles.saveButtonPressable}>
                                    <LinearGradient colors={HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.deleteButton}>
                                        <Text style={styles.saveButtonText}>
                                            Return to Home
                                        </Text>
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    warningIconContainer: {
        width: normalize(56),
        height: normalize(56),
        borderRadius: normalize(28),
        backgroundColor: 'rgba(254, 226, 226, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    container: { flex: 1, backgroundColor: '#FFF8F1' },
    scrollContent: { flexGrow: 1 },
    headerBackground: { height: verticalScale(190), borderBottomLeftRadius: normalize(34), borderBottomRightRadius: normalize(34), overflow: 'hidden' },
    headerGlowOne: {
        position: 'absolute',
        top: verticalScale(-24),
        right: normalize(-40),
        width: normalize(140),
        height: normalize(140),
        borderRadius: normalize(70),
        backgroundColor: 'rgba(249, 115, 22, 0.26)',
    },
    headerGlowTwo: {
        position: 'absolute',
        bottom: verticalScale(-34),
        left: normalize(-36),
        width: normalize(120),
        height: normalize(120),
        borderRadius: normalize(60),
        backgroundColor: 'rgba(20, 184, 166, 0.18)',
    },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), marginHorizontal: -normalize(8), backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: normalize(14) },
    headerTitle: { flex: 1, fontSize: normalize(18), fontWeight: '800', color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.4 },
    headerRightSpacer: { width: normalize(40), height: normalize(40) },
    profileCardWrapper: { paddingHorizontal: normalize(24), marginTop: -verticalScale(80) },
    profileCard: { borderRadius: normalize(24), padding: normalize(24), paddingTop: normalize(40), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 8, overflow: 'visible' },
    cardSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%', opacity: 0.65 },
    editIconButton: { position: 'absolute', top: normalize(14), right: normalize(14), width: normalize(38), height: normalize(38), borderRadius: normalize(19), backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(15, 118, 110, 0.16)', zIndex: 5, elevation: 2 },
    avatarRing: { width: normalize(110), height: normalize(110), borderRadius: normalize(55), padding: normalize(5), justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(12), marginTop: -normalize(46), zIndex: 4, elevation: 4 },
    avatarContainer: { width: '100%', height: '100%', borderRadius: normalize(50), backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)' },
    avatarImage: { width: '100%', height: '100%', borderRadius: normalize(50) },
    avatarFallbackText: { fontSize: normalize(24), fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.8 },
    userName: { fontSize: normalize(21), fontWeight: '800', color: Colorpath.Primary, marginBottom: verticalScale(4), textAlign: 'center' },
    userMeta: { fontSize: normalize(13), color: '#5B6475', marginBottom: verticalScale(8), textAlign: 'center' },
    bioText: { fontSize: normalize(13), color: '#425466', lineHeight: normalize(20), textAlign: 'center', marginBottom: verticalScale(16) },
    heroPillsRow: { flexDirection: 'row', gap: normalize(8), marginBottom: verticalScale(14) },
    heroPill: { flexDirection: 'row', alignItems: 'center', gap: normalize(6), paddingHorizontal: normalize(10), paddingVertical: verticalScale(6), borderRadius: normalize(16), overflow: 'hidden' },
    heroPillText: { fontSize: normalize(11), fontWeight: '800', color: Colorpath.Primary },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colorpath.Secondary, paddingHorizontal: normalize(12), paddingVertical: verticalScale(7), borderRadius: normalize(18), gap: normalize(6), shadowColor: '#F59E0B', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
    badgeText: { color: '#FFFFFF', fontSize: normalize(12), fontWeight: '800' },
    mainContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(24) },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: normalize(12), marginBottom: verticalScale(24) },
    statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: normalize(16), borderRadius: normalize(18), borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', overflow: 'hidden' },
    statIconWrapper: { width: normalize(42), height: normalize(42), borderRadius: normalize(13), backgroundColor: 'rgba(255,255,255,0.78)', justifyContent: 'center', alignItems: 'center', marginRight: normalize(12) },
    statBoxLabel: { fontSize: normalize(11), color: '#5B6475', marginBottom: verticalScale(2), fontWeight: '600' },
    statBoxValue: { fontSize: normalize(16), fontWeight: '800', color: Colorpath.Primary },
    sectionTitle: { fontSize: normalize(18), fontWeight: '800', color: Colorpath.Primary, marginBottom: verticalScale(16), letterSpacing: 0.3 },
    performanceCard: { backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: normalize(18), padding: normalize(20), marginBottom: verticalScale(24), borderWidth: 1, borderColor: 'rgba(255,255,255,0.92)', shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
    detailRow: { gap: verticalScale(6) },
    detailDivider: { height: 1, backgroundColor: 'rgba(15, 23, 42, 0.08)', marginVertical: verticalScale(16) },
    detailLabel: { fontSize: normalize(12), color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    detailValue: { fontSize: normalize(14), color: '#111827', lineHeight: normalize(20), fontWeight: '500' },
    settingsContainer: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: normalize(18), paddingHorizontal: normalize(16), marginBottom: verticalScale(24), borderWidth: 1, borderColor: 'rgba(255,255,255,0.92)', shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: 'rgba(15, 23, 42, 0.06)' },
    settingItemLast: { borderBottomWidth: 0 },
    settingIconBg: { width: normalize(38), height: normalize(38), borderRadius: normalize(12), justifyContent: 'center', alignItems: 'center', marginRight: normalize(12), overflow: 'hidden' },
    settingCopy: { flex: 1 },
    settingText: { fontSize: normalize(15), fontWeight: '700', color: '#243047' },
    settingSubText: { fontSize: normalize(12), color: '#6B7280', marginTop: verticalScale(2) },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(4, 15, 30, 0.45)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(28), borderTopRightRadius: normalize(28), paddingHorizontal: normalize(24), paddingTop: normalize(20), paddingBottom: normalize(32), shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 12 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: verticalScale(20) },
    modalTitle: { fontSize: normalize(20), fontWeight: '800', color: Colorpath.Primary },
    closeButton: { width: normalize(36), height: normalize(36), borderRadius: normalize(18), backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
    imagePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: normalize(18), padding: normalize(14), marginBottom: verticalScale(18), borderWidth: 1, borderColor: '#E5E7EB' },
    editAvatarPreview: { width: normalize(58), height: normalize(58), borderRadius: normalize(29), overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: normalize(12) },
    imagePickerCopy: { flex: 1 },
    imagePickerTitle: { fontSize: normalize(14), fontWeight: '800', color: '#111827', marginBottom: verticalScale(2) },
    imagePickerSubtitle: { fontSize: normalize(12), color: '#6B7280' },
    inputGroup: { marginBottom: verticalScale(14) },
    inputLabel: { fontSize: normalize(13), fontWeight: '700', color: '#374151', marginBottom: verticalScale(8) },
    input: { backgroundColor: '#F8FAFC', borderRadius: normalize(14), borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: normalize(14), paddingVertical: verticalScale(12), fontSize: normalize(14), color: '#111827' },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
    phonePrefixBox: { backgroundColor: '#F8FAFC', borderRadius: normalize(14), borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: normalize(14), paddingVertical: verticalScale(12) },
    phonePrefixText: { fontSize: normalize(14), fontWeight: '600', color: '#111827' },
    phoneInput: { flex: 1 },
    bioInput: { minHeight: verticalScale(96) },
    saveButtonPressable: { marginTop: verticalScale(10) },
    saveButton: { borderRadius: normalize(16), alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(14), overflow: 'hidden' },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: '700' },
    deleteButtonPressable: { width: '48%' },
    deleteButton: { width: '100%', borderRadius: normalize(12), paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center' },
});
