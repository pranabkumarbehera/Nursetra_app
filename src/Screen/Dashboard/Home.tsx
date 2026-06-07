import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../Themes';
import { DASHBOARD_STATS, EXAM_CATEGORIES, MOCK_CHALLENGES, QUICK_ACTIONS } from '../../Constants/dummyData';
import { ROUTES } from '../../Navigation/RouteNames';

const actionEmojis: Record<string, string> = {
  '1': '⚡',
  '2': '📚',
  '3': '📝',
  '4': '📅',
  '5': '🎯',
  '6': '📄',
};

const STAT_STYLES = [
  { color: '#0EA5E9', label: 'Accuracy' },
  { color: '#6366F1', label: 'Rank' },
  { color: '#F59E0B', label: 'Streak' },
  { color: '#10B981', label: 'Tests Done' },
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
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />

      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Text style={styles.greeting}>
            Good Morning ☀️ <Text style={styles.userName}>Priya</Text>
          </Text>
          <Text style={styles.subGreeting}>Ready to crack NORCET 2024?</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="notifications" size={22} color="#EAB308" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search-outline" size={22} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#7A63F2', '#4E8EDF', '#18B5A9']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
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
            >
              <Text style={styles.actionIconText}>{actionEmojis[action.id]}</Text>
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
    backgroundColor: '#F4F7FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  profileRow: {
    flex: 1,
  },
  greeting: {
    color: '#1E293B',
    fontFamily: Fonts.interbold,
    fontSize: 18,
    marginBottom: 4,
    fontWeight: '700',
  },
  userName: {
    color: '#0F172A',
    fontFamily: Fonts.interbold,
    fontSize: 18,
    fontWeight: '700',
  },
  subGreeting: {
    color: '#64748B',
    fontFamily: Fonts.intermedium,
    fontSize: 13,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: Fonts.interbold,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  challengeCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#5E73E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  challengeHeader: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  challengeTag: {
    color: '#FFFFFF',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.interbold,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 8,
  },
  challengeSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontFamily: Fonts.intermedium,
    fontSize: 14,
    marginBottom: 20,
  },
  joinButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  joinButtonText: {
    color: '#0D9488',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  statValue: {
    fontFamily: Fonts.interbold,
    fontSize: 18,
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
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
    color: '#1E293B',
    fontFamily: Fonts.interbold,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: '#6366F1',
    fontFamily: Fonts.intersemibold,
    fontSize: 13,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionText: {
    color: '#0F172A',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    textAlign: 'center',
  },
  categoryWrap: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#1C86F8',
  },
  categoryText: {
    color: '#64748B',
    fontFamily: Fonts.interbold,
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  mockChallengeWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 12,
  },
  mockChallengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  mockChallengeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  mockType: {
    flex: 1,
    color: '#0F172A',
    fontFamily: Fonts.interbold,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 10,
  },
  viewDetails: {
    color: '#6366F1',
    fontFamily: Fonts.intersemibold,
    fontSize: 12,
    fontWeight: '600',
  },
  mockStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockStatBox: {
    flex: 1,
  },
  mockStatDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 14,
  },
  mockStatLabel: {
    color: '#64748B',
    fontFamily: Fonts.intermedium,
    fontSize: 11,
    marginBottom: 4,
  },
  mockStatValue: {
    color: '#0F172A',
    fontFamily: Fonts.interbold,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyMockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  emptyMockTitle: {
    color: '#0F172A',
    fontFamily: Fonts.interbold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyMockText: {
    color: '#64748B',
    fontFamily: Fonts.interregular,
    fontSize: 13,
    textAlign: 'center',
  },
});
