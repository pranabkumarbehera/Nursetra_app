import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../Navigation/RouteNames';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';
import { Header } from '../../Components/headers/Header';
import { EXAM_CATEGORIES, SUBJECT_TESTS } from '../../Constants/dummyData';
import { Button } from '../../Components/buttons/Button';

const difficultyMap = {
  Easy: { accent: '#43C17B', bg: '#ECFBF2' },
  Medium: { accent: '#F2B44A', bg: '#FFF6E5' },
  Hard: { accent: '#B15CFF', bg: '#F2E8FF' },
};

export const SubjectTestsScreen = () => {
  const navigation = useNavigation<any>();
  const filterOptions = ['All', ...EXAM_CATEGORIES.slice(0, 6)];
  const [selectedFilter, setSelectedFilter] = useState('All');

  const visibleTests = selectedFilter === 'All'
    ? SUBJECT_TESTS
    : SUBJECT_TESTS.filter(item => item.exams?.includes(selectedFilter));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerBackground}>
        <Header title="Subject Tests" rightIcon="options-outline" light style={styles.header} />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === item && styles.activeFilterChip]}
              activeOpacity={0.85}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[styles.filterText, selectedFilter === item && styles.activeFilterText]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.statsRow}>
        {[
          ['28', 'Total Tests', theme.colors.primary],
          ['12', 'Completed', theme.colors.success],
          ['16', 'Pending', theme.colors.warning],
        ].map(([value, label, color]) => (
          <View key={label} style={styles.statBox}>
            <Text style={[styles.statNumber, { color: color as string }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={visibleTests}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tests found</Text>
            <Text style={styles.emptyText}>Try another course filter to see available subject tests.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const badge = difficultyMap[item.difficulty as keyof typeof difficultyMap];
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <Icon name="book-outline" size={22} color={badge.accent} />
                </View>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.subjectTitle}>{item.subject}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Icon name="time-outline" size={14} color={theme.colors.textLight} />
                      <Text style={styles.metaText}>{item.questions}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="timer-outline" size={14} color={theme.colors.textLight} />
                      <Text style={styles.metaText}>{item.duration}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.accent }]}>{item.difficulty}</Text>
                </View>
              </View>

              <Button 
                title="Start Test" 
                onPress={() => navigation.navigate(ROUTES.MOCK_TEST_SCREEN)} 
                style={[styles.startButton, { backgroundColor: badge.accent }]}
                textStyle={styles.startButtonText}
              />
            </View>
          );
        }}
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
    paddingBottom: 16,
  },
  header: {
    backgroundColor: 'transparent',
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  activeFilterChip: {
    backgroundColor: theme.colors.white,
  },
  filterText: {
    color: theme.colors.white,
    fontFamily: Fonts.intersemibold,
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: theme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statBox: {
    width: '31%',
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
    shadowColor: '#9DB8DB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 4,
  },
  statNumber: {
    fontFamily: Fonts.interbold,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.textLight,
    fontFamily: Fonts.intermedium,
    fontSize: 11,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 14,
    shadowColor: '#A9BEDD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#F5FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitleWrap: {
    flex: 1,
  },
  subjectTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 12,
    marginLeft: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  startButton: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    shadowOpacity: 0.1,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
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
