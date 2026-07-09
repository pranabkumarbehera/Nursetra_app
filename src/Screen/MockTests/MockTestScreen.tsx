import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
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
import { Fonts, theme, Colorpath } from '../../Themes';
import { ROUTES } from '../../Navigation/RouteNames';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';

const { height } = Dimensions.get('window');

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
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [remainingSeconds, setRemainingSeconds] = useState(50 * 60);
  const [showPalette, setShowPalette] = useState(false);

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

  const answeredCount = Object.keys(selectedAnswers).length;
  const skippedCount = skippedQuestions.length;
  const remainingCount = MOCK_QUESTIONS.length - answeredCount - skippedCount;

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

  const toggleReview = () => {
    const newReview = new Set(reviewed);
    if (newReview.has(currentQuestion.questionNumber)) {
      newReview.delete(currentQuestion.questionNumber);
    } else {
      newReview.add(currentQuestion.questionNumber);
    }
    setReviewed(newReview);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon name="arrow-back" size={normalize(24)} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>NORCET Mock Test</Text>
          <Pressable style={styles.jumpIconButton} onPress={() => setShowPalette(!showPalette)}>
            <Icon name="grid-outline" size={normalize(22)} color={theme.colors.primary} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <View style={styles.qCountBadge}>
            <Text style={styles.qCountText}>Q {currentIndex + 1} / {MOCK_QUESTIONS.length}</Text>
          </View>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Offline mode</Text>
          </View>
        </View>
        <View style={styles.timerBadge}>
          <Icon name="time-outline" size={normalize(16)} color="#FFFFFF" />
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>
            {currentQuestion.questionNumber}. {currentQuestion.question}
          </Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswers[currentQuestion.questionNumber] === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionContainer, isSelected && styles.optionSelected]}
                  onPress={() => selectAnswer(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>{opt.id}.</Text>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
          <Icon name="chevron-back" size={normalize(20)} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reviewButton, reviewed.has(currentQuestion.questionNumber) && styles.reviewButtonActive]}
          onPress={toggleReview}
        >
          <Icon name={reviewed.has(currentQuestion.questionNumber) ? "bookmark" : "bookmark-outline"} size={normalize(18)} color={reviewed.has(currentQuestion.questionNumber) ? '#FFFFFF' : '#D97706'} style={styles.reviewIcon} />
          <Text style={[styles.reviewButtonText, reviewed.has(currentQuestion.questionNumber) && styles.reviewButtonTextActive]}>
            Review
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{currentIndex === MOCK_QUESTIONS.length - 1 ? 'Finish' : 'Save & Next'}</Text>
          <Icon name={currentIndex === MOCK_QUESTIONS.length - 1 ? 'checkmark' : 'chevron-forward'} size={normalize(18)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal visible={showPalette} transparent animationType="slide" onRequestClose={() => setShowPalette(false)}>
        <View style={styles.paletteOverlay}>
          <Pressable style={styles.paletteBg} onPress={() => setShowPalette(false)} />
          <View style={styles.paletteContainer}>
            <View style={styles.paletteDragBar} />
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Question Palette</Text>
              <Pressable onPress={() => setShowPalette(false)} style={styles.closeBtn}>
                <Icon name="close" size={normalize(24)} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.paletteStats}>
              <Text style={styles.paletteStatText}>Answered: {answeredCount}</Text>
              <Text style={styles.paletteStatText}>Skipped: {skippedCount}</Text>
              <Text style={styles.paletteStatText}>Remaining: {remainingCount}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.gridContainer}>
                {MOCK_QUESTIONS.map((q) => {
                  const index = q.questionNumber - 1;
                  const hasAnswer = !!selectedAnswers[q.questionNumber];
                  const isSkipped = skippedQuestions.includes(q.questionNumber);
                  const isReview = reviewed.has(q.questionNumber);
                  const isCurrent = index === currentIndex;

                  let boxStyle: any = styles.gridBox;
                  let textStyle: any = styles.gridText;

                  if (isCurrent) {
                    boxStyle = { ...boxStyle, ...styles.gridCurrent };
                    textStyle = { ...textStyle, ...styles.gridTextCurrent };
                  } else if (hasAnswer && isReview) {
                    boxStyle = { ...boxStyle, ...styles.gridAnsweredMarked };
                    textStyle = { ...textStyle, ...styles.gridTextAnswered };
                  } else if (isReview) {
                    boxStyle = { ...boxStyle, ...styles.gridReview };
                    textStyle = { ...textStyle, ...styles.gridTextReview };
                  } else if (hasAnswer) {
                    boxStyle = { ...boxStyle, ...styles.gridAnswered };
                    textStyle = { ...textStyle, ...styles.gridTextAnswered };
                  } else if (isSkipped) {
                    boxStyle = { ...boxStyle, ...styles.gridSkipped };
                    textStyle = { ...textStyle, ...styles.gridTextSkipped };
                  }

                  return (
                    <Pressable
                      key={q.questionNumber}
                      style={boxStyle}
                      onPress={() => jumpToQuestion(q.questionNumber)}
                    >
                      <Text style={textStyle}>{q.questionNumber}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.paletteLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981', borderColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Answered</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F1F5F9' }]} />
                  <Text style={styles.legendText}>Skipped</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F8FAFC' }]} />
                  <Text style={styles.legendText}>Unanswered</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]} />
                  <Text style={styles.legendText}>Marked for Review</Text>
                </View>
              </View>

              <View style={styles.paletteFooter}>
                <TouchableOpacity style={styles.footerBtnOutline} onPress={() => setShowPalette(false)}>
                  <Text style={styles.footerBtnText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerBtnSolid} onPress={handleNext}>
                  <Text style={styles.footerBtnSolidText}>Continue Test</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerSafeArea: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: normalize(16), height: verticalScale(56) },
  iconButton: { width: normalize(40), height: normalize(40), borderRadius: normalize(20), backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  jumpIconButton: { width: normalize(40), height: normalize(40), borderRadius: normalize(20), backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: normalize(18), fontFamily: Fonts.interbold, color: theme.colors.text, textAlign: 'center', marginHorizontal: normalize(12) },

  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingBottom: verticalScale(16), paddingTop: verticalScale(16), borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  subHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: normalize(12) },
  qCountBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), borderRadius: normalize(10), borderWidth: 1, borderColor: theme.colors.border },
  qCountText: { fontSize: normalize(13), fontFamily: Fonts.interbold, color: theme.colors.text },
  syncBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(8), paddingVertical: verticalScale(6), borderRadius: normalize(8), gap: normalize(4) },
  syncDot: { width: normalize(6), height: normalize(6), borderRadius: normalize(3), backgroundColor: '#10B981' },
  syncText: { color: Colorpath.TextSecondary, fontSize: normalize(11), fontFamily: Fonts.intermedium },

  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: normalize(14), paddingVertical: verticalScale(8), borderRadius: normalize(12), gap: normalize(6), shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  timerText: { color: '#FFFFFF', fontSize: normalize(14), fontFamily: Fonts.interbold },

  scrollContent: { paddingHorizontal: normalize(20), paddingTop: verticalScale(24), paddingBottom: verticalScale(120) },

  questionSection: { marginBottom: verticalScale(32) },
  questionText: { fontSize: normalize(17), color: theme.colors.text, fontFamily: Fonts.interbold, lineHeight: normalize(26), marginBottom: verticalScale(24) },

  optionsContainer: { gap: verticalScale(12) },
  optionContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(16), paddingVertical: verticalScale(16), borderRadius: normalize(16), borderWidth: 1, borderColor: theme.colors.border, backgroundColor: '#FFFFFF' },
  optionSelected: { borderColor: theme.colors.primary, backgroundColor: '#F0F9FF' },
  optionLetter: { fontSize: normalize(15), color: Colorpath.TextSecondary, fontFamily: Fonts.interbold, marginRight: normalize(10) },
  optionLetterSelected: { color: theme.colors.primary },
  optionText: { fontSize: normalize(15), color: theme.colors.text, fontFamily: Fonts.intermedium, flex: 1, lineHeight: normalize(22) },
  optionTextSelected: { color: '#0F172A', fontFamily: Fonts.interbold },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingTop: verticalScale(16), paddingBottom: verticalScale(24), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 15 },
  prevButton: { width: normalize(48), height: normalize(48), borderRadius: normalize(24), backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },

  reviewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: normalize(48), paddingHorizontal: normalize(24), borderRadius: normalize(24), borderWidth: 1.5, borderColor: '#F59E0B' },
  reviewButtonActive: { backgroundColor: '#F59E0B' },
  reviewIcon: { marginRight: normalize(6) },
  reviewButtonText: { color: '#F59E0B', fontSize: normalize(14), fontFamily: Fonts.interbold },
  reviewButtonTextActive: { color: '#FFFFFF' },

  nextButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: normalize(48), backgroundColor: theme.colors.primary, borderRadius: normalize(24), marginLeft: normalize(12), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  nextButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontFamily: Fonts.interbold, marginRight: normalize(6) },

  paletteOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  paletteBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  paletteContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Dimensions.get('window').height * 0.75, backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(32), borderTopRightRadius: normalize(32), paddingHorizontal: normalize(24), paddingTop: verticalScale(12), paddingBottom: verticalScale(24) },
  paletteDragBar: { width: normalize(48), height: normalize(5), backgroundColor: '#E2E8F0', borderRadius: normalize(3), alignSelf: 'center', marginBottom: verticalScale(20) },
  paletteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(16) },
  paletteTitle: { fontSize: normalize(20), fontFamily: Fonts.interbold, color: theme.colors.text },
  closeBtn: { width: normalize(36), height: normalize(36), borderRadius: normalize(18), backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  paletteStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(20), paddingHorizontal: normalize(8) },
  paletteStatText: { fontSize: normalize(13), fontFamily: Fonts.intermedium, color: Colorpath.TextSecondary },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(12), justifyContent: 'flex-start' },
  gridBox: { width: normalize(42), height: normalize(42), borderRadius: normalize(12), backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  gridAnswered: { backgroundColor: '#10B981', borderWidth: 0 },
  gridAnsweredMarked: { backgroundColor: '#10B981', borderWidth: 2, borderColor: '#F59E0B' },
  gridCurrent: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: theme.colors.primary },
  gridReview: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B' },
  gridSkipped: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },

  gridText: { fontSize: normalize(15), color: Colorpath.TextSecondary, fontFamily: Fonts.interbold },
  gridTextAnswered: { color: '#FFFFFF' },
  gridTextCurrent: { color: theme.colors.primary },
  gridTextReview: { color: '#D97706' },
  gridTextSkipped: { color: '#94A3B8' },

  paletteLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(16), marginTop: verticalScale(24), backgroundColor: '#F8FAFC', padding: normalize(16), borderRadius: normalize(16) },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%', marginBottom: verticalScale(8) },
  legendDot: { width: normalize(12), height: normalize(12), borderRadius: normalize(6), marginRight: normalize(8), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  legendText: { color: Colorpath.TextSecondary, fontSize: normalize(12), fontFamily: Fonts.intermedium },

  paletteFooter: { flexDirection: 'row', gap: normalize(16), marginTop: verticalScale(24) },
  footerBtnOutline: { flex: 1, height: normalize(52), borderRadius: normalize(16), borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  footerBtnText: { color: theme.colors.text, fontSize: normalize(15), fontFamily: Fonts.interbold },
  footerBtnSolid: { flex: 1, height: normalize(52), borderRadius: normalize(16), backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  footerBtnSolidText: { color: '#FFFFFF', fontSize: normalize(15), fontFamily: Fonts.interbold },
});
