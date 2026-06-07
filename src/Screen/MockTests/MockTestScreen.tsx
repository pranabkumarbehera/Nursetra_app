import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../Themes';
import { ROUTES } from '../../Navigation/RouteNames';
import { SecurityNotice } from '../../Components/security/SecurityNotice';

const QUESTION_TEMPLATES = [
  {
    subject: 'Anatomy',
    question: 'Which chamber of the heart pumps oxygenated blood to the body?',
    options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
    answer: 'D',
  },
  {
    subject: 'Physiology',
    question: 'What is the normal adult respiratory rate per minute?',
    options: ['8 to 10', '12 to 20', '22 to 30', '30 to 36'],
    answer: 'B',
  },
  {
    subject: 'Pharmacology',
    question: 'Which drug is commonly used as an antidote for opioid overdose?',
    options: ['Atropine', 'Naloxone', 'Diazepam', 'Heparin'],
    answer: 'B',
  },
  {
    subject: 'Microbiology',
    question: 'BCG vaccine is primarily used to prevent which disease?',
    options: ['Tetanus', 'Tuberculosis', 'Measles', 'Mumps'],
    answer: 'B',
  },
  {
    subject: 'Community Health',
    question: 'Which level of prevention focuses on early diagnosis and prompt treatment?',
    options: ['Primary', 'Secondary', 'Tertiary', 'Primordial'],
    answer: 'B',
  },
  {
    subject: 'Med-Surg Nursing',
    question: 'Which electrolyte imbalance is common in severe vomiting?',
    options: ['Hyperkalemia', 'Hypokalemia', 'Hypernatremia', 'Hypermagnesemia'],
    answer: 'B',
  },
  {
    subject: 'Psychiatric Nursing',
    question: 'Which therapeutic communication technique encourages a patient to continue talking?',
    options: ['Changing subject', 'Giving advice', 'Broad opening', 'Defending'],
    answer: 'C',
  },
  {
    subject: 'Obstetrics',
    question: 'The normal duration of pregnancy is approximately:',
    options: ['28 weeks', '32 weeks', '36 weeks', '40 weeks'],
    answer: 'D',
  },
];

const MOCK_QUESTIONS = Array.from({ length: 40 }, (_, index) => {
  const template = QUESTION_TEMPLATES[index % QUESTION_TEMPLATES.length];
  return {
    id: `mock-question-${index + 1}`,
    subject: template.subject,
    penalty: '-0.25 penalty',
    questionNumber: index + 1,
    question: template.question,
    options: template.options.map((option, optionIndex) => ({
      id: ['A', 'B', 'C', 'D'][optionIndex],
      text: option,
    })),
    answer: template.answer,
  };
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const MockTestScreen = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(50 * 60);
  const [showPalette, setShowPalette] = useState(false);
  const dotsAnimation = useRef(new Animated.Value(0)).current;

  const currentQuestion = MOCK_QUESTIONS[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(dotsAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [dotsAnimation]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const skippedCount = skippedQuestions.length;
  const remainingCount = MOCK_QUESTIONS.length - answeredCount - skippedCount;

  const progressPercent = ((currentIndex + 1) / MOCK_QUESTIONS.length) * 100;

  const paletteItems = useMemo(
    () =>
      MOCK_QUESTIONS.map((item, index) => {
        const answered = !!selectedAnswers[item.questionNumber];
        const skipped = skippedQuestions.includes(item.questionNumber);
        return {
          number: item.questionNumber,
          active: index === currentIndex,
          answered,
          skipped,
        };
      }),
    [currentIndex, selectedAnswers, skippedQuestions]
  );

  const selectAnswer = (answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.questionNumber]: answerId }));
    setSkippedQuestions(prev => prev.filter(question => question !== currentQuestion.questionNumber));
  };

  const jumpToQuestion = (questionNumber: number) => {
    setCurrentIndex(questionNumber - 1);
    setShowPalette(false);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      navigation.goBack();
      return;
    }
    setCurrentIndex(prev => prev - 1);
  };

  const handleSkip = () => {
    setSkippedQuestions(prev =>
      prev.includes(currentQuestion.questionNumber) ? prev : [...prev, currentQuestion.questionNumber]
    );
    setSelectedAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion.questionNumber];
      return next;
    });
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex === MOCK_QUESTIONS.length - 1) {
      navigation.navigate(ROUTES.RESULTS);
      return;
    }
    setCurrentIndex(prev => prev + 1);
  };

  const dotOpacities = [0, 1, 2, 3].map(index =>
    dotsAnimation.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange:
        index === 0
          ? [0.35, 1, 0.35, 0.35, 0.35]
          : index === 1
            ? [0.35, 0.35, 1, 0.35, 0.35]
            : index === 2
              ? [0.35, 0.35, 0.35, 1, 0.35]
              : [0.35, 0.35, 0.35, 0.35, 1],
    })
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.timerWrap}>
          <Icon name="time-outline" size={18} color="#00B4A2" />
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        </View>

        <Text style={styles.testName} numberOfLines={1}>
          NORCET Mock Test
        </Text>

        <TouchableOpacity style={styles.jumpWrap} activeOpacity={0.85} onPress={() => setShowPalette(true)}>
          <Text style={styles.jumpText}>Jump</Text>
          <View style={styles.dotsWrap}>
            {dotOpacities.map((opacity, index) => (
              <Animated.View key={index} style={[styles.dot, { opacity }]} />
            ))}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTopRow}>
          <Text style={styles.questionCounter}>
            Question <Text style={styles.counterBold}>{currentQuestion.questionNumber}</Text> of{' '}
            <Text style={styles.counterBold}>{MOCK_QUESTIONS.length}</Text>
          </Text>
          <TouchableOpacity style={styles.jumpIconButton} onPress={() => setShowPalette(true)}>
            <Icon name="grid-outline" size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statAnswered}>Answered {answeredCount}</Text>
          <Text style={styles.statSkipped}>Skipped {skippedCount}</Text>
          <Text style={styles.statRemaining}>Remaining {remainingCount}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.securityNotice}>
          <SecurityNotice text="Mock test screen is protected. Screenshots, recording, PDF download and sharing are disabled." />
        </View>

        <View style={styles.tagsRow}>
          <View style={styles.tagGreen}>
            <Text style={styles.tagGreenText}>{currentQuestion.subject}</Text>
          </View>
          <View style={styles.tagYellow}>
            <Text style={styles.tagYellowText}>{currentQuestion.penalty}</Text>
          </View>
        </View>

        <Text style={styles.questionText}>
          Q{currentQuestion.questionNumber}. {currentQuestion.question}
        </Text>

        <View style={styles.optionsWrap}>
          {currentQuestion.options.map(opt => {
            const isSelected = selectedAnswers[currentQuestion.questionNumber] === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                onPress={() => selectAnswer(opt.id)}
                activeOpacity={0.82}
              >
                <View style={[styles.optionLetter, isSelected && styles.selectedOptionLetter]}>
                  <Text style={[styles.optionLetterText, isSelected && styles.selectedOptionLetterText]}>{opt.id}</Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButtonSecondary} onPress={handlePrevious}>
          <Text style={styles.navButtonTextSecondary}>‹ Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButtonPrimary} onPress={handleNext}>
          <Text style={styles.navButtonTextPrimary}>{currentIndex === MOCK_QUESTIONS.length - 1 ? 'Finish' : 'Next ›'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPalette} transparent animationType="slide" onRequestClose={() => setShowPalette(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.overlayDismiss} activeOpacity={1} onPress={() => setShowPalette(false)} />
          <View style={styles.paletteSheet}>
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Question Palette</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}>
                <Icon name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.paletteStats}>
              <Text style={styles.paletteStatText}>Answered: {answeredCount}</Text>
              <Text style={styles.paletteStatText}>Skipped: {skippedCount}</Text>
              <Text style={styles.paletteStatText}>Remaining: {remainingCount}</Text>
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#00B4A2' }]} />
                <Text style={styles.legendText}>Answered</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Skipped</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D9E4F0' }]} />
                <Text style={styles.legendText}>Pending</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.paletteGrid}>
              {paletteItems.map(item => (
                <TouchableOpacity
                  key={item.number}
                  style={[
                    styles.paletteButton,
                    item.answered && styles.paletteButtonAnswered,
                    item.skipped && styles.paletteButtonSkipped,
                    item.active && styles.paletteButtonActive,
                  ]}
                  onPress={() => jumpToQuestion(item.number)}
                >
                  <Text
                    style={[
                      styles.paletteButtonText,
                      item.answered && styles.paletteButtonTextDark,
                      item.skipped && styles.paletteButtonTextDark,
                      item.active && styles.paletteButtonTextActive,
                    ]}
                  >
                    {item.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 84,
  },
  timerText: {
    color: '#00B4A2',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  testName: {
    flex: 1,
    color: '#1E293B',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  jumpWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 78,
    justifyContent: 'flex-end',
  },
  jumpText: {
    color: '#5F6FE4',
    fontFamily: Fonts.interbold,
    fontSize: 13,
    fontWeight: '700',
  },
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#5F6FE4',
    marginLeft: 3,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionCounter: {
    color: '#64748B',
    fontFamily: Fonts.intermedium,
    fontSize: 13,
    fontWeight: '500',
  },
  counterBold: {
    color: '#1E293B',
    fontFamily: Fonts.interbold,
  },
  jumpIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#00B4A2',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statAnswered: {
    color: '#00B4A2',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  statSkipped: {
    color: '#F59E0B',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  statRemaining: {
    color: '#64748B',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  securityNotice: {
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  tagGreen: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagGreenText: {
    color: '#00B4A2',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  tagYellow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagYellowText: {
    color: '#D97706',
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  questionText: {
    color: '#1E293B',
    fontFamily: Fonts.intermedium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 24,
  },
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionCard: {
    backgroundColor: '#E6F4F1',
    borderColor: '#00B4A2',
    borderWidth: 2,
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  selectedOptionLetter: {
    backgroundColor: '#00B4A2',
  },
  optionLetterText: {
    color: '#334155',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedOptionLetterText: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    color: '#1E293B',
    fontFamily: Fonts.interregular,
    fontSize: 14,
    lineHeight: 20,
  },
  selectedOptionText: {
    color: '#0F172A',
    fontFamily: Fonts.intermedium,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F4F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navButtonSecondary: {
    backgroundColor: '#EEF2F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navButtonTextSecondary: {
    color: '#64748B',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  skipButtonText: {
    color: '#F59E0B',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
  },
  navButtonPrimary: {
    backgroundColor: '#00B4A2',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  navButtonTextPrimary: {
    color: '#FFFFFF',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  overlayDismiss: {
    flex: 1,
  },
  paletteSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '72%',
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paletteTitle: {
    color: '#1E293B',
    fontFamily: Fonts.interbold,
    fontSize: 18,
    fontWeight: '700',
  },
  paletteStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paletteStatText: {
    color: '#64748B',
    fontFamily: Fonts.intermedium,
    fontSize: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: '#64748B',
    fontFamily: Fonts.interregular,
    fontSize: 11,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 12,
  },
  paletteButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EAF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteButtonAnswered: {
    backgroundColor: '#BAF0E7',
  },
  paletteButtonSkipped: {
    backgroundColor: '#FFE4B5',
  },
  paletteButtonActive: {
    backgroundColor: '#5F6FE4',
  },
  paletteButtonText: {
    color: '#475569',
    fontFamily: Fonts.interbold,
    fontSize: 13,
    fontWeight: '700',
  },
  paletteButtonTextDark: {
    color: '#1E293B',
  },
  paletteButtonTextActive: {
    color: '#FFFFFF',
  },
});
