import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { reset as resetNavigation } from '../../Navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { FloatingMedicalBackground } from '../../Components/FloatingMedicalBackground';
import { ROUTES } from '../../Navigation/RouteNames';
import { loginRequest, loginSuccess } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';
import constants from '../../Utils/Helpers/constants';
import { validateEmail, validatePassword } from '../../Utils/Helpers/validation';

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.AuthReducer);
  const isFocused = useIsFocused();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (!isFocused) return;
    
    dispatch(loginSuccess(null));
    let active = true;

    const loadSavedLogin = async () => {
      try {
        const remember = await AsyncStorage.getItem(constants.REMEMBER_PASSWORD);
        const savedEmail = await AsyncStorage.getItem(constants.SAVED_EMAIL);
        const savedPassword = await AsyncStorage.getItem(constants.SAVED_PASSWORD);

        if (!active) return;

        if (remember === 'true' && savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        } else {
          setEmail('');
          setPassword('');
          setRememberMe(false);
        }
      } catch {
        // ignore
      }
    };

    loadSavedLogin();
    return () => {
      active = false;
    };
  }, [dispatch, isFocused]);

  useEffect(() => {
    if (auth.token && auth.loginResponse) {
      resetNavigation({
        index: 0,
        routes: [{ name: ROUTES.MAIN_STACK }],
      });
    }
  }, [auth.token, auth.loginResponse, navigation]);

  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.password ? validatePassword(password) : '';
  const isInvalid = !!validateEmail(email) || !!validatePassword(password);

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    if (nextEmailError || nextPasswordError) return;

    const deviceName = Platform.OS === 'ios' ? 'iOS Device' : 'Android Device';
    let deviceId = Platform.OS === 'ios' ? 'ios-device' : 'android-device';
    try {
      let id = await AsyncStorage.getItem('device_id');
      if (!id) {
        id = 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        await AsyncStorage.setItem('device_id', id);
      }
      deviceId = id;
    } catch {
      // Ignore
    }

    dispatch(
      loginRequest({
        email: email.trim(),
        password,
        rememberMe,
        deviceId,
        deviceName,
        deviceType: 'mobile',
      })
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContainer}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue your learning journey.</Text>
        </View>
      </View>

      <FloatingMedicalBackground />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setTouched(prev => ({ ...prev, email: true }))}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={emailError}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setTouched(prev => ({ ...prev, password: true }))}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            isPassword
            leftIcon="lock-closed-outline"
            error={passwordError}
          />

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(prev => !prev)} activeOpacity={0.8}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Icon name="checkmark" size={14} color={theme.colors.white} /> : null}
              </View>
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)} activeOpacity={0.8}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button title="Sign In" onPress={handleLogin} style={styles.primaryBtn} loading={auth.isLoading} disabled={auth.isLoading || isInvalid} />

          <View style={styles.dividerWrap}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Icon name="logo-google" size={20} color={theme.colors.text} style={styles.socialIcon} />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Icon name="logo-apple" size={20} color={theme.colors.text} style={styles.socialIcon} />
              <Text style={styles.socialBtnText}>Continue with Apple</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerWrap} activeOpacity={0.8} onPress={() => navigation.navigate(ROUTES.REGISTER)}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text style={styles.footerAction}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: { height: '25%', width: '100%', position: 'relative', overflow: 'hidden', justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 24, paddingTop: 60 },
  headerTextWrap: { position: 'relative', zIndex: 10 },
  welcomeText: {fontWeight: 'bold', fontFamily: Fonts.interbold, fontSize: 32, color: theme.colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitleText: { fontFamily: Fonts.interbold, fontWeight: '600', fontSize: 16, color: theme.colors.textLight },
  keyboardView: { flex: 1, zIndex: 10 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 32 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: theme.colors.border, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  rememberText: { color: theme.colors.text, fontFamily: Fonts.intermedium, fontSize: 14 },
  forgotText: { color: theme.colors.primary, fontFamily: Fonts.intersemibold, fontSize: 14 },
  primaryBtn: { marginBottom: 20 },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { marginHorizontal: 12, color: theme.colors.textLight, fontFamily: Fonts.intermedium },
  socialBtn: { height: 56, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.white, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 12 },
  socialIcon: { marginRight: 10 },
  socialBtnText: { color: theme.colors.text, fontFamily: Fonts.intersemibold, fontSize: 15 },
  footer: { paddingHorizontal: 24, paddingBottom: 18 },
  footerWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { color: theme.colors.textLight, fontFamily: Fonts.interregular, fontSize: 15 },
  footerAction: { color: theme.colors.primary, fontFamily: Fonts.interbold, fontSize: 15 },
});
