import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';
import { Header } from '../../Components/headers/Header';
import { Input } from '../../Components/inputs/Input';
import { QUESTION_BANK_CATEGORIES, SUBJECT_TESTS } from '../../Constants/dummyData';
import { ROUTES } from '../../Navigation/RouteNames';


const isNorcertDhmakaLabel = (value: string = '') => /norcert\s*(dhamaka|dhmaka)/i.test(String(value || '').trim());
export const QuestionBankScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedExam, setSelectedExam] = useState('All');
  const [selectedMode, setSelectedMode] = useState<'category' | 'subject'>('category');
  const [searchQuery, setSearchQuery] = useState('');

  const subjectItems = useMemo(
    () =>
      SUBJECT_TESTS.map((item, index) => ({
        id: `subject-${item.id}`,
        title: item.subject,
        count: item.questions,
        icon: index % 2 === 0 ? 'book-outline' : 'library-outline',
        accent: ['#2FB0FF', '#63D1D2', '#FFB648', '#B27EFF', '#FF7A7A'][index % 5],
        exams: item.exams,
      })),
    []
  );

  const categoryExamItems = useMemo(
    () => QUESTION_BANK_CATEGORIES,
    []
  );

  const subjectModeItems = useMemo(
    () => subjectItems.filter(item => !isNorcertDhmakaLabel(item.title)),
    [subjectItems]
  );

  const listData = useMemo(() => {
    const source = selectedMode === 'category' ? categoryExamItems : subjectModeItems;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return source.filter(item => {
      const matchesExam =
        selectedExam === 'All' ||
        item.exams?.includes(selectedExam) ||
        item.exams?.includes('All');
      const matchesSearch =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.count.toLowerCase().includes(normalizedQuery);

      return matchesExam && matchesSearch;
    });
  }, [searchQuery, selectedExam, selectedMode, categoryExamItems, subjectModeItems]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerBackground}>
        <Header title="Q.Bank" rightIcon="options-outline" light style={styles.header} />

        <View style={styles.searchWrap}>
          <Input
            placeholder="Search questions, topics..."
            leftIcon="search-outline"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.zeroMargin}
            inputContainerStyle={styles.searchInput}
            inputStyle={styles.searchText}
          />
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentButton, selectedMode === 'category' && styles.segmentButtonActive]}
                onPress={() => setSelectedMode('category')}
              >
                <Text style={[styles.segmentText, selectedMode === 'category' && styles.segmentTextActive]}>By Category Exam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, selectedMode === 'subject' && styles.segmentButtonActive]}
                onPress={() => setSelectedMode('subject')}
              >
                <Text style={[styles.segmentText, selectedMode === 'subject' && styles.segmentTextActive]}>By Subject</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={listData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.84}
            onPress={() => {
              if (item.title === 'Previous Year') {
                navigation.navigate(ROUTES.PREVIOUS_YEAR_QUESTIONS);
              }
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${item.accent}18` }]}>
              <Icon name={item.icon as any} size={24} color={item.accent} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.count}</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={[styles.countText, { color: item.accent }]}>{item.count.split(' ')[0]}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try another exam filter, mode, or search keyword.</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBackground: {
    backgroundColor: theme.colors.primary,
    paddingBottom: 0,
  },
  header: {
    backgroundColor: 'transparent',
  },
  searchWrap: {
    paddingHorizontal: 10,
    marginTop: 4,
  },
  zeroMargin: {
    marginBottom: 0,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E6F8',
  },
  searchText: {
    color: theme.colors.text,
  },
  filterList: {
    paddingHorizontal: 10,
    paddingTop: 14,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.text,
    fontFamily: Fonts.intersemibold,
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: theme.colors.white,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.intersemibold,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: theme.colors.white,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 14,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 14,
    borderRadius: 18,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 12,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F7FAFF',
  },
  countText: {
    fontFamily: Fonts.interbold,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
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
