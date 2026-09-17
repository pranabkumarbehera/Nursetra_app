import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';
import { leaderboardRequest } from '../../Redux/Reducers/MockTestReducer';
import { ROUTES } from '../../Navigation/RouteNames';
import { theme, Fonts } from '../../Themes';
import Colorpath from '../../Themes/Colorpath';
import { normalize } from '../../Utils/Helpers/normalize';

export const LeaderboardScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  const { leaderboardData, leaderboardLoading, leaderboardError } = useSelector(
    (state: RootState) => state.MockTestReducer
  );

  useEffect(() => {
    dispatch(leaderboardRequest({}));
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(leaderboardRequest({}));
  };

  const handleViewLeaderboard = (quizId: string) => {
    if (!quizId) return;
    navigation.navigate(ROUTES.QUIZ_LEADERBOARD, { quizId });
  };

  const isDesktop = width >= 768;
  const quizzes = Array.isArray(leaderboardData) ? leaderboardData : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View style={styles.heroBanner}>
          <View style={styles.trophyIconWrap}>
            <Text style={{ fontSize: 26 }}>🏆</Text>
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>My Attended Quizzes Leaderboard & Ranks</Text>
            <Text style={styles.heroSubtitle}>
              View all your attended exam rankings, scores, and candidate positions.
            </Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>
              🏆 Quizzes You Have Attended ({quizzes.length})
            </Text>
          </View>

          {/* Loading Skeleton / State */}
          {leaderboardLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colorpath.Primary} />
              <Text style={styles.loadingText}>Loading your rankings...</Text>
            </View>
          ) : leaderboardError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Unable to load leaderboard.</Text>
              <Pressable style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : quizzes.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🏆</Text>
              <Text style={styles.emptyTitle}>No attended quizzes found</Text>
              <Text style={styles.emptySubtitle}>
                Attend a quiz to see your rank and leaderboard here.
              </Text>
            </View>
          ) : isDesktop ? (
            /* Desktop / Tablet Table View */
            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { flex: 2 }]}>QUIZ TITLE</Text>
                <Text style={[styles.thCell, { flex: 1 }]}>YOUR RANK</Text>
                <Text style={[styles.thCell, { flex: 1.2 }]}>SCORE</Text>
                <Text style={[styles.thCell, { flex: 1 }]}>ACCURACY</Text>
                <Text style={[styles.thCell, { flex: 1.2 }]}>TOTAL PARTICIPANTS</Text>
                <Text style={[styles.thCell, { flex: 1.2, textAlign: 'right' }]}>ACTION</Text>
              </View>

              {quizzes.map((item: any, index: number) => {
                const quizId = item.quizId || item._id || item.id;
                return (
                  <View key={quizId || index} style={styles.tableBodyRow}>
                    <Text style={[styles.tdTitle, { flex: 2 }]} numberOfLines={2}>
                      {item.quizTitle || 'Untitled Quiz'}
                    </Text>

                    <View style={[{ flex: 1 }, styles.cellCenter]}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankBadgeText}>Rank #{item.rank ?? '-'}</Text>
                      </View>
                    </View>

                    <Text style={[styles.tdScore, { flex: 1.2 }]}>
                      {item.score ?? 0} / {item.maxScore ?? 0} Marks
                    </Text>

                    <Text style={[styles.tdAccuracy, { flex: 1 }]}>
                      {item.accuracy ?? 0}%
                    </Text>

                    <Text style={[styles.tdParticipants, { flex: 1.2 }]}>
                      {item.totalParticipants ?? 0} Candidates
                    </Text>

                    <View style={[{ flex: 1.2, alignItems: 'flex-end' }]}>
                      <Pressable
                        style={styles.viewBtn}
                        onPress={() => handleViewLeaderboard(quizId)}
                      >
                        <Text style={{ fontSize: 13, marginRight: 4 }}>🏆</Text>
                        <Text style={styles.viewBtnText}>View Leaderboard</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            /* Mobile Card View */
            <View style={styles.mobileListContainer}>
              {quizzes.map((item: any, index: number) => {
                const quizId = item.quizId || item._id || item.id;
                return (
                  <View key={quizId || index} style={styles.quizCard}>
                    <View style={styles.quizCardTop}>
                      <Text style={styles.quizCardTitle} numberOfLines={2}>
                        {item.quizTitle || 'Untitled Quiz'}
                      </Text>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankBadgeText}>Rank #{item.rank ?? '-'}</Text>
                      </View>
                    </View>

                    <View style={styles.quizCardGrid}>
                      <View style={styles.quizMetaBox}>
                        <Text style={styles.metaLabel}>Score</Text>
                        <Text style={styles.scoreText}>
                          {item.score ?? 0} / {item.maxScore ?? 0} Marks
                        </Text>
                      </View>

                      <View style={styles.quizMetaBox}>
                        <Text style={styles.metaLabel}>Accuracy</Text>
                        <Text style={styles.accuracyText}>{item.accuracy ?? 0}%</Text>
                      </View>

                      <View style={styles.quizMetaBox}>
                        <Text style={styles.metaLabel}>Participants</Text>
                        <Text style={styles.participantsText}>
                          {item.totalParticipants ?? 0} Candidates
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={styles.mobileViewBtn}
                      onPress={() => handleViewLeaderboard(quizId)}
                    >
                      <Text style={{ fontSize: 14, marginRight: 6 }}>🏆</Text>
                      <Text style={styles.viewBtnText}>View Leaderboard</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  trophyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
    lineHeight: 18,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    fontFamily: Fonts.intermedium,
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colorpath.Primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: Fonts.interbold,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
    textAlign: 'center',
  },
  /* Desktop table styles */
  tableContainer: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  thCell: {
    fontSize: 11,
    fontFamily: Fonts.interbold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableBodyRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  cellCenter: {
    justifyContent: 'center',
  },
  tdTitle: {
    fontSize: 14,
    fontFamily: Fonts.intermedium,
    color: '#0F172A',
  },
  rankBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rankBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.interbold,
    color: '#D97706',
    fontWeight: 'bold',
  },
  tdScore: {
    fontSize: 13,
    fontFamily: Fonts.interbold,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  tdAccuracy: {
    fontSize: 13,
    fontFamily: Fonts.interbold,
    color: '#059669',
    fontWeight: 'bold',
  },
  tdParticipants: {
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewBtnText: {
    fontSize: 12,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  /* Mobile list styles */
  mobileListContainer: {
    padding: 12,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quizCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizCardTitle: {
    fontSize: 14,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
    fontWeight: 'bold',
  },
  quizCardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  quizMetaBox: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  scoreText: {
    fontSize: 12,
    fontFamily: Fonts.interbold,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  accuracyText: {
    fontSize: 12,
    fontFamily: Fonts.interbold,
    color: '#059669',
    fontWeight: 'bold',
  },
  participantsText: {
    fontSize: 12,
    fontFamily: Fonts.intermedium,
    color: '#475569',
  },
  mobileViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
  },
});
