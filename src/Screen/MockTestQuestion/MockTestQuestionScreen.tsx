import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    AppStateStatus,
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import Colorpath from '../../Themes/Colorpath';
import { RootStackParamList } from '../../Navigator/StackNav';
import { clearStartTestState, clearTestResult, getTestResultRequest, setActiveTestId, startTestRequest, submitTestRequest } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { Fonts, theme } from '../../Themes';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const { height } = Dimensions.get('window');

type MockTestQuestionScreenProps = any;

const PAGE_BUFFER_SECONDS = 15;
const FIVE_MIN_WARNING_SECONDS = 5 * 60;
const SESSION_PREFIX = 'MOCK_TEST_SESSION_';
const DEFAULT_DURATION_SECONDS = 3 * 60;

type SessionState = {
    testId?: string | number;
    attemptId?: string | number | null;
    title?: string;
    startTimestamp: number;
    endTimestamp: number;
    durationSeconds: number;
    rawQuestions: any[];
    currentQuestionIndex: number;
    answers: Record<number, number>;
    visited: number[];
    review: number[];
    autoSubmitTriggered?: boolean;
};

const getSessionKey = (testId?: string | number) => `${SESSION_PREFIX}${String(testId || 'default')}`;

const firstDefined = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '');

const getAttemptId = (response: any) =>
    response?.data?._id ||
    response?.data?.attemptId ||
    response?.attemptId ||
    response?.attempt?.id ||
    response?.attempt?._id ||
    response?.attempt?.attemptId ||
    response?.id ||
    response?._id ||
    null;

const getQuestions = (response: any) => {
    const possibleQuestions =
        response?.questions ||
        response?.quiz?.questions ||
        response?.attempt?.questions ||
        response?.data?.questions ||
        response?.data?.quiz?.questions;

    return Array.isArray(possibleQuestions) ? possibleQuestions : null;
};

const hasResultPayload = (result: any) => {
    const payload = result?.data || result;

    return Boolean(
        payload &&
        (
            Array.isArray(payload?.results) ||
            Array.isArray(payload?.review) ||
            Array.isArray(payload?.questions) ||
            payload?.score !== undefined ||
            payload?.maxScore !== undefined
        )
    );
};

const getDurationSeconds = (response: any, routeDuration?: string | number) => {
    const secondsValue = Number(
        firstDefined(
            response?.durationSeconds,
            response?.durationInSeconds,
            response?.timeLimitSeconds,
            response?.quiz?.durationSeconds,
            response?.attempt?.durationSeconds,
            response?.data?.durationSeconds,
        ),
    );

    if (Number.isFinite(secondsValue) && secondsValue > 0) {
        return secondsValue;
    }

    const minutesValue = Number(
        firstDefined(
            response?.durationMinutes,
            response?.duration,
            response?.timeLimit,
            response?.quiz?.durationMinutes,
            response?.quiz?.duration,
            response?.attempt?.durationMinutes,
            response?.data?.durationMinutes,
            routeDuration,
        ),
    );

    if (Number.isFinite(minutesValue) && minutesValue > 0) {
        return minutesValue * 60;
    }

    return DEFAULT_DURATION_SECONDS;
};

const formatClock = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const remainingSeconds = safeSeconds % 60;

    return [hours, minutes, remainingSeconds].map(unit => String(unit).padStart(2, '0')).join(':');
};

const mapQuestions = (rawQuestions: any[]) =>
    rawQuestions.map((q: any, i: number) => ({
        id: q.id || q._id || i,
        passage: q.passage || q.instructions || 'Read the question carefully and choose the correct option.',
        question: q.text || q.question || q.questionText || 'No question text provided.',
        options: Array.isArray(q.options)
            ? q.options
            : Array.isArray(q.choices)
                ? q.choices
                : ['Option A', 'Option B', 'Option C', 'Option D'],
        originalData: q,
    }));

const MockTestQuestionScreen = ({ route, navigation }: MockTestQuestionScreenProps) => {
    const insets = useSafeAreaInsets();
    const { testId, duration, acceptedTerms, testData } = route.params || {};

    let testPenalty: any = testData?.negativeMarks ?? testData?.negativeMarking ?? testData?.penalty ?? testData?.quiz?.negativeMarks ?? testData?.quiz?.negativeMarking ?? 0;
    if (typeof testPenalty === 'object' && testPenalty !== null) {
        testPenalty = testPenalty?.value ?? 0;
    }

    const dispatch = useDispatch();
    const { startTestResponse, submitTestResponse, testResult, isLoading, error, status } = useSelector((state: RootState) => state.MockTestReducer);

    const [rawQuestions, setRawQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showPalette, setShowPalette] = useState(false);
    const [visited, setVisited] = useState<Set<number>>(new Set([0]));
    const [reviewed, setReviewed] = useState<Set<number>>(new Set());
    const [isSubmittingExam, setIsSubmittingExam] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_DURATION_SECONDS);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [sessionMeta, setSessionMeta] = useState<Pick<SessionState, 'attemptId' | 'title' | 'startTimestamp' | 'endTimestamp' | 'durationSeconds'> | null>(null);
    const [syncStatus, setSyncStatus] = useState<'saving' | 'saved' | 'offline'>('saved');
    const [isOnline, setIsOnline] = useState(true);

    const answersRef = useRef<Record<number, number>>({});
    const visitedRef = useRef<Set<number>>(new Set([0]));
    const reviewedRef = useRef<Set<number>>(new Set());
    const currentIndexRef = useRef(0);
    const sessionMetaRef = useRef<typeof sessionMeta>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const autoSubmitTriggeredRef = useRef(false);
    const submittingRef = useRef(false);
    const fiveMinuteWarningShownRef = useRef(false);
    const jumpPulse = useRef(new Animated.Value(0)).current;

    const mappedQuestions = useMemo(() => mapQuestions(rawQuestions), [rawQuestions]);
    const currentQ = mappedQuestions[currentQuestionIndex];
    const selectedOption = answers[currentQuestionIndex] !== undefined ? answers[currentQuestionIndex] : null;
    const submittedAttemptId = getAttemptId(submitTestResponse) || sessionMeta?.attemptId || getAttemptId(startTestResponse);
    const questions = useMemo(() => Array.from({ length: mappedQuestions.length }, (_, i) => i + 1), [mappedQuestions.length]);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        visitedRef.current = visited;
    }, [visited]);

    useEffect(() => {
        reviewedRef.current = reviewed;
    }, [reviewed]);

    useEffect(() => {
        currentIndexRef.current = currentQuestionIndex;
    }, [currentQuestionIndex]);

    useEffect(() => {
        sessionMetaRef.current = sessionMeta;
    }, [sessionMeta]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = Boolean(state.isConnected && state.isInternetReachable !== false);
            setIsOnline(online);
            setSyncStatus(online ? 'saved' : 'offline');
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(jumpPulse, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(jumpPulse, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [jumpPulse]);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            try {
                const cachedSession = await AsyncStorage.getItem(getSessionKey(testId));
                if (!isMounted) {
                    return;
                }

                if (cachedSession) {
                    const parsed: SessionState = JSON.parse(cachedSession);
                    if (String(parsed?.testId) === String(testId) && parsed?.endTimestamp) {
                        setRawQuestions(Array.isArray(parsed.rawQuestions) ? parsed.rawQuestions : []);
                        setCurrentQuestionIndex(parsed.currentQuestionIndex ?? 0);
                        setAnswers(parsed.answers || {});
                        setVisited(new Set(parsed.visited?.length ? parsed.visited : [0]));
                        setReviewed(new Set(parsed.review || []));
                        setSessionMeta({
                            attemptId: parsed.attemptId ?? null,
                            title: parsed.title || 'Mock Test',
                            startTimestamp: parsed.startTimestamp,
                            endTimestamp: parsed.endTimestamp,
                            durationSeconds: parsed.durationSeconds || DEFAULT_DURATION_SECONDS,
                        });
                        autoSubmitTriggeredRef.current = Boolean(parsed.autoSubmitTriggered);
                        fiveMinuteWarningShownRef.current = Math.max(0, Math.ceil((parsed.endTimestamp - Date.now()) / 1000)) <= FIVE_MIN_WARNING_SECONDS;
                        setRemainingSeconds(Math.max(0, Math.ceil((parsed.endTimestamp - Date.now()) / 1000)));
                        setSessionLoaded(true);
                        return;
                    }
                }
            } catch {
                // Ignore broken cache and start fresh.
            }

            if (testId && !startTestResponse) {
                dispatch(clearStartTestState());
                dispatch(setActiveTestId(testId));
                dispatch(startTestRequest({ id: testId, acceptedTerms: Boolean(acceptedTerms) }));
            }
            setSessionLoaded(true);
        };

        restoreSession();

        return () => {
            isMounted = false;
        };
    }, [dispatch, testId]);

    useEffect(() => {
        if (!sessionLoaded || sessionMetaRef.current) {
            return;
        }

        const initialAttemptId = getAttemptId(startTestResponse);
        if (!initialAttemptId && !getQuestions(startTestResponse)) {
            return;
        }

        const questionsFromResponse = getQuestions(startTestResponse) || [];
        const durationSeconds = getDurationSeconds(startTestResponse, duration);
        const now = Date.now();

        setRawQuestions(questionsFromResponse);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setVisited(new Set([0]));
        setReviewed(new Set());
        setSessionMeta({
            attemptId: initialAttemptId,
            title: startTestResponse?.title || startTestResponse?.quiz?.title || 'Mock Test',
            startTimestamp: now,
            endTimestamp: now + durationSeconds * 1000,
            durationSeconds,
        });
        fiveMinuteWarningShownRef.current = false;
        setRemainingSeconds(durationSeconds);
    }, [sessionLoaded, startTestResponse]);

    useEffect(() => {
        if (!sessionLoaded || !sessionMeta) {
            return;
        }

        const payload: SessionState = {
            testId,
            attemptId: sessionMeta.attemptId,
            title: sessionMeta.title,
            startTimestamp: sessionMeta.startTimestamp,
            endTimestamp: sessionMeta.endTimestamp,
            durationSeconds: sessionMeta.durationSeconds,
            rawQuestions,
            currentQuestionIndex,
            answers,
            visited: Array.from(visited),
            review: Array.from(reviewed),
            autoSubmitTriggered: autoSubmitTriggeredRef.current,
        };

        let cancelled = false;

        const persistSession = async () => {
            setSyncStatus(isOnline ? 'saving' : 'offline');
            await AsyncStorage.setItem(getSessionKey(testId), JSON.stringify(payload));
            if (!cancelled) {
                setSyncStatus(isOnline ? 'saved' : 'offline');
            }
        };

        persistSession();

        return () => {
            cancelled = true;
        };
    }, [answers, currentQuestionIndex, isOnline, rawQuestions, reviewed, sessionLoaded, sessionMeta, testId, visited]);

    useEffect(() => {
        setVisited(prev => {
            const next = new Set(prev);
            next.add(currentQuestionIndex);
            return next;
        });
    }, [currentQuestionIndex]);

    const submitLatestAnswers = async (autoTriggered = false) => {
        if (submittingRef.current) {
            return;
        }

        const activeAttemptId = sessionMetaRef.current?.attemptId || getAttemptId(startTestResponse);
        if (!activeAttemptId) {
            Toast.show({ type: 'error', text1: 'Test session is not ready yet. Please try again.' });
            return;
        }

        const formattedAnswers = Object.keys(answersRef.current).map(index => {
            const questionIndex = Number(index);
            const question = mappedQuestions[questionIndex];
            const selectedIndex = answersRef.current[questionIndex];
            const optionData = question?.options?.[selectedIndex];

            let answerValue = ['A', 'B', 'C', 'D', 'E', 'F'][selectedIndex] || String(selectedIndex);
            if (typeof optionData === 'object' && optionData !== null) {
                answerValue = optionData.id || optionData._id || optionData.value || answerValue;
            }

            return {
                questionId: question?.id,
                selectedAnswer: answerValue,
                isMarkedForReview: reviewedRef.current.has(questionIndex),
            };
        });

        autoSubmitTriggeredRef.current = autoTriggered || autoSubmitTriggeredRef.current;
        submittingRef.current = true;
        setIsSubmittingExam(true);
        dispatch(submitTestRequest({ id: activeAttemptId, answers: formattedAnswers }));
    };

    useEffect(() => {
        if (!sessionMeta) {
            return;
        }

        const tick = () => {
            const secondsLeft = Math.max(0, Math.ceil((sessionMeta.endTimestamp - Date.now()) / 1000));
            setRemainingSeconds(secondsLeft);

            if (secondsLeft <= FIVE_MIN_WARNING_SECONDS && secondsLeft > PAGE_BUFFER_SECONDS && !fiveMinuteWarningShownRef.current) {
                fiveMinuteWarningShownRef.current = true;
                Toast.show({
                    type: 'error',
                    text1: '5 minutes left',
                    text2: 'Please submit before the timeline ends. Your test will auto-submit near timeout.',
                });
            }

            if (secondsLeft <= PAGE_BUFFER_SECONDS && !autoSubmitTriggeredRef.current) {
                submitLatestAnswers(true);
            }
        };

        tick();
        const timerId = setInterval(tick, 1000);

        return () => clearInterval(timerId);
    }, [sessionMeta]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            const previousState = appStateRef.current;
            appStateRef.current = nextState;

            if ((previousState === 'background' || previousState === 'inactive') && nextState === 'active' && sessionMetaRef.current) {
                const secondsLeft = Math.max(0, Math.ceil((sessionMetaRef.current.endTimestamp - Date.now()) / 1000));
                setRemainingSeconds(secondsLeft);
                if (secondsLeft <= PAGE_BUFFER_SECONDS && !autoSubmitTriggeredRef.current) {
                    submitLatestAnswers(true);
                }
            }
        });

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (isSubmittingExam && submitTestResponse && submittedAttemptId && hasResultPayload(testResult)) {
            const finishFlow = async () => {
                await AsyncStorage.removeItem(getSessionKey(testId));
                autoSubmitTriggeredRef.current = false;
                submittingRef.current = false;
                setIsSubmittingExam(false);
                navigation.replace('ResultsScreen', { attemptId: submittedAttemptId });
            };

            finishFlow();
        }
    }, [isSubmittingExam, navigation, submittedAttemptId, submitTestResponse, testId, testResult]);

    useEffect(() => {
        if (!isSubmittingExam || !submitTestResponse || !submittedAttemptId) {
            return;
        }

        const fallbackId = setTimeout(async () => {
            await AsyncStorage.removeItem(getSessionKey(testId));
            autoSubmitTriggeredRef.current = false;
            submittingRef.current = false;
            setIsSubmittingExam(false);
            navigation.replace('ResultsScreen', { attemptId: submittedAttemptId });
        }, 3000);

        return () => clearTimeout(fallbackId);
    }, [isSubmittingExam, navigation, submitTestResponse, submittedAttemptId, testId]);

    useEffect(() => {
        if (isSubmittingExam && submitTestResponse && !hasResultPayload(testResult)) {
            const resultId = submitTestResponse?.data?._id || submitTestResponse?._id || submittedAttemptId;
            if (resultId && status !== 'MockTest/getTestResultRequest') {
                dispatch(getTestResultRequest({ id: resultId }));
            }
        }
    }, [dispatch, isSubmittingExam, status, submitTestResponse, submittedAttemptId, testResult]);

    useEffect(() => {
        if (!isSubmittingExam || !error) {
            return;
        }

        submittingRef.current = false;
        setIsSubmittingExam(false);

        if (autoSubmitTriggeredRef.current) {
            const retryId = setTimeout(() => {
                if (isOnline) {
                    submitLatestAnswers(true);
                }
            }, 3000);

            return () => clearTimeout(retryId);
        }
    }, [error, isOnline, isSubmittingExam]);

    const handleNext = () => {
        if (currentQuestionIndex < mappedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            submitLatestAnswers(false);
        }
    };

    const handlePrev = () => {
        if (isSubmittingExam) {
            return;
        }
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSelectOption = (index: number) => {
        if (isSubmittingExam) {
            return;
        }

        setAnswers(prev => {
            if (prev[currentQuestionIndex] === index) {
                const next = { ...prev };
                delete next[currentQuestionIndex];
                return next;
            }

            return { ...prev, [currentQuestionIndex]: index };
        });
        setVisited(prev => {
            const next = new Set(prev);
            next.add(currentQuestionIndex);
            return next;
        });
    };

    const handleJumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setShowPalette(false);
    };

    const handleClearResponse = () => {
        setAnswers(prev => {
            const next = { ...prev };
            delete next[currentQuestionIndex];
            return next;
        });
    };

    const handleToggleReview = () => {
        setReviewed(prev => {
            const next = new Set(prev);
            if (next.has(currentQuestionIndex)) {
                next.delete(currentQuestionIndex);
            } else {
                next.add(currentQuestionIndex);
            }
            return next;
        });
    };

    if (isSubmittingExam) {
        return (
            <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]} edges={['top', 'left', 'right']}>
                <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />
                <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                    <View style={styles.topBar}>
                        <ShimmerPlaceholder style={{ width: 40, height: 40, borderRadius: 20 }} />
                        <ShimmerPlaceholder style={{ width: 150, height: 24, borderRadius: 6 }} />
                        <ShimmerPlaceholder style={{ width: 40, height: 40, borderRadius: 20 }} />
                    </View>
                </SafeAreaView>
                <View style={{ padding: normalize(20), paddingTop: verticalScale(20) }}>
                    <ShimmerPlaceholder style={{ width: '100%', height: 80, borderRadius: 16, marginBottom: 24 }} />
                    <ShimmerPlaceholder style={{ width: 60, height: 24, borderRadius: 8, marginBottom: 16 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 24, borderRadius: 6, marginBottom: 8 }} />
                    <ShimmerPlaceholder style={{ width: '80%', height: 24, borderRadius: 6, marginBottom: 32 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 60, borderRadius: 12, marginBottom: 12 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 60, borderRadius: 12, marginBottom: 12 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 60, borderRadius: 12, marginBottom: 12 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 60, borderRadius: 12 }} />
                </View>

                {/* Modern Professional Loading UI Overlay */}
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingSpinner} />
                        <Text style={styles.loadingOverlayTitle}>Preparing Result...</Text>
                        <Text style={styles.loadingOverlaySubtitle}>Analyzing your performance</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
            <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.topBar}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Icon name="arrow-back" size={normalize(24)} color={theme.colors.text} />
                    </Pressable>
                    <Text style={styles.headerTitle} numberOfLines={1}>{sessionMeta?.title || startTestResponse?.title || startTestResponse?.quiz?.title || 'Mock Test'}</Text>
                    <Pressable style={styles.jumpIconButton} onPress={() => setShowPalette(!showPalette)}>
                        <Icon name="grid-outline" size={normalize(22)} color={theme.colors.primary} />
                    </Pressable>
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <View style={styles.subHeaderLeft}>
                    <View style={styles.qCountBadge}>
                        <Text style={styles.qCountText}>Q {currentQuestionIndex + 1} / {mappedQuestions.length}</Text>
                    </View>
                    <View style={[styles.syncBadge, !isOnline && styles.syncBadgeOffline]}>
                        <View style={[styles.syncDot, !isOnline && styles.syncDotOffline]} />
                        <Text style={[styles.syncText, !isOnline && styles.syncTextOffline]}>
                            {!isOnline ? 'Offline' : syncStatus === 'saving' ? 'Saving' : 'Saved'}
                        </Text>
                    </View>
                </View>
                <View style={styles.timerBadge}>
                    <Icon name="time-outline" size={normalize(16)} color="#FFFFFF" />
                    <Text style={styles.timerText}>{formatClock(remainingSeconds)}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: verticalScale(120) + insets.bottom }]}>
                {isLoading && mappedQuestions.length === 0 ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loaderText}>Loading questions...</Text>
                    </View>
                ) : mappedQuestions.length === 0 ? (
                    <View style={styles.loaderContainer}>
                        <Text style={styles.loaderText}>No questions were returned for this test yet.</Text>
                    </View>
                ) : (
                    <>
                        {currentQ?.passage ? (
                            <View style={styles.passageContainer}>
                                <View style={styles.passageHeader}>
                                    <Icon name="information-circle" size={16} color="#0284C7" />
                                    <Text style={styles.passageLabel}>REFERENCE INFO</Text>
                                </View>
                                <Text style={styles.passageText}>{currentQ.passage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.tagsRow}>
                            <View style={styles.tagGreen}>
                                <Text style={styles.tagGreenText}>{testData?.title || 'General'}</Text>
                            </View>
                            <View style={styles.tagYellow}>
                                <Text style={styles.tagYellowText}>{`${testPenalty} penalty`}</Text>
                            </View>

                            <View style={styles.tagGreen}>
                                <Text style={styles.tagGreenText}>Full mark :{testData?.totalMarks || '100'}</Text>
                            </View>
                        </View>

                        <Text style={styles.questionText}>
                            Q{currentQuestionIndex + 1}. {currentQ?.question}
                        </Text>

                        <View style={styles.optionsContainer}>
                            {currentQ?.options?.map((option: any, index: number) => {
                                const isSelected = answers[currentQuestionIndex] === index;
                                const optionText = typeof option === 'string' ? option : option?.text || option?.value || String(option);
                                return (
                                    <Pressable
                                        key={index}
                                        style={[
                                            styles.optionContainer,
                                            isSelected && styles.optionSelected,
                                        ]}
                                        onPress={() => handleSelectOption(index)}
                                    >
                                        <View style={[
                                            styles.radioCircle,
                                            isSelected && styles.radioCircleSelected,
                                        ]}>
                                            {isSelected && <View style={styles.radioDot} />}
                                        </View>
                                        <Text style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                                            {['A', 'B', 'C', 'D', 'E', 'F'][index]}
                                        </Text>
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {optionText}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </>
                )}
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + verticalScale(10), verticalScale(24)) }]}>
                <Pressable style={[styles.prevButton, isSubmittingExam && styles.disabledButton]} onPress={handlePrev} disabled={isSubmittingExam}>
                    <Icon name="chevron-back" size={normalize(20)} color={theme.colors.text} />
                </Pressable>

                <Pressable
                    style={[
                        styles.reviewButton,
                        reviewed.has(currentQuestionIndex) && styles.reviewButtonActive,
                        isSubmittingExam && styles.disabledButton,
                    ]}
                    onPress={handleToggleReview}
                    disabled={isSubmittingExam}
                >
                    <Icon name={reviewed.has(currentQuestionIndex) ? "bookmark" : "bookmark-outline"} size={normalize(18)} color={reviewed.has(currentQuestionIndex) ? '#FFFFFF' : '#D97706'} style={styles.reviewIcon} />
                    <Text style={[styles.reviewButtonText, reviewed.has(currentQuestionIndex) && styles.reviewButtonTextActive]}>
                        {reviewed.has(currentQuestionIndex) ? 'Marked' : 'Review'}
                    </Text>
                </Pressable>

                <Pressable style={[styles.nextButton, isSubmittingExam && styles.submittingButton]} onPress={handleNext} disabled={isSubmittingExam}>
                    {isSubmittingExam ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Text style={styles.nextButtonText}>{currentQuestionIndex === mappedQuestions.length - 1 ? 'Submit' : 'Next'}</Text>
                            <Icon name={currentQuestionIndex === mappedQuestions.length - 1 ? 'checkmark' : 'chevron-forward'} size={normalize(18)} color="#FFFFFF" />
                        </>
                    )}
                </Pressable>
            </View>

            {showPalette && (
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
                            <Text style={styles.paletteStatText}>Answered: {Object.keys(answers).length}</Text>
                            <Text style={styles.paletteStatText}>Skipped: {visited.size - Object.keys(answers).length - reviewed.size}</Text>
                            <Text style={styles.paletteStatText}>Remaining: {mappedQuestions.length - visited.size}</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.gridContainer}>
                                {questions.map((questionNumber) => {
                                    const index = questionNumber - 1;
                                    const hasAnswer = answers[index] !== undefined;
                                    const isReview = reviewed.has(index);
                                    const isCurrent = index === currentQuestionIndex;
                                    const isVisited = visited.has(index);

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
                                    } else if (isVisited) {
                                        boxStyle = { ...boxStyle, ...styles.gridSkipped };
                                        textStyle = { ...textStyle, ...styles.gridTextSkipped };
                                    }

                                    return (
                                        <Pressable
                                            key={questionNumber}
                                            style={boxStyle}
                                            onPress={() => handleJumpToQuestion(index)}
                                        >
                                            <Text style={textStyle}>{questionNumber}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <View style={styles.paletteLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridCurrent]} />
                                <Text style={styles.legendText}>Current</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridAnswered]} />
                                <Text style={styles.legendText}>Attempted</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridReview]} />
                                <Text style={styles.legendText}>Review</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridAnsweredMarked]} />
                                <Text style={styles.legendText}>Ans + Review</Text>
                            </View>
                        </View>
                        <View style={styles.paletteFooter}>
                            <Pressable style={[styles.footerBtnOutline, isSubmittingExam && styles.disabledButton]} disabled={isSubmittingExam} onPress={handleClearResponse}>
                                <Text style={styles.footerBtnText}>Clear</Text>
                            </Pressable>
                            <Pressable style={[styles.footerBtnSolid, isSubmittingExam && styles.submittingButton]} disabled={isSubmittingExam} onPress={() => {
                                setShowPalette(false);
                                handleNext();
                            }}>
                                {isSubmittingExam ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.footerBtnSolidText}>{currentQuestionIndex === mappedQuestions.length - 1 ? 'Submit Exam' : 'Save & Next'}</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    headerSafeArea: { backgroundColor: '#F8FAFC' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingTop: verticalScale(12), paddingBottom: verticalScale(16) },
    iconButton: { width: normalize(40), height: normalize(40), borderRadius: normalize(20), backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
    jumpIconButton: { width: normalize(40), height: normalize(40), borderRadius: normalize(20), backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: "bold", fontFamily: Fonts.interbold, color: theme.colors.text, textAlign: 'center', marginHorizontal: normalize(12) },

    subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingBottom: verticalScale(16), borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    subHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: normalize(12) },
    qCountBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), borderRadius: normalize(10), borderWidth: 1, borderColor: theme.colors.border },
    qCountText: { fontSize: normalize(13), fontFamily: Fonts.interbold, color: theme.colors.text },
    syncBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(8), paddingVertical: verticalScale(6), borderRadius: normalize(8), gap: normalize(4) },
    syncBadgeOffline: {},
    syncDot: { width: normalize(6), height: normalize(6), borderRadius: normalize(3), backgroundColor: '#10B981' },
    syncDotOffline: { backgroundColor: '#EF4444' },
    syncText: { color: Colorpath.TextSecondary, fontSize: normalize(11), fontFamily: Fonts.intermedium },
    syncTextOffline: { color: '#EF4444' },

    timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: normalize(14), paddingVertical: verticalScale(8), borderRadius: normalize(12), gap: normalize(6), shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    timerText: { color: '#FFFFFF', fontSize: normalize(14), fontFamily: Fonts.interbold },

    scrollContent: { paddingHorizontal: normalize(20), paddingTop: verticalScale(24), paddingBottom: verticalScale(120) },
    loaderContainer: { marginTop: verticalScale(40), alignItems: 'center' },
    loaderText: { marginTop: verticalScale(12), color: Colorpath.TextSecondary, fontFamily: Fonts.intermedium },

    passageContainer: { backgroundColor: '#F0F9FF', padding: normalize(16), borderRadius: normalize(16), marginBottom: verticalScale(24), borderWidth: 1, borderColor: '#E0F2FE' },
    passageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8), gap: normalize(6) },
    passageLabel: { fontSize: normalize(11), fontFamily: Fonts.interbold, color: '#0284C7', letterSpacing: 0.5 },
    passageText: { fontSize: normalize(14), fontFamily: Fonts.interregular, color: '#0F172A', lineHeight: normalize(22) },

    tagsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: verticalScale(12), rowGap: verticalScale(8) },
    tagGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: normalize(10), paddingVertical: verticalScale(4), borderRadius: normalize(6), marginRight: normalize(8) },
    tagGreenText: { color: '#059669', fontFamily: Fonts.intermedium, fontSize: normalize(12), fontWeight: '600' },
    tagYellow: { backgroundColor: '#FEF3C7', paddingHorizontal: normalize(10), paddingVertical: verticalScale(4), borderRadius: normalize(6), marginRight: normalize(8) },
    tagYellowText: { color: '#D97706', fontFamily: Fonts.intermedium, fontSize: normalize(12), fontWeight: '600' },

    questionSection: { marginBottom: verticalScale(32) },
    questionText: { fontSize: normalize(17), color: theme.colors.text, fontFamily: Fonts.interbold, lineHeight: normalize(26), marginBottom: verticalScale(24) },

    optionsContainer: { gap: verticalScale(12) },
    optionContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(16), paddingVertical: verticalScale(16), borderRadius: normalize(16), borderWidth: 1, borderColor: theme.colors.border, backgroundColor: '#FFFFFF' },
    optionSelected: { borderColor: theme.colors.primary, backgroundColor: '#F0F9FF' },
    radioCircle: { width: normalize(22), height: normalize(22), borderRadius: normalize(11), borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginRight: normalize(14) },
    radioCircleSelected: { borderColor: theme.colors.primary },
    radioDot: { width: normalize(10), height: normalize(10), borderRadius: normalize(5), backgroundColor: theme.colors.primary },
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

    disabledButton: { opacity: 0.5 },
    submittingButton: { opacity: 0.8 },

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
    gridAnsweredMarked: { backgroundColor: '#6366F1', borderWidth: 0 },
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
    footerBtnSolid: { flex: 2, height: normalize(52), backgroundColor: theme.colors.primary, borderRadius: normalize(16), alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    footerBtnSolidText: { color: '#FFFFFF', fontSize: normalize(15), fontFamily: Fonts.interbold },

    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(248, 250, 252, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    loadingCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(24), paddingHorizontal: normalize(32), paddingVertical: verticalScale(40), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10, width: '80%', borderWidth: 1, borderColor: theme.colors.border },
    loadingSpinner: { marginBottom: verticalScale(24), transform: [{ scale: 1.2 }] },
    loadingOverlayTitle: { fontSize: normalize(20), fontFamily: Fonts.interbold, color: theme.colors.text, textAlign: 'center', marginBottom: verticalScale(8) },
    loadingOverlaySubtitle: { fontSize: normalize(14), color: Colorpath.TextSecondary, textAlign: 'center', fontFamily: Fonts.intermedium },
});

export default MockTestQuestionScreen;
