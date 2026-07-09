import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';

export const AboutUsScreen = () => {
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
            <Text style={styles.headerTitle}>About Us</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroCenter}>
            <View style={styles.heroIconWrap}>
              <Icon name="people-outline" size={28} color="#0B5FA8" />
            </View>
            <Text style={styles.heroTitle}>About Nursetra</Text>
            <Text style={styles.heroSubtitle}>Your trusted companion for nursing exam preparation and career growth.</Text>
          </View>
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.card}>
            <View style={styles.badge}>
              <Icon name="sparkles-outline" size={14} color="#0B5FA8" />
              <Text style={styles.badgeText}>Built for nursing aspirants</Text>
            </View>

            <Text style={styles.intro}>
              Welcome to <Text style={styles.bold}>Nursetra</Text>, your trusted companion for nursing exam preparation.
            </Text>

            <Text style={styles.paragraph}>
              Nursetra is an online learning platform dedicated to helping nursing students and healthcare professionals prepare for competitive examinations through high-quality study materials, mock tests, previous year questions, practice quizzes, and performance analysis.
            </Text>

            <Text style={styles.paragraph}>
              Our mission is to make nursing education accessible, affordable, and effective for every aspirant. We continuously update our content to align with the latest examination patterns and syllabus so that learners stay well-prepared and confident.
            </Text>

            <Text style={styles.sectionTitle}>What We Offer</Text>
            <View style={styles.bulletList}>
              {[
                'Comprehensive Nursing Question Banks',
                'Topic-wise Practice Tests',
                'Full-Length Mock Exams',
                'Previous Year Question Papers',
                'Detailed Answer Explanations',
                'Performance Analytics',
                'Daily Practice Questions',
                'Current Affairs and General Knowledge',
                'Regular Content Updates'
              ].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Icon name="checkmark-circle" size={18} color={theme.colors.primary} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.paragraph}>
              Our platform is designed to support preparation for various nursing examinations conducted by central and state government organizations, hospitals, universities, and healthcare institutions.
            </Text>

            <Text style={styles.sectionTitle}>Our Vision</Text>
            <Text style={styles.paragraph}>
              To become one of India's most trusted digital learning platforms for nursing education by empowering students with quality content and innovative learning experiences.
            </Text>

            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions, suggestions, or feedback, please contact us:
            </Text>
            <Text style={styles.contactInfo}><Text style={styles.bold}>Website:</Text> https://www.nursetra.in</Text>
            <Text style={styles.contactInfo}><Text style={styles.bold}>Email:</Text> support@nursetra.in</Text>

            <Text style={styles.paragraph}>
              We appreciate your trust and remain committed to helping you achieve success in your nursing career.
            </Text>
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
  intro: {
    fontFamily: Fonts.interregular,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
    lineHeight: 24,
  },
  bold: {
    fontFamily: Fonts.interbold,
  },
  paragraph: {
    fontFamily: Fonts.interregular,
    fontSize: 15,
    color: theme.colors.textLight,
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: Fonts.interbold,
    fontSize: 17,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 10,
  },
  bulletText: {
    fontFamily: Fonts.interregular,
    fontSize: 15,
    color: theme.colors.textLight,
    marginLeft: 10,
    lineHeight: 22,
    flex: 1,
  },
  contactInfo: {
    fontFamily: Fonts.interregular,
    fontSize: 15,
    color: theme.colors.textLight,
    marginBottom: 8,
  }
});
