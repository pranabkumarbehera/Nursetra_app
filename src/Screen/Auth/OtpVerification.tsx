import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar, TextInput } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, theme } from '../../Themes';
import { Button } from '../../Components/buttons/Button';
import { ROUTES } from '../../Navigation/RouteNames';
import { forgotPasswordRequest, verifyOtpRequest, verifyOtpSuccess } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';
import { validateOtp } from '../../Utils/Helpers/validation';

const EMPTY_OTP = ['', '', '', '', '', ''];
const HERO_GRADIENT = ['#07182E', '#0B5FA8', '#18B5A5'];
const CARD_GRADIENT = ['rgba(255,255,255,0.98)', 'rgba(247,251,255,0.95)'];
const ACCENT_GRADIENT = ['rgba(11,95,168,0.16)', 'rgba(24,181,165,0.10)'];
const TIP_GRADIENT = ['rgba(245,158,11,0.16)', 'rgba(251,191,36,0.08)'];

export const OtpVerification = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.AuthReducer);
  const email = String(route.params?.email || '').trim();
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [touched, setTouched] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    dispatch(verifyOtpSuccess(null));
  }, [dispatch]);

  useEffect(() => {
    if (!auth.verifyOtpResponse) return;

    const token =
      auth.verifyOtpResponse?.resetToken ||
      auth.verifyOtpResponse?.token ||
      auth.verifyOtpResponse?.data?.resetToken ||
      auth.verifyOtpResponse?.data?.token ||
      auth.verifyOtpResponse?.data?.data?.token ||
      '';

    navigation.dispatch(
      CommonActions.navigate({
        name: ROUTES.CHANGE_PASSWORD,
        params: { token, email },
      })
    );
  }, [auth.verifyOtpResponse, email, navigation]);

  const otpValue = otp.join('');
  const otpError = touched ? validateOtp(otpValue) : '';

  const setDigit = (value: string, index: number) => {
    const next = [...otp];
    const digit = value.replace(/\D/g, '').slice(-1);
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    setTouched(true);
    if (validateOtp(otpValue)) return;
    dispatch(verifyOtpRequest({ email, otp: otpValue }));
  };

  const handleResend = () => {
    if (!email) return;
    setOtp(EMPTY_OTP);
    setTouched(false);
    dispatch(forgotPasswordRequest({ email }));
  };

  const disableResend = useMemo(() => auth.isLoading, [auth.isLoading]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#07182E" />

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                <Icon name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>OTP Verification</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.heroCenter}>
              <LinearGradient colors={ACCENT_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIconWrap}>
                <Icon name="shield-checkmark-outline" size={30} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.heroTitle}>Enter verification code</Text>
              <Text style={styles.heroSubtitle}>
                We have sent a 6-digit OTP to your email address.
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>
          </LinearGradient>

          <View style={styles.contentWrap}>
            <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card}>
              <View style={styles.cardTopBadge}>
                <LinearGradient colors={TIP_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tipPill}>
                  <Icon name="time-outline" size={14} color="#D97706" />
                  <Text style={styles.tipPillText}>Valid for a short time</Text>
                </LinearGradient>
              </View>

              <Text style={styles.sectionTitle}>Enter OTP</Text>
              <Text style={styles.sectionSubtitle}>
                Type the 6-digit code sent to your registered email.
              </Text>

              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[styles.otpInput, digit ? styles.otpInputFilled : null, touched && otpError ? styles.otpInputError : null]}
                    value={digit}
                    onChangeText={(value) => setDigit(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    textAlign="center"
                  />
                ))}
              </View>
              {touched && otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

              <Button
                title="Verify & Continue"
                onPress={handleVerify}
                style={styles.actionButton}
                loading={auth.isLoading}
                disabled={auth.isLoading || !!validateOtp(otpValue)}
              />

              <View style={styles.hintList}>
                <View style={styles.hintItem}>
                  <View style={styles.hintDot} />
                  <Text style={styles.hintText}>Did not receive the code? Tap resend OTP.</Text>
                </View>
                <View style={styles.hintItem}>
                  <View style={styles.hintDot} />
                  <Text style={styles.hintText}>Make sure the email shown above is correct.</Text>
                </View>
              </View>

              <View style={styles.resendBox}>
                <Icon name="refresh-outline" size={16} color={theme.colors.textLight} />
                <Text style={styles.resendText}>Didn&apos;t receive code? </Text>
                <TouchableOpacity onPress={handleResend} disabled={disableResend}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
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
  backBtn: {
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
  emailText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.interbold,
    textAlign: 'center',
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
  otpRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 20,
  },
  otpInputFilled: {
    borderColor: theme.colors.primary,
  },
  otpInputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: Fonts.interregular,
    fontSize: 12,
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
    marginBottom: 18,
  },
  hintList: {
    gap: 10,
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
  resendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    color: theme.colors.textLight,
    marginLeft: 6,
    fontFamily: Fonts.interregular,
  },
  resendLink: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
  },
});
