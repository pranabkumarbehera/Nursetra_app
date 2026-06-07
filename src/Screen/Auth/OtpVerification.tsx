import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';
import { Button } from '../../Components/buttons/Button';
import { ROUTES } from '../../Navigation/RouteNames';

const OTP_DIGITS = ['3', '', '', '', '', ''];

export const OtpVerification = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTP Verification</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Icon name="shield-checkmark-outline" size={28} color={theme.colors.white} />
        </View>

        <Text style={styles.title}>Enter OTP Code</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a 6-digit code to{'\n'}
          <Text style={styles.emailText}>your**@email.com</Text>
        </Text>

        <View style={styles.otpRow}>
          {OTP_DIGITS.map((digit, index) => (
            <View key={index} style={[styles.otpBox, index === 0 && styles.otpBoxActive]}>
              <Text style={[styles.otpText, index === 0 && styles.otpTextActive]}>{digit || '•'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>01:45</Text>
        </View>
        <Text style={styles.timerLabel}>Time remaining</Text>

        <View style={styles.resendRow}>
          <Icon name="refresh-outline" size={16} color={theme.colors.textLight} />
          <Text style={styles.resendText}>Didn&apos;t receive code? </Text>
          <TouchableOpacity>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        <Button title="Verify & Continue" onPress={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)} style={styles.actionButton} />

        <View style={styles.footerTextRow}>
          <Text style={styles.footerText}>Wrong email? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Change it</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepper}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleDone]}>
              <Icon name="checkmark" size={12} color={theme.colors.white} />
            </View>
            <Text style={styles.stepTextActive}>Request</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>2</Text>
            </View>
            <Text style={styles.stepTextActive}>Verify</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepText}>Reset</Text>
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
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 26,
  },
  emailText: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
  },
  otpRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 28,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  otpText: {
    fontSize: 28,
    color: '#D2DCEC',
    fontFamily: Fonts.interbold,
  },
  otpTextActive: {
    color: theme.colors.primary,
  },
  timerCircle: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 3,
    borderColor: '#D9ECFF',
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timerText: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 28,
  },
  timerLabel: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    marginBottom: 28,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
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
  actionButton: {
    marginBottom: 24,
  },
  footerTextRow: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  footerText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
  },
  footerLink: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3EAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleDone: {
    backgroundColor: theme.colors.primary,
  },
  stepCircleActive: {
    backgroundColor: '#DDF0FF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  stepNumber: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interbold,
    fontSize: 12,
  },
  stepNumberActive: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 12,
  },
  stepText: {
    color: '#B8C5D7',
    fontSize: 12,
    fontFamily: Fonts.intersemibold,
  },
  stepTextActive: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: Fonts.intersemibold,
  },
  stepLine: {
    width: 44,
    height: 2,
    backgroundColor: '#DFE8F4',
    marginHorizontal: 10,
    marginBottom: 18,
  },
  stepLineDone: {
    backgroundColor: theme.colors.primary,
  },
});
