import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { ROUTES } from '../../Navigation/RouteNames';

export const ForgotPassword = () => {
  const navigation = useNavigation<any>();
  const [method, setMethod] = useState<'email' | 'mobile'>('email');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Icon name="lock-closed-outline" size={28} color={theme.colors.white} />
        </View>

        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered {method === 'email' ? 'email address' : 'mobile number'} and we&apos;ll send you a one-time password.
        </Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, method === 'email' && styles.toggleButtonActive]}
            onPress={() => setMethod('email')}
          >
            <Icon name="mail-outline" size={18} color={method === 'email' ? theme.colors.primary : theme.colors.textLight} />
            <Text style={[styles.toggleText, method === 'email' && styles.toggleTextActive]}>Email Address</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, method === 'mobile' && styles.toggleButtonActive]}
            onPress={() => setMethod('mobile')}
          >
            <Icon name="call-outline" size={18} color={method === 'mobile' ? theme.colors.primary : theme.colors.textLight} />
            <Text style={[styles.toggleText, method === 'mobile' && styles.toggleTextActive]}>Mobile Number</Text>
          </TouchableOpacity>
        </View>

        {method === 'email' ? (
          <Input label="Email Address" placeholder="yourname@email.com" keyboardType="email-address" leftIcon="mail-outline" />
        ) : (
          <Input label="Mobile Number" placeholder="Enter mobile number" keyboardType="phone-pad" leftIcon="call-outline" />
        )}

        <Button title="Send OTP" onPress={() => navigation.navigate(ROUTES.OTP_VERIFICATION)} style={styles.actionButton} />

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.footerTextRow}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Icon name="lock-closed" size={16} color={theme.colors.warning} />
          </View>
          <View>
            <Text style={styles.securityTitle}>Secure &amp; Encrypted</Text>
            <Text style={styles.securitySubtitle}>Your data is always protected with us</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontFamily: Fonts.interbold,
    fontSize:18,
    color:"#000000",
    fontWeight:'bold'
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 26,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 10,
  },
  title: {
    ...theme.typography.h1,
    fontFamily: Fonts.interbold,
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  toggleContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#E8F1FC',
    padding: 5,
    borderRadius: 18,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.white,
  },
  toggleText: {
    marginLeft: 8,
    color: theme.colors.textLight,
    fontFamily: Fonts.intersemibold,
    fontSize: 14,
  },
  toggleTextActive: {
    color: theme.colors.primary,
  },
  actionButton: {
    marginTop: 8,
  },
  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
  },
  footerTextRow: {
    flexDirection: 'row',
    marginBottom: 24,
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
  securityCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D6E6FA',
    padding: 16,
  },
  securityIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityTitle: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    marginBottom: 2,
  },
  securitySubtitle: {
    color: theme.colors.textLight,
    fontSize: 12,
    fontFamily: Fonts.interregular,
  },
});
