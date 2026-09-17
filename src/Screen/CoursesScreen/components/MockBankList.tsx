import React from 'react';
import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, FlatList, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { Fonts } from '../../../Themes';
import { styles } from '../coursesStyles';
import {
    getBundlePayload,
    getBundleId,
    getBundleMockCount,
    getQuizTotalMarks,
    getQuizQuestionCount,
    getQuizMarksPerQuestion,
} from '../utils/courseHelpers';
import { useCoursePagination } from '../hooks/useCoursePagination';

export function MockBankList({
    showingSubBundle,
    filteredSubBundleItems,
    filteredDetailQuizGroups,
    mockMarkingMap,
    canAttemptMocks,
    isEnrollingBundle,
    handleQuizAction,
    handleSubBundlePress,
    normalizedDetailSearchQuery,
    header,
    onVisibleQuizzes,
    scrollOffset,
}: any) {
    const subBundles = !showingSubBundle && filteredSubBundleItems.length > 0;
    const rows = useMemo(() => {
        const result: any[] = [];
        const groups = subBundles
            ? [{ title: '', quizzes: filteredSubBundleItems }]
            : filteredDetailQuizGroups;
        groups.forEach((group: any, groupIndex: number) => {
            for (let index = 0; index < group.quizzes.length; index += 2) {
                result.push({
                    key: `${groupIndex}:${index}`,
                    title: group.title,
                    first: index === 0,
                    index,
                    items: group.quizzes.slice(index, index + 2),
                });
            }
        });
        return result;
    }, [subBundles, filteredSubBundleItems, filteredDetailQuizGroups]);
    // Each virtual row contains at most two cards: five rows expose ten records.
    const pagination = useCoursePagination(rows, 5);
    useEffect(() => {
        onVisibleQuizzes(subBundles ? [] : pagination.visibleData.flatMap((row) => row.items));
    }, [onVisibleQuizzes, pagination.visibleData, subBundles]);
    const renderCard = (item: any, index: number) => {
        if (subBundles) {
            const normalizedSubBundle = getBundlePayload(item);
            const mockCount = getBundleMockCount(normalizedSubBundle);
            return (
                <Pressable
                    key={String(getBundleId(normalizedSubBundle) || index)}
                    style={styles.quizCardPressable}
                    onPress={() => handleSubBundlePress(normalizedSubBundle)}
                >
                    <View style={styles.quizCard}>
                        {/* No SUB-BUNDLE badge displayed */}

                        <Text style={styles.quizCardTitle}>
                            {normalizedSubBundle?.title ||
                                normalizedSubBundle?.name ||
                                `Sub Bundle ${index + 1}`}
                        </Text>

                        <View style={styles.quizMetaRow}>
                            <View style={styles.quizMetaItem}>
                                <Feather name="layers" size={normalize(14)} color="#667085" />
                                <Text style={styles.quizMetaText}>
                                    {mockCount} Mock Test{mockCount === 1 ? '' : 's'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.quizActionButton}>
                            <Text style={styles.quizActionText}>Explore Curriculum</Text>
                            <Feather name="chevron-right" size={normalize(14)} color="#FFFFFF" />
                        </View>
                    </View>
                </Pressable>
            );
        }
        const quiz = item;
        const quizIndex = index;
        const fetchedQuiz = mockMarkingMap[quiz.id || quiz._id || quiz.quizId || quiz.testId];
        const targetQuiz = fetchedQuiz || quiz?.rawQuiz || quiz;
        const calculatedTotalMarks =
            getQuizTotalMarks(targetQuiz) ||
            getQuizQuestionCount(targetQuiz) * (getQuizMarksPerQuestion(targetQuiz) || 1);
        const attemptsDisplay =
            quiz.attempts !== undefined && quiz.attempts !== null
                ? String(quiz.attempts).toLowerCase() === 'unlimited'
                    ? 'Unlimited'
                    : quiz.attempts
                : null;
        return (
            <View key={String(quiz.id || quizIndex)} style={styles.quizCardPressable}>
                <View
                    style={[
                        styles.quizCard,
                        { borderTopWidth: 4, borderTopColor: '#0EA5E9', backgroundColor: '#FFFFFF' },
                    ]}
                >
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.quizCardTitle,
                            { marginBottom: normalize(8), minHeight: normalize(38) },
                        ]}
                    >
                        {quiz.title || quiz.name || 'Mock Bank'}
                    </Text>

                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: normalize(8) }} />

                    <View style={{ gap: normalize(4), marginBottom: normalize(12) }}>
                        {calculatedTotalMarks !== null && calculatedTotalMarks > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather
                                    name="award"
                                    size={normalize(12)}
                                    color="#64748B"
                                    style={{ marginRight: normalize(6) }}
                                />
                                <Text
                                    style={{
                                        fontSize: normalize(11),
                                        color: '#64748B',
                                        fontFamily: Fonts.intermedium,
                                    }}
                                >
                                    Marks:{' '}
                                    <Text style={{ color: '#0F766E', fontWeight: 'bold' }}>
                                        {calculatedTotalMarks}
                                    </Text>
                                </Text>
                            </View>
                        )}
                        {quiz.durationMinutes ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather
                                    name="clock"
                                    size={normalize(12)}
                                    color="#64748B"
                                    style={{ marginRight: normalize(6) }}
                                />
                                <Text
                                    style={{
                                        fontSize: normalize(11),
                                        color: '#64748B',
                                        fontFamily: Fonts.intermedium,
                                    }}
                                >
                                    Time:{' '}
                                    <Text style={{ color: '#0EA5E9', fontWeight: 'bold' }}>
                                        {quiz.durationMinutes}m
                                    </Text>
                                </Text>
                            </View>
                        ) : null}
                        {attemptsDisplay ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather
                                    name="rotate-ccw"
                                    size={normalize(12)}
                                    color="#64748B"
                                    style={{ marginRight: normalize(6) }}
                                />
                                <Text
                                    style={{
                                        fontSize: normalize(11),
                                        color: '#64748B',
                                        fontFamily: Fonts.intermedium,
                                    }}
                                >
                                    Attempts:{' '}
                                    <Text style={{ color: '#D97706', fontWeight: 'bold' }}>
                                        {attemptsDisplay}
                                    </Text>
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {canAttemptMocks ? (
                        <Pressable
                            style={[
                                styles.quizActionButton,
                                isEnrollingBundle && styles.quizActionButtonDisabled,
                            ]}
                            disabled={isEnrollingBundle}
                            onPress={() => handleQuizAction(quiz)}
                        >
                            {isEnrollingBundle ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.quizActionText}>Attempt</Text>
                                    <Feather name="play" size={normalize(14)} color="#FFFFFF" />
                                </>
                            )}
                        </Pressable>
                    ) : (
                        <View style={styles.quizViewOnlyTag}>
                            <Feather name="eye" size={normalize(14)} color="#667085" />
                            <Text style={styles.quizViewOnlyText}>View only</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };
    return (
        <FlatList
            data={pagination.visibleData}
            keyExtractor={(item) => item.key}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            onEndReached={pagination.loadMore}
            onEndReachedThreshold={0.4}
            onScrollBeginDrag={pagination.onScrollBeginDrag}
            onScroll={(event) => {
                pagination.onScroll(event);
                scrollOffset.current = event.nativeEvent.contentOffset.y;
            }}
            contentOffset={{ x: 0, y: scrollOffset.current }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: verticalScale(140) }}
            ListHeaderComponent={
                <>
                    {header}
                    {!subBundles && filteredDetailQuizGroups.length > 0 ? (
                        <>
                            <Text style={styles.sectionTitle}>Mock Bank</Text>
                            <Text style={styles.subjectSubtitle}>
                                {filteredDetailQuizGroups.reduce(
                                    (total: number, group: any) => total + group.quizzes.length,
                                    0,
                                )}{' '}
                                quizzes in this {showingSubBundle ? 'course' : 'category'}
                            </Text>
                        </>
                    ) : null}
                </>
            }
            renderItem={({ item }) => (
                <View style={{ marginBottom: normalize(10) }}>
                    {item.first && !subBundles ? (
                        <View style={styles.topicRow}>
                            <View style={styles.topicDot} />
                            <Text style={styles.topicTitle}>{item.title}</Text>
                        </View>
                    ) : null}
                    <View style={styles.quizCardsWrap}>
                        {item.items.map((entry: any, index: number) => renderCard(entry, item.index + index))}
                    </View>
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.emptyStateBox}>
                    <Feather name="search" size={normalize(24)} color="#94A3B8" />
                    <Text style={styles.emptyStateText}>
                        {normalizedDetailSearchQuery ? 'No matching mock tests found' : 'No Data Available'}
                    </Text>
                </View>
            }
        />
    );
}
