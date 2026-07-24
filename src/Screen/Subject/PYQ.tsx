import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';
import { Header } from '../../Components/headers/Header';
import { EXAM_CATEGORIES, PREVIOUS_YEAR_QUESTIONS, PREVIOUS_YEAR_YEARS } from '../../Constants/dummyData';
import { SecurityNotice } from '../../Components/security/SecurityNotice';

export const PYQ = () => {
  const insets = useSafeAreaInsets();
  const [selectedYear, setSelectedYear] = useState(PREVIOUS_YEAR_YEARS[0]);
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [openDropdown, setOpenDropdown] = useState<'year' | 'course' | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  const filteredQuestions = useMemo(() => {
    return PREVIOUS_YEAR_QUESTIONS.filter(item => {
      const matchesYear = item.year === selectedYear;
      const matchesCourse = selectedCourse === 'All' || item.course === selectedCourse;
      return matchesYear && matchesCourse;
    });
  }, [selectedCourse, selectedYear]);

  const visibleQuestions = useMemo(
    () => filteredQuestions.slice(0, visibleCount),
    [filteredQuestions, visibleCount]
  );

  const courseOptions = ['All', ...EXAM_CATEGORIES];

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setVisibleCount(5);
    setOpenDropdown(null);
  };

  const handleCourseSelect = (course: string) => {
    setSelectedCourse(course);
    setVisibleCount(5);
    setOpenDropdown(null);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]} edges={['top', 'left', 'right']}>
      <Header title="Previous Year Questions" />

      <View style={styles.filterSection}>
        <SecurityNotice text="Previous year question content is protected. Screenshots, recording, PDF download and sharing are disabled." />

        <View style={styles.dropdownRow}>
          <View style={styles.dropdownWrap}>
            <Text style={styles.dropdownLabel}>Year Wise</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              activeOpacity={0.85}
              onPress={() => setOpenDropdown(current => (current === 'year' ? null : 'year'))}
            >
              <Text style={styles.dropdownValue}>{selectedYear}</Text>
              <Icon name={openDropdown === 'year' ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textLight} />
            </TouchableOpacity>
            {openDropdown === 'year' ? (
              <View style={styles.dropdownMenu}>
                {PREVIOUS_YEAR_YEARS.map(year => (
                  <TouchableOpacity key={year} style={styles.dropdownItem} onPress={() => handleYearSelect(year)}>
                    <Text style={[styles.dropdownItemText, selectedYear === year && styles.dropdownItemTextActive]}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.dropdownWrap}>
            <Text style={styles.dropdownLabel}>Course Wise</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              activeOpacity={0.85}
              onPress={() => setOpenDropdown(current => (current === 'course' ? null : 'course'))}
            >
              <Text style={styles.dropdownValue} numberOfLines={1}>{selectedCourse}</Text>
              <Icon name={openDropdown === 'course' ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textLight} />
            </TouchableOpacity>
            {openDropdown === 'course' ? (
              <View style={styles.dropdownMenu}>
                {courseOptions.map(course => (
                  <TouchableOpacity key={course} style={styles.dropdownItem} onPress={() => handleCourseSelect(course)}>
                    <Text style={[styles.dropdownItemText, selectedCourse === course && styles.dropdownItemTextActive]}>{course}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <FlatList
        data={visibleQuestions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.questionCard}>
            <View style={styles.questionMetaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{item.course}</Text>
              </View>
              <View style={[styles.metaPill, styles.metaPillSoft]}>
                <Text style={[styles.metaPillText, styles.metaPillTextSoft]}>{item.year}</Text>
              </View>
            </View>

            <Text style={styles.questionTitle}>Q{item.questionNumber}. {item.question}</Text>

            {item.options.map(option => (
              <View key={option} style={styles.optionRow}>
                <View style={styles.optionDot} />
                <Text style={styles.optionText}>{option}</Text>
              </View>
            ))}

            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Answer</Text>
              <Text style={styles.answerValue}>{item.answer}</Text>
            </View>

            <Text style={styles.explanationText}>{item.explanation}</Text>
          </View>
        )}
        ListFooterComponent={
          filteredQuestions.length > visibleCount ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              activeOpacity={0.85}
              onPress={() => setVisibleCount(current => Math.min(current + 5, filteredQuestions.length))}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No questions found</Text>
            <Text style={styles.emptyText}>Try another year or course filter.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 20,
    marginTop: 14,
  },
  dropdownWrap: {
    flex: 1,
  },
  dropdownLabel: {
    color: theme.colors.text,
    fontFamily: Fonts.intersemibold,
    fontSize: 13,
    marginBottom: 8,
  },
  dropdownButton: {
    minHeight: 48,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: Fonts.intermedium,
    fontSize: 14,
    marginRight: 8,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4FB',
  },
  dropdownItemText: {
    color: theme.colors.text,
    fontFamily: Fonts.interregular,
    fontSize: 13,
  },
  dropdownItemTextActive: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  questionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  questionMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E9F4FF',
  },
  metaPillSoft: {
    backgroundColor: '#F3F6FB',
  },
  metaPillText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
    fontSize: 11,
  },
  metaPillTextSoft: {
    color: theme.colors.textLight,
  },
  questionTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  optionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 7,
    marginRight: 10,
  },
  optionText: {
    flex: 1,
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 14,
    lineHeight: 20,
  },
  answerBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#EAF9F2',
    marginBottom: 10,
  },
  answerLabel: {
    color: '#15803D',
    fontFamily: Fonts.intersemibold,
    fontSize: 12,
    marginBottom: 4,
  },
  answerValue: {
    color: '#166534',
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
  },
  explanationText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 13,
    lineHeight: 19,
  },
  loadMoreButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  loadMoreText: {
    color: theme.colors.white,
    fontFamily: Fonts.interbold,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 13,
    textAlign: 'center',
  },
});
