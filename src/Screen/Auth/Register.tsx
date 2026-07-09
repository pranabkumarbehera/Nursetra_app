import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { FloatingMedicalBackground } from '../../Components/FloatingMedicalBackground';
import { ROUTES } from '../../Navigation/RouteNames';
import { signupRequest, signupSuccess } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';
import { normalizePhone, validateEmail, validatePassword, validatePhone } from '../../Utils/Helpers/validation';

export const RegisterScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.AuthReducer);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', gender: 'male', email: '', mobile: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ firstName: false, lastName: false, gender: false, email: false, mobile: false, password: false, confirmPassword: false });

  useEffect(() => {
    dispatch(signupSuccess(null));
  }, [dispatch]);

  useEffect(() => {
    if (!auth.signupResponse) return;
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.LOGIN }],
      })
    );
  }, [auth.signupResponse, navigation]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errors = {
    firstName: touched.firstName && !form.firstName.trim() ? 'First name is required' : '',
    lastName: touched.lastName && !form.lastName.trim() ? 'Last name is required' : '',
    email: touched.email ? (!form.email.trim() ? 'Email is required' : (!emailRegex.test(form.email.trim()) ? 'Enter valid email address' : '')) : '',
    mobile: touched.mobile ? (!form.mobile ? 'Phone number is required' : (form.mobile.length !== 10 ? 'Phone number must be 10 digits' : '')) : '',
    password: touched.password ? (!form.password ? 'Password is required' : (form.password.length < 7 ? 'Password must be at least 7 characters' : '')) : '',
    confirmPassword: touched.confirmPassword && form.confirmPassword !== form.password ? 'Passwords do not match' : '',
  };

  const isInvalid = !!errors.firstName || !!errors.lastName || !!errors.email || !!errors.mobile || !!errors.password || !!errors.confirmPassword || !agreed;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: field === 'mobile' ? normalizePhone(value) : value }));
  };

  const handleSubmit = () => {
    setTouched({ firstName: true, lastName: true, gender: true, email: true, mobile: true, password: true, confirmPassword: true });
    const nextErrors = {
      firstName: !form.firstName.trim() ? 'First name is required' : '',
      lastName: !form.lastName.trim() ? 'Last name is required' : '',
      email: !form.email.trim() ? 'Email is required' : (!emailRegex.test(form.email.trim()) ? 'Enter valid email address' : ''),
      mobile: !form.mobile ? 'Phone number is required' : (form.mobile.length !== 10 ? 'Phone number must be 10 digits' : ''),
      password: !form.password ? 'Password is required' : (form.password.length < 7 ? 'Password must be at least 7 characters' : ''),
      confirmPassword: form.confirmPassword !== form.password ? 'Passwords do not match' : '',
    };

    if (Object.values(nextErrors).some(Boolean) || !agreed) {
      return;
    }

    dispatch(
      signupRequest({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        gender: form.gender,
        email: form.email.trim(),
        phone: form.mobile.trim(),
        password: form.password,
      })
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContainer}>
        <View style={styles.headerTextWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>Join thousands of learners today.</Text>
        </View>
      </View>

      <FloatingMedicalBackground />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Input label="First Name" placeholder="Enter your first name" value={form.firstName} onChangeText={(value) => handleChange('firstName', value)} onFocus={() => setTouched(prev => ({ ...prev, firstName: true }))} onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))} leftIcon="person-outline" error={errors.firstName} />
          <Input label="Last Name" placeholder="Enter your last name" value={form.lastName} onChangeText={(value) => handleChange('lastName', value)} onFocus={() => setTouched(prev => ({ ...prev, lastName: true }))} onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))} leftIcon="person-outline" error={errors.lastName} />
          
          <View style={styles.genderSection}>
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity style={styles.radioOption} onPress={() => handleChange('gender', 'male')} activeOpacity={0.8}>
                <View style={[styles.radioCircle, form.gender === 'male' && styles.radioCircleActive]}>
                  {form.gender === 'male' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => handleChange('gender', 'female')} activeOpacity={0.8}>
                <View style={[styles.radioCircle, form.gender === 'female' && styles.radioCircleActive]}>
                  {form.gender === 'female' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Input label="Email" placeholder="Enter your email" value={form.email} onChangeText={(value) => handleChange('email', value)} onFocus={() => setTouched(prev => ({ ...prev, email: true }))} onBlur={() => setTouched(prev => ({ ...prev, email: true }))} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={errors.email} />
          <Input label="Mobile Number" placeholder="Enter mobile number" value={form.mobile} onChangeText={(text) => handleChange('mobile', text.replace(/[^0-9]/g, '').slice(0, 10))} onFocus={() => setTouched(prev => ({ ...prev, mobile: true }))} onBlur={() => setTouched(prev => ({ ...prev, mobile: true }))} keyboardType="phone-pad" maxLength={10} leftIcon="call-outline" error={errors.mobile} />
          <Input label="Password" placeholder="Create a password" value={form.password} onChangeText={(value) => handleChange('password', value)} onFocus={() => setTouched(prev => ({ ...prev, password: true }))} onBlur={() => setTouched(prev => ({ ...prev, password: true }))} isPassword leftIcon="lock-closed-outline" error={errors.password} />
          <Input label="Confirm Password" placeholder="Confirm your password" value={form.confirmPassword} onChangeText={(value) => handleChange('confirmPassword', value)} onFocus={() => setTouched(prev => ({ ...prev, confirmPassword: true }))} onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))} isPassword leftIcon="shield-checkmark-outline" error={errors.confirmPassword} />

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreed(prev => !prev)} activeOpacity={0.8}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>{agreed ? <Icon name="checkmark" size={14} color={theme.colors.white} /> : null}</View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.linkText} onPress={() => navigation.navigate(ROUTES.TERMS_CONDITIONS)}>Terms & Conditions</Text> and <Text style={styles.linkText} onPress={() => navigation.navigate(ROUTES.PRIVACY_POLICY)}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>
          </View>

          <Button title="Create Account" onPress={handleSubmit} style={styles.primaryBtn} loading={auth.isLoading} disabled={auth.isLoading || isInvalid} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerWrap} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.footerAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: { height: '20%', width: '100%', position: 'relative', overflow: 'hidden', justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 20, paddingTop: 60 },
  headerTextWrap: { position: 'relative', zIndex: 10 },
  backButton: { marginBottom: 0, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  welcomeText: {fontWeight: 'bold', fontFamily: Fonts.interbold, fontSize: 32, color: theme.colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitleText: { fontFamily: Fonts.interbold, fontWeight: '600', fontSize: 16, color: theme.colors.textLight },
  keyboardView: { flex: 1, zIndex: 10 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  optionsContainer: { marginBottom: 20 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: theme.colors.border, marginRight: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  termsText: { flex: 1, color: theme.colors.text, fontFamily: Fonts.interregular, fontSize: 14, lineHeight: 20 },
  linkText: { color: theme.colors.primary, fontFamily: Fonts.intersemibold },
  primaryBtn: { marginBottom: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 18 },
  footerWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { color: theme.colors.textLight, fontFamily: Fonts.interregular, fontSize: 15 },
  footerAction: { color: theme.colors.primary, fontFamily: Fonts.interbold, fontSize: 15 },
  genderSection: { marginBottom: 16 },
  genderLabel: { fontFamily: Fonts.intersemibold, fontSize: 14, color: theme.colors.text, marginBottom: 8, marginLeft: 4 },
  genderOptions: { flexDirection: 'row', gap: 24, marginLeft: 4 },
  radioOption: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  radioCircleActive: { borderColor: theme.colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  radioText: { color: theme.colors.text, fontFamily: Fonts.interregular, fontSize: 15 },
});
