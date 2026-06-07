import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';
import { SecurityNotice } from '../../Components/security/SecurityNotice';

const RESULT_QUESTIONS = Array.from({ length: 20 }, (_, index) => {
  const states = ['correct', 'incorrect', 'skipped'] as const;
  const state = states[index % states.length];
  const rightAnswers = ['A', 'B', 'C', 'D'];
  const correctAnswer = rightAnswers[index % 4];
  const selectedAnswer =
    state === 'skipped'
      ? null
      : state === 'correct'
        ? correctAnswer
        : rightAnswers[(index + 1) % 4];

  return {
    id: `result-question-${index + 1}`,
    questionNumber: index + 1,
    question: `Sample nursing mock question ${index + 1}: identify the most appropriate clinical answer for this scenario.`,
    options: [
      'Option A sample answer',
      'Option B sample answer',
      'Option C sample answer',
      'Option D sample answer',
    ],
    selectedAnswer,
    correctAnswer,
    status: state,
    marks: state === 'correct' ? '+1' : state === 'incorrect' ? '-0.5' : '0',
  };
});

const SUMMARY = {
  mockName: 'NORCET Mock Test',
  correctAnswer: 12,
  penalty: '-39.0',
  finalScore: '113.0',
  totalMarks: '360',
  marksEarned: '+152',
  allIndiaRank: '#342',
  attempted: 62,
  correct: 38,
  incorrect: 22,
  skipped: 28,
};

export const ResultScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="chevron-back" size={22} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.heroHeaderTitle}>Your Result</Text>
            <TouchableOpacity style={styles.headerAction}>
              <Icon name="trophy-outline" size={18} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.summaryPanel}>
            <Text style={styles.summaryCaption}>FINAL SCORE</Text>
            <Text style={styles.mockNameText}>{SUMMARY.mockName}</Text>

            <View style={styles.summaryScoreRow}>
              <Text style={styles.summaryScoreText}>{SUMMARY.finalScore}</Text>
              <Text style={styles.summaryScoreTotal}>/ {SUMMARY.totalMarks}</Text>
            </View>

            <View style={styles.topMetricRow}>
              <View style={[styles.topMetricCard, styles.metricGreenCard]}>
                <Text style={[styles.topMetricValue, styles.metricGreenText]}>{SUMMARY.marksEarned}</Text>
                <Text style={styles.topMetricLabel}>Marks Earned</Text>
              </View>
              <View style={[styles.topMetricCard, styles.metricRedCard]}>
                <Text style={[styles.topMetricValue, styles.metricRedText]}>{SUMMARY.penalty}</Text>
                <Text style={styles.topMetricLabel}>Penalty</Text>
              </View>
              <View style={[styles.topMetricCard, styles.metricBlueCard]}>
                <Text style={[styles.topMetricValue, styles.metricBlueText]}>{SUMMARY.allIndiaRank}</Text>
                <Text style={styles.topMetricLabel}>All India Rank</Text>
              </View>
            </View>

            <View style={styles.miniStatsRow}>
              <View style={styles.miniStatCard}>
                <Text style={styles.miniStatValue}>{SUMMARY.attempted}</Text>
                <Text style={styles.miniStatLabel}>Attempted</Text>
              </View>
              <View style={styles.miniStatCard}>
                <Text style={[styles.miniStatValue, styles.greenText]}>{SUMMARY.correct}</Text>
                <Text style={styles.miniStatLabel}>Correct</Text>
              </View>
              <View style={styles.miniStatCard}>
                <Text style={[styles.miniStatValue, styles.redText]}>{SUMMARY.incorrect}</Text>
                <Text style={styles.miniStatLabel}>Wrong</Text>
              </View>
              <View style={styles.miniStatCard}>
                <Text style={[styles.miniStatValue, styles.orangeText]}>{SUMMARY.skipped}</Text>
                <Text style={styles.miniStatLabel}>Skipped</Text>
              </View>
            </View>

            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Negative Marking Breakdown</Text>
              <View style={styles.breakdownRow}>
                <View>
                  <Text style={styles.breakdownRowTitle}>Wrong (-0.25 each)</Text>
                  <Text style={styles.breakdownRowSub}>14 questions</Text>
                </View>
                <Text style={[styles.breakdownValue, styles.redText]}>-35.0</Text>
              </View>
              <View style={styles.breakdownRow}>
                <View>
                  <Text style={styles.breakdownRowTitle}>Wrong (-0.5 each)</Text>
                  <Text style={styles.breakdownRowSub}>8 questions</Text>
                </View>
                <Text style={[styles.breakdownValue, styles.orangeText]}>-4.0</Text>
              </View>
              <View style={styles.breakdownRow}>
                <View>
                  <Text style={styles.breakdownRowTitle}>Skipped (0 penalty)</Text>
                  <Text style={styles.breakdownRowSub}>{SUMMARY.skipped} questions</Text>
                </View>
                <Text style={styles.breakdownValue}>0</Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                <Text style={styles.breakdownTotalLabel}>Total Penalty</Text>
                <Text style={[styles.breakdownTotalValue, styles.redText]}>{SUMMARY.penalty}</Text>
              </View>
            </View>
          </View>

          <View style={styles.noticeWrap}>
            <SecurityNotice text="Result review is protected. Screenshots, recording, PDF download and sharing are disabled." />
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Question Review</Text>

            {RESULT_QUESTIONS.map(item => {
              const isCorrect = item.status === 'correct';
              const isSkipped = item.status === 'skipped';
              const isIncorrect = item.status === 'incorrect';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.questionItem,
                    isCorrect && styles.questionItemCorrect,
                    isSkipped && styles.questionItemSkipped,
                    isIncorrect && styles.questionItemIncorrect,
                  ]}
                >
                  <View style={styles.questionTopRow}>
                    <Text style={styles.questionNumber}>Q{item.questionNumber}</Text>
                    <Text
                      style={[
                        styles.markValue,
                        isCorrect && styles.markValueCorrect,
                        isSkipped && styles.markValueSkipped,
                        isIncorrect && styles.markValueIncorrect,
                      ]}
                    >
                      {item.marks}
                    </Text>
                  </View>

                  <Text style={styles.questionText}>{item.question}</Text>

                  <View style={styles.optionsWrap}>
                    {item.options.map((option, index) => {
                      const optionId = ['A', 'B', 'C', 'D'][index];
                      const isRightAnswer = optionId === item.correctAnswer;
                      const isChosenWrong = optionId === item.selectedAnswer && item.status === 'incorrect';
                      const isChosenCorrect = optionId === item.selectedAnswer && item.status === 'correct';

                      return (
                        <View
                          key={`${item.id}-${optionId}`}
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
                            {optionId}.
                          </Text>
                          <Text
                            style={[
                              styles.optionReviewText,
                              isRightAnswer && styles.optionReviewTextCorrect,
                              isChosenWrong && styles.optionReviewTextIncorrect,
                            ]}
                          >
                            {option}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {isCorrect ? (
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Your Answer:</Text>
                      <Text style={styles.answerValueCorrect}>{item.selectedAnswer} Matched</Text>
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
                      <Text style={styles.answerValueIncorrect}>{item.selectedAnswer}</Text>
                    </View>
                  ) : null}

                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Answer Key:</Text>
                    <Text style={styles.answerValueCorrect}>{item.correctAnswer}</Text>
                  </View>
                </View>
              );
            })}
          </View>
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
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    backgroundColor: theme.colors.primary,
    paddingTop: 8,
    paddingBottom: 18,
    overflow: 'hidden',
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
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#B5CAE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  noticeWrap: {
    marginBottom: 16,
  },
  summaryCaption: {
    color: '#94A3B8',
    fontFamily: Fonts.intersemibold,
    fontSize: 10,
    marginBottom: 4,
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
    color: theme.colors.textLight,
    fontFamily: Fonts.intermedium,
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
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF4FB',
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
    backgroundColor: '#FAFCFF',
    borderWidth: 1,
    borderColor: '#EEF4FB',
    overflow: 'hidden',
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
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#B5CAE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  reviewTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  questionItem: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  questionItemCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  questionItemSkipped: {
    backgroundColor: '#FFFBEA',
    borderColor: '#FCD34D',
  },
  questionItemIncorrect: {
    backgroundColor: '#FEF2F2',
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
});
