import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, theme } from '../../Themes';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { ROUTES } from '../../Navigation/RouteNames';
import { forgotPasswordRequest, forgotPasswordSuccess } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';
import { validateEmail } from '../../Utils/Helpers/validation';

const HERO_GRADIENT = ['#07182E', '#0B5FA8', '#18B5A5'];
const CARD_GRADIENT = ['rgba(255,255,255,0.98)', 'rgba(247,251,255,0.95)'];
const ACCENT_GRADIENT = ['rgba(11,95,168,0.16)', 'rgba(24,181,165,0.10)'];
const TIP_GRADIENT = ['rgba(245,158,11,0.16)', 'rgba(251,191,36,0.08)'];

export const ForgotPassword = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.AuthReducer);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    dispatch(forgotPasswordSuccess(null));
  }, [dispatch]);

  useEffect(() => {
    if (!auth.forgotPasswordResponse) return;
    navigation.dispatch(
      CommonActions.navigate({
        name: ROUTES.OTP_VERIFICATION,
        params: { email: email.trim() },
      })
    );
  }, [auth.forgotPasswordResponse, email, navigation]);

  const emailError = touched ? validateEmail(email) : '';

  const handleSubmit = () => {
    setTouched(true);
    if (validateEmail(email)) return;
    dispatch(forgotPasswordRequest({ email: email.trim() }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#07182E" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Icon name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroCenter}>
            <LinearGradient colors={ACCENT_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIconWrap}>
              <Icon name="lock-closed-outline" size={30} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.heroTitle}>Reset your password</Text>
            <Text style={styles.heroSubtitle}>
              Enter your registered email address and we will send a one-time password to continue.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.contentWrap}>
          <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card}>
            <View style={styles.cardTopBadge}>
              <LinearGradient colors={TIP_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tipPill}>
                <Icon name="shield-checkmark-outline" size={14} color="#D97706" />
                <Text style={styles.tipPillText}>Secure OTP</Text>
              </LinearGradient>
            </View>

            <Text style={styles.sectionTitle}>Email verification</Text>
            <Text style={styles.sectionSubtitle}>
              We will verify your account and guide you to the next step.
            </Text>

            <View style={styles.formCard}>
              <Input
                label="Email Address"
                placeholder="yourname@email.com"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setTouched(true)}
                onBlur={() => setTouched(true)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={emailError}
              />
            </View>

            <Button
              title="Send OTP"
              onPress={handleSubmit}
              style={styles.actionButton}
              loading={auth.isLoading}
              disabled={auth.isLoading || !!validateEmail(email)}
            />

            <View style={styles.hintRow}>
              <View style={styles.hintItem}>
                <View style={styles.hintDot} />
                <Text style={styles.hintText}>OTP will be sent to your registered email</Text>
              </View>
              <View style={styles.hintItem}>
                <View style={styles.hintDot} />
                <Text style={styles.hintText}>Check spam or promotions if you do not see it</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.footerBox}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)} activeOpacity={0.8}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7FB',
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 2,
    marginBottom: 16,
  },
  hintRow: {
    gap: 10,
    paddingTop: 4,
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
  footerBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 15,
  },
  footerLink: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 15,
  },
});
