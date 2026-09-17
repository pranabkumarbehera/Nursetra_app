import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';
import { quizLeaderboardRequest } from '../../Redux/Reducers/MockTestReducer';
import { Fonts } from '../../Themes';
import Colorpath from '../../Themes/Colorpath';

export const QuizLeaderboardScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { quizId } = route.params || {};

  const { quizLeaderboardData, quizLeaderboardLoading, quizLeaderboardError } = useSelector(
    (state: RootState) => state.MockTestReducer
  );

  useEffect(() => {
    if (quizId) {
      dispatch(quizLeaderboardRequest({ quizId }));
    }
  }, [dispatch, quizId]);

  const handleRetry = () => {
    if (quizId) {
      dispatch(quizLeaderboardRequest({ quizId }));
    }
  };

  const payload = quizLeaderboardData?.data || quizLeaderboardData;
  const leaderboardList = Array.isArray(payload?.rankings)
    ? payload.rankings
    : Array.isArray(payload?.leaderboard)
    ? payload.leaderboard
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
    ? payload
    : [];

  const myRankInfo = payload?.myRank || payload?.userRank || payload?.currentUser || null;
  const quizTitle = payload?.quizTitle || payload?.quiz?.title || payload?.title || 'Quiz Leaderboard';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {quizTitle}
        </Text>
      </View>

      {quizLeaderboardLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colorpath.Primary} />
          <Text style={styles.loadingText}>Loading leaderboard ranks...</Text>
        </View>
      ) : quizLeaderboardError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Unable to load quiz leaderboard.</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Attempt Statistics Summary Card */}
          {myRankInfo && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryHeaderLabel}>1ST ATTEMPT SCORE</Text>
                </View>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryHeaderLabel}>ACCURACY</Text>
                </View>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryHeaderLabel}>CORRECT / WRONG</Text>
                </View>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryHeaderLabel}>TIME SPENT</Text>
                </View>
              </View>

              <View style={styles.summaryValuesRow}>
                <View style={styles.summaryCol}>
                  <Text style={styles.scorePrimaryValue}>
                    {myRankInfo.score ?? myRankInfo.firstAttemptScore ?? 0}
                    <Text style={styles.scoreSubValue}> / {myRankInfo.maxScore ?? 100}</Text>
                  </Text>
                </View>

                <View style={styles.summaryCol}>
                  <Text style={styles.accuracyValue}>{myRankInfo.accuracy ?? 0}%</Text>
                </View>

                <View style={styles.summaryCol}>
                  <Text style={styles.correctValue}>
                    {myRankInfo.correctCount ?? myRankInfo.correct ?? 0}
                    <Text style={styles.slashDivider}> / </Text>
                    <Text style={styles.wrongValue}>{myRankInfo.wrongCount ?? myRankInfo.wrong ?? 0}</Text>
                  </Text>
                </View>

                <View style={styles.summaryCol}>
                  <Text style={styles.timeSpentValue}>
                    {(() => {
                      const sec = Number(myRankInfo.timeTakenSeconds || myRankInfo.timeSpentSeconds || myRankInfo.durationSeconds || 0);
                      if (!sec) return myRankInfo.timeSpent || '0m 0s';
                      const m = Math.floor(sec / 60);
                      const s = sec % 60;
                      return `${m}m ${s}s`;
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Leaderboard Table / List */}
          <View style={styles.listCard}>
            <View style={styles.listCardHeader}>
              <Text style={styles.listCardHeaderTitle}>
                🏆 Leaderboard Standings ({leaderboardList.length})
              </Text>
            </View>

            {leaderboardList.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptySubtitle}>No candidate rankings found for this quiz.</Text>
              </View>
            ) : (
              leaderboardList.map((item: any, index: number) => {
                const rankNum = item.rank ?? index + 1;
                const medalIcon = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : null;
                const name = item.user?.name || item.student?.name || item.name || item.userName || item.studentName || 'Candidate';
                const score = item.score ?? item.marks ?? 0;
                const accuracy = item.accuracy ?? 0;
                const correct = item.correctCount ?? item.correct ?? 0;
                const wrong = item.wrongCount ?? item.wrong ?? 0;

                const timeSpent = (() => {
                  const sec = Number(item.timeTakenSeconds || item.timeSpentSeconds || item.durationSeconds || 0);
                  if (!sec) return item.timeSpent || '';
                  const m = Math.floor(sec / 60);
                  const s = sec % 60;
                  return `${m}m ${s}s`;
                })();

                return (
                  <View key={item.userId || item.id || item._id || index} style={styles.rankItemRow}>
                    <View style={styles.rankNumberCol}>
                      {medalIcon ? (
                        <Text style={{ fontSize: 18 }}>{medalIcon}</Text>
                      ) : (
                        <Text style={styles.rankNumberText}>#{rankNum}</Text>
                      )}
                    </View>

                    <View style={styles.userMetaCol}>
                      <Text style={styles.userNameText} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.userSubText}>
                        Correct/Wrong: <Text style={{ color: '#059669', fontWeight: 'bold' }}>{correct}</Text>/<Text style={{ color: '#EF4444', fontWeight: 'bold' }}>{wrong}</Text> • Accuracy: {accuracy}% {timeSpent ? `• Time: ${timeSpent}` : ''}
                      </Text>
                    </View>

                    <View style={styles.scoreCol}>
                      <Text style={styles.finalScoreText}>{score} pts</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
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
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
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
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  summaryValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCol: {
    flex: 1,
  },
  summaryHeaderLabel: {
    fontSize: 11,
    fontFamily: Fonts.interbold,
    color: '#64748B',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  scorePrimaryValue: {
    fontSize: 16,
    fontFamily: Fonts.interbold,
    color: '#0284C7',
    fontWeight: 'bold',
  },
  scoreSubValue: {
    fontSize: 12,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
    fontWeight: 'normal',
  },
  accuracyValue: {
    fontSize: 16,
    fontFamily: Fonts.interbold,
    color: '#059669',
    fontWeight: 'bold',
  },
  correctValue: {
    fontSize: 16,
    fontFamily: Fonts.interbold,
    color: '#059669',
    fontWeight: 'bold',
  },
  slashDivider: {
    fontSize: 14,
    color: '#94A3B8',
  },
  wrongValue: {
    fontSize: 16,
    fontFamily: Fonts.interbold,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  timeSpentValue: {
    fontSize: 14,
    fontFamily: Fonts.interbold,
    color: '#475569',
    fontWeight: 'bold',
  },
  listCard: {
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
  },
  listCardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  listCardHeaderTitle: {
    fontSize: 15,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  rankItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rankNumberCol: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    fontSize: 13,
    fontFamily: Fonts.interbold,
    color: '#64748B',
    fontWeight: 'bold',
  },
  userMetaCol: {
    flex: 1,
    marginLeft: 10,
  },
  userNameText: {
    fontSize: 14,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userSubText: {
    fontSize: 12,
    fontFamily: Fonts.intermedium,
    color: '#64748B',
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  finalScoreText: {
    fontSize: 13,
    fontFamily: Fonts.interbold,
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
