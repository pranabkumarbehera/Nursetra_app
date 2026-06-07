import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colorpath, Fonts, theme } from '../../Themes';
import { ROUTES } from '../../Navigation/RouteNames';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';

const EXAMS = ['NORCET', 'GNM', 'B.Sc Nursing', 'CHO', 'ESIC', 'RRB', 'DSSSB', 'PGIMER'];

export const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedExams, setSelectedExams] = useState<string[]>(['NORCET']);
  const [agreed, setAgreed] = useState(true);

  const toggleExam = (exam: string) => {
    setSelectedExams(prev =>
      prev.includes(exam) ? prev.filter(item => item !== exam) : [...prev, exam]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={20} color={theme.colors.white} />
          </TouchableOpacity>

        </View>

        <Text style={styles.mainTitle}>Join the Community</Text>
        <Text style={styles.subtitle}>Create an account to start your preparation</Text>

        <View style={styles.stepperContainer}>
          {['Personal Info', 'Exam Goal', 'Done'].map((step, index) => {
            const active = index === 0;
            return (
              <React.Fragment key={step}>
                <View style={styles.stepperStep}>
                  <View style={[styles.stepperCircle, active && styles.stepperCircleActive]}>
                    <Text style={[styles.stepperNumber, active && styles.stepperNumberActive]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stepperText, active && styles.stepperTextActive]}>{step}</Text>
                </View>
                {index < 2 ? <View style={styles.stepperLine} /> : null}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <View style={styles.formContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Input label="Full Name *" placeholder="Enter your full name" leftIcon="person-outline" />

          <Text style={styles.inputLabel}>Mobile Number *</Text>
          <View style={styles.mobileRow}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <View style={styles.mobileInput}>
              <Input
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                leftIcon="call-outline"
                containerStyle={styles.noGap}
              />
            </View>
          </View>

          <Input label="Email Address" placeholder="Optional" keyboardType="email-address" leftIcon="mail-outline" />

          <View style={styles.passwordBlock}>
            <Input
              label="Password *"
              placeholder="Create strong password"
              isPassword
              leftIcon="lock-closed-outline"
              containerStyle={styles.noGap}
            />
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBar, styles.strengthBarActive]} />
              <View style={[styles.strengthBar, styles.strengthBarActive]} />
              <View style={styles.strengthBar} />
              <View style={styles.strengthBar} />
              <Text style={styles.strengthText}>Fair</Text>
            </View>
          </View>

          <Input label="Confirm Password *" placeholder="Re-enter password" isPassword leftIcon="lock-closed-outline" />

          <Text style={styles.inputLabel}>Target Exam *</Text>
          <View style={styles.chipsContainer}>
            {EXAMS.map(exam => {
              const isSelected = selectedExams.includes(exam);
              return (
                <TouchableOpacity
                  key={exam}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleExam(exam)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{exam}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreed(!agreed)}>
            <Icon
              name={agreed ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={agreed ? theme.colors.primary : theme.colors.textLight}
            />
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.linkText}>Terms of Service</Text> &amp;{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <Button title="Continue" onPress={() => navigation.navigate(ROUTES.LOGIN)} style={styles.continueBtn} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  topSection: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandText: {
    color: theme.colors.white,
    fontFamily: Fonts.interbold,
    fontSize: 24,
  },
  mainTitle: {
    ...theme.typography.h1,
    fontFamily: Fonts.interbold,
    color: theme.colors.white,
    fontSize: 30,
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontFamily: Fonts.interregular,
    fontSize: 16,
    marginBottom: 22,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  stepperCircleActive: {
    backgroundColor: theme.colors.white,
  },
  stepperNumber: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.interbold,
    fontSize: 12,
  },
  stepperNumberActive: {
    color: Colorpath.Primary,
  },
  stepperText: {
    marginLeft: 8,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Fonts.intermedium,
    fontSize: 13,
  },
  stepperTextActive: {
    color: theme.colors.white,
  },
  stepperLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.26)',
    marginHorizontal: 8,
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 36,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontFamily: Fonts.intersemibold,
    fontSize: 15,
    marginBottom: 10,
    fontWeight: "bold"
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  countryCode: {
    width: 88,
    height: 52,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontFamily: Fonts.intersemibold,
    color: theme.colors.text,
  },
  mobileInput: {
    flex: 1,
  },
  noGap: {
    marginBottom: 0,
  },
  passwordBlock: {
    marginBottom: 16,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#DCE6F4',
  },
  strengthBarActive: {
    backgroundColor: theme.colors.primary,
  },
  strengthText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
    fontSize: 12,
    marginLeft: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontFamily: Fonts.intersemibold,
    fontSize: 14,
  },
  chipTextSelected: {
    color: theme.colors.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 13,
    lineHeight: 20,
  },
  linkText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
  },
  continueBtn: {
    marginTop: 4,
  },
});
