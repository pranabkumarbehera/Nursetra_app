import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';
import { bootstrapHomeRequest } from '../../Redux/Reducers/HomeReducer';
import { getProfileRequest } from '../../Redux/Reducers/ProfileReducer';
import { clearTestResult, getTestResultRequest } from '../../Redux/Reducers/MockTestReducer';
import { logoutRequest } from '../../Redux/Reducers/AuthReducer';
import { getProfileName, normalizeDashboardStats, normalizeRecentItems, formatPercent, formatScore, formatDisplayDate } from '../../Utils/Helpers/home';
import { Colorpath, Fonts, theme } from '../../Themes';
import { QUICK_ACTIONS } from '../../Constants/dummyData';
import { ROUTES } from '../../Navigation/RouteNames';
import { CategoriesFAB } from '../../Components/CategoriesFAB';
import { HomeSkeleton } from '../../Components/LoadingSkeletons';

const { width } = Dimensions.get('window');

const actionIcons: Record<string, string> = {
  '7': 'layers',
  '1': 'flash',
  '2': 'book',
  '3': 'document-text',
  '4': 'calendar',
  '5': 'trophy',
  '6': 'copy',
};

const LOCAL_EXAM_CATEGORIES = ['All Subjects', 'Elite Mock', 'NORCET', 'CHO', 'GNM', 'B.Sc Nursing', 'ESIC', 'RRB'];

const isEliteMockItem = (item: any) => {
  const title = String(item?.title || item?.type || '').toLowerCase();
  const exam = String(item?.exam || '').toLowerCase();

  return (
    title.includes('elite mock') ||
    title.includes('mock bundle') ||
    exam.includes('elite mock') ||
    exam.includes('mock bundle')
  );
};

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const homeState = useSelector((state: RootState) => state.HomeReducer);
  const profileState = useSelector((state: RootState) => state.ProfileReducer);
  const mockTestState = useSelector((state: RootState) => state.MockTestReducer);
  const authToken = useSelector((state: RootState) => state.AuthReducer.token);

  const [selectedExam, setSelectedExam] = useState('All Subjects');
  const [pendingItem, setPendingItem] = useState<any>(null);

  const profileName = getProfileName(profileState.profileData || homeState.dashboardData?.user || homeState.dashboardData?.student || {});

  const stats = useMemo(() => normalizeDashboardStats(homeState.dashboardData), [homeState.dashboardData]);
  const avgAccuracy = formatPercent(
    homeState.dashboardData?.avgAccuracy ?? homeState.dashboardData?.averageAccuracy ?? homeState.dashboardData?.average_accuracy ?? homeState.dashboardData?.stats?.avgAccuracy ?? homeState.dashboardData?.summary?.avgAccuracy ?? stats.accuracy
  );
  const rank = stats.rank || homeState.dashboardData?.rank || homeState.dashboardData?.allIndiaRank || homeState.dashboardData?.air || homeState.dashboardData?.stats?.rank || '-';
  const streak = homeState.dashboardData?.dayStreak ?? homeState.dashboardData?.streak ?? homeState.dashboardData?.stats?.dayStreak ?? homeState.dashboardData?.summary?.dayStreak ?? 0;
  const testsDone = homeState.dashboardData?.testsCompleted ?? homeState.dashboardData?.completedAttempts ?? homeState.dashboardData?.stats?.testsCompleted ?? homeState.dashboardData?.summary?.testsCompleted ?? homeState.dashboardData?.completedTests ?? 0;

  const recentItems = useMemo(() => normalizeRecentItems(homeState.dashboardData), [homeState.dashboardData]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All Subjects');
    recentItems.forEach((item: any) => {
      if (isEliteMockItem(item)) {
        cats.add('Elite Mock');
        return;
      }

      if (item.exam) {
        cats.add(item.exam);
      } else {
        const titleUpper = (item.title || '').toUpperCase();
        if (titleUpper.includes('NORCET')) cats.add('NORCET');
        else if (titleUpper.includes('CHO')) cats.add('CHO');
        else if (titleUpper.includes('GNM')) cats.add('GNM');
      }
    });
    if (cats.size === 1) {
      LOCAL_EXAM_CATEGORIES.forEach(c => cats.add(c));
    }
    return Array.from(cats);
  }, [recentItems]);

  const filteredMockChallenges = useMemo(() => {
    if (selectedExam === 'All Subjects') {
      return recentItems;
    }
    return recentItems.filter((item: any) => {
      if (selectedExam === 'Elite Mock') {
        return isEliteMockItem(item);
      }
      if (item.exam && item.exam === selectedExam) return true;
      const titleUpper = (item.title || '').toUpperCase();
      return titleUpper.includes(selectedExam.toUpperCase());
    });
  }, [recentItems, selectedExam]);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    const isAuthError = homeState.error && (
      String(homeState.error?.message).toLowerCase().includes('unauthorized') ||
      String(homeState.error?.message).toLowerCase().includes('token') ||
      homeState.error?.status === 401 ||
      homeState.error?.status === 403
    );

    if (isAuthError) {
      dispatch(logoutRequest({}));
      return;
    }

    if (!homeState.dashboardData && !homeState.isBootstrapping && !homeState.error) {
      dispatch(bootstrapHomeRequest({}));
    }
  }, [authToken, dispatch, homeState.dashboardData, homeState.isBootstrapping, homeState.error]);

  useEffect(() => {
    if (!authToken) return;

    const isAuthError = profileState.error && (
      String(profileState.error?.message).toLowerCase().includes('unauthorized') ||
      String(profileState.error?.message).toLowerCase().includes('token') ||
      profileState.error?.status === 401 ||
      profileState.error?.status === 403
    );

    if (isAuthError) {
      dispatch(logoutRequest({}));
      return;
    }

    if (!profileState.profileData && !profileState.isLoading && !profileState.error) {
      dispatch(getProfileRequest({}));
    }
  }, [authToken, dispatch, profileState.profileData, profileState.isLoading, profileState.error]);

  useEffect(() => {
    if (
      pendingItem &&
      mockTestState.testResult &&
      mockTestState.status === 'MockTest/getTestResultSuccess'
    ) {
      navigation.navigate('ResultsScreen', {
        attemptId: pendingItem.attemptId,
        title: pendingItem.title,
        score: pendingItem.score,
        accuracy: pendingItem.accuracy,
        resultData: mockTestState.testResult,
      });
      setPendingItem(null);
      dispatch(clearTestResult());
    }
  }, [dispatch, mockTestState.status, mockTestState.testResult, navigation, pendingItem]);

  useEffect(() => {
    if (pendingItem && mockTestState.status === 'MockTest/getTestResultFailure') {
      setPendingItem(null);
    }
  }, [mockTestState.status, pendingItem]);

  const resolveRoute = (route: string) => {
    if ([ROUTES.HOME, ROUTES.SUBJECT_TESTS, ROUTES.COURSE_SCREEN, ROUTES.SUBJECT_TESTS, ROUTES.PROFILE].includes(route as never)) {
      return route;
    }
    if (route === ROUTES.MOCK_TESTS || route === ROUTES.RAPID_REVISION) {
      return ROUTES.SUBJECT_TESTS;
    }
    return ROUTES.HOME;
  };

  const handleViewDetails = (item: any) => {
    if (!item.attemptId) return;
    setPendingItem(item);
    dispatch(clearTestResult());
    dispatch(getTestResultRequest({ id: item.attemptId }));
  };

  if (homeState.isBootstrapping && !homeState.dashboardData) {
    return (
      <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <HomeSkeleton />
        </ScrollView>
        <CategoriesFAB />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Text style={styles.greeting}>
            <Text style={styles.userName}>{profileName}</Text> 👋
          </Text>
          <Text style={styles.subGreeting}>Your nursing journey starts here</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {[
            { value: avgAccuracy, label: 'Accuracy', color: '#059669', bg: '#D1FAE5', icon: 'checkmark-circle' },
            { value: rank, label: 'Rank', color: '#4F46E5', bg: '#E0E7FF', icon: 'trophy' },
            { value: streak, label: 'Streak', color: '#D97706', bg: '#FEF3C7', icon: 'flame' },
            { value: testsDone, label: 'Tests', color: '#2563EB', bg: '#DBEAFE', icon: 'document-text' },
          ].map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: stat.bg }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FFFFFF' }]}>
                <Icon name={stat.icon} size={18} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: stat.color }]}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Explore</Text>
        </View>

        <View style={styles.actionGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionItem}
              onPress={() => navigation.navigate(resolveRoute(action.route))}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Icon name={actionIcons[action.id] || 'apps'} size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Performance & Activity</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryWrap}>
          {categories.map(label => (
            <TouchableOpacity
              key={label}
              style={[styles.pillBtn, selectedExam === label && styles.pillBtnActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedExam(label)}
            >
              <Text style={[styles.pillText, selectedExam === label && styles.pillTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.mockChallengeWrap}>
          {filteredMockChallenges.map((item: any, index: number) => {
            const isLoading = mockTestState.isLoading && !!pendingItem && String(pendingItem.attemptId) === String(item.attemptId);
            return (
              <View key={item.id || index} style={styles.mockCard}>
                <View style={styles.mockCardTop}>
                  <View style={styles.mockCardIcon}>
                    <Icon name="document-text" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.mockCardTitleArea}>
                    <Text style={styles.mockCardTitle} numberOfLines={1}>{item.title || item.type || 'Mock Test'}</Text>
                    {item.date && <Text style={styles.mockCardDate}>{formatDisplayDate(item.date)}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.mockCardArrow}
                    onPress={() => handleViewDetails(item)}
                    disabled={isLoading || !item.attemptId}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.mockCardStats}>
                  <View style={styles.mockCardStat}>
                    <Text style={styles.mockCardStatLabel}>Score</Text>
                    <Text style={styles.mockCardStatValue}>{item.score !== undefined ? formatScore(item.score) : '-'}</Text>
                  </View>
                  <View style={styles.mockCardDivider} />
                  <View style={styles.mockCardStat}>
                    <Text style={styles.mockCardStatLabel}>Accuracy</Text>
                    <Text style={styles.mockCardStatValue}>{item.accuracy !== undefined ? formatPercent(item.accuracy) : '-'}</Text>
                  </View>
                  <View style={styles.mockCardDivider} />
                  <View style={styles.mockCardStat}>
                    <Text style={styles.mockCardStatLabel}>Percentile</Text>
                    <Text style={styles.mockCardStatValue}>{item.percentile !== undefined && item.percentile !== null ? `${Number(item.percentile).toFixed(1)}%` : '-'}</Text>
                  </View>
                </View>
              </View>
            );
          })}
          {filteredMockChallenges.length === 0 ? (
            <View style={styles.emptyMockCard}>
              <View style={styles.emptyMockIcon}>
                <Icon name="search-outline" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyMockTitle}>No recent activity</Text>
              <Text style={styles.emptyMockText}>Tests you attempt for this category will appear here.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <CategoriesFAB />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  profileRow: { flex: 1 },
  greeting: { color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 24, marginBottom: 4 },
  userName: { color: theme.colors.primary, fontFamily: Fonts.interbold, fontSize: 18, fontWeight: "bold" },
  subGreeting: { color: Colorpath.TextSecondary, fontFamily: Fonts.intermedium, fontSize: 14 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  notificationBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: Colorpath.Danger },
  scrollContent: { paddingBottom: 60 },
  heroWrapper: { paddingHorizontal: 20, marginBottom: 24 },
  heroCard: { backgroundColor: theme.colors.primary, borderRadius: 24, overflow: 'hidden', padding: 24, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  heroBgCircle1: { position: 'absolute', top: -50, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroBgCircle2: { position: 'absolute', bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' },
  heroContent: { position: 'relative', zIndex: 2 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  liveBadge: { backgroundColor: Colorpath.Danger, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveBadgeText: { color: '#FFF', fontFamily: Fonts.interbold, fontSize: 10 },
  challengeTag: { color: 'rgba(255,255,255,0.9)', fontFamily: Fonts.intermedium, fontSize: 12, letterSpacing: 1 },
  challengeTitle: { color: '#FFF', fontFamily: Fonts.interbold, fontSize: 26, marginBottom: 6 },
  challengeSubtitle: { color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.intermedium, fontSize: 14, marginBottom: 24 },
  joinButton: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  joinButtonText: { color: theme.colors.primary, fontFamily: Fonts.interbold, fontSize: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 28, gap: 12 },
  statCard: {borderWidth:0.7, borderColor: theme.colors.textLight, width: (width - 52) / 2, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  statIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statInfo: { flex: 1 },
  statValue: { fontFamily: Fonts.interbold, fontSize: 20, marginBottom: 2 },
  statLabel: { fontFamily: Fonts.intermedium, fontSize: 12, opacity: 0.8 },
  sectionHeaderRow: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 18, fontWeight: "bold" },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginBottom: 16, justifyContent: 'space-between' },
  actionItem: { width: '31%', alignItems: 'center', marginBottom: 20 },
  actionIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 10 },
  actionText: { color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 12, textAlign: 'center' },
  categoryWrap: { paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  pillBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 99, borderWidth: 1, borderColor: theme.colors.border },
  pillBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  pillText: { color: Colorpath.TextSecondary, fontFamily: Fonts.interbold, fontSize: 14, fontWeight: 'bold' },
  pillTextActive: { color: '#FFFFFF' },
  mockChallengeWrap: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  mockCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 3 },
  mockCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  mockCardIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(10, 75, 143, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  mockCardTitleArea: { flex: 1 },
  mockCardTitle: {fontWeight: 'bold', color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 16, marginBottom: 4 },
  mockCardDate: { color: Colorpath.TextSecondary, fontFamily: Fonts.intermedium, fontSize: 12 },
  mockCardArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  mockCardStats: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16 },
  mockCardStat: { flex: 1, alignItems: 'center' },
  mockCardDivider: { width: 1, height: 32, backgroundColor: theme.colors.border, marginHorizontal: 12 },
  mockCardStatLabel: { color: Colorpath.TextSecondary, fontFamily: Fonts.intermedium, fontSize: 12, marginBottom: 4 },
  mockCardStatValue: { color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 16 },
  emptyMockCard: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  emptyMockIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(10, 75, 143, 0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyMockTitle: { color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 18, marginBottom: 8 },
  emptyMockText: { color: Colorpath.TextSecondary, fontFamily: Fonts.intermedium, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
