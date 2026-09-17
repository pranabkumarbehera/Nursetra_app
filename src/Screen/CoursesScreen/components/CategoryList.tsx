import React from 'react';
import { useMemo } from 'react';
import { View, Text, Pressable, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { SubjectBankSkeleton } from '../../../Components/LoadingSkeletons';
import { styles } from '../coursesStyles';
import { QBankBundleCard } from './QBankBundleCard';
import { PaginatedList } from './PaginatedList';
import {
    buildCategoryGroups,
    SUBJECT_CARD_THEMES,
    SEGMENT_THEMES,
    getCategoryIconName,
    getBundlePayload,
    getBundleId,
    getBundleQuizzes,
    getQuizId,
} from '../utils/courseHelpers';

const EMPTY_ROWS: any[] = [];

export const CategoryList = React.memo(function CategoryList({
    moduleOptions,
    bundleItems,
    apiCategories,
    mainTab,
    setMainTab,
    expandedCategory,
    setExpandedCategory,
    viewMoreStates,
    setViewMoreStates,
    canUseCategoryExam,
    showCategoryExamInfo,
    enrolledBundleOverrides,
    failedPendingBundleIds,
    enrolledBundleIds,
    paymentHistoryLoading,
    pendingEnrollmentId,
    openBundleDetails,
    navigation,
    subjectBankSkeletonVisible,
    insets,
    scrollOffset,
    paginationMemory,
    searchKey,
    onRetry,
}: any) {
    const categories = useMemo(
        () => buildCategoryGroups(bundleItems, moduleOptions, mainTab, apiCategories),
        [moduleOptions, bundleItems, apiCategories, mainTab],
    );
    const rows = useMemo(
        () =>
            categories.flatMap((category: any) => {
                const { title, bundles } = category;
                const result: any[] = [{ kind: 'category', key: `category:${title}`, category }];
                if (expandedCategory === title) {
                    bundles
                        .slice(0, viewMoreStates[title] ? undefined : 2)
                        .forEach((bundle: any, index: number) => {
                            result.push({
                                kind: 'bundle',
                                key: `bundle:${title}:${getBundleId(bundle) || index}`,
                                category,
                                bundle,
                                index,
                            });
                        });
                    if (bundles.length > 2) result.push({ kind: 'more', key: `more:${title}`, category });
                }
                return result;
            }),
        [categories, expandedCategory, viewMoreStates],
    );
    const renderItem = ({ item }: any) => {
        const { title, index, bundles: uniqueMatchingBundles } = item.category;
        const theme = SUBJECT_CARD_THEMES[index % SUBJECT_CARD_THEMES.length];
        const accentColor = ['#2FB0FF', '#63D1D2', '#FFB648', '#B27EFF', '#FF7A7A'][index % 5];
        const iconName = getCategoryIconName(title, mainTab);
        if (item.kind === 'category')
            return (
                <Pressable
                    style={styles.qBankCardPressable}
                    onPress={() => {
                        setExpandedCategory(expandedCategory === title ? null : title);
                    }}
                >
                    <LinearGradient
                        colors={theme.colors as [string, string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.qBankCard, { shadowColor: accentColor }]}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.16)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.qBankIconContainer,
                                {
                                    shadowColor: '#0F172A',
                                },
                            ]}
                        >
                            <View style={[styles.qBankIconInner, { backgroundColor: theme.tint }]}>
                                <Ionicons name={iconName} size={normalize(22)} color="#FFFFFF" />
                            </View>
                        </LinearGradient>
                        <View style={styles.qBankCardContent}>
                            <Text style={[styles.qBankCardTitle, styles.qBankCardTitleLight]}>{title}</Text>
                            <Text style={[styles.qBankCardSubtitle, styles.qBankCardSubtitleLight]}>
                                Tap to explore
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={normalize(20)} color="#FFFFFF" />
                    </LinearGradient>
                </Pressable>
            );
        if (item.kind === 'more')
            return (
                <TouchableOpacity
                    style={styles.viewMoreBtn}
                    onPress={() => {
                        setViewMoreStates((prev: Record<string, boolean>) => ({
                            ...prev,
                            [title]: !prev[title],
                        }));
                    }}
                >
                    <Text style={styles.viewMoreBtnText}>
                        {viewMoreStates[title]
                            ? 'View Less'
                            : `View More (${uniqueMatchingBundles.length - 2})`}
                    </Text>
                    <Feather
                        name={viewMoreStates[title] ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#1D4ED8"
                    />
                </TouchableOpacity>
            );
        const bundle = item.bundle;
        const bIndex = item.index;
        const normalizedBundle = getBundlePayload(bundle);
        const bundleId = String(getBundleId(normalizedBundle) || bIndex);
        const hasEnrolledAccess =
            enrolledBundleOverrides.has(bundleId) ||
            (!failedPendingBundleIds.has(bundleId) &&
                (Boolean(normalizedBundle?.isEnrolled) || enrolledBundleIds.includes(bundleId)));
        const isProcessing = paymentHistoryLoading || pendingEnrollmentId === bundleId;
        return (
            <QBankBundleCard
                key={bundleId}
                bundle={bundle}
                index={bIndex}
                isEnrolled={hasEnrolledAccess}
                isPending={isProcessing}
                onView={() => openBundleDetails(bundle, 'view')}
                onEnroll={() => openBundleDetails(bundle, 'enroll')}
                onBuyAndEnroll={() => openBundleDetails(bundle, 'enroll')}
                onMock={() => {
                    const quizzes = getBundleQuizzes(normalizedBundle);
                    if (quizzes.length > 0) {
                        navigation.navigate('MockTestRules', {
                            testId: getQuizId(quizzes[0]),
                            testData: quizzes[0],
                        });
                    } else {
                        Toast.show({ type: 'info', text1: 'No Mock Tests available for this course yet.' });
                    }
                }}
            />
        );
    };
    return (
        <PaginatedList
            data={subjectBankSkeletonVisible ? EMPTY_ROWS : rows}
            paginationKey={`${mainTab}:${searchKey}`}
            paginationMemory={paginationMemory}
            keyExtractor={(item: any) => item.key}
            renderItem={renderItem}
            contentOffset={{ x: 0, y: scrollOffset.current }}
            onScroll={(event) => {
                scrollOffset.current = event.nativeEvent.contentOffset.y;
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
                styles.qBankSurfaceCard,
                { paddingBottom: Math.max(insets.bottom + verticalScale(112), verticalScale(140)) },
            ]}
            ListHeaderComponent={
                <View style={styles.segmentedControl}>
                        <Pressable style={styles.segmentButtonWrap} onPress={() => setMainTab('exam')}>
                            <LinearGradient
                                colors={
                                    mainTab === 'exam'
                                        ? (SEGMENT_THEMES[0].colors as [string, string])
                                        : ['#F8FAFC', '#FFFFFF']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[
                                    styles.segmentButton,
                                    mainTab === 'exam' && canUseCategoryExam && styles.segmentButtonActive,
                                    { borderColor: SEGMENT_THEMES[0].border },
                                ]}
                            >
                                <View style={styles.segmentTextRow}>
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            mainTab === 'exam' &&
                                                canUseCategoryExam &&
                                                styles.segmentTextActive,
                                        ]}
                                    >
                                        By Category Exam
                                    </Text>
                                    <Pressable
                                        hitSlop={10}
                                        onPress={(e) => {
                                            e?.stopPropagation?.();
                                            showCategoryExamInfo();
                                        }}
                                        style={styles.segmentInfoButton}
                                    >
                                        <Ionicons
                                            name="information-circle-outline"
                                            size={normalize(14)}
                                            color={
                                                mainTab === 'exam' && canUseCategoryExam
                                                    ? '#FFFFFF'
                                                    : '#1D4ED8'
                                            }
                                        />
                                    </Pressable>
                                </View>
                            </LinearGradient>
                        </Pressable>
                        <Pressable style={styles.segmentButtonWrap} onPress={() => setMainTab('subject')}>
                            <LinearGradient
                                colors={
                                    mainTab === 'subject'
                                        ? (SEGMENT_THEMES[1].colors as [string, string])
                                        : ['#F8FAFC', '#FFFFFF']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[
                                    styles.segmentButton,
                                    mainTab === 'subject' && styles.segmentButtonActive,
                                    { borderColor: SEGMENT_THEMES[1].border },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.segmentText,
                                        mainTab === 'subject' && styles.segmentTextActive,
                                    ]}
                                >
                                    By Subject
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
            }
            ListEmptyComponent={
                subjectBankSkeletonVisible ? (
                    <SubjectBankSkeleton />
                ) : (
                    <View style={styles.emptyStateBox}>
                        <Text style={styles.emptyStateText}>No matching subjects or exams found</Text>
                        {!searchKey ? (
                            <TouchableOpacity style={styles.viewMoreBtn} onPress={onRetry}>
                                <Text style={styles.viewMoreBtnText}>Retry</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                )
            }
        />
    );
});
