import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colorpath, Fonts, theme } from '../../Themes';
import { DASHBOARD_STATS, EXAM_CATEGORIES, MOCK_CHALLENGES, QUICK_ACTIONS } from '../../Constants/dummyData';
import { ROUTES } from '../../Navigation/RouteNames';
import { FloatingMedicalBackground } from '../../Components/FloatingMedicalBackground';

const actionIcons: Record<string, string> = {
  '1': 'flash',
  '2': 'book',
  '3': 'document-text',
  '4': 'calendar',
  '5': 'trophy',
  '6': 'copy',
};

const STAT_STYLES = [
  { color: theme.colors.secondary, label: 'Accuracy' },
  { color: theme.colors.primaryDark, label: 'Rank' },
  { color: theme.colors.warning, label: 'Streak' },
  { color: theme.colors.success, label: 'Tests Done' },
];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedExam, setSelectedExam] = useState(EXAM_CATEGORIES[0]);

  const resolveRoute = (route: string) => {
    if ([ROUTES.HOME, ROUTES.QUESTION_BANK, ROUTES.SUBJECT_TESTS, ROUTES.PYQ, ROUTES.PROFILE].includes(route as never)) {
      return route;
    }
    if (route === ROUTES.MOCK_TESTS || route === ROUTES.RAPID_REVISION) {
      return ROUTES.SUBJECT_TESTS;
    }
    return ROUTES.HOME;
  };

  const filteredMockChallenges = useMemo(
    () => MOCK_CHALLENGES.filter(item => item.exams?.includes(selectedExam)),
    [selectedExam]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={false} />

      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Text style={styles.greeting}>
            Good Morning ☀️ <Text style={styles.userName}>Priya</Text>
          </Text>
          <Text style={styles.subGreeting}>Ready to crack NORCET 2024?</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="notifications" size={22} color={theme.colors.warning} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.challengeCard}
          >
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeTag}>TODAY'S CHALLENGE</Text>
            </View>
            <Text style={styles.challengeTitle}>NORCET 2024 — Mock Test</Text>
            <Text style={styles.challengeSubtitle}>150 Qs • 90 Minutes • Starts in 2h 30m</Text>
            <TouchableOpacity style={styles.joinButton} onPress={() => navigation.navigate(ROUTES.MOCK_TEST_SCREEN)}>
              <Text style={styles.joinButtonText}>Join Now ›</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          {[DASHBOARD_STATS.accuracy, DASHBOARD_STATS.rank, DASHBOARD_STATS.streak, DASHBOARD_STATS.testsDone].map((value, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={[styles.statValue, { color: STAT_STYLES[index].color }]}>{value}</Text>
              <Text style={styles.statLabel}>{STAT_STYLES[index].label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(resolveRoute(action.route))}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconWrap}>
                <Icon name={actionIcons[action.id] || 'apps'} size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Exam Categories</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryWrap}>
          {EXAM_CATEGORIES.map(label => (
            <TouchableOpacity
              key={label}
              style={[styles.categoryChip, selectedExam === label && styles.categoryChipActive]}
              activeOpacity={0.85}
              onPress={() => setSelectedExam(label)}
            >
              <Text style={[styles.categoryText, selectedExam === label && styles.categoryTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Mock Challenge</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SUBJECT_TESTS)}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mockChallengeWrap}>
          {filteredMockChallenges.map(item => (
            <View key={item.id} style={styles.mockChallengeCard}>
              <View style={styles.mockChallengeTop}>
                <Text style={styles.mockType}>{item.type}</Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MOCK_TEST_SCREEN)}>
                  <Text style={styles.viewDetails}>View Details</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.mockStatsRow}>
                <View style={styles.mockStatBox}>
                  <Text style={styles.mockStatLabel}>Result</Text>
                  <Text style={styles.mockStatValue}>{item.result}</Text>
                </View>
                <View style={styles.mockStatDivider} />
                <View style={styles.mockStatBox}>
                  <Text style={styles.mockStatLabel}>Accuracy</Text>
                  <Text style={styles.mockStatValue}>{item.accuracy}</Text>
                </View>
              </View>
            </View>
          ))}
          {filteredMockChallenges.length === 0 ? (
            <View style={styles.emptyMockCard}>
              <Text style={styles.emptyMockTitle}>No mock challenge found</Text>
              <Text style={styles.emptyMockText}>Select another exam category to see available mock challenges.</Text>
            </View>
          ) : null}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    zIndex: 10,
  },
  profileRow: {
    flex: 1,
  },
  greeting: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 22,
    marginBottom: 4,
  },
  userName: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
  },
  subGreeting: {
    color: Colorpath.TextSecondary,
    fontFamily: Fonts.intermedium,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colorpath.Danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  notificationBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontFamily: Fonts.interbold,
  },
  scrollContent: {
    paddingBottom: 40,
    zIndex: 10,
  },
  heroWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  challengeCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  challengeHeader: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  challengeTag: {
    color: theme.colors.white,
    fontFamily: Fonts.interbold,
    fontSize: 12,
    letterSpacing: 1,
  },
  challengeTitle: {
    color: theme.colors.white,
    fontFamily: Fonts.interbold,
    fontSize: 20,
    marginBottom: 6,
  },
  challengeSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Fonts.intermedium,
    fontSize: 13,
    marginBottom: 20,
  },
  joinButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: '23%',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontFamily: Fonts.interbold,
    fontSize: 18,
    marginBottom: 4,
  },
  statLabel: {
    color: Colorpath.TextSecondary,
    fontFamily: Fonts.intermedium,
    fontSize: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 20,
  },
  seeAll: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionCard: {
    width: '31%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 75, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 11,
    textAlign: 'center',
  },
  categoryWrap: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    color: Colorpath.TextSecondary,
    fontFamily: Fonts.interbold,
    fontSize: 14,
  },
  categoryTextActive: {
    color: theme.colors.white,
  },
  mockChallengeWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 12,
  },
  mockChallengeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  mockChallengeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mockType: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 16,
    marginRight: 10,
  },
  viewDetails: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 13,
  },
  mockStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
  },
  mockStatBox: {
    flex: 1,
  },
  mockStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  mockStatLabel: {
    color: Colorpath.TextSecondary,
    fontFamily: Fonts.intermedium,
    fontSize: 12,
    marginBottom: 6,
  },
  mockStatValue: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 18,
  },
  emptyMockCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyMockTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 18,
    marginBottom: 8,
  },
  emptyMockText: {
    color: Colorpath.TextSecondary,
    fontFamily: Fonts.intermedium,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
