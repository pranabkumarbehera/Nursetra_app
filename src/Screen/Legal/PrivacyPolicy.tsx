import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';

export const PrivacyPolicyScreen = () => {
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroCenter}>
            <View style={styles.heroIconWrap}>
              <Icon name="shield-checkmark-outline" size={28} color="#0B5FA8" />
            </View>
            <Text style={styles.heroTitle}>Privacy Policy</Text>
            <Text style={styles.heroSubtitle}>How Nursetra collects, uses, and protects your information.</Text>
          </View>
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.card}>
            <View style={styles.badge}>
              <Icon name="calendar-outline" size={14} color="#0B5FA8" />
              <Text style={styles.badgeText}>Effective Date: July 9, 2026</Text>
            </View>

            <Text style={styles.paragraph}>
              Welcome to Nursetra ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our website, mobile application, and related services.
            </Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>1.</Text> Information We Collect</Text>
            <Text style={styles.paragraph}>We may collect:</Text>
            <View style={styles.bulletList}>
              {['Name', 'Email address', 'Mobile number', 'Profile information', 'Login credentials', 'Device information', 'IP address', 'Usage statistics', 'Payment transaction details (processed securely by third-party payment providers; we do not store complete card information)'].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>2.</Text> How We Use Your Information</Text>
            <Text style={styles.paragraph}>We use your information to:</Text>
            <View style={styles.bulletList}>
              {['Create and manage your account', 'Provide access to courses and practice tests', 'Improve our services', 'Track learning progress', 'Process purchases', 'Send important updates and notifications', 'Provide customer support', 'Prevent fraud and misuse'].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>3.</Text> Cookies and Analytics</Text>
            <Text style={styles.paragraph}>We may use cookies and similar technologies to enhance user experience and analyze platform performance.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>4.</Text> Third-Party Services</Text>
            <Text style={styles.paragraph}>We may use trusted third-party services including:</Text>
            <View style={styles.bulletList}>
              {['Google Firebase', 'Google Play Services', 'Razorpay or other payment gateways', 'Analytics providers', 'Cloud hosting providers'].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.paragraph}>These services have their own privacy policies.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>5.</Text> Data Security</Text>
            <Text style={styles.paragraph}>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>6.</Text> Data Sharing</Text>
            <Text style={styles.paragraph}>We do not sell your personal information.</Text>
            <Text style={styles.paragraph}>We may share information only:</Text>
            <View style={styles.bulletList}>
              {['When required by law', 'With trusted service providers', 'During business transfers or legal compliance'].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>7.</Text> Children's Privacy</Text>
            <Text style={styles.paragraph}>Nursetra is intended for users who are at least 13 years old. We do not knowingly collect personal information from children under 13.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>8.</Text> Your Rights</Text>
            <Text style={styles.paragraph}>You may:</Text>
            <View style={styles.bulletList}>
              {['Access your account information', 'Update your profile', 'Request correction of inaccurate information', 'Request deletion of your account, subject to applicable legal obligations'].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>9.</Text> Changes to This Policy</Text>
            <Text style={styles.paragraph}>We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date.</Text>

            <Text style={styles.sectionTitle}><Text style={styles.sectionNumber}>10.</Text> Contact Us</Text>
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
