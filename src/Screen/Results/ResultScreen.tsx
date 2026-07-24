import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Fonts, theme } from '../../Themes';
import { SecurityNotice } from '../../Components/security/SecurityNotice';
import { getTestResultRequest } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { ROUTES } from '../../Navigation/RouteNames';
import { bootstrapHomeRequest } from '../../Redux/Reducers/HomeReducer';

const HERO_GRADIENT = ['#247ce7', '#0B5FA8', '#14B8A6'];
const SCORE_GRADIENT = ['#FFFFFF', '#F8FAFC', '#EEF2F7'];
const SUMMARY_GRADIENT = ['rgba(255,255,255,0.98)', 'rgba(244,249,255,0.98)'];
const CARD_BLUE_GRADIENT = ['rgba(11,95,168,0.12)', 'rgba(20,184,166,0.07)'];
const CARD_GOLD_GRADIENT = ['rgba(245,158,11,0.14)', 'rgba(251,191,36,0.08)'];
const CARD_RED_GRADIENT = ['rgba(254,226,226,0.95)', 'rgba(255,237,213,0.85)'];
const CARD_GREEN_GRADIENT = ['rgba(220,252,231,0.95)', 'rgba(191,219,254,0.55)'];
const REVIEW_BORDER = 'rgba(11, 95, 168, 0.12)';

const getAttemptId = (data: any) =>
    data?.data?._id || data?.data?.attemptId || data?.attemptId || data?.attempt?.id || data?.attempt?._id || data?.id || data?._id || null;

const normalizeOption = (option: any, index: number) => {
    if (typeof option === 'string') return { key: `${index}-${option}`, text: option, value: option };
    return {
        key: option?._id || option?.id || option?.value || option?.text || `${index}`,
        text: option?.text || option?.value || option?.label || `Option ${index + 1}`,
        value: option?.value || option?.text || option?._id || option?.id || '',
        isCorrect: option?.isCorrect,
    };
};

const isOptionMatch = (option: any, target: any) => {
    if (target === undefined || target === null || target === '') return false;
    return [option?.key, option?.value, option?.text, option?.id, option?._id].some(value => value !== undefined && value !== null && String(value) === String(target));
};

const hasUserAnswered = (item: any) => {
    const rawAnswer = item?.userAnswer ?? item?.selectedAnswer?.value ?? item?.selectedAnswer?.text ?? item?.selectedAnswer ?? item?.studentAnswer ?? item?.answer;
    if (Array.isArray(rawAnswer)) return rawAnswer.length > 0;
    if (typeof rawAnswer === 'string') return rawAnswer.trim() !== '';
    return rawAnswer !== undefined && rawAnswer !== null && rawAnswer !== '';
};

const getReviewItems = (resultData: any) => {
    const rawItems = resultData?.results || resultData?.review || resultData?.questions || resultData?.attempt?.questions || resultData?.answers || resultData?.result || [];
    if (!Array.isArray(rawItems)) return [];

    return rawItems.map((item: any, index: number) => {
        const question = item?.question || item?.questionId || item;
        const rawOptions = question?.options || question?.choices || item?.options || [];
        const options = Array.isArray(rawOptions) ? rawOptions.map((opt: any, idx: number) => normalizeOption(opt, idx)) : [];
        const explanation =
            item?.explanation ||
            item?.answerExplanation ||
            item?.answer_explanation ||
            item?.solutionExplanation ||
            item?.solution ||
            question?.explanation ||
            question?.answerExplanation ||
            question?.answer_explanation ||
            question?.solutionExplanation ||
            question?.solution ||
            resultData?.explanation ||
            resultData?.answerExplanation ||
            resultData?.answer_explanation ||
            '';

        const selectedRaw = item?.selectedAnswer?.value ?? item?.selectedAnswer?.text ?? item?.selectedAnswer ?? item?.userAnswer ?? item?.studentAnswer ?? item?.answer ?? null;
        const selectedIndex = item?.selectedAnswer?.index ?? item?.selectedIndex ?? item?.userAnswerIndex ?? null;
        const correctRaw = item?.correctAnswer?.value ?? item?.correctAnswer?.text ?? item?.correctAnswer ?? question?.correctAnswer?.value ?? question?.correctAnswer?.text ?? question?.correctAnswer ?? null;

        const safeSelectedLabel = typeof selectedRaw === 'object' && selectedRaw !== null ? selectedRaw.value || selectedRaw.text || selectedRaw.label || JSON.stringify(selectedRaw) : selectedRaw;
        const safeCorrectLabel = typeof correctRaw === 'object' && correctRaw !== null ? correctRaw.value || correctRaw.text || correctRaw.label || JSON.stringify(correctRaw) : correctRaw;

        const resolvedCorrectIndex = options.findIndex(option => option?.isCorrect === true || isOptionMatch(option, correctRaw));
        const resolvedSelectedIndex = selectedIndex !== null && selectedIndex !== undefined ? Number(selectedIndex) : options.findIndex(option => isOptionMatch(option, selectedRaw));

        const isAnswered = hasUserAnswered(item);
        let status = 'skipped';
        if (isAnswered) {
            status = (item?.isCorrect === true || (resolvedCorrectIndex >= 0 && resolvedSelectedIndex === resolvedCorrectIndex)) ? 'correct' : 'incorrect';
        }

        return {
            id: item?._id || question?._id || question?.id || `${index}`,
            questionNumber: index + 1,
            questionText: question?.text || question?.question || question?.questionText || item?.questionText || 'Question',
            options,
            marksAwarded: item?.marksAwarded ?? 0,
            questionMarks: question?.marks ?? 0,
            correctAnswerLabel: safeCorrectLabel,
            userAnswerLabel: safeSelectedLabel,
            selectedIndex: resolvedSelectedIndex >= 0 ? resolvedSelectedIndex : null,
            correctIndex: resolvedCorrectIndex >= 0 ? resolvedCorrectIndex : null,
            status,
            explanation,
        };
    });
};

const getRawResultItems = (resultData: any) => {
    const rawItems = resultData?.results || resultData?.review || resultData?.questions || resultData?.attempt?.questions || resultData?.answers || resultData?.result || [];
    return Array.isArray(rawItems) ? rawItems : [];
};

export const ResultScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch();
    const { testResult, isLoading, submitTestResponse, startTestResponse } = useSelector((state: RootState) => state.MockTestReducer);

    const attemptId = route.params?.attemptId || getAttemptId(submitTestResponse) || getAttemptId(startTestResponse);
    const routeResultData = route.params?.resultData;
    const resultData = useMemo(() => routeResultData || testResult?.data || testResult || {}, [routeResultData, testResult]);
    const resultWhole = resultData;

    useEffect(() => {
        if (attemptId && !routeResultData) {
            dispatch(getTestResultRequest({ id: attemptId }));
        }
    }, [attemptId, dispatch, routeResultData]);

    const reviewItems = useMemo(() => getReviewItems(resultWhole), [resultWhole]);

    const submitData = submitTestResponse?.data || submitTestResponse || {};
    const score = route.params?.score ?? resultData?.score ?? resultData?.finalScore ?? resultData?.obtainedMarks ?? submitData?.score ?? 0;
    const totalMarks = resultData?.maxScore ?? resultData?.maxMarks ?? resultData?.quiz?.totalMarks ?? submitData?.maxScore ?? 0;
    const rawResultItems = getRawResultItems(resultWhole);
    const totalQuestionsFromResults = rawResultItems.length || reviewItems.length;
    const attemptedFromUserAnswer = rawResultItems.filter((item: any) => hasUserAnswered(item)).length;
    const correctFromUserAnswer = rawResultItems.filter((item: any) => hasUserAnswered(item) && item?.isCorrect === true).length;
    const wrongFromUserAnswer = rawResultItems.filter((item: any) => hasUserAnswered(item) && item?.isCorrect === false).length;
    const skippedFromUserAnswer = Math.max(totalQuestionsFromResults - attemptedFromUserAnswer, 0);

    const attempted = rawResultItems.length > 0 ? attemptedFromUserAnswer : resultData?.questionCount ?? resultData?.attempted ?? resultData?.stats?.attempted ?? resultData?.results?.length ?? submitData?.answers?.length ?? reviewItems.filter((item: any) => item.status !== 'skipped').length;
    const correct = rawResultItems.length > 0 ? correctFromUserAnswer : resultData?.correctAnswers ?? resultData?.correct ?? resultData?.stats?.correct ?? reviewItems.filter((item: any) => item.status === 'correct').length;
    const wrong = rawResultItems.length > 0 ? wrongFromUserAnswer : resultData?.wrongAnswers ?? resultData?.wrong ?? resultData?.stats?.wrong ?? reviewItems.filter((item: any) => item.status === 'incorrect').length;
    const skipped = rawResultItems.length > 0 ? skippedFromUserAnswer : resultData?.skippedQuestions ?? resultData?.skipped ?? resultData?.stats?.skipped ?? reviewItems.filter((item: any) => item.status === 'skipped').length;

    const rawNegativeMarkingText = reviewItems.some((item: any) => Number(item.marksAwarded) < 0) ? `${Math.min(...reviewItems.map((item: any) => Number(item.marksAwarded) || 0))}` : '0';
    const negativeMarkingValue = Math.abs(Number(rawNegativeMarkingText));
    const calculatedPenalty = Number(wrong) * negativeMarkingValue;
    const penaltyRaw = calculatedPenalty > 0 ? calculatedPenalty : (resultData?.negativeMarks ?? resultData?.penalty ?? resultData?.stats?.penalty ?? 0);
    const penalty = Number(penaltyRaw).toFixed(2).replace(/\.?0+$/, '');

    const rawCorrectMarkingText = reviewItems.some((item: any) => Number(item.questionMarks) > 0) ? `${Math.max(...reviewItems.map((item: any) => Number(item.questionMarks) || 0))}` : '';
    const correctMarkingValue = Math.abs(Number(rawCorrectMarkingText));
    const calculatedEarned = Number(correct) * correctMarkingValue;
    const earnedRaw = calculatedEarned > 0 ? calculatedEarned : (resultData?.score ?? resultData?.marksEarned ?? resultData?.stats?.earned ?? submitData?.score ?? score);
    const earned = Number(earnedRaw).toFixed(2).replace(/\.?0+$/, '');
    
    const displayScore = Number(score).toFixed(2).replace(/\.?0+$/, '');

    const title = route.params?.title || resultData?.title || resultData?.quiz?.title || startTestResponse?.title || startTestResponse?.quiz?.title || 'Mock Test';
    const rank = resultData?.rank || resultData?.allIndiaRank || resultData?.air || '-';

    if (isLoading && !reviewItems.length) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.loadingCenter}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 96, 120) }]}>
        <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroSection}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => {
                dispatch(bootstrapHomeRequest({}));
                navigation.navigate(ROUTES.BOTTOM_TABS);
              }} 
              style={styles.backButton}
            >
              <Icon name="chevron-back" size={22} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.heroHeaderTitle}>Your Result</Text>
            <TouchableOpacity style={styles.headerAction}>
              <Icon name="trophy-outline" size={18} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.contentSection}>
          <LinearGradient colors={SUMMARY_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.summaryPanel}>
            <LinearGradient colors={SCORE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summarySheen} />
            <Text style={styles.summaryCaption}>FINAL SCORE</Text>
            <Text style={styles.mockNameText}>{title}</Text>

            <View style={styles.summaryTopRow}>
              <LinearGradient colors={SCORE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.scoreCircle}>
                <Text style={styles.summaryScoreText}>{displayScore}</Text>
                <Text style={styles.summaryScoreTotal}>/ {totalMarks}</Text>
              </LinearGradient>
              <LinearGradient colors={CARD_GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rankBadge}>
                <Icon name="sparkles" size={14} color="#D97706" />
                <Text style={styles.rankBadgeText}>Rank {rank}</Text>
              </LinearGradient>
            </View>

            <View style={styles.topMetricRow}>
              <LinearGradient colors={CARD_GREEN_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.topMetricCard, styles.metricGreenCard]}>
                <Text style={[styles.topMetricValue, styles.metricGreenText]}>+{earned}</Text>
                <Text style={styles.topMetricLabel}>Marks Earned</Text>
              </LinearGradient>
              <LinearGradient colors={CARD_RED_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.topMetricCard, styles.metricRedCard]}>
                <Text style={[styles.topMetricValue, styles.metricRedText]}>-{penalty}</Text>
                <Text style={styles.topMetricLabel}>Penalty</Text>
              </LinearGradient>
              <LinearGradient colors={CARD_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.topMetricCard, styles.metricBlueCard]}>
                <Text style={[styles.topMetricValue, styles.metricBlueText]}>{rank}</Text>
                <Text style={styles.topMetricLabel}>All India Rank</Text>
              </LinearGradient>
            </View>

            <View style={styles.miniStatsRow}>
              <LinearGradient colors={CARD_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.miniStatCard}>
                <Text style={styles.miniStatValue}>{attempted}</Text>
                <Text style={styles.miniStatLabel}>Attempted</Text>
              </LinearGradient>
              <LinearGradient colors={CARD_GREEN_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.miniStatCard}>
                <Text style={[styles.miniStatValue, styles.greenText]}>{correct}</Text>
                <Text style={styles.miniStatLabel}>Correct</Text>
              </LinearGradient>
              <LinearGradient colors={CARD_RED_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.miniStatCard}>
                <Text style={[styles.miniStatValue, styles.redText]}>{wrong}</Text>
                <Text style={styles.miniStatLabel}>Wrong</Text>
              </LinearGradient>
              <LinearGradient colors={CARD_GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.miniStatCard}>
                <Text style={[styles.miniStatValue, styles.orangeText]}>{skipped}</Text>
                <Text style={styles.miniStatLabel}>Skipped</Text>
              </LinearGradient>
            </View>

            <LinearGradient colors={CARD_BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Negative Marking Breakdown</Text>
              <View style={styles.breakdownRow}>
                <View>
                  <Text style={styles.breakdownRowTitle}>Wrong Penalty</Text>
                  <Text style={styles.breakdownRowSub}>{wrong} questions (-{negativeMarkingValue} each)</Text>
                </View>
                <Text style={[styles.breakdownValue, styles.redText]}>-{penalty}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <View>
                  <Text style={styles.breakdownRowTitle}>Skipped (0 penalty)</Text>
                  <Text style={styles.breakdownRowSub}>{skipped} questions</Text>
                </View>
                <Text style={styles.breakdownValue}>0</Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                <Text style={styles.breakdownTotalLabel}>Total Penalty</Text>
                <Text style={[styles.breakdownTotalValue, styles.redText]}>-{penalty}</Text>
              </View>
            </LinearGradient>
          </LinearGradient>

          <View style={styles.noticeWrap}>
            <SecurityNotice text="Result review is protected. Screenshots, recording, PDF download and sharing are disabled." />
          </View>

          <LinearGradient colors={SUMMARY_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewTitle}>Question Review</Text>
              <View style={styles.reviewCountPill}>
                <Text style={styles.reviewCountText}>{reviewItems.length} items</Text>
              </View>
            </View>

            {reviewItems.map((item: any) => {
              const isCorrect = item.status === 'correct';
              const isSkipped = item.status === 'skipped';
              const isIncorrect = item.status === 'incorrect';

              return (
                <LinearGradient
                  colors={isCorrect ? ['rgba(220,252,231,0.95)', 'rgba(240,253,244,0.98)'] : isSkipped ? ['rgba(254,249,195,0.9)', 'rgba(255,251,235,0.98)'] : ['rgba(254,226,226,0.95)', 'rgba(255,241,242,0.98)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.questionItem,
                    isCorrect && styles.questionItemCorrect,
                    isSkipped && styles.questionItemSkipped,
                    isIncorrect && styles.questionItemIncorrect,
                  ]}
                >
                  <View
                    style={[
                      styles.questionAccent,
                      isCorrect && styles.questionAccentCorrect,
                      isSkipped && styles.questionAccentSkipped,
                      isIncorrect && styles.questionAccentIncorrect,
                    ]}
                  />
                  <View key={item.id} style={styles.questionBody}>
                    <View style={styles.questionTopRow}>
                    <View style={styles.questionTag}>
                      <Text style={styles.questionNumber}>Q{item.questionNumber}</Text>
                    </View>
                    <Text
                      style={[
                        styles.markValue,
                        isCorrect && styles.markValueCorrect,
                        isSkipped && styles.markValueSkipped,
                        isIncorrect && styles.markValueIncorrect,
                      ]}
                    >
                      {item.marksAwarded}
                    </Text>
                    </View>

                    <Text style={styles.questionText}>{item.questionText}</Text>

                    <View style={styles.optionsWrap}>
                      {item.options.map((option: any, index: number) => {
                        const isRightAnswer = index === item.correctIndex;
                        const isChosenWrong = index === item.selectedIndex && item.status === 'incorrect';
                        const isChosenCorrect = index === item.selectedIndex && item.status === 'correct';

                        return (
                          <View
                            key={`${item.id}-${index}`}
                            style={[
                              styles.optionItem,
                              isRightAnswer && styles.optionItemCorrect,
                              isChosenWrong && styles.optionItemIncorrect,
                              isChosenCorrect && styles.optionItemCorrect,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionKey,
                                isRightAnswer && styles.optionKeyCorrect,
                                isChosenWrong && styles.optionKeyIncorrect,
                              ]}
                            >
                              {['A', 'B', 'C', 'D', 'E', 'F'][index] || index + 1}.
                            </Text>
                            <Text
                              style={[
                                styles.optionReviewText,
                                isRightAnswer && styles.optionReviewTextCorrect,
                                isChosenWrong && styles.optionReviewTextIncorrect,
                              ]}
                            >
                              {option.text}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {isCorrect ? (
                      <View style={styles.answerRow}>
                        <Text style={styles.answerLabel}>Your Answer:</Text>
                        <Text style={styles.answerValueCorrect}>{item.userAnswerLabel || item.correctAnswerLabel || 'Matched'}</Text>
                      </View>
                    ) : null}

                    {isSkipped ? (
                      <View style={styles.answerRow}>
                        <Text style={styles.answerLabel}>Status:</Text>
                        <Text style={styles.answerValueSkipped}>Not Answered</Text>
                      </View>
                    ) : null}

                    {isIncorrect ? (
                      <View style={styles.answerRow}>
                        <Text style={styles.answerLabel}>Your Answer:</Text>
                        <Text style={styles.answerValueIncorrect}>{item.userAnswerLabel || 'Unknown'}</Text>
                      </View>
                    ) : null}

                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Answer Key:</Text>
                      <Text style={styles.answerValueCorrect}>{item.correctAnswerLabel || 'Unknown'}</Text>
                    </View>

                    {item.explanation ? (
                      <View style={styles.explanationBox}>
                        <Text style={styles.answerLabel}>Explanation:</Text>
                        <Text style={styles.explanationText}>{item.explanation}</Text>
                      </View>
                    ) : null}
                  </View>
                </LinearGradient>
              );
            })}
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    backgroundColor: theme.colors.primary,
    paddingTop: 8,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroGlowTwo: {
    position: 'absolute',
    bottom: -40,
    left: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  backButton: {
    padding: 4,
  },
  heroHeaderTitle: {
    flex: 1,
    color: theme.colors.white,
    fontFamily: Fonts.interbold,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  headerAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    paddingHorizontal: 20,
    marginTop: -6,
  },
  summaryPanel: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    // shadowColor: '#0F172A',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.12,
    // shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
    // overflow: 'hidden',
    // position: 'relative',
  },
  summarySheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    opacity: 0.25,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  summaryTitleBlock: {
    flex: 1,
  },
  scoreCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    // shadowColor: '#0F172A',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.18,
    // shadowRadius: 14,
    // elevation: 4,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.18)',
  },
  rankBadgeText: {
    color: '#92400E',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  noticeWrap: {
    marginBottom: 16,
  },
  summaryCaption: {
    color: '#1105ef',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    marginBottom: 4,
    fontWeight:'bold'
  },
  mockNameText: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryScoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  summaryScoreText: {
    fontFamily: Fonts.interbold,
    fontSize: 34,
    color: theme.colors.text,
  },
  summaryScoreTotal: {
    color: "#000000",
    fontFamily: Fonts.interbold,
    fontSize: 18,
    marginLeft: 4,
    marginBottom: 4,
  },
  topMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  topMetricCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  metricGreenCard: {
    backgroundColor: '#ECFDF5',
  },
  metricRedCard: {
    backgroundColor: '#FEF2F2',
  },
  metricBlueCard: {
    backgroundColor: '#EEF2FF',
  },
  topMetricValue: {
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  topMetricLabel: {
    color: '#94A3B8',
    fontFamily: Fonts.intermedium,
    fontSize: 9,
    textAlign: 'center',
  },
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  miniStatCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  miniStatValue: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 14,
    marginBottom: 2,
  },
  miniStatLabel: {
    color: '#94A3B8',
    fontFamily: Fonts.intermedium,
    fontSize: 9,
  },
  breakdownCard: {
    borderRadius: 14,
    overflow: 'hidden',
    // shadowColor: '#0F172A',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.08,
    // shadowRadius: 10,
    // elevation: 2,
  },
  breakdownTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4FB',
  },
  breakdownRowTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.intersemibold,
    fontSize: 11,
  },
  breakdownRowSub: {
    color: '#94A3B8',
    fontFamily: Fonts.intermedium,
    fontSize: 9,
    marginTop: 2,
  },
  breakdownValue: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 12,
    fontWeight: '700',
  },
  greenText: {
    color: '#16A34A',
  },
  redText: {
    color: '#DC2626',
  },
  orangeText: {
    color: '#D97706',
  },
  metricGreenText: {
    color: '#16A34A',
  },
  metricRedText: {
    color: '#DC2626',
  },
  metricBlueText: {
    color: '#4F46E5',
  },
  breakdownTotalRow: {
    borderBottomWidth: 0,
  },
  breakdownTotalLabel: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownTotalValue: {
    fontFamily: Fonts.interbold,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewCard: {
    borderRadius: 18,
    padding: 16,
    // shadowColor: '#0F172A',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // elevation: 3,
    overflow: 'hidden',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  reviewTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 17,
    fontWeight: '700',
  },
  reviewCountPill: {
    backgroundColor: 'rgba(11, 95, 168, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  reviewCountText: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  questionItem: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  questionAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  questionAccentCorrect: {
    backgroundColor: '#22C55E',
  },
  questionAccentSkipped: {
    backgroundColor: '#F59E0B',
  },
  questionAccentIncorrect: {
    backgroundColor: '#EF4444',
  },
  questionBody: {
    gap: 0,
  },
  questionTag: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: REVIEW_BORDER,
  },
  questionItemCorrect: {
    borderColor: '#86EFAC',
  },
  questionItemSkipped: {
    borderColor: '#FCD34D',
  },
  questionItemIncorrect: {
    borderColor: '#FCA5A5',
  },
  questionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionNumber: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 13,
    fontWeight: '700',
  },
  markValue: {
    fontFamily: Fonts.interbold,
    fontSize: 13,
    fontWeight: '700',
  },
  markValueCorrect: {
    color: '#16A34A',
  },
  markValueSkipped: {
    color: '#D97706',
  },
  markValueIncorrect: {
    color: '#DC2626',
  },
  questionText: {
    color: theme.colors.text,
    fontFamily: Fonts.intermedium,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  optionsWrap: {
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  optionItemCorrect: {
    backgroundColor: '#DCFCE7',
  },
  optionItemIncorrect: {
    backgroundColor: '#FEE2E2',
  },
  optionKey: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 12,
    width: 22,
  },
  optionKeyCorrect: {
    color: '#16A34A',
  },
  optionKeyIncorrect: {
    color: '#DC2626',
  },
  optionReviewText: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: Fonts.interregular,
    fontSize: 12,
    lineHeight: 18,
  },
  optionReviewTextCorrect: {
    color: '#166534',
  },
  optionReviewTextIncorrect: {
    color: '#991B1B',
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  answerLabel: {
    color: theme.colors.textLight,
    fontFamily: Fonts.intermedium,
    fontSize: 12,
    marginRight: 6,
  },
  answerValueCorrect: {
    color: '#16A34A',
    fontFamily: Fonts.interbold,
    fontSize: 12,
    fontWeight: '700',
  },
  answerValueSkipped: {
    color: '#D97706',
    fontFamily: Fonts.interbold,
    fontSize: 12,
    fontWeight: '700',
  },
  answerValueIncorrect: {
    color: '#DC2626',
    fontFamily: Fonts.interbold,
    fontSize: 12,
    fontWeight: '700',
  },
  explanationBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: REVIEW_BORDER,
  },
  explanationText: {
    marginTop: 6,
    color: '#334155',
    fontFamily: Fonts.interregular,
    fontSize: 12,
    lineHeight: 18,
  },
});
