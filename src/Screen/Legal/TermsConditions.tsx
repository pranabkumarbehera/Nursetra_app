import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';

export const TermsConditionsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0B5FA8" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.hero}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.85}>
              <Icon name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroCenter}>
            <View style={styles.heroIconWrap}>
              <Icon name="document-text-outline" size={28} color="#0B5FA8" />
            </View>
            <Text style={styles.heroTitle}>Terms & Conditions</Text>
            <Text style={styles.heroSubtitle}>Please review the rules that apply when using Nursetra services.</Text>
          </View>
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.card}>
            <View style={styles.badge}>
              <Icon name="shield-checkmark-outline" size={14} color="#0B5FA8" />
              <Text style={styles.badgeText}>Effective Date: July 9, 2026</Text>
            </View>

            <Text style={styles.paragraph}>
              Welcome to Nursetra. By accessing or using our website, mobile application, or services, you agree to comply with these Terms & Conditions.
            </Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>1.</Text> Acceptance of Terms</Text>
            <Text style={styles.paragraph}>By using Nursetra, you agree to these Terms & Conditions and our Privacy Policy.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>2.</Text> User Accounts</Text>
            <Text style={styles.paragraph}>Users are responsible for maintaining the confidentiality of their login credentials and for all activities under their account.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>3.</Text> Educational Purpose</Text>
            <Text style={styles.paragraph}>Nursetra provides educational content for examination preparation only. We do not guarantee success in any examination or employment opportunity.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>4.</Text> Payments</Text>
            <Text style={styles.paragraph}>Paid subscriptions and purchases are subject to the pricing displayed at the time of purchase.</Text>
            <Text style={styles.paragraph}>Unless otherwise stated, payments are non-refundable except where required by applicable law.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>5.</Text> Intellectual Property</Text>
            <Text style={styles.paragraph}>All study materials, questions, explanations, graphics, logos, videos, and other content are the intellectual property of Nursetra or its licensors and may not be copied, reproduced, distributed, or modified without written permission.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>6.</Text> Prohibited Activities</Text>
            <Text style={styles.paragraph}>Users must not:</Text>
            <View style={styles.bulletList}>
              {['Share account credentials', 'Copy or distribute study materials', 'Attempt unauthorized access', 'Reverse engineer the application', 'Use the platform for unlawful purposes'].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>7.</Text> Account Suspension</Text>
            <Text style={styles.paragraph}>We reserve the right to suspend or terminate accounts that violate these Terms.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>8.</Text> Disclaimer</Text>
            <Text style={styles.paragraph}>While we strive for accuracy, we do not warrant that all content is free from errors or omissions. Users should independently verify important information.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>9.</Text> Limitation of Liability</Text>
            <Text style={styles.paragraph}>Nursetra shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>10.</Text> Governing Law</Text>
            <Text style={styles.paragraph}>These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in India.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>11.</Text> Changes to Terms</Text>
            <Text style={styles.paragraph}>We reserve the right to modify these Terms at any time. Continued use of the platform constitutes acceptance of the updated Terms.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>12.</Text> Contact Us</Text>
            <Text style={styles.contactInfo}><Text style={styles.bold}>Website:</Text> https://www.nursetra.in</Text>
            <Text style={styles.contactInfo}><Text style={styles.bold}>Email:</Text> support@nursetra.in</Text>
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
    backgroundColor: '#0B5FA8',
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    paddingTop: 14,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: Fonts.interbold,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    fontFamily: Fonts.interregular,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  contentWrap: {
    paddingHorizontal: 16,
    marginTop: -12,
    paddingBottom: 18,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#0B5FA8',
    fontSize: 12,
    fontFamily: Fonts.interbold,
  },
  paragraph: {
    fontFamily: Fonts.interregular,
    fontSize: 15,
    color: theme.colors.textLight,
    marginBottom: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: Fonts.interbold,
    fontSize: 17,
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 10,
  },
  sectionNumber: {
    fontFamily: Fonts.interbold,
    color: '#0B5FA8',
  },
  bulletList: {
    marginBottom: 14,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
  },
  bulletPoint: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: 10,
  },
  bulletText: {
    fontFamily: Fonts.interregular,
    fontSize: 15,
    color: theme.colors.textLight,
    lineHeight: 22,
    flex: 1,
  },
  contactInfo: {
    fontFamily: Fonts.interregular,
    fontSize: 15,
    color: theme.colors.textLight,
    marginBottom: 8,
  },
  bold: {
    fontFamily: Fonts.interbold,
    color: theme.colors.text,
  },
});
