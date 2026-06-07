import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Imagepath, theme } from '../../Themes';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { ROUTES } from '../../Navigation/RouteNames';
import Icon from 'react-native-vector-icons/Ionicons';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = () => {
    navigation.replace(ROUTES.MAIN_STACK);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.heroGlow, styles.heroGlowLeft]} />
          <View style={[styles.heroGlow, styles.heroGlowRight]} />


          <Text style={styles.appName}>Welcome Back!</Text>
          <Text style={styles.tagline}>Sign in to continue your preparation</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={styles.activeTabText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate(ROUTES.REGISTER)}>
              <Text style={styles.inactiveTabText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Email Address"
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <Input
            label="Password"
            placeholder="Enter password"
            isPassword
            leftIcon="lock-closed-outline"
          />

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Icon name="checkmark" size={13} color={theme.colors.white} /> : null}
              </View>
              <Text style={styles.rememberText}>Remember Password</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button title="Sign In" onPress={handleLogin} style={styles.primaryButton} />



          <Text style={styles.termsText}>
            By signing in, you agree to our <Text style={styles.linkText}>Terms</Text> &amp;{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 44,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  heroGlowLeft: {
    top: -60,
    left: -40,
  },
  heroGlowRight: {
    right: -60,
    bottom: -80,
  },
  logoCard: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 18,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    ...theme.typography.h1,
    fontFamily: Fonts.interbold,
    color: theme.colors.white,
    marginBottom: 8,
    fontSize: 32,
  },
  tagline: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 32,
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
    fontSize: 16,
    fontWeight: "bold"
  },
  inactiveTabText: {
    color: theme.colors.white,
    fontFamily: Fonts.intersemibold,
    fontSize: 16,
    fontWeight: "bold"
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 34,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -30,
    flex: 1,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  label: {
    ...theme.typography.caption,
    fontFamily: Fonts.intersemibold,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  countryPill: {
    width: 90,
    minHeight: 58,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#B5CAE6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    color: theme.colors.text,
    fontFamily: Fonts.intersemibold,
    fontSize: 15,
  },
  phoneInputWrap: {
    flex: 1,
  },
  zeroMargin: {
    marginBottom: 0,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rememberText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.intermedium,
    fontSize: 14,
  },
  forgotText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
    fontSize: 14,
  },
  primaryButton: {
    marginBottom: 18,
    fontSize: 20,
    fontFamily: Fonts.intersemibold,
    fontWeight: "bold"
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    color: theme.colors.textLight,
    marginHorizontal: 10,
    fontFamily: Fonts.interregular,
  },
  secondaryButton: {
    marginBottom: 18,
  },
  termsText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 12,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  linkText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
  },
});
