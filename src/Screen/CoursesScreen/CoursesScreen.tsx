import { useMockMarkings } from './hooks/useMockMarkings';
import { StudyMaterialCard } from './components/StudyMaterialCard';
import React from 'react';
import type { RootState } from '../../Redux/Store';
import { useCourseRequests } from './hooks/useCourseRequests';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { NotePageModal } from './components/NotePageModal';
import { DocumentFolderModal } from './components/DocumentFolderModal';
import { DocumentPdfModal } from './components/DocumentPdfModal';
import { VideoBankModal } from './components/VideoBankModal';
import { QuestionAnswerModal } from './components/QuestionAnswerModal';
import { QuestionBankModal } from './components/QuestionBankModal';
import { NoteBankModal } from './components/NoteBankModal';
import { MockBankList } from './components/MockBankList';
import { PaginatedList } from './components/PaginatedList';
import { CategoryList } from './components/CategoryList';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StatusBar,
    Modal,
    Linking,
    FlatList,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { WebView } from 'react-native-webview';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { getApi } from '../../Utils/Helpers/ApiRequest';

import { Header } from '../../Components/headers/Header';
import { Input } from '../../Components/inputs/Input';
import { theme } from '../../Themes';
import { SubjectBankSkeleton } from '../../Components/LoadingSkeletons';
import { getNursingSubjectName } from '../../Utils/Constants/Subjects';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
    bundleIDRequest,
    clearBundleFlowState,
    clearPaymentSession as clearPaymentSessionAction,
    enrollBundleFailure,
    enrollBundleRequest,
    enrollBundleSuccess,
    getBundleListRequest,
    getStudentModulesRequest,
    getSubBundleDetailsRequest,
    getSubBundleListRequest,
    paymentRequest,
    paymentFailure,
    documentRequest,
} from '../../Redux/Reducers/MockTestReducer';

import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';

import {
    EXAM_CHIPS,
    MIN_SUBJECTS_FOR_CATEGORY_EXAM,
    sortNursingTitles,
    normalizeTitle,
    ensureArray,
    getBundlePayload,
    getBundleId,
    getQuizId,
    getItemId,
    getBundleItems,
    getSubBundleItems,
    getBundleQuizzes,
    isEliteMockBundle,
    isFreeMockBundle,
    getItemTitle,
    getItemDescription,
    getQuestionBankQuestions,
    getVideoBankUrl,
    getYouTubeVideoId,
    getVideoBankItems,
    normalizeCourseSections,
    getNoteBankId,
    getBundleMockCount,
    buildSelectedExam,
    collectEnrolledBundleIds,
    resolveBundlePricing,
    normalizePaymentSession,
} from './utils/courseHelpers';
import { styles } from './coursesStyles';

type CoursesScreenProps = {
    navigation: any;
    route?: any;
};

const CoursesScreen = ({ navigation, route }: CoursesScreenProps) => {
    const insets = useSafeAreaInsets();
    const { begin: beginRequest, cancel: cancelRequest } = useCourseRequests();
    const catalogScrollOffset = useRef(0);
    const catalogPagination = useRef<import('./hooks/useCoursePagination').PaginationMemory | null>(null);
    const mockScrollOffset = useRef(0);
    const [visibleQuizzes, setVisibleQuizzes] = useState<any[]>([]);
    const dispatch = useDispatch();
    const lastAction = useRef({ key: '', at: 0 });
    const acceptAction = useCallback((key: string) => {
        const now = Date.now();
        if (lastAction.current.key === key && now - lastAction.current.at < 600) return false;
        lastAction.current = { key, at: now };
        return true;
    }, []);
    const isFocused = useIsFocused();
    const {
        bundleList,
        studentModules,
        bundleDetails,
        subBundleList,
        subBundleDetails,
        paymentSession,
        isLoading,
        status,
        documentLoading,
        documentResponse,
    } = useSelector((state: RootState) => state.MockTestReducer);

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebouncedValue(searchQuery);
    const [mainTab, setMainTab] = useState<'subject' | 'exam'>('subject');

    useEffect(() => {
        if (route?.params?.tab) {
            setMainTab(route.params.tab);
        }
        if (route?.params?.search !== undefined) {
            setSearchQuery(route.params.search);
        }
    }, [route?.params]);
    useEffect(() => {
        catalogScrollOffset.current = 0;
    }, [mainTab, debouncedSearchQuery]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [viewMoreStates, setViewMoreStates] = useState<Record<string, boolean>>({});
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [selectedSubBundleExam, setSelectedSubBundleExam] = useState<any>(null);
    const [activeBundleId, setActiveBundleId] = useState<string | null>(null);
    const [activeSubBundleId, setActiveSubBundleId] = useState<string | null>(null);
    const [pendingEnrollmentId, setPendingEnrollmentId] = useState<string | null>(null);
    const [enrolledBundleOverrides, setEnrolledBundleOverrides] = useState<Set<string>>(new Set());
    const [activeDetailTab, setActiveDetailTab] = useState<'mock' | 'course'>('mock');
    const [activeCourseSection, setActiveCourseSection] = useState<string>('');
    const [showNoteViewerModal, setShowNoteViewerModal] = useState(false);
    const [isLoadingNotePages, setIsLoadingNotePages] = useState(false);
    const [selectedNoteBankTitle, setSelectedNoteBankTitle] = useState('');
    const [selectedNotePages, setSelectedNotePages] = useState<any[]>([]);
    const [selectedNotePageIndex, setSelectedNotePageIndex] = useState(0);
    const [showNotePageModal, setShowNotePageModal] = useState(false);
    const [selectedNotePageDetail, setSelectedNotePageDetail] = useState<any>(null);
    const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
    const [isLoadingQuestionBank, setIsLoadingQuestionBank] = useState(false);
    const [selectedQuestionBankTitle, setSelectedQuestionBankTitle] = useState('');
    const [selectedQuestionBankQuestions, setSelectedQuestionBankQuestions] = useState<any[]>([]);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [selectedQuestionBankMeta, setSelectedQuestionBankMeta] = useState<any>(null);
    const [showQuestionAnswerModal, setShowQuestionAnswerModal] = useState(false);
    const [selectedQuestionAnswerDetail, setSelectedQuestionAnswerDetail] = useState<any>(null);
    const [isPaymentWebViewVisible, setIsPaymentWebViewVisible] = useState(false);
    const [activePaymentSession, setActivePaymentSession] = useState<any>(null);
    const [paymentVerificationId, setPaymentVerificationId] = useState<string | null>(null);
    const [showVideoBankModal, setShowVideoBankModal] = useState(false);
    const [isLoadingVideoBank, setIsLoadingVideoBank] = useState(false);
    const [selectedVideoBankTitle, setSelectedVideoBankTitle] = useState('');
    const [selectedVideoBankItems, setSelectedVideoBankItems] = useState<any[]>([]);

    const [showDocumentFolderModal, setShowDocumentFolderModal] = useState(false);
    const [selectedDocumentFolderTitle, setSelectedDocumentFolderTitle] = useState('');
    const [showDocumentPdfModal, setShowDocumentPdfModal] = useState(false);
    const [selectedPdfDocId, setSelectedPdfDocId] = useState<string | null>(null);
    const [selectedPdfTitle, setSelectedPdfTitle] = useState('');
    const [subjectBankSkeletonVisible, setSubjectBankSkeletonVisible] = useState(false);
    const [detailSearchQuery, setDetailSearchQuery] = useState('');
    const debouncedDetailSearchQuery = useDebouncedValue(detailSearchQuery);

    const authToken = useSelector((state: RootState) => state.AuthReducer.token);
    const mockMarkingMap = useMockMarkings(visibleQuizzes, authToken);
    const { paymentHistoryData, paymentHistoryLoading } = useSelector(
        (state: RootState) => state.ProfileReducer,
    );
    const paymentHistoryLoadingRef = useRef(paymentHistoryLoading);
    paymentHistoryLoadingRef.current = paymentHistoryLoading;
    useEffect(() => {
        if (!showNoteViewerModal) cancelRequest('notes');
    }, [showNoteViewerModal, cancelRequest]);
    useEffect(() => {
        if (!showQuestionBankModal) cancelRequest('questions');
    }, [showQuestionBankModal, cancelRequest]);
    useEffect(() => {
        if (!showVideoBankModal) cancelRequest('videos');
    }, [showVideoBankModal, cancelRequest]);

    const bundleItems = useMemo(() => getBundleItems(bundleList), [bundleList]);
    const subBundleItems = useMemo(() => getSubBundleItems(subBundleList), [subBundleList]);
    const { enrolledBundleIds, failedPendingBundleIds } = useMemo(() => {
        const collectedIds = collectEnrolledBundleIds(studentModules);
        const paymentsList = paymentHistoryData?.data?.items || paymentHistoryData?.items || [];
        const failedPending = new Set<string>();

        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
            const paymentStatusMap = new Map<string, boolean>();
            paymentsList.forEach((item: any) => {
                const bundleId = String(
                    item?.resourceId || item?.course?._id || item?.course?.id || item?.course || '',
                );
                if (bundleId) {
                    const status = String(item?.status || '').toLowerCase();
                    const isSuccess =
                        status === 'captured' ||
                        status === 'success' ||
                        status === 'paid' ||
                        status === 'completed';
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

            const filteredIds = collectedIds.filter((id: string) => {
                const strId = String(id);
                if (paymentStatusMap.has(strId)) {
                    return paymentStatusMap.get(strId);
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
            enrolledBundleIds: Array.from(new Set(collectedIds)),
            failedPendingBundleIds: failedPending,
        };
    }, [studentModules, paymentHistoryData]);
    const successfulPaidBundleIds = useMemo(() => {
        const paymentsList =
            paymentHistoryData?.data?.items ||
            paymentHistoryData?.items ||
            paymentHistoryData?.data ||
            (Array.isArray(paymentHistoryData) ? paymentHistoryData : []);
        const successStatuses = new Set(['captured', 'success', 'paid', 'completed']);

        const paidIds = Array.isArray(paymentsList)
            ? paymentsList
                  .filter((item: any) => successStatuses.has(String(item?.status || '').toLowerCase()))
                  .map((item: any) =>
                      String(
                          item?.resourceId ||
                              item?.course?._id ||
                              item?.course?.id ||
                              item?.course ||
                              item?.bundleId ||
                              item?.bundle?._id ||
                              item?.bundle?.id ||
                              '',
                      ).trim(),
                  )
                  .filter(Boolean)
            : [];

        return Array.from(new Set(paidIds));
    }, [paymentHistoryData]);
    const purchasedSubjectCount = successfulPaidBundleIds.length;
    const hasAllSubjectBundlePayment = useMemo(() => {
        const paymentsList =
            paymentHistoryData?.data?.items ||
            paymentHistoryData?.items ||
            paymentHistoryData?.data ||
            (Array.isArray(paymentHistoryData) ? paymentHistoryData : []);

        return (
            Array.isArray(paymentsList) &&
            paymentsList.some((item: any) => {
                const status = String(item?.status || '')
                    .trim()
                    .toUpperCase();
                const resourceTitle = String(item?.resourceTitle || '')
                    .trim()
                    .toLowerCase();

                return status === 'COMPLETED' && resourceTitle === 'all subject bundle';
            })
        );
    }, [paymentHistoryData]);
    const canUseCategoryExam =
        purchasedSubjectCount >= MIN_SUBJECTS_FOR_CATEGORY_EXAM || hasAllSubjectBundlePayment;

    const apiCategories = useMemo(() => {
        let cats: any[] = [];
        if (Array.isArray(bundleList?.categories)) cats = bundleList.categories;
        else if (Array.isArray(bundleList?.data?.categories)) cats = bundleList.data.categories;
        else if (Array.isArray(bundleList?.data?.data?.categories)) cats = bundleList.data.data.categories;

        const categoryNames = cats.map((c) => String(c?.name || c?.title || c || '')).filter(Boolean);

        bundleItems.forEach((bundle: any) => {
            const cat = String(bundle?.category || bundle?.subject || bundle?.module || '').trim();
            if (cat && !categoryNames.some((c) => c.toLowerCase() === cat.toLowerCase())) {
                categoryNames.push(cat);
            }
        });

        return categoryNames;
    }, [bundleList, bundleItems]);

    const activeOptions = useMemo(() => {
        const subjects = new Set<string>();
        const dynamicExams = new Set<string>();

        bundleItems.forEach((bundle: any) => {
            const title = String(bundle?.title || bundle?.name || '').trim();
            const lowerTitle = title.toLowerCase();
            const category = String(bundle?.category || bundle?.subject || bundle?.module || '').toLowerCase();
            const isFreeMock = isFreeMockBundle(bundle);

            let subjectLabel = bundle?.subject || bundle?.module || bundle?.category;
            if (!subjectLabel) subjectLabel = title || 'Other';
            const finalLabel = getNursingSubjectName(String(subjectLabel).trim());
            if (finalLabel) subjects.add(finalLabel);
            if (title) subjects.add(title);

            const chipList = apiCategories.length > 0 ? apiCategories : EXAM_CHIPS;
            const isExam =
                !isFreeMock &&
                (isEliteMockBundle(bundle) ||
                    chipList.some(
                        (chip) =>
                            lowerTitle.includes(chip.toLowerCase()) ||
                            category.includes(chip.toLowerCase()) ||
                            chip.toLowerCase().includes(lowerTitle),
                    ));

            if (isExam) {
                if (isEliteMockBundle(bundle)) {
                    dynamicExams.add('Elite Mock Bundle');
                }
                for (const chip of chipList) {
                    if (
                        lowerTitle.includes(chip.toLowerCase()) ||
                        category.includes(chip.toLowerCase()) ||
                        chip.toLowerCase().includes(lowerTitle)
                    ) {
                        dynamicExams.add(chip);
                    }
                }
                if (bundle?.category) dynamicExams.add(bundle.category.trim());
                if (title) dynamicExams.add(title);
            }
            if (isFreeMock) {
                dynamicExams.add('Free Mock Bundle');
                subjects.add('Free Mock Bundle');
            }
        });

        if (mainTab === 'exam') {
            const examsList = Array.from(dynamicExams);
            return examsList.length > 0 ? examsList : (apiCategories.length > 0 ? apiCategories : EXAM_CHIPS);
        }
        return sortNursingTitles(Array.from(subjects));
    }, [bundleItems, mainTab, apiCategories]);

    const moduleOptions = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return activeOptions;
        const q = debouncedSearchQuery.toLowerCase();
        const filtered = activeOptions.filter((opt) => opt.toLowerCase().includes(q));
        if (filtered.length > 0) return filtered;
        // Fallback: match bundle titles directly if query doesn't match predefined chip labels
        const directMatches = new Set<string>();
        bundleItems.forEach((bundle: any) => {
            const title = String(bundle?.title || bundle?.name || '').trim();
            const category = String(bundle?.category || bundle?.subject || bundle?.module || '').trim();
            if (title.toLowerCase().includes(q) || category.toLowerCase().includes(q)) {
                if (title) directMatches.add(title);
            }
        });
        return Array.from(directMatches);
    }, [activeOptions, debouncedSearchQuery, bundleItems]);
    const clearPaymentSession = useCallback(async () => {
        setActivePaymentSession(null);
        setPaymentVerificationId(null);
        setIsPaymentWebViewVisible(false);
        setPendingEnrollmentId(null);
        dispatch(clearPaymentSessionAction());
    }, [dispatch]);

    const verifyPaymentAndContinue = useCallback(
        async (bundleId: string) => {
            if (!bundleId || paymentVerificationId === bundleId) return;
            // Redirect text is a refresh hint, never proof of a successful payment.
            setPaymentVerificationId(bundleId);
            if (!paymentHistoryLoadingRef.current) dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        },
        [dispatch, paymentVerificationId],
    );

    useEffect(() => {
        if (!paymentVerificationId || !successfulPaidBundleIds.includes(paymentVerificationId)) return;
        const bundleId = paymentVerificationId;
        void clearPaymentSession();
        dispatch(bundleIDRequest({ id: bundleId }));
    }, [paymentVerificationId, successfulPaidBundleIds, clearPaymentSession, dispatch]);

    const metadataRequested = useRef(false);
    const retryCourseMetadata = useCallback(() => {
        dispatch(getBundleListRequest({ limit: 50, page: 1 }));
    }, [dispatch]);
    useEffect(() => {
        if (bundleItems.length || metadataRequested.current) return;
        metadataRequested.current = true;
        dispatch(getBundleListRequest({ limit: 50, page: 1 }));
    }, [dispatch, bundleItems.length]);

    const focusRefreshStarted = useRef(false);
    useEffect(() => {
        if (!isFocused) {
            focusRefreshStarted.current = false;
            return;
        }
        if (focusRefreshStarted.current) return;
        focusRefreshStarted.current = true;
        dispatch(getStudentModulesRequest({}));
        dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
    }, [dispatch, isFocused]);

    useEffect(() => {
        return () => {
            dispatch(clearBundleFlowState());
        };
    }, [dispatch]);

    useEffect(() => {
        const session = normalizePaymentSession(paymentSession);
        if (!session) {
            return;
        }

        if (pendingEnrollmentId && String(session.resourceId || '') !== pendingEnrollmentId) {
            return;
        }

        if (!pendingEnrollmentId && !isPaymentWebViewVisible) {
            return;
        }

        setActivePaymentSession(session);
        setIsPaymentWebViewVisible(true);
    }, [isPaymentWebViewVisible, pendingEnrollmentId, paymentSession]);

    useEffect(() => {
        if (!activePaymentSession?.resourceId) {
            return;
        }

        const interval = setInterval(() => {
            if (!paymentHistoryLoadingRef.current) dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        }, 5000);

        return () => clearInterval(interval);
    }, [activePaymentSession?.resourceId, dispatch]);

    useEffect(() => {
        if (!bundleDetails || !activeBundleId) return;
        const responseId = String(getBundleId(getBundlePayload(bundleDetails)) || '');
        if (responseId && responseId !== activeBundleId) return;

        const resolvedBundleId = String(getBundleId(bundleDetails) || activeBundleId || '');
        const isEnrolled =
            enrolledBundleOverrides.has(resolvedBundleId) ||
            (!failedPendingBundleIds.has(resolvedBundleId) &&
                (Boolean(bundleDetails?.isEnrolled) ||
                    (resolvedBundleId ? enrolledBundleIds.includes(resolvedBundleId) : false)));

        setSelectedExam((previous: any) =>
            previous?.rawBundle === getBundlePayload(bundleDetails) && previous?.isEnrolled === isEnrolled
                ? previous
                : buildSelectedExam(bundleDetails, isEnrolled),
        );
        if (resolvedBundleId) {
            setActiveBundleId(resolvedBundleId);
        }
    }, [
        activeBundleId,
        bundleDetails,
        dispatch,
        enrolledBundleIds,
        enrolledBundleOverrides,
        failedPendingBundleIds,
    ]);

    useEffect(() => {
        if (activeBundleId && selectedExam?.id && String(selectedExam.id) === activeBundleId) {
            dispatch(getSubBundleListRequest({ bundleId: activeBundleId }));
        }
    }, [activeBundleId, selectedExam?.id, dispatch]);

    useEffect(() => {
        if (!subBundleDetails || !activeSubBundleId) return;
        const responseId = String(getBundleId(getBundlePayload(subBundleDetails)) || '');
        if (responseId && responseId !== activeSubBundleId) return;

        const parentBundleId = activeBundleId ? String(activeBundleId) : '';
        const isEnrolled =
            enrolledBundleOverrides.has(parentBundleId) ||
            (!failedPendingBundleIds.has(parentBundleId) &&
                (Boolean(subBundleDetails?.isEnrolled) ||
                    Boolean(selectedExam?.isEnrolled) ||
                    (parentBundleId ? enrolledBundleIds.includes(parentBundleId) : false)));
        setSelectedSubBundleExam((previous: any) =>
            previous?.rawBundle === getBundlePayload(subBundleDetails) && previous?.isEnrolled === isEnrolled
                ? previous
                : buildSelectedExam(subBundleDetails, isEnrolled),
        );
    }, [
        activeSubBundleId,
        activeBundleId,
        enrolledBundleIds,
        enrolledBundleOverrides,
        subBundleDetails,
        selectedExam,
        failedPendingBundleIds,
    ]);

    useEffect(() => {
        if (
            status === enrollBundleSuccess.type ||
            status === enrollBundleFailure.type ||
            status === paymentFailure.type
        ) {
            setPendingEnrollmentId(null);

            if (status === enrollBundleSuccess.type && activeBundleId) {
                dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
                setEnrolledBundleOverrides((prev) => {
                    const next = new Set(prev);
                    next.add(String(activeBundleId));
                    return next;
                });
            }
        }
    }, [status, activeBundleId, dispatch]);

    const openExternalVideoUrl = useCallback(async (rawUrl: string) => {
        if (!rawUrl) {
            return false;
        }

        const normalizedUrl = rawUrl.trim();
        const videoId = getYouTubeVideoId(normalizedUrl);
        const attempts = videoId
            ? [
                  `youtube://watch?v=${videoId}`,
                  `vnd.youtube://${videoId}`,
                  `https://www.youtube.com/watch?v=${videoId}`,
              ]
            : [normalizedUrl, normalizedUrl.replace('youtu.be/', 'www.youtube.com/watch?v=')];

        for (const candidate of attempts) {
            if (!candidate) {
                continue;
            }

            try {
                await Linking.openURL(candidate);
                return true;
            } catch {
                // keep trying
            }
        }

        return false;
    }, []);

    const handleShouldStartLoadWithRequest = useCallback((request: any) => {
        const reqUrl = String(request?.url || '');
        const upiSchemes = ['intent://', 'upi://', 'tez://', 'phonepe://', 'paytmmp://', 'gpay://'];
        const isUpiScheme = upiSchemes.some((scheme) => reqUrl.startsWith(scheme));

        if (!reqUrl || !isUpiScheme) {
            return true;
        }

        const openUpiApp = async () => {
            try {
                let finalUrl = reqUrl;
                if (reqUrl.startsWith('intent://')) {
                    const schemeMatch = reqUrl.match(/scheme=([^;]+)/);
                    const scheme = schemeMatch ? schemeMatch[1] : 'upi';
                    finalUrl = reqUrl.replace(/^intent/, scheme).split('#')[0];
                }

                const supported = await Linking.canOpenURL(finalUrl);
                if (supported) {
                    await Linking.openURL(finalUrl);
                    return;
                }

                // If fallback fails, try just opening it anyway as Android can sometimes handle it
                await Linking.openURL(finalUrl);
            } catch (error) {
                console.log('Error opening UPI URI:', error);
                Toast.show({ type: 'error', text1: 'Unable to open UPI app.' });
            }
        };

        openUpiApp().catch(() => {});
        return false;
    }, []);

    const showCategoryExamInfo = useCallback(() => {
        Toast.show({
            type: 'info',
            text1: `Buy at least ${MIN_SUBJECTS_FOR_CATEGORY_EXAM} subjects to enable By Category Exam.`,
            text2: `You have purchased ${purchasedSubjectCount} subject${
                purchasedSubjectCount === 1 ? '' : 's'
            } so far.`,
        });
    }, [purchasedSubjectCount]);

    const showCategoryExamContentLockedToast = useCallback(
        (contentName: string) => {
            const lockedName = contentName || 'This content';
            Toast.show({
                type: 'info',
                text1: `${lockedName} is locked`,
                text2: `Buy at least ${MIN_SUBJECTS_FOR_CATEGORY_EXAM} subjects to access it. You have purchased ${purchasedSubjectCount} subject${
                    purchasedSubjectCount === 1 ? '' : 's'
                } so far.`,
            });
        },
        [purchasedSubjectCount],
    );

    const isEnrollingBundle =
        isLoading && (status === enrollBundleRequest.type || status === paymentRequest.type);
    const showSubjectBankSkeleton =
        bundleItems.length === 0 &&
        isLoading &&
        (status === getBundleListRequest.type || status === getStudentModulesRequest.type);
    const detailScreen = selectedSubBundleExam || selectedExam;
    const showingSubBundle = Boolean(selectedSubBundleExam);
    const canAttemptMocks = Boolean(detailScreen?.isEnrolled);
    const showSubBundleList = Boolean(selectedExam) && !showingSubBundle && subBundleItems.length > 0;
    const courseSections = useMemo(
        () => normalizeCourseSections(detailScreen?.rawBundle || detailScreen),
        [detailScreen],
    );
    const mockContentAvailable = Boolean(
        detailScreen?.quizGroups?.length ||
            showSubBundleList ||
            getBundleQuizzes(detailScreen?.rawBundle || detailScreen).length,
    );

    useEffect(() => {
        let hideTimer: ReturnType<typeof setTimeout> | null = null;

        if (showSubjectBankSkeleton) {
            setSubjectBankSkeletonVisible(true);
        } else {
            hideTimer = setTimeout(() => {
                setSubjectBankSkeletonVisible(false);
            }, 250);
        }

        return () => {
            if (hideTimer) {
                clearTimeout(hideTimer);
            }
        };
    }, [showSubjectBankSkeleton]);
    const availableDetailTabs = useMemo(
        () =>
            [
                mockContentAvailable ? { key: 'mock', label: 'Mock Bank' } : null,
                courseSections.length > 0 ? { key: 'course', label: 'Study Materials' } : null,
            ].filter(Boolean) as Array<{ key: 'mock' | 'course'; label: string }>,
        [courseSections.length, mockContentAvailable],
    );
    const detailTabs = availableDetailTabs;
    const normalizedDetailSearchQuery = normalizeTitle(debouncedDetailSearchQuery);
    useEffect(() => {
        mockScrollOffset.current = 0;
    }, [detailScreen?.id, normalizedDetailSearchQuery]);

    const filteredSubBundleItems = useMemo(() => {
        if (!normalizedDetailSearchQuery) {
            return subBundleItems;
        }

        return subBundleItems.filter((subBundle: any) => {
            const normalizedSubBundle = getBundlePayload(subBundle);
            const title = normalizeTitle(
                String(normalizedSubBundle?.title || normalizedSubBundle?.name || ''),
            );
            const description = normalizeTitle(
                String(normalizedSubBundle?.description || normalizedSubBundle?.summary || ''),
            );
            const mockCount = normalizeTitle(String(getBundleMockCount(normalizedSubBundle)));

            return (
                title.includes(normalizedDetailSearchQuery) ||
                description.includes(normalizedDetailSearchQuery) ||
                mockCount.includes(normalizedDetailSearchQuery)
            );
        });
    }, [normalizedDetailSearchQuery, subBundleItems]);

    const filteredDetailQuizGroups = useMemo(() => {
        const groups = ensureArray(detailScreen?.quizGroups);

        if (!normalizedDetailSearchQuery) {
            return groups;
        }

        return groups.reduce((acc: any[], group: any) => {
            const groupTitle = normalizeTitle(String(group?.title || ''));
            const quizzes = ensureArray(group?.quizzes);

            if (groupTitle.includes(normalizedDetailSearchQuery)) {
                acc.push({ ...group, quizzes });
                return acc;
            }

            const filteredQuizzes = quizzes.filter((quiz: any) => {
                const quizTitle = normalizeTitle(String(quiz?.title || quiz?.name || ''));
                const quizDescription = normalizeTitle(
                    String(quiz?.description || quiz?.summary || quiz?.topic || ''),
                );

                return (
                    quizTitle.includes(normalizedDetailSearchQuery) ||
                    quizDescription.includes(normalizedDetailSearchQuery)
                );
            });

            if (filteredQuizzes.length > 0) {
                acc.push({ ...group, quizzes: filteredQuizzes });
            }

            return acc;
        }, []);
    }, [detailScreen?.quizGroups, normalizedDetailSearchQuery]);

    const filteredCourseSections = useMemo(() => {
        if (!normalizedDetailSearchQuery) {
            return courseSections;
        }

        return courseSections
            .map((section: any) => {
                const sectionLabel = normalizeTitle(String(section?.label || ''));
                const sectionMatches = sectionLabel.includes(normalizedDetailSearchQuery);
                const items = ensureArray(section?.items);

                if (sectionMatches) {
                    return section;
                }

                const filteredItems = items.filter((item: any) => {
                    const itemTitle = normalizeTitle(String(getItemTitle(item, '')));
                    const itemDescription = normalizeTitle(String(getItemDescription(item) || ''));

                    return (
                        itemTitle.includes(normalizedDetailSearchQuery) ||
                        itemDescription.includes(normalizedDetailSearchQuery)
                    );
                });

                return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
            })
            .filter(Boolean);
    }, [courseSections, normalizedDetailSearchQuery]);

    const filteredActiveCourseSection = useMemo(() => {
        if (filteredCourseSections.length === 0) {
            return null;
        }

        return (
            filteredCourseSections.find((section) => section.key === activeCourseSection) ||
            filteredCourseSections[0]
        );
    }, [activeCourseSection, filteredCourseSections]);

    useEffect(() => {
        if (availableDetailTabs.length === 0) {
            setActiveDetailTab('mock');
            return;
        }

        if (!availableDetailTabs.find((tab) => tab.key === activeDetailTab)) {
            setActiveDetailTab(availableDetailTabs[0].key);
        }
    }, [activeDetailTab, availableDetailTabs]);

    useEffect(() => {
        if (courseSections.length === 0) {
            setActiveCourseSection('');
            return;
        }

        if (!courseSections.find((section) => section.key === activeCourseSection)) {
            setActiveCourseSection(courseSections[0].key);
        }
    }, [activeCourseSection, courseSections]);

    useEffect(() => {
        if (selectedQuestionBankQuestions.length === 0) {
            setSelectedQuestionIndex(0);
            return;
        }

        if (selectedQuestionIndex >= selectedQuestionBankQuestions.length) {
            setSelectedQuestionIndex(0);
        }
    }, [selectedQuestionBankQuestions.length, selectedQuestionIndex]);

    useEffect(() => {
        if (selectedNotePages.length === 0) {
            setSelectedNotePageIndex(0);
            return;
        }

        if (selectedNotePageIndex >= selectedNotePages.length) {
            setSelectedNotePageIndex(0);
        }
    }, [selectedNotePageIndex, selectedNotePages.length]);

    useEffect(() => {
        if (!showNotePageModal) {
            setSelectedNotePageDetail(null);
        }
    }, [showNotePageModal]);

    const renderIcon = (name: string, type: string, size: number, color: string) => {
        if (type === 'FontAwesome5') {
            return <FontAwesome5 name={name} size={size} color={color} />;
        }
        return <Feather name={name} size={size} color={color} />;
    };

    const handleQuizAction = (quiz: any) => {
        let quizId = getQuizId(quiz?.rawQuiz || quiz) || quiz?.id;

        if (typeof quizId === 'object' && quizId !== null) {
            quizId = quizId.id || quizId._id || quizId.quizId || quizId.testId;
        }

        if (!quizId) {
            return;
        }

        if (paymentHistoryLoading) {
            Toast.show({ type: 'info', text1: 'Verifying payment status, please wait...' });
            return;
        }

        if (!acceptAction(`quiz:${quizId}`)) return;
        const fetchedQuiz = mockMarkingMap[quizId];
        const targetQuiz = fetchedQuiz || quiz?.rawQuiz || quiz;

        navigation.navigate('MockTestRulesScreen', {
            testId: quizId,
            testData: targetQuiz,
        });
    };

    const handleOpenNoteBank = useCallback(
        async (item: any): Promise<void> => {
            const noteId = getNoteBankId(item);

            if (!noteId) {
                return;
            }

            const operation = beginRequest('notes');
            if (!operation) return;
            setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
            setSelectedNotePages([]);
            setShowNoteViewerModal(true);
            try {
                setIsLoadingNotePages(true);
                const response = await getApi(`student/note-banks/${noteId}/pages`, {
                    Accept: 'application/json',
                    contenttype: 'application/json',
                    authorization: authToken,
                });

                if (!operation.isCurrent()) return;
                const pages = response?.data?.data || response?.data || [];
                setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
                setSelectedNotePages(Array.isArray(pages) ? pages : []);
                setSelectedNotePageIndex(0);
                setShowNoteViewerModal(true);
            } catch {
                if (!operation.isCurrent()) return;
                Toast.show({ type: 'error', text1: 'Unable to load notes. Please reopen to retry.' });
                setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
                setSelectedNotePages([]);
                setSelectedNotePageIndex(0);
                setShowNoteViewerModal(true);
            } finally {
                if (operation.isCurrent()) setIsLoadingNotePages(false);
                operation.finish();
            }
        },
        [authToken, beginRequest],
    );

    const handleOpenQuestionBank = useCallback(
        async (item: any) => {
            const questionBankId = getItemId(item);

            if (!questionBankId) {
                return;
            }

            const operation = beginRequest('questions');
            if (!operation) return;
            setShowQuestionBankModal(true);
            setIsLoadingQuestionBank(true);
            setSelectedQuestionBankTitle(getItemTitle(item, 'Question Bank'));
            setSelectedQuestionBankMeta(item);
            setSelectedQuestionBankQuestions([]);
            setSelectedQuestionIndex(0);
            setShowQuestionAnswerModal(false);
            setSelectedQuestionAnswerDetail(null);

            try {
                const response = await getApi(`student/question-banks/${questionBankId}/questions`, {
                    Accept: 'application/json',
                    contenttype: 'application/json',
                    authorization: authToken,
                });
                if (!operation.isCurrent()) return;
                const questions = getQuestionBankQuestions(response);
                setSelectedQuestionBankQuestions(Array.isArray(questions) ? questions : []);
            } catch {
                if (!operation.isCurrent()) return;
                Toast.show({ type: 'error', text1: 'Unable to load questions. Please reopen to retry.' });
                setSelectedQuestionBankQuestions([]);
            } finally {
                if (operation.isCurrent()) setIsLoadingQuestionBank(false);
                operation.finish();
            }
        },
        [authToken, beginRequest],
    );

    const handleOpenVideoBank = useCallback(
        async (item: any) => {
            const videoBankId = getItemId(item) || item?.videoBankId;
            const directVideoUrl = getVideoBankUrl(item);

            if (directVideoUrl) {
                await openExternalVideoUrl(directVideoUrl);
                return;
            }

            if (!videoBankId) {
                return;
            }

            const operation = beginRequest('videos');
            if (!operation) return;
            setSelectedVideoBankItems([]);
            setShowVideoBankModal(true);
            try {
                setIsLoadingVideoBank(true);
                setSelectedVideoBankTitle(getItemTitle(item, 'Video Bank'));
                const response = await getApi(`student/video-banks/${videoBankId}/items`, {
                    Accept: 'application/json',
                    contenttype: 'application/json',
                    authorization: authToken,
                });
                if (!operation.isCurrent()) return;
                const items = getVideoBankItems(response);
                setSelectedVideoBankItems(items);

                if (items.length === 1) {
                    const singleUrl = getVideoBankUrl(items[0]);
                    if (singleUrl) {
                        setShowVideoBankModal(false);
                        await openExternalVideoUrl(singleUrl);
                        return;
                    }
                }

                setShowVideoBankModal(true);
            } catch {
                if (!operation.isCurrent()) return;
                Toast.show({ type: 'error', text1: 'Unable to load videos. Please reopen to retry.' });
                setSelectedVideoBankItems([]);
                setShowVideoBankModal(false);
            } finally {
                if (operation.isCurrent()) setIsLoadingVideoBank(false);
                operation.finish();
            }
        },
        [authToken, openExternalVideoUrl, beginRequest],
    );

    const handleOpenDocumentFolder = useCallback(
        (item: any) => {
            const folderId = getItemId(item);

            if (!folderId) {
                return;
            }

            if (!acceptAction(`folder:${folderId}`)) return;
            setSelectedDocumentFolderTitle(getItemTitle(item, 'Document'));
            setShowDocumentFolderModal(true);
            dispatch(documentRequest(folderId));
        },
        [dispatch, acceptAction],
    );

    const handleOpenDocumentPdf = useCallback(
        (docId: string, title: string) => {
            if (!docId) return;
            if (!acceptAction(`pdfDoc:${docId}`)) return;
            setSelectedPdfDocId(docId);
            setSelectedPdfTitle(title);
            setShowDocumentPdfModal(true);
        },
        [acceptAction],
    );

    const handleOpenCourseItem = useCallback(
        (sectionKey: string, item: any) => {
            const contentName = getItemTitle(
                item,
                sectionKey === 'note'
                    ? 'Note Bank'
                    : sectionKey === 'question'
                    ? 'Question Bank'
                    : sectionKey === 'video'
                    ? 'Video Bank'
                    : sectionKey === 'document'
                    ? 'Document'
                    : 'Content',
            );

            if (paymentHistoryLoading) {
                Toast.show({ type: 'info', text1: 'Verifying payment status, please wait...' });
                return;
            }

            if (
                activePaymentSession?.resourceId &&
                !enrolledBundleIds.includes(String(activePaymentSession.resourceId))
            ) {
                Toast.show({ type: 'info', text1: 'Please complete the current payment first.' });
                return;
            }

            if (!detailScreen?.isEnrolled) {
                showCategoryExamContentLockedToast(contentName);
                return;
            }

            if (sectionKey === 'note') {
                handleOpenNoteBank(item);
                return;
            }

            if (sectionKey === 'question') {
                handleOpenQuestionBank(item);
                return;
            }

            if (sectionKey === 'video') {
                handleOpenVideoBank(item);
                return;
            }

            if (sectionKey === 'document') {
                handleOpenDocumentFolder(item);
                return;
            }
        },
        [
            activePaymentSession?.resourceId,
            enrolledBundleIds,
            handleOpenNoteBank,
            handleOpenQuestionBank,
            handleOpenVideoBank,
            handleOpenDocumentFolder,
            paymentHistoryLoading,
            detailScreen?.isEnrolled,
            showCategoryExamContentLockedToast,
        ],
    );

    const renderCourseSectionItem = useCallback(
        ({ item }: { item: any }) => {
            const section = filteredActiveCourseSection;
            return section ? (
                <StudyMaterialCard item={item} section={section} onOpen={handleOpenCourseItem} />
            ) : null;
        },
        [filteredActiveCourseSection, handleOpenCourseItem],
    );

    const renderCourseTabContent = () => {
        if (filteredCourseSections.length === 0) {
            return (
                <View style={styles.emptyStateBox}>
                    <Feather name="folder" size={normalize(24)} color="#94A3B8" />
                    <Text style={styles.emptyStateText}>
                        {normalizedDetailSearchQuery
                            ? 'No matching study materials found'
                            : 'No Data Available'}
                    </Text>
                </View>
            );
        }

        const activeSection = filteredActiveCourseSection;

        return (
            <View style={[styles.courseLayout, { flex: 1, flexWrap: 'nowrap' }]}>
                <View style={styles.courseLeftPanel}>
                    <View style={styles.coursePanelHeader}>
                        <Text style={styles.coursePanelLabel}>Sections</Text>
                        <View style={styles.coursePanelCountPill}>
                            <Text style={styles.coursePanelCountText}>{filteredCourseSections.length}</Text>
                        </View>
                    </View>
                    <FlatList
                        data={filteredCourseSections}
                        keyExtractor={(item) => item.key}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(10) }} />}
                        renderItem={({ item }) => {
                            const isActiveSection = activeSection?.key === item.key;
                            const sectionColors: [string, string, string] = isActiveSection
                                ? ['#0F766E', '#14B8A6', '#0EA5E9']
                                : ['#F8FAFC', '#EEF2FF', '#E0F2FE'];

                            return (
                                <Pressable
                                    onPress={() => setActiveCourseSection(item.key)}
                                    style={styles.courseSectionItemPressable}
                                >
                                    <LinearGradient
                                        colors={sectionColors}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[
                                            styles.courseSectionItem,
                                            isActiveSection && styles.courseSectionItemActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.courseSectionText,
                                                isActiveSection && styles.courseSectionTextActive,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        <View
                                            style={[
                                                styles.courseSectionItemDot,
                                                isActiveSection && styles.courseSectionItemDotActive,
                                            ]}
                                        />
                                    </LinearGradient>
                                </Pressable>
                            );
                        }}
                    />
                </View>

                <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.courseRightPanel}
                >
                    <LinearGradient
                        colors={['#0F766E', '#14B8A6', '#0EA5E9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.courseSectionBanner}
                    >
                        <View style={styles.courseSectionBannerPillOnly}>
                            <Text style={styles.courseSectionBannerPillValue}>
                                {(activeSection?.items || []).length}
                            </Text>
                            <Text style={styles.courseSectionBannerPillLabel}>ITEMS</Text>
                        </View>
                    </LinearGradient>
                    <PaginatedList
                        data={activeSection?.items || []}
                        keyExtractor={(item: any, index: number) => String(getItemId(item) || index)}
                        renderItem={renderCourseSectionItem}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                        ListEmptyComponent={
                            <View style={styles.emptyStateBox}>
                                <Feather name="inbox" size={normalize(24)} color="#94A3B8" />
                                <Text style={styles.emptyStateText}>No Data Available</Text>
                            </View>
                        }
                    />
                </LinearGradient>
            </View>
        );
    };

    const openBundleDetails = useCallback(
        (bundle: any, mode: 'view' | 'enroll') => {
            const normalizedBundle = getBundlePayload(bundle);
            const bundleId = getBundleId(normalizedBundle);
            const resolvedBundleId = bundleId ? String(bundleId) : null;
            const bundleTitle = String(getItemTitle(normalizedBundle, 'This content')).trim();

            if (!resolvedBundleId) {
                return;
            }

            if (
                activePaymentSession?.resourceId &&
                String(activePaymentSession.resourceId) !== resolvedBundleId
            ) {
                Toast.show({ type: 'info', text1: 'Complete the current payment first.' });
                return;
            }

            if (
                activePaymentSession?.resourceId === resolvedBundleId &&
                !enrolledBundleIds.includes(resolvedBundleId)
            ) {
                setIsPaymentWebViewVisible(true);
                return;
            }

            if (mainTab === 'exam' && !canUseCategoryExam) {
                showCategoryExamContentLockedToast(bundleTitle);
                return;
            }

            const alreadyEnrolled =
                enrolledBundleOverrides.has(resolvedBundleId) ||
                (!failedPendingBundleIds.has(resolvedBundleId) &&
                    (Boolean(normalizedBundle?.isEnrolled) || enrolledBundleIds.includes(resolvedBundleId)));

            if (!acceptAction(`bundle:${resolvedBundleId}:${mode}`)) return;
            setSelectedSubBundleExam(null);
            setActiveSubBundleId(null);
            setActiveBundleId(resolvedBundleId);

            if (alreadyEnrolled) {
                dispatch(bundleIDRequest({ id: resolvedBundleId }));
                return;
            }

            if (mode === 'enroll') {
                if (pendingEnrollmentId === resolvedBundleId) {
                    return;
                }
                setPendingEnrollmentId(resolvedBundleId);
                const pricing = resolveBundlePricing(normalizedBundle);

                if (pricing.finalPrice > 0) {
                    dispatch(paymentRequest({ id: resolvedBundleId, price: pricing.finalPrice }));
                } else {
                    dispatch(enrollBundleRequest({ id: resolvedBundleId }));
                }
                return;
            }

            dispatch(bundleIDRequest({ id: resolvedBundleId }));
        },
        [
            activePaymentSession,
            enrolledBundleIds,
            mainTab,
            canUseCategoryExam,
            showCategoryExamContentLockedToast,
            enrolledBundleOverrides,
            failedPendingBundleIds,
            pendingEnrollmentId,
            dispatch,
            acceptAction,
        ],
    );

    const handleSubBundlePress = (subBundle: any) => {
        const normalizedSubBundle = getBundlePayload(subBundle);
        const subBundleId = getBundleId(normalizedSubBundle);

        if (!activeBundleId || !subBundleId) {
            return;
        }

        if (paymentHistoryLoading) {
            Toast.show({ type: 'info', text1: 'Verifying payment status, please wait...' });
            return;
        }

        if (
            activePaymentSession?.resourceId &&
            !enrolledBundleIds.includes(String(activePaymentSession.resourceId))
        ) {
            Toast.show({ type: 'info', text1: 'Please complete the current payment first.' });
            return;
        }

        const resolvedSubBundleId = String(subBundleId);
        if (!acceptAction(`subBundle:${resolvedSubBundleId}`)) return;
        setActiveSubBundleId(resolvedSubBundleId);
        dispatch(
            getSubBundleDetailsRequest({
                bundleId: activeBundleId,
                subBundleId: resolvedSubBundleId,
            }),
        );
    };

    const handleBackPress = () => {
        setSearchQuery('');
        setDetailSearchQuery('');
        if (selectedSubBundleExam) {
            setSelectedSubBundleExam(null);
            setActiveSubBundleId(null);
            return;
        }

        if (selectedExam) {
            setSelectedExam(null);
            setActiveBundleId(null);
            setActiveSubBundleId(null);
            dispatch(clearBundleFlowState());
            return;
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            setSearchQuery('');
            setDetailSearchQuery('');
        });
        return unsubscribe;
    }, [navigation]);

    const detailHeader = (
        <>
            <View style={styles.detailSearchWrap}>
                <Input
                    placeholder="Search mock tests or study materials..."
                    leftIcon="search-outline"
                    value={detailSearchQuery}
                    onChangeText={setDetailSearchQuery}
                    containerStyle={styles.detailSearchZeroMargin}
                    inputContainerStyle={styles.detailSearchInput}
                    inputStyle={styles.detailSearchText}
                />
            </View>

            {detailTabs.length > 0 ? (
                <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dynamicTabsCard}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.dynamicTabsScrollContent}
                    >
                        {detailTabs.map((tab: any) => {
                            const isActiveTab = activeDetailTab === tab.key;
                            const tabColors: [string, string, string] = isActiveTab
                                ? ['#0F766E', '#14B8A6', '#0EA5E9']
                                : tab.key === 'mock'
                                ? ['#EEF2FF', '#E0F2FE', '#DBEAFE']
                                : ['#ECFDF5', '#CCFBF1', '#E0F2FE'];

                            return (
                                <Pressable
                                    key={tab.key}
                                    onPress={() => setActiveDetailTab(tab.key)}
                                    style={styles.dynamicTabPressable}
                                >
                                    <LinearGradient
                                        colors={tabColors as [string, string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[
                                            styles.dynamicTabItem,
                                            isActiveTab && styles.dynamicTabItemActive,
                                            isActiveTab && styles.dynamicTabItemActiveGlow,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dynamicTabText,
                                                isActiveTab && styles.dynamicTabTextActive,
                                            ]}
                                        >
                                            {tab.label}
                                        </Text>
                                        <View
                                            style={[
                                                styles.dynamicTabIndicator,
                                                isActiveTab && styles.dynamicTabIndicatorActive,
                                            ]}
                                        />
                                    </LinearGradient>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </LinearGradient>
            ) : null}
        </>
    );

    if (detailScreen) {
        return (
            <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

                <View style={styles.detailHeader}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.detailHeaderContent}>
                            <Pressable onPress={handleBackPress} style={styles.backBtn}>
                                <Feather name="arrow-left" size={normalize(20)} color="#FFFFFF" />
                            </Pressable>
                            <View style={styles.headerTextColumn}>
                                <Text style={styles.headerTagline}>
                                    {showingSubBundle ? 'COURSE' : 'EXAM CATEGORY'}
                                </Text>
                                <Text style={styles.headerMainTitle}>{detailScreen.name}</Text>
                                <Text style={styles.detailSubtitle}>
                                    {showingSubBundle
                                        ? detailScreen.isEnrolled
                                            ? 'You are enrolled. Start any mock below.'
                                            : 'Enroll in the parent bundle to unlock attempts.'
                                        : detailScreen.isEnrolled
                                        ? 'Open any curriculum item below.'
                                        : 'Enroll once to unlock every mock in this course.'}
                                </Text>
                            </View>
                            <View style={styles.headerRightIcon}>
                                {renderIcon(
                                    detailScreen.icon,
                                    detailScreen.iconType,
                                    normalize(20),
                                    detailScreen.iconColor,
                                )}
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                <View style={[styles.detailScrollContent, { flex: 1 }]}>
                    {activeDetailTab === 'course' ? (
                        <>
                            {detailHeader}
                            {renderCourseTabContent()}
                        </>
                    ) : (
                        <MockBankList
                            showingSubBundle={showingSubBundle}
                            filteredSubBundleItems={filteredSubBundleItems}
                            filteredDetailQuizGroups={filteredDetailQuizGroups}
                            mockMarkingMap={mockMarkingMap}
                            canAttemptMocks={canAttemptMocks}
                            isEnrollingBundle={isEnrollingBundle}
                            handleQuizAction={handleQuizAction}
                            handleSubBundlePress={handleSubBundlePress}
                            normalizedDetailSearchQuery={normalizedDetailSearchQuery}
                            header={detailHeader}
                            onVisibleQuizzes={setVisibleQuizzes}
                            scrollOffset={mockScrollOffset}
                        />
                    )}
                </View>

                <NoteBankModal
                    showNoteViewerModal={showNoteViewerModal}
                    setShowNoteViewerModal={setShowNoteViewerModal}
                    selectedNoteBankTitle={selectedNoteBankTitle}
                    isLoadingNotePages={isLoadingNotePages}
                    selectedNotePages={selectedNotePages}
                    setSelectedNotePageIndex={setSelectedNotePageIndex}
                    selectedNotePageIndex={selectedNotePageIndex}
                    insets={insets}
                    setSelectedNotePageDetail={setSelectedNotePageDetail}
                    setShowNotePageModal={setShowNotePageModal}
                />

                <QuestionBankModal
                    showQuestionBankModal={showQuestionBankModal}
                    setShowQuestionBankModal={setShowQuestionBankModal}
                    selectedQuestionBankTitle={selectedQuestionBankTitle}
                    isLoadingQuestionBank={isLoadingQuestionBank}
                    selectedQuestionBankQuestions={selectedQuestionBankQuestions}
                    setSelectedQuestionIndex={setSelectedQuestionIndex}
                    selectedQuestionIndex={selectedQuestionIndex}
                    selectedQuestionBankMeta={selectedQuestionBankMeta}
                    insets={insets}
                    setSelectedQuestionAnswerDetail={setSelectedQuestionAnswerDetail}
                    setShowQuestionAnswerModal={setShowQuestionAnswerModal}
                />

                <QuestionAnswerModal
                    showQuestionAnswerModal={showQuestionAnswerModal}
                    setShowQuestionAnswerModal={setShowQuestionAnswerModal}
                    selectedQuestionAnswerDetail={selectedQuestionAnswerDetail}
                    insets={insets}
                />

                <VideoBankModal
                    showVideoBankModal={showVideoBankModal}
                    setShowVideoBankModal={setShowVideoBankModal}
                    selectedVideoBankTitle={selectedVideoBankTitle}
                    isLoadingVideoBank={isLoadingVideoBank}
                    selectedVideoBankItems={selectedVideoBankItems}
                    openExternalVideoUrl={openExternalVideoUrl}
                />

                <DocumentFolderModal
                    showDocumentFolderModal={showDocumentFolderModal}
                    setShowDocumentFolderModal={setShowDocumentFolderModal}
                    selectedDocumentFolderTitle={selectedDocumentFolderTitle}
                    documentLoading={documentLoading}
                    documentResponse={documentResponse}
                    handleOpenDocumentPdf={handleOpenDocumentPdf}
                />

                <DocumentPdfModal
                    showModal={showDocumentPdfModal}
                    onClose={() => setShowDocumentPdfModal(false)}
                    documentId={selectedPdfDocId}
                    title={selectedPdfTitle}
                />

                <NotePageModal
                    showNotePageModal={showNotePageModal}
                    setShowNotePageModal={setShowNotePageModal}
                    selectedNotePageDetail={selectedNotePageDetail}
                />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

            <View style={styles.qBankHeaderBackground}>
                <Header
                    title="All Subject Bank"
                    rightIcon={canUseCategoryExam ? undefined : 'information-circle-outline'}
                    onRightPress={canUseCategoryExam ? undefined : showCategoryExamInfo}
                    light
                    style={styles.qBankHeader}
                />
                <View style={styles.qBankSearchWrap}>
                    <Input
                        placeholder="Search subject exam name ..."
                        leftIcon="search-outline"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        containerStyle={styles.qBankZeroMargin}
                        inputContainerStyle={styles.qBankSearchInput}
                        inputStyle={styles.qBankSearchText}
                    />
                </View>
            </View>

            <CategoryList
                moduleOptions={moduleOptions}
                bundleItems={bundleItems}
                apiCategories={apiCategories}
                mainTab={mainTab}
                setMainTab={setMainTab}
                expandedCategory={expandedCategory}
                setExpandedCategory={setExpandedCategory}
                viewMoreStates={viewMoreStates}
                setViewMoreStates={setViewMoreStates}
                canUseCategoryExam={canUseCategoryExam}
                showCategoryExamInfo={showCategoryExamInfo}
                enrolledBundleOverrides={enrolledBundleOverrides}
                failedPendingBundleIds={failedPendingBundleIds}
                enrolledBundleIds={enrolledBundleIds}
                paymentHistoryLoading={paymentHistoryLoading}
                pendingEnrollmentId={pendingEnrollmentId}
                openBundleDetails={openBundleDetails}
                navigation={navigation}
                subjectBankSkeletonVisible={subjectBankSkeletonVisible}
                insets={insets}
                scrollOffset={catalogScrollOffset}
                paginationMemory={catalogPagination}
                searchKey={debouncedSearchQuery}
                onRetry={retryCourseMetadata}
            />

            <Modal
                visible={isPaymentWebViewVisible && Boolean(activePaymentSession?.paymentUrl)}
                animationType="slide"
                onRequestClose={() => {
                    clearPaymentSession().catch(() => {});
                }}
            >
                <View style={styles.paymentWebViewContainer}>
                    <SafeAreaView edges={['top']} style={styles.paymentWebViewSafeArea}>
                        <View style={styles.paymentWebViewHeader}>
                            <View style={styles.paymentWebViewHeaderText}>
                                <Text style={styles.paymentWebViewLabel}>PAYMENT IN PROGRESS</Text>
                                <Text style={styles.paymentWebViewTitle}>Complete your payment</Text>
                                <Text style={styles.paymentWebViewSubtitle}>
                                    Stay in this screen until payment is confirmed. The course will unlock
                                    automatically.
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => {
                                    clearPaymentSession().catch(() => {});
                                }}
                                style={styles.paymentWebViewCloseBtn}
                            >
                                <Feather name="x" size={normalize(20)} color="#0F172A" />
                            </Pressable>
                        </View>
                    </SafeAreaView>

                    <View style={styles.paymentWebViewBody}>
                        {activePaymentSession?.paymentUrl ? (
                            <WebView
                                source={{ uri: activePaymentSession.paymentUrl }}
                                startInLoadingState
                                originWhitelist={['*']}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                thirdPartyCookiesEnabled={true}
                                sharedCookiesEnabled={true}
                                setSupportMultipleWindows={false}
                                userAgent={
                                    Platform.OS === 'android'
                                        ? 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
                                        : 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
                                }
                                renderLoading={() => (
                                    <View style={styles.paymentWebViewLoading}>
                                        <SubjectBankSkeleton />
                                    </View>
                                )}
                                onNavigationStateChange={(navState) => {
                                    const currentUrl = String(navState.url || '');
                                    const successHints = [
                                        'success',
                                        'payment-success',
                                        'verified',
                                        'paid',
                                        'thank',
                                        'complete',
                                    ];
                                    if (
                                        successHints.some((hint) => currentUrl.toLowerCase().includes(hint))
                                    ) {
                                        verifyPaymentAndContinue(
                                            String(activePaymentSession.resourceId),
                                        ).catch(() => {});
                                    }
                                }}
                                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                                onError={() => {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Unable to load payment page. Please try again.',
                                    });
                                }}
                            />
                        ) : (
                            <View style={styles.paymentWebViewLoading}>
                                <SubjectBankSkeleton />
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export const CourseScreen = CoursesScreen;
