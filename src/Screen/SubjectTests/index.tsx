import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { useDispatch, useSelector } from 'react-redux';
import { getMockTestListRequest, getStudentModulesRequest } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';
import { useIsFocused, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { ROUTES } from '../../Navigation/RouteNames';
import { getApi } from '../../Utils/Helpers/ApiRequest';
import { CategoriesFAB } from '../../Components/CategoriesFAB';
import { MockBankSkeleton } from '../../Components/LoadingSkeletons';

const getSubjectTheme = (subjectName: string) => {
    const s = subjectName.toLowerCase();
    if (s.includes('anatomy') || s.includes('physiology')) return { icon: 'activity', colors: ['#FF9A9E', '#FECFEF'] };
    if (s.includes('biochemistry')) return { icon: 'droplet', colors: ['#A18CD1', '#FBC2EB'] };
    if (s.includes('nutrition')) return { icon: 'coffee', colors: ['#84FAB0', '#8FD3F4'] };
    if (s.includes('microbiology')) return { icon: 'chrome', colors: ['#FCCB90', '#D57EEB'] };
    if (s.includes('pathology') || s.includes('genetics')) return { icon: 'git-branch', colors: ['#F6D365', '#FDA085'] };
    if (s.includes('pharmacology')) return { icon: 'shield', colors: ['#E0C3FC', '#8EC5FC'] };
    if (s.includes('child')) return { icon: 'smile', colors: ['#4FACFE', '#00F2FE'] };
    if (s.includes('mental')) return { icon: 'sun', colors: ['#43E97B', '#38F9D7'] };
    if (s.includes('obstetrics') || s.includes('gynecological')) return { icon: 'heart', colors: ['#FA709A', '#FEE140'] };
    if (s.includes('community')) return { icon: 'users', colors: ['#0BA360', '#3CBA92'] };
    if (s.includes('research') || s.includes('statistics')) return { icon: 'bar-chart', colors: ['#13547A', '#80D0C7'] };
    if (s.includes('management')) return { icon: 'briefcase', colors: ['#9D50BB', '#6E48AA'] };
    if (s.includes('computer')) return { icon: 'monitor', colors: ['#B224EF', '#7579FF'] };
    if (s.includes('oncology')) return { icon: 'target', colors: ['#FF0844', '#FFB199'] };
    return { icon: 'book-open', colors: ['#667EEA', '#764BA2'] };
};

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

const getItemId = (item: any) => String(item?.id || item?._id || item?.moduleId || item?.module_id || '');

const getItemLabel = (item: any, fallback = '') => String(
    item?.name ||
    item?.title ||
    item?.moduleName ||
    item?.module_name ||
    item?.label ||
    fallback
);

type MockBankScreenProps = {
    navigation: any;
};

export const SubjectTestsScreen = ({ navigation }: MockBankScreenProps) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const route = useRoute<any>();
    const scrollRef = useRef<ScrollView | null>(null);
    const routeParams = route?.params || {};
    const { mockTestList, studentModules, isLoading } = useSelector((state: RootState) => state.MockTestReducer);
    const { paymentHistoryData, paymentHistoryLoading } = useSelector((state: RootState) => state.ProfileReducer);
    const authToken = useSelector((state: RootState) => state.AuthReducer.token);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMock, setSelectedMock] = useState<any>(null);
    const [categories, setCategories] = useState<Array<{ id: string; label: string; raw: any }>>([]);
    const [subCategories, setSubCategories] = useState<Array<{ id: string; label: string; raw: any }>>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubCategories, setLoadingSubCategories] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState('All Sub Categories');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (isFocused && !studentModules) {
            setLoadingCategories(true);
            dispatch(getStudentModulesRequest({}));
        }

        if (isFocused && !paymentHistoryData) {
            dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        }
    }, [dispatch, isFocused, paymentHistoryData, studentModules]);

    useEffect(() => {
        const routeCategoryId = routeParams?.selectedCategoryId != null ? String(routeParams.selectedCategoryId) : null;
        const routeSubCategoryId = routeParams?.selectedSubCategoryId != null ? String(routeParams.selectedSubCategoryId) : null;

        if (routeCategoryId) {
            setSelectedCategory('All Categories');
            setSelectedSubCategory('All Sub Categories');
            setSelectedCategoryId(routeCategoryId);
            setSelectedSubCategoryId(routeSubCategoryId);
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({ y: 0, animated: true });
            });
        }
    }, [routeParams?.selectedCategoryId, routeParams?.selectedSubCategoryId]);

    useEffect(() => {
        const items = extractItems(studentModules);
        if (items.length > 0) {
            setCategories(
                items
                    .map((item: any, idx: number) => ({
                        id: getItemId(item) || String(idx),
                        label: getItemLabel(item, `Category ${idx + 1}`),
                        raw: item,
                    }))
                    .filter((item: any) => item.id),
            );
        }
        setLoadingCategories(false);
    }, [studentModules]);

    useEffect(() => {
        let active = true;

        const loadSubCategories = async () => {
            if (!selectedCategoryId) {
                setSubCategories([]);
                setLoadingSubCategories(false);
                return;
            }

            setLoadingSubCategories(true);

            try {
                const response = await getApi(
                    `student/sub-modules?moduleId=${encodeURIComponent(selectedCategoryId)}`,
                    {
                        authorization: authToken,
                    },
                );

                if (!active) {
                    return;
                }

                const items = extractItems(response?.data);
                setSubCategories(
                    items
                        .map((item: any, idx: number) => ({
                            id: getItemId(item) || String(idx),
                            label: getItemLabel(item, `Sub Category ${idx + 1}`),
                            raw: item,
                        }))
                        .filter((item: any) => item.id),
                );
            } catch (error: any) {
                if (active) {
                    setSubCategories([]);
                    Toast.show({ type: 'error', text1: error?.response?.data?.message || 'Failed to fetch sub-categories' });
                }
            } finally {
                if (active) {
                    setLoadingSubCategories(false);
                }
            }
        };

        loadSubCategories();

        return () => {
            active = false;
        };
    }, [authToken, selectedCategoryId]);

    useEffect(() => {
        const params: any = {};
        if (selectedCategoryId) params.moduleId = selectedCategoryId;
        if (selectedSubCategoryId) params.subModuleId = selectedSubCategoryId;
        if (debouncedSearch) params.search = debouncedSearch;

        dispatch(getMockTestListRequest(params));
    }, [dispatch, selectedCategoryId, selectedSubCategoryId, debouncedSearch]);

    const { enrolledBundleIds } = useMemo(() => {
        const collectedIds = studentModules?.data?.modules || studentModules?.modules || studentModules?.data || (Array.isArray(studentModules) ? studentModules : []);
        const paymentsList = paymentHistoryData?.data?.items || paymentHistoryData?.items || [];
        const failedPending = new Set<string>();

        const collectedBundleIds = collectedIds.map((item: any) => {
            const bundleId = item?.bundleId || item?.bundle?.id || item?.bundle?._id || item?.id || item?._id;
            return String(bundleId || '');
        }).filter(Boolean);

        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
            const paymentStatusMap = new Map<string, boolean>();
            paymentsList.forEach((item: any) => {
                const bundleId = String(item?.resourceId || item?.course?._id || item?.course?.id || item?.course || '');
                if (bundleId) {
                    const status = String(item?.status || '').toLowerCase();
                    const isSuccess = status === 'captured' || status === 'success' || status === 'paid' || status === 'completed';
                    if (isSuccess || !paymentStatusMap.has(bundleId)) {
                        paymentStatusMap.set(bundleId, isSuccess);
                    }
                }
            });

            paymentStatusMap.forEach((isSuccess, bundleId) => {
                if (!isSuccess) {
                    failedPending.add(bundleId);
                }
            });

            const filteredIds = collectedBundleIds.filter((id: string) => {
                if (paymentStatusMap.has(id)) {
                    return paymentStatusMap.get(id);
                }
                return true;
            });

            paymentStatusMap.forEach((isSuccess, bundleId) => {
                if (isSuccess && !filteredIds.includes(bundleId)) {
                    filteredIds.push(bundleId);
                }
            });

            return {
                enrolledBundleIds: Array.from(new Set(filteredIds)),
                failedPendingBundleIds: failedPending,
            };
        }

        return {
            enrolledBundleIds: Array.from(new Set(collectedBundleIds)),
            failedPendingBundleIds: failedPending,
        };
    }, [studentModules, paymentHistoryData]);

    const rawData = Array.isArray(mockTestList)
        ? mockTestList
        : mockTestList?.data || mockTestList?.quizzes || mockTestList?.items || [];

    const displayData = rawData.map((mock: any) => {
        const correctMarks = mock?.positiveMarks ?? mock?.correctMarks ?? mock?.defaultMarks ?? mock?.marksPerQuestion ?? mock?.quiz?.positiveMarks ?? mock?.quiz?.defaultMarks ?? mock?.quiz?.marksPerQuestion ?? 1;
        const rawNeg = mock?.negativeMarks ?? mock?.negativeMarking ?? mock?.penalty ?? mock?.quiz?.negativeMarks ?? mock?.quiz?.negativeMarking ?? 0;
        const negVal = typeof rawNeg === 'object' && rawNeg !== null ? rawNeg.value : rawNeg;

        const questionsCount = mock.questionsCount || mock.questions?.length || mock?.quiz?.questionsCount || mock?.quiz?.questions?.length || 0;

        const fullMarks = mock?.totalMarks || mock?.quiz?.totalMarks || (questionsCount * correctMarks);

        let negStr = '0';
        if (Number(negVal) > 0) {
            negStr = `-${Number(negVal)}`;
        } else if (Number(negVal) < 0) {
            negStr = `${Number(negVal)}`;
        }

        const price = Number(mock?.price || mock?.quiz?.price || 0);

        // Find if this mock test belongs to any module that is enrolled
        const mockModuleId = String(mock?.moduleId || mock?.quiz?.moduleId || mock?.bundleId || mock?.quiz?.bundleId || mock?.module?._id || mock?.module?.id || selectedCategoryId || '');
        const isUnlocked = mockModuleId ? enrolledBundleIds.includes(mockModuleId) : false;

        const finalSubject =
            mock.subjects ||
            mock.subject ||
            mock.category ||
            mock.categoryName ||
            mock.moduleName ||
            mock?.module?.name ||
            mock?.module?.title ||
            mock?.quiz?.moduleName ||
            mock?.quiz?.module?.name ||
            mock?.quiz?.module?.title ||
            mock.description ||
            mock?.quiz?.description ||
            'General Syllabus';

        return {
            id: mock.id || mock._id || mock.testId,
            title: mock.title || mock?.quiz?.title || 'Untitled Test',
            subjects: finalSubject,
            topics: mock.topics || mock?.quiz?.topics || '', // Handle topic if it exists
            questions: questionsCount,
            duration: mock.durationMinutes || mock.duration || mock?.quiz?.durationMinutes || mock?.quiz?.duration || 60,
            fullMarks: fullMarks,
            negativeMarking: negStr,
            type: price > 0 ? 'premium' : 'free',
            isUnlocked: isUnlocked,
            price: price,
            originalData: mock
        };
    });
    const filteredData = displayData;

    const handleStartTest = (mock: any) => {
        if (mock.type === 'premium' && !mock.isUnlocked) {
            setSelectedMock(mock);
            setShowPaymentModal(true);
        } else {
            navigation.navigate(ROUTES.MOCK_TEST_RULES, { testId: mock.id });
        }
    };

    const showLoadingSkeleton = isLoading || loadingCategories || loadingSubCategories || paymentHistoryLoading;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FAFBFF" barStyle="dark-content" />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={normalize(24)} color="#111827" />
                </Pressable>
                <Text style={styles.headerTitleInline}>Test Series & Exam Mock </Text>
            </View>
            {showLoadingSkeleton ? (
                <MockBankSkeleton />
            ) : (
            <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionSubtitle}>Practice with real exam scenarios.</Text>

                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <Icon name="search" size={normalize(18)} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search tests..."
                        placeholderTextColor="#9CA3AF"
                        value={searchInput}
                        onChangeText={setSearchInput}
                    />
                    {searchInput.length > 0 && (
                        <Pressable onPress={() => setSearchInput('')}>
                            <Icon name="x" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>

                {/* Categories Filter */}
                <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Categories</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScrollStyle}
                    >
                        <Pressable
                            style={[
                                styles.filterPill,
                                selectedCategoryId === null && selectedCategory === 'All Categories' && styles.filterPillActive,
                            ]}
                            onPress={() => {
                                setSelectedCategory('All Categories');
                                setSelectedCategoryId(null);
                                setSelectedSubCategory('All Sub Categories');
                                setSelectedSubCategoryId(null);
                                setSubCategories([]);
                            }}
                        >
                            <Text
                                style={[
                                    styles.filterPillText,
                                    selectedCategoryId === null && selectedCategory === 'All Categories' && styles.filterPillTextActive,
                                ]}
                            >
                                All Categories
                            </Text>
                        </Pressable>
                        {categories.map((category: any) => {
                            const isSelected =
                                String(selectedCategoryId) === String(category.id) ||
                                selectedCategory === category.label;
                            return (
                                <Pressable
                                    key={category.id}
                                    style={[
                                        styles.filterPill,
                                        isSelected && styles.filterPillActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(category.label);
                                        setSelectedCategoryId(String(category.id));
                                        setSelectedSubCategory('All Sub Categories');
                                        setSelectedSubCategoryId(null);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            isSelected && styles.filterPillTextActive,
                                        ]}
                                    >
                                        {category.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Sub Categories Filter */}
                <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Sub Categories</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScrollStyle}
                    >
                        <Pressable
                            style={[
                                styles.filterPill,
                                selectedSubCategoryId === null && selectedSubCategory === 'All Sub Categories' && styles.filterPillActive,
                            ]}
                            onPress={() => setSelectedSubCategory('All Sub Categories')}
                        >
                            <Text
                                style={[
                                    styles.filterPillText,
                                    selectedSubCategoryId === null && selectedSubCategory === 'All Sub Categories' && styles.filterPillTextActive,
                                ]}
                            >
                                All Sub Categories
                            </Text>
                        </Pressable>
                        {subCategories.map((subCategory: any) => {
                            const isSelected =
                                String(selectedSubCategoryId) === String(subCategory.id) ||
                                selectedSubCategory === subCategory.label;
                            return (
                                <Pressable
                                    key={subCategory.id}
                                    style={[
                                        styles.filterPill,
                                        isSelected && styles.filterPillActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedSubCategory(subCategory.label);
                                        setSelectedSubCategoryId(String(subCategory.id));
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            isSelected && styles.filterPillTextActive,
                                        ]}
                                    >
                                        {subCategory.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {filteredData.length === 0 ? (
                    <View style={styles.centerLoadingState}>
                        <Text style={styles.loadingStateText}>No tests available right now.</Text>
                    </View>
                ) : filteredData.map((mock: any, i: number) => {
                    const theme = getSubjectTheme(mock.subjects);
                    return (
                        <Pressable key={i} style={styles.testCard} onPress={() => handleStartTest(mock)}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <LinearGradient
                                        colors={theme.colors}
                                        style={styles.iconContainer}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Icon name={theme.icon} size={normalize(16)} color="#FFFFFF" />
                                    </LinearGradient>
                                    <Text style={styles.mainSubjectText} numberOfLines={1}>{mock.subjects}</Text>
                                </View>
                                <View style={styles.cardHeaderRight}>
                                    <Text style={styles.testSeriesText}>Test Series</Text>
                                    {mock.type === 'premium' && !mock.isUnlocked ? (
                                        <FontAwesome5 name="lock" size={normalize(12)} color="#9CA3AF" style={{ marginHorizontal: normalize(6) }} />
                                    ) : null}
                                    <Icon name="chevron-right" size={normalize(20)} color={theme.colors[1]} />
                                </View>
                            </View>

                            <View style={styles.cardDivider} />

                            <Text style={styles.testTitle}>{mock.title}</Text>

                            <View style={styles.cardMetaGrid}>
                                <View style={styles.cardMetaItem}>
                                    <Text style={styles.cardMetaLabel}>Test Topic</Text>
                                    <Text style={styles.cardMetaValue} numberOfLines={1}>{mock.title}</Text>
                                </View>
                                <View style={styles.cardMetaItem}>
                                    <Text style={styles.cardMetaLabel}>Full mark</Text>
                                    <Text style={styles.cardMetaValue}>{mock.fullMarks}</Text>
                                </View>
                                <View style={styles.cardMetaItem}>
                                    <Text style={styles.cardMetaLabel}>Time</Text>
                                    <Text style={styles.cardMetaValue}>{mock.duration} Mins</Text>
                                </View>
                                <View style={styles.cardMetaItem}>
                                    <Text style={styles.cardMetaLabel}>Negative marking</Text>
                                    <Text style={styles.cardMetaValue}>{mock.negativeMarking}</Text>
                                </View>
                            </View>
                        </Pressable>
                    );
                })}

                <View style={{ height: verticalScale(100) }} />
            </ScrollView>
            )}
            <CategoriesFAB />

            <Modal visible={showPaymentModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBg} onPress={() => setShowPaymentModal(false)} />
                    <View style={styles.bottomSheetContent}>
                        <View style={styles.modalIconContainer}>
                            <FontAwesome5 name="crown" size={normalize(28)} color="#F59E0B" />
                        </View>
                        <Text style={styles.modalTitle}>Unlock Premium Test</Text>
                        <Text style={styles.modalSubtitle}>Get access to high-quality {selectedMock?.subjects} questions carefully curated by top educators.</Text>

                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>Total Price</Text>
                            <Text style={styles.priceValue}>${selectedMock?.price}</Text>
                        </View>

                        <Pressable style={styles.payButton} onPress={() => {
                            setShowPaymentModal(false);
                            navigation.navigate(ROUTES.MOCK_TEST_RULES, { testId: selectedMock?.id });
                        }}>
                            <Text style={styles.payButtonText}>Pay ${selectedMock?.price} & Start</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    backButton: { padding: normalize(8), marginLeft: -normalize(8) },
    headerTitleInline: { fontSize: normalize(22), fontWeight: '700', color: Colorpath.Primary, marginLeft: normalize(12) },
    scrollContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    sectionSubtitle: { fontSize: normalize(14), color: '#6B7280', marginBottom: verticalScale(24) },
    testCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(16),
        padding: normalize(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12)
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    testSeriesText: {
        fontSize: normalize(12),
        color: '#6B7280',
        fontWeight: '600',
        marginRight: normalize(4)
    },
    iconContainer: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(12)
    },
    mainSubjectText: {
        fontSize: normalize(14),
        fontWeight: 'bold',
        color: Colorpath.Primary,
        flex: 1,
        paddingRight: normalize(8)
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: verticalScale(12)
    },
    testTitle: {
        fontSize: normalize(16),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: verticalScale(16)
    },
    cardMetaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: verticalScale(16)
    },
    cardMetaItem: {
        width: '45%'
    },
    cardMetaLabel: {
        fontSize: normalize(11),
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: verticalScale(4),
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    cardMetaValue: {
        fontSize: normalize(13),
        color: '#111827',
        fontWeight: '600'
    },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    bottomSheetContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(24), paddingBottom: verticalScale(40), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalIconContainer: { width: normalize(60), height: normalize(60), borderRadius: normalize(30), backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
    modalTitle: { fontSize: normalize(20), fontWeight: 'bold', color: '#111827', marginBottom: verticalScale(8) },
    modalSubtitle: { fontSize: normalize(13), color: '#6B7280', textAlign: 'center', lineHeight: normalize(20), marginBottom: verticalScale(20) },
    priceContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: normalize(16), borderRadius: normalize(12), marginBottom: verticalScale(24), borderWidth: 1, borderColor: '#F3F4F6' },
    priceLabel: { fontSize: normalize(14), color: '#4B5563', fontWeight: '600' },
    priceValue: { fontSize: normalize(20), color: '#111827', fontWeight: 'bold' },
    payButton: { width: '100%', backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(14), borderRadius: normalize(12), alignItems: 'center' },
    payButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        paddingHorizontal: normalize(14),
        height: verticalScale(48),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: verticalScale(16),
    },
    searchIcon: {
        marginRight: normalize(8),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: '#1F2937',
        height: '100%',
        paddingVertical: 0,
    },
    filterSection: {
        marginBottom: verticalScale(16),
    },
    filterLabel: {
        fontSize: normalize(12),
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: verticalScale(8),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    horizontalScrollStyle: {
        paddingVertical: verticalScale(4),
        gap: normalize(8),
    },
    filterPill: {
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(10),
        borderRadius: normalize(24),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: normalize(8),
    },
    filterPillActive: {
        backgroundColor: Colorpath.Primary,
        borderColor: Colorpath.Primary,
    },
    filterPillText: {
        fontSize: normalize(13),
        fontWeight: '600',
        color: '#4B5563',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
    },
    centerLoadingState: {
        marginTop: verticalScale(40),
        alignItems: 'center',
    },
    loadingStateText: {
        color: '#6B7280',
    },
    inlineLoadingState: {
        justifyContent: 'center',
        paddingHorizontal: normalize(8),
    },
    inlineLoadingText: {
        color: '#6B7280',
        fontSize: normalize(12),
    },
});

export default SubjectTestsScreen;
