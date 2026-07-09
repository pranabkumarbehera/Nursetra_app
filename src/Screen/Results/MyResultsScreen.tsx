import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';
import { bootstrapHomeRequest } from '../../Redux/Reducers/HomeReducer';
import { getProfileRequest } from '../../Redux/Reducers/ProfileReducer';
import { clearTestResult, getTestResultRequest } from '../../Redux/Reducers/MockTestReducer';
import {
  getProfileName,
  normalizeDashboardStats,
  normalizeRecentItems,
  formatPercent,
  formatScore,
  formatDisplayDate,
} from '../../Utils/Helpers/home';
import { ROUTES } from '../../Navigation/RouteNames';
import { Fonts, theme } from '../../Themes';

const HERO_GRADIENT = ['#04111F', '#0B4F8A', '#15B8A6'];
const HERO_HALO = ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.02)'];
const PANEL_GRADIENT = ['rgba(255,255,255,0.98)', 'rgba(245,250,255,0.94)'];
const BLUE_GLOW = ['rgba(11,79,138,0.16)', 'rgba(21,184,166,0.08)'];
const GOLD_GLOW = ['rgba(245,158,11,0.18)', 'rgba(251,191,36,0.08)'];
const GREEN_GLOW = ['rgba(34,197,94,0.16)', 'rgba(59,130,246,0.08)'];
const localCategoryNames = ['All Subjects', 'NORCET', 'CHO', 'GNM', 'B.Sc Nursing', 'ESIC', 'RRB'];

const isCategoryMatch = (item: any, label: string) => {
  if (label === 'All Subjects') {
    return true;
  }

  if (item.exam && String(item.exam).toLowerCase() === String(label).toLowerCase()) {
    return true;
  }

  const title = String(item.title || '').toUpperCase();
  return title.includes(String(label).toUpperCase());
};

export const MyResultsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const homeState = useSelector((state: RootState) => state.HomeReducer);
  const profileState = useSelector((state: RootState) => state.ProfileReducer);
  const mockTestState = useSelector((state: RootState) => state.MockTestReducer);

  const [selectedCategory, setSelectedCategory] = useState('All Subjects');
  const [pendingItem, setPendingItem] = useState<any>(null);

  const profileName = getProfileName(profileState.profileData || homeState.dashboardData?.user || homeState.dashboardData?.student || {});
  const stats = useMemo(() => normalizeDashboardStats(homeState.dashboardData), [homeState.dashboardData]);
  const recentItems = useMemo(() => normalizeRecentItems(homeState.dashboardData), [homeState.dashboardData]);

  const summaryAccuracy = formatPercent(
    homeState.dashboardData?.avgAccuracy ??
    homeState.dashboardData?.averageAccuracy ??
    homeState.dashboardData?.average_accuracy ??
    homeState.dashboardData?.stats?.avgAccuracy ??
    homeState.dashboardData?.summary?.avgAccuracy ??
    stats.accuracy
  );
  const rank = homeState.dashboardData?.rank ?? homeState.dashboardData?.allIndiaRank ?? homeState.dashboardData?.air ?? homeState.dashboardData?.stats?.rank ?? '-';
  const streak = homeState.dashboardData?.dayStreak ?? homeState.dashboardData?.streak ?? homeState.dashboardData?.stats?.dayStreak ?? homeState.dashboardData?.summary?.dayStreak ?? 0;
  const testsDone = homeState.dashboardData?.testsCompleted ?? homeState.dashboardData?.completedAttempts ?? homeState.dashboardData?.stats?.testsCompleted ?? homeState.dashboardData?.summary?.testsCompleted ?? homeState.dashboardData?.completedTests ?? recentItems.length ?? 0;

  const categories = useMemo(() => {
    const found = new Set<string>();
    found.add('All Subjects');

    recentItems.forEach((item: any) => {
      if (item.exam) {
        found.add(String(item.exam));
      } else {
        const title = String(item.title || '').toUpperCase();
        if (title.includes('NORCET')) found.add('NORCET');
        else if (title.includes('CHO')) found.add('CHO');
        else if (title.includes('GNM')) found.add('GNM');
      }
    });

    if (found.size === 1) {
      localCategoryNames.forEach(name => found.add(name));
    }

    return Array.from(found);
  }, [recentItems]);

  const filteredItems = useMemo(
    () => recentItems.filter((item: any) => isCategoryMatch(item, selectedCategory)),
    [recentItems, selectedCategory]
  );

  useEffect(() => {
    if (!homeState.dashboardData && !homeState.isBootstrapping) {
      dispatch(bootstrapHomeRequest({}));
    }
  }, [dispatch, homeState.dashboardData, homeState.isBootstrapping]);

  useEffect(() => {
    if (!profileState.profileData && !profileState.isLoading) {
      dispatch(getProfileRequest({}));
    }
  }, [dispatch, profileState.profileData, profileState.isLoading]);

  useEffect(() => {
    if (
      pendingItem &&
      mockTestState.testResult &&
      mockTestState.status === 'MockTest/getTestResultSuccess'
    ) {
      navigation.navigate(ROUTES.RESULTS, {
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

  const handleViewDetails = (item: any) => {
    if (!item.attemptId) {
      return;
    }

    setPendingItem(item);
    dispatch(clearTestResult());
    dispatch(getTestResultRequest({ id: item.attemptId }));
  };

  if (homeState.isBootstrapping && !homeState.dashboardData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#04111F" />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#04111F" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.heroTopRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
            <View style={styles.heroTitleWrap}>
              {/* <Text style={styles.heroTitle}>My Results</Text> */}
              <Text style={styles.heroSubtitle}>{profileName}'s Result Dashbaord </Text>
            </View>
            <View style={styles.heroBadge}>
              <Icon name="sparkles" size={14} color="#F59E0B" />
              <Text style={styles.heroBadgeText}>Live</Text>
            </View>
          </View>

          <LinearGradient colors={HERO_HALO} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroPanel}>
            <View style={styles.heroPanelHeader}>
              <Text style={styles.heroPanelLabel}>Overall accuracy</Text>
              <Text style={styles.heroPanelValue}>{summaryAccuracy}</Text>
            </View>

            <View style={styles.heroStatsRow}>
              <LinearGradient colors={BLUE_GLOW} style={styles.heroMiniCard}>
                <Icon name="trophy-outline" size={18} color="#0B5FA8" />
                <Text style={styles.heroMiniValue}>{rank}</Text>
                <Text style={styles.heroMiniLabel}>Rank</Text>
              </LinearGradient>
              <LinearGradient colors={GOLD_GLOW} style={styles.heroMiniCard}>
                <Icon name="flame-outline" size={18} color="#D97706" />
                <Text style={styles.heroMiniValue}>{streak}</Text>
                <Text style={styles.heroMiniLabel}>Streak</Text>
              </LinearGradient>
              <LinearGradient colors={GREEN_GLOW} style={styles.heroMiniCard}>
                <Icon name="documents-outline" size={18} color="#047857" />
                <Text style={styles.heroMiniValue}>{testsDone}</Text>
                <Text style={styles.heroMiniLabel}>Tests</Text>
              </LinearGradient>
            </View>
          </LinearGradient>
        </LinearGradient>

        <View style={styles.content}>
          <LinearGradient colors={PANEL_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.summaryCard}>
            <Text style={styles.sectionKicker}>Quick insight</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>{summaryAccuracy}</Text>
                <Text style={styles.summaryItemLabel}>Average Accuracy</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>{formatScore(homeState.dashboardData?.score ?? stats.score ?? 0)}</Text>
                <Text style={styles.summaryItemLabel}>Score</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>{recentItems.length}</Text>
                <Text style={styles.summaryItemLabel}>Recent Attempts</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Filter by exam</Text>
            <Text style={styles.sectionMeta}>{filteredItems.length} results</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryWrap}>
            {categories.map(label => {
              const active = selectedCategory === label;
              return (
                <Pressable
                  key={label}
                  onPress={() => setSelectedCategory(label)}
                  style={({ pressed }) => [
                    styles.categoryPill,
                    active && styles.categoryPillActive,
                    pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                  ]}>
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.cardList}>
            {filteredItems.map((item: any, index: number) => {
              const isLoading = mockTestState.isLoading && !!pendingItem && String(pendingItem.attemptId) === String(item.attemptId);
              return (
                <Pressable
                  key={item.id || index}
                  onPress={() => handleViewDetails(item)}
                  disabled={isLoading || !item.attemptId}
                  style={({ pressed }) => [
                    styles.resultCard,
                    pressed && !isLoading ? styles.resultCardPressed : null,
                  ]}>
                  <LinearGradient colors={PANEL_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.resultCardInner}>
                    <LinearGradient colors={BLUE_GLOW} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardAccent} />

                    <View style={styles.resultTopRow}>
                      <View style={styles.resultIconWrap}>
                        <Icon name="analytics-outline" size={18} color="#0B5FA8" />
                      </View>
                      <View style={styles.resultTitleArea}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {item.title || item.type || 'Mock Test'}
                        </Text>
                        <Text style={styles.resultDate}>
                          {item.date ? formatDisplayDate(item.date) : 'Recently attempted'}
                        </Text>
                      </View>
                      <View style={styles.resultActionWrap}>
                        {isLoading ? (
                          <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                          <Icon name="chevron-forward" size={18} color={theme.colors.primary} />
                        )}
                      </View>
                    </View>

                    <View style={styles.metricRow}>
                      <View style={styles.metricBlock}>
                        <Text style={styles.metricLabel}>Score</Text>
                        <Text style={styles.metricValue}>{item.score !== undefined ? formatScore(item.score) : '-'}</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricBlock}>
                        <Text style={styles.metricLabel}>Accuracy</Text>
                        <Text style={styles.metricValue}>{item.accuracy !== undefined ? formatPercent(item.accuracy) : '-'}</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricBlock}>
                        <Text style={styles.metricLabel}>Percentile</Text>
                        <Text style={styles.metricValue}>
                          {item.percentile !== undefined && item.percentile !== null ? `${Number(item.percentile).toFixed(1)}%` : '-'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.footerChip}>
                        <Icon name="calendar-outline" size={12} color="#0B5FA8" />
                        <Text style={styles.footerChipText}>{item.date ? formatDisplayDate(item.date) : 'No date'}</Text>
                      </View>
                      <View style={styles.footerChip}>
                        <Icon name="ribbon-outline" size={12} color="#D97706" />
                        <Text style={styles.footerChipText}>{item.exam || item.type || 'Mock Test'}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}

            {filteredItems.length === 0 ? (
              <LinearGradient colors={PANEL_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Icon name="search-outline" size={26} color="#0B5FA8" />
                </View>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyText}>Try a different exam filter or attempt a test to see it here.</Text>
              </LinearGradient>
            ) : null}
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
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -40,
    right: -35,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
    left: -30,
    bottom: -20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroTitleWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Fonts.interbold,
  },
  heroSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    fontWeight: "bold"
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.intersemibold,
  },
  heroPanel: {
    marginTop: 18,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  heroPanelLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: "bold"
  },
  heroPanelValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: Fonts.interbold,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroMiniCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  heroMiniValue: {
    marginTop: 8,
    color: '#0F172A',
    fontSize: 18,
    fontFamily: Fonts.interbold,
  },
  heroMiniLabel: {
    marginTop: 2,
    color: '#475569',
    fontSize: 12,
    fontFamily: Fonts.intermedium,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 16,
    shadowColor: '#0B5FA8',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  sectionKicker: {
    color: '#0B5FA8',
    fontSize: 12,
    fontFamily: Fonts.intersemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontWeight: "bold"
  },
  summaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryItemValue: {
    color: '#06172C',
    fontSize: 20,
    fontFamily: Fonts.interbold,
  },
  summaryItemLabel: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
    fontFamily: Fonts.intermedium,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(148,163,184,0.3)',
  },
  sectionHeaderRow: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontFamily: Fonts.interbold,
    fontWeight: "bold"
  },
  sectionMeta: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: Fonts.intermedium,
  },
  categoryWrap: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  categoryPill: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(11,95,168,0.12)',
  },
  categoryPillActive: {
    backgroundColor: '#0B5FA8',
    borderColor: '#0B5FA8',
  },
  categoryText: {
    color: '#475569',
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    fontWeight: "bold"
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.intersemibold,
  },
  cardList: {
    marginTop: 10,
    gap: 14,
    paddingBottom: 24,
  },
  resultCard: {
    borderRadius: 24,
  },
  resultCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },
  resultCardInner: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(11,95,168,0.10)',
  },
  cardAccent: {
    position: 'absolute',
    right: -20,
    top: -24,
    width: 120,
    height: 120,
    borderRadius: 120,
    opacity: 0.65,
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  resultIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,95,168,0.10)',
  },
  resultTitleArea: {
    flex: 1,
    paddingTop: 2,
  },
  resultTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: Fonts.interbold,
    fontWeight: "bold"
  },
  resultDate: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
    fontFamily: Fonts.intermedium,
  },
  resultActionWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,95,168,0.08)',
  },
  metricRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,252,0.92)',
    borderRadius: 18,
    paddingVertical: 14,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(148,163,184,0.28)',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: Fonts.intermedium,
  },
  metricValue: {
    marginTop: 5,
    color: '#06172C',
    fontSize: 16,
    fontFamily: Fonts.interbold,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  footerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  footerChipText: {
    color: '#475569',
    fontSize: 11,
    fontFamily: Fonts.intermedium,
  },
  emptyCard: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(11,95,168,0.10)',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,95,168,0.08)',
  },
  emptyTitle: {
    marginTop: 14,
    color: '#0F172A',
    fontSize: 16,
    fontFamily: Fonts.intersemibold,
  },
  emptyText: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    textAlign: 'center',
    lineHeight: 20,
  },
  redText: {
    color: '#EF4444',
  },
  greenText: {
    color: '#047857',
  },
});
