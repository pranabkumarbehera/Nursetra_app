import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    LayoutAnimation,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Colorpath from '../Themes/Colorpath';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';
import { getApi } from '../Utils/Helpers/ApiRequest';
import { RootState } from '../Redux/Store';
import { CategoriesModalSkeleton, SkeletonBlock, SkeletonLine } from './LoadingSkeletons';
import { ROUTES } from '../Navigation/RouteNames';
import { useSelector } from 'react-redux';
import { getNursingSubjectName, sortNursingSubjects } from '../Utils/Constants/Subjects';

type CategoryItem = {
    id: string;
    label: string;
    raw: any;
};

const DEFAULT_PREVIEW_COUNT = 5;

let categoriesCache: CategoryItem[] | null = null;
const subCategoriesCache = new Map<string, CategoryItem[]>();

const extractItems = (source: any): any[] => {
    if (Array.isArray(source)) {
        return source;
    }

    return (
        source?.data?.modules ||
        source?.modules ||
        source?.data?.items ||
        source?.items ||
        source?.data ||
        []
    );
};

const getItemId = (item: any, index: number) => String(item?.id || item?._id || item?.moduleId || item?.module_id || index);

const getItemLabel = (item: any, fallback: string) => String(
    item?.name ||
    item?.title ||
    item?.moduleName ||
    item?.module_name ||
    item?.label ||
    fallback
);

type CategoriesFABProps = {
    bottomOffset?: number;
    rightOffset?: number;
};

const SubCategorySkeleton = memo(() => {
    return (
        <View style={styles.subCategorySkeletonWrap}>
            <SkeletonLine width="44%" height={16} />
            <View style={styles.subCategorySkeletonList}>
                <SkeletonBlock style={styles.subCategorySkeletonItem} />
                <SkeletonBlock style={styles.subCategorySkeletonItem} />
                <SkeletonBlock style={styles.subCategorySkeletonItem} />
            </View>
        </View>
    );
});

type CategoryCardProps = {
    item: CategoryItem;
    isSelected: boolean;
    isExpanded: boolean;
    onPress: (item: CategoryItem) => void;
    onTogglePreview: (categoryId: string, totalCount: number) => void;
    previewItems: CategoryItem[];
    visibleCount: number;
    onSubCategoryPress: (category: CategoryItem, subCategory: CategoryItem) => void;
    loadingSubCategories: boolean;
};

const CategoryCard = memo(({
    item,
    isSelected,
    isExpanded,
    onPress,
    onTogglePreview,
    previewItems,
    visibleCount,
    onSubCategoryPress,
    loadingSubCategories,
}: CategoryCardProps) => {
    return (
        <Pressable onPress={() => onPress(item)} style={styles.categoryCardPressable}>
            <LinearGradient
                colors={isSelected ? ['#0F766E', '#14B8A6'] : ['#FFFFFF', '#F8FAFC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.categoryCard, isSelected && styles.categoryCardActive]}
            >
                <View style={styles.categoryCardTopRow}>
                    <View style={[styles.categoryIconWrap, isSelected && styles.categoryIconWrapActive]}>
                        <Feather
                            name={isSelected ? 'layers' : 'grid'}
                            size={normalize(18)}
                            color={isSelected ? '#FFFFFF' : Colorpath.Primary}
                        />
                    </View>

                    <View style={styles.categoryCardTextWrap}>
                        <Text style={[styles.categoryCardTitle, isSelected && styles.categoryCardTitleActive]} numberOfLines={1}>
                            {item.label}
                        </Text>
                        <Text style={[styles.categoryCardSubtitle, isSelected && styles.categoryCardSubtitleActive]}>
                            {isExpanded ? 'Tap sub-categories below or choose from the modal' : 'Tap to expand'}
                        </Text>
                    </View>

                    <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={normalize(18)}
                        color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                    />
                </View>

                {isExpanded ? (
                    <View style={styles.expandedSection}>
                        <View style={styles.expandedSectionHeader}>
                        <Text style={[styles.expandedSectionTitle, isSelected && styles.categoryCardTitleActive]}>
                            Sub-Categories
                        </Text>
                            <View style={styles.expandedCountPill}>
                                <Text style={styles.expandedCountText}>{previewItems.length}</Text>
                            </View>
                        </View>

                        {loadingSubCategories ? (
                            <SubCategorySkeleton />
                        ) : previewItems.length === 0 ? (
                            <View style={styles.emptyWrap}>
                                <Feather name="inbox" size={normalize(18)} color="#94A3B8" />
                                <Text style={styles.emptyText}>No sub-categories available.</Text>
                            </View>
                        ) : (
                            <View style={styles.previewList}>
                                {previewItems.slice(0, visibleCount).map((subCategory) => (
                                    <Pressable
                                        key={subCategory.id}
                                        onPress={(event) => {
                                            event?.stopPropagation?.();
                                            onSubCategoryPress(item, subCategory);
                                        }}
                                        style={styles.previewItemPressable}
                                    >
                                        <LinearGradient
                                            colors={['#FFFFFF', '#F8FAFC']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.previewItem}
                                        >
                                            <View style={styles.previewItemDot} />
                                            <Text style={styles.previewItemText} numberOfLines={1}>
                                                {subCategory.label}
                                            </Text>
                                            <Feather name="check" size={normalize(15)} color={Colorpath.Primary} />
                                        </LinearGradient>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {previewItems.length > DEFAULT_PREVIEW_COUNT ? (
                            <Pressable
                                onPress={(event) => {
                                    event?.stopPropagation?.();
                                    onTogglePreview(item.id, previewItems.length);
                                }}
                                style={styles.moreToggle}
                            >
                                <Text style={styles.moreToggleText}>
                                    {visibleCount >= previewItems.length ? 'View Less' : 'View More'}
                                </Text>
                                <Feather
                                    name={visibleCount >= previewItems.length ? 'chevron-up' : 'chevron-down'}
                                    size={normalize(15)}
                                    color={Colorpath.Primary}
                                />
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}
            </LinearGradient>
        </Pressable>
    );
});

export const CategoriesFAB = memo(({ bottomOffset = 20, rightOffset = 20 }: CategoriesFABProps) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const authToken = useSelector((state: RootState) => state.AuthReducer.token);

    const [visible, setVisible] = useState(false);
    const [categories, setCategories] = useState<CategoryItem[]>(categoriesCache || []);
    const [subCategories, setSubCategories] = useState<CategoryItem[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubCategories, setLoadingSubCategories] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoriesCache?.[0]?.id || null);
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string>(categoriesCache?.[0]?.label || '');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
    const [previewCountByCategory, setPreviewCountByCategory] = useState<Record<string, number>>({});
    const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);
    const [subCategoryModalCategory, setSubCategoryModalCategory] = useState<CategoryItem | null>(null);
    const [subCategoryError, setSubCategoryError] = useState<string | null>(null);
    const [coachHiddenByScroll, setCoachHiddenByScroll] = useState(false);
    const coachMarkVisible = !coachHiddenByScroll;

    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const coachOpacity = useRef(new Animated.Value(0)).current;
    const coachTranslate = useRef(new Animated.Value(8)).current;
    const coachMomentumScrollActive = useRef(false);

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
            tension: 120,
        }).start();
    }, [scaleAnim]);

    useEffect(() => {
        Animated.timing(coachOpacity, {
            toValue: coachMarkVisible ? 1 : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
        Animated.timing(coachTranslate, {
            toValue: coachMarkVisible ? 0 : 8,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [coachMarkVisible, coachOpacity, coachTranslate]);

    const ensureCategories = useCallback(async () => {
        if (categoriesCache) {
            setCategories(categoriesCache);
            return categoriesCache;
        }

        setLoadingCategories(true);
        try {
        const response = await getApi('student/modules', { authorization: authToken });
            const items = sortNursingSubjects(
                extractItems(response?.data)
                .map((item: any, index: number) => ({
                    id: getItemId(item, index),
                    label: getNursingSubjectName(getItemLabel(item, `Category ${index + 1}`)),
                    raw: item,
                }))
                .filter((item: CategoryItem) => item.id),
                (item) => item.label,
            );
            categoriesCache = items;
            setCategories(items);
            return items;
        } finally {
            setLoadingCategories(false);
        }
    }, [authToken]);

    const ensureSubCategories = useCallback(async (moduleId: string) => {
        if (!moduleId) {
            setSubCategories([]);
            return [];
        }

        const cached = subCategoriesCache.get(moduleId);
        if (cached) {
            setSubCategories(cached);
            return cached;
        }

        setLoadingSubCategories(true);
        setSubCategoryError(null);
        try {
            const response = await getApi(`student/sub-modules?moduleId=${encodeURIComponent(moduleId)}`, { authorization: authToken });
            const items = sortNursingSubjects(
                extractItems(response?.data)
                .map((item: any, index: number) => ({
                    id: getItemId(item, index),
                    label: getNursingSubjectName(getItemLabel(item, `Sub Category ${index + 1}`)),
                    raw: item,
                }))
                .filter((item: CategoryItem) => item.id),
                (item) => item.label,
            );
            subCategoriesCache.set(moduleId, items);
            setSubCategories(items);
            return items;
        } catch (error: any) {
            setSubCategories([]);
            setSubCategoryError(error?.response?.data?.message || 'Failed to fetch sub-categories');
            throw error;
        } finally {
            setLoadingSubCategories(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        ensureCategories();
    }, [ensureCategories, visible]);

    const dismissCoachMark = useCallback(() => {
        setCoachHiddenByScroll(true);
    }, []);

    const handleCoachScrollBegin = useCallback(() => {
        setCoachHiddenByScroll(true);
    }, []);

    const handleCoachScrollEndDrag = useCallback(() => {
        if (!coachMomentumScrollActive.current) {
            setCoachHiddenByScroll(false);
        }
    }, []);

    const handleCoachMomentumScrollBegin = useCallback(() => {
        coachMomentumScrollActive.current = true;
        setCoachHiddenByScroll(true);
    }, []);

    const handleCoachMomentumScrollEnd = useCallback(() => {
        coachMomentumScrollActive.current = false;
        setCoachHiddenByScroll(false);
    }, []);

    const openCategories = useCallback(async () => {
        if (coachMarkVisible) {
            dismissCoachMark();
        }
        setSubCategoryModalVisible(false);
        setVisible(true);
        ensureCategories();
    }, [coachMarkVisible, dismissCoachMark, ensureCategories]);

    const closeCategories = useCallback(() => {
        setVisible(false);
        setSubCategoryModalVisible(false);
    }, []);

    const openMockBank = useCallback((categoryId: string, subCategoryId?: string | null) => {
        closeCategories();
        setSubCategoryModalVisible(false);
        navigation.navigate(ROUTES.SUBJECT_TESTS, {
            selectedCategoryId: categoryId,
            selectedSubCategoryId: subCategoryId || null,
        });
    }, [closeCategories, navigation]);

    const handleCategoryPress = useCallback(async (category: CategoryItem) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedCategoryId(category.id);
        setSelectedCategoryLabel(category.label);
        setSelectedSubCategoryId(null);
        setPreviewCountByCategory(prev => ({
            ...prev,
            [category.id]: prev[category.id] || DEFAULT_PREVIEW_COUNT,
        }));

        try {
            const items = await ensureSubCategories(category.id);
            if (items.length > 0) {
                setSubCategoryModalCategory(category);
                setSubCategoryModalVisible(true);
                return;
            }

            openMockBank(category.id, null);
        } catch {
            // Error UI is already shown in the sub-category modal.
            setSubCategoryModalCategory(category);
            setSubCategoryModalVisible(true);
        }
    }, [ensureSubCategories, openMockBank]);

    const handleSubCategoryPress = useCallback((category: CategoryItem, subCategory: CategoryItem) => {
        setSelectedCategoryId(category.id);
        setSelectedCategoryLabel(category.label);
        setSelectedSubCategoryId(subCategory.id);
        openMockBank(category.id, subCategory.id);
    }, [openMockBank]);

    const togglePreview = useCallback((categoryId: string, totalCount: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPreviewCountByCategory(prev => {
            const current = prev[categoryId] || DEFAULT_PREVIEW_COUNT;
            const next = current >= totalCount ? DEFAULT_PREVIEW_COUNT : totalCount;
            return { ...prev, [categoryId]: next };
        });
    }, []);

    const handleFabPress = useCallback(() => {
        if (coachMarkVisible) {
            dismissCoachMark();
        }
        openCategories();
    }, [coachMarkVisible, dismissCoachMark, openCategories]);

    const activePreviewCount = useCallback((categoryId: string) => {
        return previewCountByCategory[categoryId] || DEFAULT_PREVIEW_COUNT;
    }, [previewCountByCategory]);

    const selectedCategoryItems = useMemo(() => {
        return categories.map(category => ({
            ...category,
            isSelected: category.id === selectedCategoryId,
            isExpanded: category.id === selectedCategoryId,
        }));
    }, [categories, selectedCategoryId]);

    const subCategoryModalItems = useMemo(() => subCategories, [subCategories]);

    const renderCoachMark = coachMarkVisible ? (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.coachOverlay,
                {
                    opacity: coachOpacity,
                    transform: [{ translateY: coachTranslate }],
                },
            ]}
        >
            <Pressable style={styles.coachBackdrop} onPressIn={dismissCoachMark} />
            <View style={styles.coachWrap} pointerEvents="box-none">
                <View style={styles.coachBubble}>
                    <Text style={styles.coachTitle}>Tap here to explore Categories & Sub-Categories</Text>
                    <Pressable onPress={dismissCoachMark} style={styles.coachButton}>
                        <Text style={styles.coachButtonText}>Got it</Text>
                    </Pressable>
                </View>
                <View style={styles.coachPointer} />
            </View>
        </Animated.View>
    ) : null;

    return (
        <>
            <Animated.View
                pointerEvents="box-none"
                style={[
                    styles.fabContainer,
                    {
                        right: rightOffset,
                        bottom: bottomOffset + insets.bottom,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Pressable onPress={handleFabPress} style={styles.fabButton}>
                    <Feather name="grid" size={normalize(22)} color="#FFFFFF" />
                </Pressable>
            </Animated.View>

            {renderCoachMark}

            <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={closeCategories}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>Categories</Text>
                            <Text style={styles.modalSubtitle}>Browse categories and sub-categories</Text>
                        </View>
                        <Pressable onPress={closeCategories} style={styles.closeButton}>
                            <Feather name="x" size={normalize(22)} color="#0F172A" />
                        </Pressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        onScrollBeginDrag={handleCoachScrollBegin}
                        onScrollEndDrag={handleCoachScrollEndDrag}
                        onMomentumScrollBegin={handleCoachMomentumScrollBegin}
                        onMomentumScrollEnd={handleCoachMomentumScrollEnd}
                    >
                        {loadingCategories && categories.length === 0 ? (
                            <CategoriesModalSkeleton />
                        ) : selectedCategoryItems.length === 0 ? (
                            <View style={styles.emptyWrap}>
                                <Feather name="inbox" size={normalize(20)} color="#94A3B8" />
                                <Text style={styles.emptyText}>No categories available.</Text>
                            </View>
                        ) : (
                            selectedCategoryItems.map((item) => {
                                const previewItems = item.id === selectedCategoryId ? subCategoryModalItems : [];
                                const visibleCount = activePreviewCount(item.id);
                                return (
                                    <CategoryCard
                                        key={item.id}
                                        item={item}
                                        isSelected={item.isSelected}
                                        isExpanded={item.isExpanded}
                                        onPress={handleCategoryPress}
                                        onTogglePreview={togglePreview}
                                        previewItems={previewItems}
                                        visibleCount={visibleCount}
                                onSubCategoryPress={handleSubCategoryPress}
                                loadingSubCategories={loadingSubCategories && item.id === selectedCategoryId}
                            />
                                );
                            })
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <Modal visible={subCategoryModalVisible} transparent animationType="fade" onRequestClose={() => setSubCategoryModalVisible(false)}>
                <View style={styles.subModalBackdrop}>
                    <Pressable style={styles.subModalBackdropPressable} onPress={() => setSubCategoryModalVisible(false)} />
                    <View style={styles.subModalSheet}>
                        <View style={styles.subModalHandle} />
                    <View style={styles.subModalHeader}>
                        <View style={styles.subModalHeaderTextWrap}>
                                <Text style={styles.subModalTitle}>Choose a Sub-Category</Text>
                                <Text style={styles.subModalMessage}>Please select a Sub-Category to continue.</Text>
                            </View>
                            <View style={styles.subModalHeaderActions}>
                                <View style={styles.subModalCategoryPill}>
                                    <Text style={styles.subModalCategoryPillText} numberOfLines={1}>
                                        {subCategoryModalCategory?.label || selectedCategoryLabel}
                                    </Text>
                                </View>
                                <Pressable onPress={() => setSubCategoryModalVisible(false)} style={styles.subModalCloseButton}>
                                    <Feather name="x" size={normalize(18)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </View>

                        {loadingSubCategories && subCategoryModalItems.length === 0 ? (
                            <View style={styles.subCategoryLoadingWrap}>
                                <SkeletonLine width="100%" height={72} />
                                <SkeletonLine width="100%" height={72} style={{ marginTop: verticalScale(12) }} />
                                <SkeletonLine width="100%" height={72} style={{ marginTop: verticalScale(12) }} />
                            </View>
                        ) : subCategoryError ? (
                            <View style={styles.errorWrap}>
                                <Feather name="alert-triangle" size={normalize(20)} color="#EF4444" />
                                <Text style={styles.errorText}>{subCategoryError}</Text>
                                <Pressable
                                    onPress={async () => {
                                        if (subCategoryModalCategory) {
                                            await handleCategoryPress(subCategoryModalCategory);
                                        }
                                    }}
                                    style={styles.retryButton}
                                >
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.subCategoryList}
                                onScrollBeginDrag={handleCoachScrollBegin}
                                onScrollEndDrag={handleCoachScrollEndDrag}
                                onMomentumScrollBegin={handleCoachMomentumScrollBegin}
                                onMomentumScrollEnd={handleCoachMomentumScrollEnd}
                            >
                                {subCategoryModalItems.map((subCategory) => {
                                    const isSelected = selectedSubCategoryId === subCategory.id;
                                    return (
                                        <Pressable
                                            key={subCategory.id}
                                            onPress={() => {
                                                if (subCategoryModalCategory) {
                                                    handleSubCategoryPress(subCategoryModalCategory, subCategory);
                                                }
                                            }}
                                            style={styles.subCategoryPressable}
                                        >
                                            <LinearGradient
                                                colors={isSelected ? ['#0F766E', '#14B8A6'] : ['#FFFFFF', '#F8FAFC']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={[styles.subCategoryItem, isSelected && styles.subCategoryItemActive]}
                                            >
                                                <View style={[styles.subCategoryCheck, isSelected && styles.subCategoryCheckActive]}>
                                                    <Feather
                                                        name={isSelected ? 'check' : 'circle'}
                                                        size={normalize(14)}
                                                        color={isSelected ? '#FFFFFF' : Colorpath.Primary}
                                                    />
                                                </View>
                                                <Text style={[styles.subCategoryText, isSelected && styles.subCategoryTextActive]} numberOfLines={1}>
                                                    {subCategory.label}
                                                </Text>
                                                <Feather
                                                    name="chevron-right"
                                                    size={normalize(16)}
                                                    color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                                                />
                                            </LinearGradient>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
});

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        zIndex: 50,
        elevation: 10,
    },
    fabButton: {
        width: normalize(58),
        height: normalize(58),
        borderRadius: normalize(29),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colorpath.Primary,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    coachOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 60,
        elevation: 12,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    coachBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.08)',
    },
    coachWrap: {
        position: 'absolute',
        right: 18,
        bottom: 96,
        alignItems: 'flex-end',
    },
    coachBubble: {
        width: 260,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    coachTitle: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#111827',
        lineHeight: normalize(20),
    },
    coachButton: {
        alignSelf: 'flex-end',
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: Colorpath.Primary,
    },
    coachButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(12),
        fontWeight: '700',
    },
    coachPointer: {
        width: 14,
        height: 14,
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        transform: [{ rotate: '45deg' }],
        marginRight: 16,
        marginTop: -7,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(8),
    },
    modalTitle: {
        fontSize: normalize(24),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    modalSubtitle: {
        marginTop: 4,
        fontSize: normalize(12),
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    closeButton: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    scrollContent: {
        paddingBottom: verticalScale(24),
    },
    categoryCardPressable: {
        marginBottom: verticalScale(12),
    },
    categoryCard: {
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(14),
    },
    categoryCardActive: {
        shadowColor: '#0F766E',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    categoryCardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIconWrap: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(13),
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(12),
    },
    categoryIconWrapActive: {
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    categoryCardTextWrap: {
        flex: 1,
        paddingRight: normalize(10),
    },
    categoryCardTitle: {
        fontSize: normalize(15),
        fontWeight: '800',
        color: '#111827',
    },
    categoryCardTitleActive: {
        color: '#FFFFFF',
    },
    categoryCardSubtitle: {
        marginTop: 3,
        fontSize: normalize(11),
        color: '#6B7280',
    },
    categoryCardSubtitleActive: {
        color: 'rgba(255,255,255,0.82)',
    },
    expandedSection: {
        marginTop: verticalScale(12),
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: 'rgba(229, 231, 235, 0.85)',
    },
    expandedSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(10),
    },
    expandedSectionTitle: {
        fontSize: normalize(13),
        fontWeight: '800',
        color: '#111827',
    },
    expandedCountPill: {
        minWidth: normalize(28),
        height: normalize(24),
        paddingHorizontal: normalize(8),
        borderRadius: 999,
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandedCountText: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    previewList: {
        gap: verticalScale(8),
    },
    previewItemPressable: {
        borderRadius: normalize(14),
        overflow: 'hidden',
    },
    previewItem: {
        minHeight: verticalScale(54),
        borderRadius: normalize(14),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(12),
    },
    previewItemDot: {
        width: normalize(9),
        height: normalize(9),
        borderRadius: normalize(5),
        backgroundColor: Colorpath.Primary,
        marginRight: normalize(10),
    },
    previewItemText: {
        flex: 1,
        fontSize: normalize(13),
        fontWeight: '600',
        color: '#1F2937',
    },
    moreToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingTop: verticalScale(12),
    },
    moreToggleText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    emptyWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: verticalScale(18),
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    emptyText: {
        color: '#64748B',
        fontSize: normalize(13),
        fontWeight: '600',
    },
    subCategorySkeletonWrap: {
        gap: verticalScale(10),
    },
    subCategorySkeletonList: {
        gap: verticalScale(10),
    },
    subCategorySkeletonItem: {
        height: verticalScale(54),
        borderRadius: normalize(14),
    },
    subModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.38)',
        justifyContent: 'flex-end',
    },
    subModalBackdropPressable: {
        ...StyleSheet.absoluteFillObject,
    },
    subModalSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: normalize(28),
        borderTopRightRadius: normalize(28),
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: verticalScale(24),
        maxHeight: '78%',
    },
    subModalHandle: {
        alignSelf: 'center',
        width: 56,
        height: 5,
        borderRadius: 999,
        backgroundColor: '#E5E7EB',
        marginBottom: verticalScale(12),
    },
    subModalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: verticalScale(16),
    },
    subModalHeaderTextWrap: {
        flex: 1,
    },
    subModalHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subModalTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#111827',
    },
    subModalMessage: {
        marginTop: 4,
        fontSize: normalize(13),
        color: '#6B7280',
        lineHeight: normalize(18),
    },
    subModalCategoryPill: {
        maxWidth: '42%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(15, 118, 110, 0.10)',
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.16)',
    },
    subModalCategoryPillText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    subModalCloseButton: {
        width: normalize(34),
        height: normalize(34),
        borderRadius: normalize(17),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subCategoryLoadingWrap: {
        gap: verticalScale(12),
    },
    errorWrap: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: verticalScale(18),
        paddingHorizontal: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        fontSize: normalize(13),
        color: '#991B1B',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: normalize(18),
    },
    retryButton: {
        marginTop: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#991B1B',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(12),
        fontWeight: '800',
    },
    subCategoryList: {
        gap: verticalScale(10),
        paddingBottom: verticalScale(8),
    },
    subCategoryPressable: {
        borderRadius: normalize(16),
        overflow: 'hidden',
    },
    subCategoryItem: {
        minHeight: verticalScale(56),
        borderRadius: normalize(16),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(14),
    },
    subCategoryItemActive: {
        shadowColor: '#0F766E',
        shadowOpacity: 0.14,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    subCategoryCheck: {
        width: normalize(28),
        height: normalize(28),
        borderRadius: normalize(10),
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(12),
    },
    subCategoryCheckActive: {
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    subCategoryText: {
        flex: 1,
        fontSize: normalize(13),
        fontWeight: '700',
        color: '#111827',
        paddingRight: normalize(10),
    },
    subCategoryTextActive: {
        color: '#FFFFFF',
    },
});

export default CategoriesFAB;
