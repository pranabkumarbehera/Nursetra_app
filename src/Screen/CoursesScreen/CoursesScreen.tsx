import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, ActivityIndicator, Modal, Linking, FlatList, Platform, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { getApi } from '../../Utils/Helpers/ApiRequest';
import constants from '../../Utils/Helpers/constants';
import { Header } from '../../Components/headers/Header';
import { Input } from '../../Components/inputs/Input';
import { Fonts, theme } from '../../Themes';
import { CategoriesFAB } from '../../Components/CategoriesFAB';
import { SubjectBankSkeleton } from '../../Components/LoadingSkeletons';
import { FREE_MOCK_BUNDLE_NAME, getNursingSubjectName, getNursingSubjectOrder } from '../../Utils/Constants/Subjects';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import {
    bundleIDRequest,
    clearBundleFlowState,
    clearPaymentSession as clearPaymentSessionAction,
    enrollBundleFailure,
    enrollBundleRequest,
    enrollBundleSuccess,
    getBundleListRequest,
    // getMockTestDetailsRequest,
    getStudentModulesRequest,
    getSubBundleDetailsRequest,
    getSubBundleListRequest,
    paymentRequest,
    paymentFailure,
    documentRequest,
} from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';
// import { clearCoursesData, fetchBannersRequest, fetchCategoriesRequest, fetchCoursesRequest } from '../../Redux/Reducers/CourseReducer';

// const FALLBACK_COURSE_IMAGE = require('../../Assets/Images/Logo_small.png');

type CoursesScreenProps = {
    navigation: any;
};

const DEFAULT_EXAM_META = {
    icon: 'book-open',
    iconType: 'Feather',
    bgColor: '#EEF2FF',
    iconColor: '#4F46E5',
    pattern: {
        questions: '-',
        marks: '-',
        marksPerQuestion: '-',
        negativeMarking: '-',
        duration: '-',
        note: '-',
    },
};

const EXAM_ICON_THEMES = [
    { bgColor: '#EEF2FF', iconColor: '#4F46E5' },
    { bgColor: '#E0F2FE', iconColor: '#0284C7' },
    { bgColor: '#FEF3C7', iconColor: '#D97706' },
    { bgColor: '#D1FAE5', iconColor: '#059669' },
    { bgColor: '#F3E8FF', iconColor: '#7C3AED' },
    { bgColor: '#FEE2E2', iconColor: '#DC2626' },
    { bgColor: '#FFEDD5', iconColor: '#EA580C' },
];

const SUBJECT_CARD_THEMES = [
    { colors: ['#0F766E', '#14B8A6', '#2DD4BF'], tint: 'rgba(15, 118, 110, 0.14)' },
    { colors: ['#1D4ED8', '#38BDF8', '#60A5FA'], tint: 'rgba(29, 78, 216, 0.14)' },
    { colors: ['#D97706', '#F59E0B', '#FBBF24'], tint: 'rgba(217, 119, 6, 0.14)' },
    { colors: ['#7C3AED', '#A855F7', '#EC4899'], tint: 'rgba(124, 58, 237, 0.14)' },
    { colors: ['#DC2626', '#FB7185', '#F97316'], tint: 'rgba(220, 38, 38, 0.14)' },
];

const EXAM_CHIPS = ['NORCET', 'GNM', 'B.Sc Nursing', 'CHO', 'ESIC', 'RRB'];

const SEGMENT_THEMES = [
    { colors: ['#0F766E', '#14B8A6'], border: 'rgba(15, 118, 110, 0.18)' },
    { colors: ['#1D4ED8', '#38BDF8'], border: 'rgba(29, 78, 216, 0.18)' },
];

const MIN_SUBJECTS_FOR_CATEGORY_EXAM = 2;
const CONTENT_ACCESS_DURATION_LABEL = 'No Expiry';

const getCategoryIconName = (title: string, tab: 'subject' | 'exam') => {
    const value = String(title || '').toLowerCase();

    if (tab === 'exam') {
        if (value.includes('norcet')) return 'medkit-outline';
        if (value.includes('cho')) return 'heart-outline';
        if (value.includes('gnm') || value.includes('anm')) return 'document-text-outline';
        return 'clipboard-outline';
    }

    if (value.includes('nursing') || value.includes('nurse')) return 'medkit-outline';
    if (value.includes('anatomy')) return 'accessibility-outline';
    if (value.includes('physiology')) return 'pulse-outline';
    if (value.includes('micro')) return 'bug-outline';
    if (value.includes('pathology')) return 'flask-outline';
    if (value.includes('pharma')) return 'medical-outline';
    if (value.includes('community')) return 'people-outline';
    if (value.includes('mental')) return 'happy-outline';
    if (value.includes('pedia')) return 'accessibility-outline';
    if (value.includes('obst') || value.includes('gyn')) return 'woman-outline';
    if (value.includes('surg')) return 'cut-outline';
    if (value.includes('medicine')) return 'fitness-outline';
    if (value.includes('book')) return 'book-outline';

    return 'library-outline';
};

const sortNursingTitles = (titles: string[]) =>
    [...titles].sort((left, right) => {
        const leftOrder = getNursingSubjectOrder(left);
        const rightOrder = getNursingSubjectOrder(right);

        if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
        }

        return left.localeCompare(right);
    });

const normalizeTitle = (value: string = '') =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const ensureArray = (value: any) => (Array.isArray(value) ? value : []);

const getBundlePayload = (bundle: any) =>
    bundle?.bundle ||
    bundle?.data?.bundle ||
    bundle?.data ||
    bundle?.details ||
    bundle?.item ||
    bundle?.result ||
    bundle;

const getThemeByIndex = (index: number, themes: any[]) =>
    themes[index % themes.length];

const getThemeIndexFromText = (value: string = '') =>
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getBundleId = (bundle: any) =>
    bundle?.id ||
    bundle?._id ||
    bundle?.testId ||
    bundle?.bundleId ||
    null;

const getQuizId = (quiz: any) => quiz?.id || quiz?._id || quiz?.testId || quiz?.quizId;

const getItemId = (item: any) =>
    item?.id ||
    item?._id ||
    item?.noteId ||
    item?.questionBankId ||
    item?.videoBankId ||
    item?.bankId ||
    null;

const getBundleItems = (bundleList: any) =>
    ensureArray(
        Array.isArray(bundleList)
            ? bundleList
            : (
                bundleList?.data?.bundles ||
                bundleList?.data?.items ||
                bundleList?.data?.quizzes ||
                bundleList?.bundles ||
                bundleList?.quizzes ||
                bundleList?.items ||
                bundleList?.data ||
                []
            )
    ).map(getBundlePayload);

const getSubBundleItems = (subBundleList: any) =>
    ensureArray(
        Array.isArray(subBundleList)
            ? subBundleList
            : (
                subBundleList?.data?.subBundles ||
                subBundleList?.data?.items ||
                subBundleList?.subBundles ||
                subBundleList?.items ||
                subBundleList?.data ||
                []
            )
    ).map(getBundlePayload);

const uniqueBundlesById = (bundles: any[]) => {
    const seen = new Set<string>();

    return bundles.filter((bundle: any, index: number) => {
        const normalizedBundle = getBundlePayload(bundle);
        const bundleId = String(getBundleId(normalizedBundle) || '').trim();
        const dedupeKey = bundleId || `fallback-${index}`;

        if (seen.has(dedupeKey)) {
            return false;
        }

        seen.add(dedupeKey);
        return true;
    });
};

const parseMaybeJson = (value: any) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue || (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('['))) {
        return value;
    }

    try {
        return JSON.parse(trimmedValue);
    } catch {
        return value;
    }
};

const getBundleQuizzes = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const parsedPayloadData = parseMaybeJson(payload?.data);
    const parsedBundleItems = parseMaybeJson(payload?.bundleItems);
    const parsedExamData = parseMaybeJson(payload?.examData);
    const quizCollections = [
        payload?.displayData,
        payload?.mock?.displayData,
        payload?.mockTests,
        payload?.quizzes,
        payload?.quizIds,
        payload?.tests,
        parsedBundleItems,
        parsedPayloadData?.displayData,
        parsedPayloadData?.mock?.displayData,
        payload?.items,
        parsedPayloadData?.quizzes,
        parsedPayloadData?.mockTests,
        parsedPayloadData?.quizIds,
        parsedPayloadData?.tests,
        parsedPayloadData?.bundleItems,
        parsedPayloadData?.items,
        parsedExamData?.displayData,
        parsedExamData?.mock?.displayData,
        parsedExamData?.quizzes,
        parsedExamData?.mockTests,
        parsedExamData?.tests,
    ];

    for (const collection of quizCollections) {
        if (Array.isArray(collection) && collection.length > 0) {
            return collection;
        }
    }

    return [];
};

const isEliteMockBundle = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const normalizedTitle = normalizeTitle(String(payload?.title || payload?.name || ''));
    const normalizedCategory = normalizeTitle(String(payload?.category || ''));

    return (
        normalizedTitle.includes('elite mock bundle') ||
        normalizedTitle.includes('elite mock') ||
        normalizedTitle.includes('mock bundle') ||
        normalizedCategory.includes('elite mock bundle') ||
        normalizedCategory.includes('elite mock') ||
        normalizedCategory.includes('mock bundle')
    );
};

const isFreeMockBundle = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const normalizedTitle = normalizeTitle(String(payload?.title || payload?.name || ''));
    const normalizedCategory = normalizeTitle(String(payload?.category || ''));
    const freeMockBundleKey = normalizeTitle(FREE_MOCK_BUNDLE_NAME);

    return (
        normalizedTitle === freeMockBundleKey ||
        normalizedTitle.includes(freeMockBundleKey) ||
        normalizedCategory === freeMockBundleKey ||
        normalizedCategory.includes(freeMockBundleKey)
    );
};

const getDetailCollections = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const parsedData = parseMaybeJson(bundle?.data);
    const sources = [bundle, payload, parsedData];
    const getCollection = (...keys: string[]) => {
        const collected: any[] = [];
        const seenKeys = new Set<string>();

        const pushItems = (items: any[]) => {
            items.forEach((item) => {
                if (!item || typeof item !== 'object') {
                    return;
                }

                const dedupeKey = [
                    item?.id || item?._id || item?.noteId || item?.questionId || item?.videoId || '',
                    item?.title || item?.name || item?.label || item?.heading || '',
                    item?.type || item?.kind || '',
                ].join('|');

                if (seenKeys.has(dedupeKey)) {
                    return;
                }

                seenKeys.add(dedupeKey);
                collected.push(item);
            });
        };

        for (const source of sources) {
            for (const key of keys) {
                const value = source?.[key];
                if (Array.isArray(value) && value.length > 0) {
                    pushItems(value.flatMap((entry: any) => (Array.isArray(entry) ? entry : [entry])));
                }
            }
        }

        return collected;
    };

    const quizzes = getCollection('quizzes', 'mockTests', 'tests');
    const noteBanks = getCollection('note_banks', 'noteBanks', 'notes');
    const questionBanks = getCollection('question_banks', 'questionBanks', 'questions');
    const videoBanks = getCollection('video_banks', 'videoBanks', 'videos', 'youtube_banks', 'youtubeBanks', 'youtube');
    const youtubeBanks = getCollection('youtube_banks', 'youtubeBanks', 'youtube');
    const documentFolders = getCollection('document_folders', 'documentFolders', 'documents');
    const quizCount = Number(
        firstDisplayValue(
            payload?.quizCount,
            parsedData?.quizCount,
            quizzes.length,
        ) || 0,
    );

    return {
        quizzes,
        noteBanks,
        questionBanks,
        videoBanks,
        youtubeBanks,
        documentFolders,
        quizCount,
    };
};

const getItemTitle = (item: any, fallback: string) =>
    item?.title ||
    item?.name ||
    item?.label ||
    item?.heading ||
    item?.questionTitle ||
    item?.videoTitle ||
    item?.noteTitle ||
    fallback;

const getItemDescription = (item: any) =>
    item?.description ||
    item?.subtitle ||
    item?.summary ||
    item?.text ||
    item?.question ||
    item?.questionText ||
    '';

const toDisplayText = (value: any, fallback = ''): string => {
    if (typeof value === 'string') {
        return htmlToPlainText(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value
            .map(entry => toDisplayText(entry, ''))
            .filter(Boolean)
            .join(', ');
    }

    if (value && typeof value === 'object') {
        return toDisplayText(
            value?.htmlContent ||
            value?.label ||
            value?.title ||
            value?.text ||
            value?.name ||
            value?.value ||
            value?.question ||
            value?.answer ||
            value?.content ||
            fallback,
            fallback,
        );
    }

    return fallback;
};

const getQuestionBankYear = (item: any) =>
    item?.year ||
    item?.examYear ||
    item?.sessionYear ||
    item?.academicYear ||
    null;

const getQuestionBankQuestions = (response: any) => {
    const seen = new WeakSet<object>();
    const arrayKeys = [
        'questions',
        'items',
        'results',
        'rows',
        'docs',
        'records',
        'list',
        'question_list',
        'questionList',
        'data',
        'result',
        'payload',
        'questionBank',
        'question_bank',
        'bank',
    ];

    const walk = (value: any): any[] => {
        if (!value) {
            return [];
        }

        const parsedValue = parseMaybeJson(value);
        if (Array.isArray(parsedValue)) {
            return parsedValue;
        }

        if (!parsedValue || typeof parsedValue !== 'object') {
            return [];
        }

        const looksLikeQuestion =
            parsedValue?.question !== undefined ||
            parsedValue?.questionText !== undefined ||
            parsedValue?.text !== undefined ||
            parsedValue?.answer !== undefined ||
            parsedValue?.explanation !== undefined ||
            parsedValue?.options !== undefined ||
            parsedValue?.choices !== undefined;

        if (looksLikeQuestion) {
            return [parsedValue];
        }

        if (seen.has(parsedValue)) {
            return [];
        }
        seen.add(parsedValue);

        for (const key of arrayKeys) {
            const candidate = parsedValue?.[key];
            if (Array.isArray(candidate)) {
                return candidate;
            }

            const nested = walk(candidate);
            if (nested.length > 0) {
                return nested;
            }
        }

        for (const nestedValue of Object.values(parsedValue)) {
            const nested = walk(nestedValue);
            if (nested.length > 0) {
                return nested;
            }
        }

        return [];
    };

    const payloadCandidates = [
        response?.data?.data,
        response?.data,
        response,
    ];

    for (const candidate of payloadCandidates) {
        const questions = walk(candidate);
        if (questions.length > 0) {
            return questions;
        }
    }

    return [];
};

const getQuestionPrompt = (item: any) =>
    item?.question ||
    item?.questionText ||
    item?.text ||
    item?.title ||
    item?.prompt ||
    '';

const getQuestionAnswer = (item: any) =>
    item?.answer ||
    item?.correctAnswer ||
    item?.correct_answer ||
    item?.solution ||
    item?.response ||
    '';

const getQuestionExplanation = (item: any) =>
    item?.explanation ||
    item?.answerExplanation ||
    item?.answer_explanation ||
    item?.solutionExplanation ||
    item?.solution ||
    '';

const getQuestionOptions = (item: any) =>
    ensureArray(
        item?.options ||
        item?.choices ||
        item?.answers ||
        item?.variants ||
        item?.mcqOptions ||
        item?.optionList ||
        [],
    );

const getVideoBankUrl = (item: any) =>
    item?.videoUrl ||
    item?.youtubeUrl ||
    item?.url ||
    item?.link ||
    item?.contentUrl ||
    item?.path ||
    null;

const getYouTubeVideoId = (url: string) => {
    if (!url) {
        return '';
    }

    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]+)/i);
    return match?.[1] || '';
};

const getVideoBankItems = (response: any) => {
    const payloadCandidates = [
        response?.data?.data,
        response?.data,
        response,
    ];

    const arrayKeys = ['items', 'videos', 'results', 'data', 'list', 'records'];

    const seen = new WeakSet<object>();
    const walk = (value: any): any[] => {
        if (!value) {
            return [];
        }

        const parsedValue = parseMaybeJson(value);
        if (Array.isArray(parsedValue)) {
            return parsedValue;
        }

        if (!parsedValue || typeof parsedValue !== 'object') {
            return [];
        }

        if (seen.has(parsedValue)) {
            return [];
        }
        seen.add(parsedValue);

        if (parsedValue?.videoUrl || parsedValue?.youtubeUrl || parsedValue?.url || parsedValue?.link) {
            return [parsedValue];
        }

        for (const key of arrayKeys) {
            const candidate = parsedValue?.[key];
            if (Array.isArray(candidate)) {
                return candidate;
            }

            const nested = walk(candidate);
            if (nested.length > 0) {
                return nested;
            }
        }

        for (const nestedValue of Object.values(parsedValue)) {
            const nested = walk(nestedValue);
            if (nested.length > 0) {
                return nested;
            }
        }

        return [];
    };

    for (const candidate of payloadCandidates) {
        const items = walk(candidate);
        if (items.length > 0) {
            return items;
        }
    }

    return [];
};

const normalizeCourseSections = (bundle: any) => {
    const collections = getDetailCollections(bundle);
    return [
        {
            key: 'question',
            label: 'Question bank',
            badge: 'QUESTION BANK',
            items: collections.questionBanks,
            type: 'question' as const,
        },
        {
            key: 'note',
            label: 'Note bank',
            badge: 'NOTE BANK',
            items: collections.noteBanks,
            type: 'note' as const,
        },
        {
            key: 'video',
            label: 'VideoLink Bank',
            badge: 'VIDEO BANK',
            items: collections.videoBanks,
            type: 'video' as const,
        },
        {
            key: 'document',
            label: 'Document',
            badge: 'DOCUMENT',
            items: collections.documentFolders,
            type: 'document' as const,
        },
    ].filter(section => Array.isArray(section.items) && section.items.length > 0);
};

const getNoteBankId = (item: any) =>
    item?.noteId ||
    item?.note_id ||
    item?.note?.noteId ||
    item?.parentNoteId ||
    item?.id ||
    item?._id ||
    null;

const htmlToPlainText = (html: string = '') => {
    if (!html) {
        return '';
    }

    return html
        .replace(/<\s*\/\s*(p|div|h[1-6]|li|tr|table|tbody|thead|pre|blockquote|ul|ol)\s*>/gi, '\n')
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const htmlToNoteText = (html: string = '') => {
    if (!html) {
        return '';
    }

    return html
        .replace(/<\s*style[^>]*>[\s\S]*?<\/\s*style\s*>/gi, '')
        .replace(/<\s*script[^>]*>[\s\S]*?<\/\s*script\s*>/gi, '')
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<\s*\/\s*(p|div|section|article|header|footer|blockquote|table|tbody|thead|tfoot|tr)\s*>/gi, '\n\n')
        .replace(/<\s*\/\s*(h[1-6])\s*>/gi, '\n\n')
        .replace(/<\s*\/\s*li\s*>/gi, '\n')
        .replace(/<\s*li[^>]*>/gi, '\n• ')
        .replace(/<\s*\/\s*(ul|ol)\s*>/gi, '\n')
        .replace(/<\s*\/\s*th\s*>/gi, '\t')
        .replace(/<\s*\/\s*td\s*>/gi, '\t')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
};

const buildNoteHtmlDocument = (html: string = '') => {
    const safeHtml = html || '<p>No content available.</p>';

    return `
        <!doctype html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <style>
                    :root {
                        color-scheme: light;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        background: #FFFFFF;
                        color: #334155;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1.7;
                    }
                    body {
                        padding: 18px 18px 28px;
                        box-sizing: border-box;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        margin: 0 0 12px;
                        color: #0F172A;
                        line-height: 1.25;
                    }
                    p {
                        margin: 0 0 12px;
                    }
                    ul, ol {
                        margin: 0 0 12px 20px;
                        padding: 0;
                    }
                    li {
                        margin: 0 0 6px;
                    }
                    blockquote {
                        margin: 12px 0;
                        padding: 10px 14px;
                        border-left: 4px solid #0F766E;
                        background: #F0FDFA;
                        color: #134E4A;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 12px 0;
                    }
                    th, td {
                        border: 1px solid #E2E8F0;
                        padding: 8px 10px;
                        text-align: left;
                        vertical-align: top;
                    }
                    img, video, iframe {
                        max-width: 100%;
                        height: auto;
                    }
                    pre, code {
                        white-space: pre-wrap;
                        word-break: break-word;
                        background: #F8FAFC;
                        color: #0F172A;
                        border-radius: 10px;
                    }
                    pre {
                        padding: 12px;
                        overflow-x: auto;
                    }
                    code {
                        padding: 2px 6px;
                    }
                </style>
            </head>
            <body>
                ${safeHtml}
            </body>
        </html>
    `;
};

const getBundleMockCount = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const quizzes = getBundleQuizzes(payload);

    if (quizzes.length > 0) {
        return quizzes.length;
    }

    const parsedPattern = parseMaybeJson(payload?.examPattern);
    const parsedData = parseMaybeJson(payload?.data);

    const directCount = firstDisplayValue(
        payload?.mockTestCount,
        payload?.mockTestsCount,
        payload?.quizCount,
        payload?.quizzesCount,
        payload?.testCount,
        payload?.testsCount,
        payload?.totalMocks,
        payload?.totalMockTests,
        payload?.totalQuizzes,
        parsedData?.mockTestCount,
        parsedData?.mockTestsCount,
        parsedData?.quizCount,
        parsedData?.quizzesCount,
        parsedData?.testCount,
        parsedData?.testsCount,
        parsedData?.totalMocks,
        parsedData?.totalMockTests,
        parsedData?.totalQuizzes,
        parsedPattern?.mockTestCount,
        parsedPattern?.quizCount,
        parsedPattern?.testCount,
    );

    return Number(directCount || 0);
};

const getQuizTopicName = (quiz: any) =>
    quiz?.masterTopicId?.name ||
    quiz?.masterTopic?.name ||
    quiz?.topic?.name ||
    quiz?.topicName ||
    quiz?.category ||
    'General';

const getQuizQuestionCount = (quiz: any) =>
    Number(quiz?.questionCount || quiz?.questionsCount || quiz?.totalQuestions || quiz?.questions?.length || 0);

const getQuizDuration = (quiz: any) =>
    Number(quiz?.durationMinutes || quiz?.duration || quiz?.timeLimit || 0);

const getQuizPrice = (quiz: any) =>
    Number(quiz?.price || 0);

const getQuizMarking = (quiz: any) => {
    const directMarking = quiz?.marking ?? quiz?.mock?.marking ?? quiz?.quiz?.marking;
    if (typeof directMarking === 'string' && directMarking.trim()) {
        return directMarking.trim();
    }

    const correctMarks =
        quiz?.positiveMarks ??
        quiz?.correctMarks ??
        quiz?.defaultMarks ??
        quiz?.marksPerQuestion ??
        quiz?.quiz?.positiveMarks ??
        quiz?.quiz?.defaultMarks ??
        quiz?.quiz?.marksPerQuestion ??
        1;
    const rawNeg =
        quiz?.negativeMarks ??
        quiz?.negativeMarking ??
        quiz?.penalty ??
        quiz?.quiz?.negativeMarks ??
        quiz?.quiz?.negativeMarking ??
        0;
    const negVal = typeof rawNeg === 'object' && rawNeg !== null ? rawNeg.value : rawNeg;

    let markingStr = `+${correctMarks}`;
    if (Number(negVal) > 0) {
        markingStr += `/-${Number(negVal)}`;
    } else if (Number(negVal) < 0) {
        markingStr += `/${Number(negVal)}`;
    } else {
        markingStr += `/0`;
    }

    return markingStr;
};

const getQuizTotalMarks = (quiz: any) =>
    Number(
        quiz?.totalMarks ||
        quiz?.maxMarks ||
        quiz?.fullMarks ||
        quiz?.marks ||
        0
    );

const getQuizMarksPerQuestion = (quiz: any) => {
    const directValue =
        quiz?.marksPerQuestion ??
        quiz?.defaultMarks ??
        quiz?.positiveMarks ??
        quiz?.correctMarks;

    if (directValue !== undefined && directValue !== null && `${directValue}` !== '') {
        return Number(directValue);
    }

    const questionCount = getQuizQuestionCount(quiz);
    const totalMarks = getQuizTotalMarks(quiz);

    if (questionCount > 0 && totalMarks > 0) {
        return totalMarks / questionCount;
    }

    return 0;
};

const getQuizNegativeMarking = (quiz: any) => {
    const rawNeg =
        quiz?.negativeMarks ??
        quiz?.negativeMarking ??
        quiz?.penalty ??
        quiz?.quiz?.negativeMarks ??
        quiz?.quiz?.negativeMarking ??
        0;

    if (typeof rawNeg === 'object' && rawNeg !== null) {
        return rawNeg?.value ?? '-';
    }

    return rawNeg ?? '-';
};

const hasDisplayValue = (value: any) =>
    value !== undefined &&
    value !== null &&
    (!(typeof value === 'string') || value.trim() !== '');

const firstDisplayValue = (...values: any[]) =>
    values.find(value => hasDisplayValue(value));

const getPatternValue = (sources: any[], keys: string[]) => {
    for (const source of sources) {
        const parsedSource = parseMaybeJson(source);

        if (!parsedSource || typeof parsedSource !== 'object') {
            continue;
        }

        for (const key of keys) {
            const value = parsedSource?.[key];
            if (hasDisplayValue(value)) {
                return value;
            }
        }
    }

    return null;
};

const getExamMetaByTitle = (title: string = '') => {
    const normalizedBundleTitle = normalizeTitle(title);
    const theme = getThemeByIndex(getThemeIndexFromText(normalizedBundleTitle), EXAM_ICON_THEMES);

    if (normalizedBundleTitle.includes('pgt') || normalizedBundleTitle.includes('graduate')) {
        return { ...DEFAULT_EXAM_META, icon: 'graduation-cap', iconType: 'FontAwesome5', ...theme };
    }
    if (normalizedBundleTitle.includes('teacher') || normalizedBundleTitle.includes('tgt') || normalizedBundleTitle.includes('school')) {
        return { ...DEFAULT_EXAM_META, icon: 'book', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('net') || normalizedBundleTitle.includes('jrf') || normalizedBundleTitle.includes('award')) {
        return { ...DEFAULT_EXAM_META, icon: 'award', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('science') || normalizedBundleTitle.includes('pcm') || normalizedBundleTitle.includes('cbz')) {
        return { ...DEFAULT_EXAM_META, icon: 'activity', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('bed') || normalizedBundleTitle.includes('education')) {
        return { ...DEFAULT_EXAM_META, icon: 'bar-chart-2', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('test') || normalizedBundleTitle.includes('mock')) {
        return { ...DEFAULT_EXAM_META, icon: 'clipboard', iconType: 'Feather', ...theme };
    }

    return { ...DEFAULT_EXAM_META, ...theme };
};

const parseBundleDescription = (description: string = '') => {
    const safeDescription = typeof description === 'string' ? description.trim() : '';
    let descriptionObject: any = null;

    if (safeDescription.startsWith('{') || safeDescription.startsWith('[')) {
        try {
            descriptionObject = JSON.parse(safeDescription);
        } catch {
            descriptionObject = null;
        }
    }

    const getValue = (key: string) => {
        const jsonValue =
            descriptionObject?.[key] ??
            descriptionObject?.pattern?.[key] ??
            descriptionObject?.examPattern?.[key];

        if (jsonValue !== undefined && jsonValue !== null && `${jsonValue}`.trim()) {
            return `${jsonValue}`.trim();
        }

        const match = safeDescription.match(new RegExp(`${key}\\s*:\\s*['"]?([^,\\n'"]+)['"]?`, 'i'));
        return match?.[1]?.trim() || DEFAULT_EXAM_META.pattern[key as keyof typeof DEFAULT_EXAM_META.pattern];
    };

    return {
        questions: getValue('questions'),
        marks: getValue('marks'),
        marksPerQuestion: getValue('marksPerQuestion'),
        negativeMarking: getValue('negativeMarking'),
        duration: getValue('duration'),
        note: getValue('note'),
    };
};

const buildPatternFromBundle = (bundle: any, examPattern: any) => {
    const quizzes = getBundleQuizzes(bundle);
    const bundlePattern =
        parseMaybeJson(bundle?.examPattern) ||
        parseMaybeJson(bundle?.pattern) ||
        parseMaybeJson(bundle?.exam_pattern) ||
        parseMaybeJson(bundle?.details?.examPattern) ||
        parseMaybeJson(bundle?.details?.pattern) ||
        parseMaybeJson(bundle?.data?.examPattern) ||
        parseMaybeJson(bundle?.data?.pattern) ||
        {};
    const parsedPattern = parseBundleDescription(bundle?.description || '');
    const patternSources = [
        bundlePattern,
        parseMaybeJson(bundle?.examPatternJson),
        parseMaybeJson(bundle?.meta),
        parseMaybeJson(bundle?.details?.meta),
        parseMaybeJson(bundle?.data),
    ];
    const totalQuestions = quizzes.reduce((sum: number, quiz: any) => sum + getQuizQuestionCount(quiz), 0);
    const totalMarks = quizzes.reduce((sum: number, quiz: any) => sum + getQuizTotalMarks(quiz), 0);
    const durationMinutes = quizzes.reduce((max: number, quiz: any) => Math.max(max, getQuizDuration(quiz)), 0);
    const firstQuiz = quizzes.find((quiz: any) => quiz && typeof quiz === 'object');
    const bundleQuestions = firstDisplayValue(
        bundle?.questionCount,
        bundle?.questionsCount,
        bundle?.totalQuestions,
        bundle?.noOfQuestions,
        getPatternValue(patternSources, ['questions', 'questionCount', 'questionsCount', 'totalQuestions', 'noOfQuestions']),
        parsedPattern.questions !== '-' ? parsedPattern.questions : null,
        totalQuestions || null,
    );
    const bundleMarks = firstDisplayValue(
        bundle?.totalMarks,
        bundle?.maxMarks,
        bundle?.fullMarks,
        bundle?.marks,
        getPatternValue(patternSources, ['marks', 'totalMarks', 'maxMarks', 'fullMarks']),
        parsedPattern.marks !== '-' ? parsedPattern.marks : null,
        totalMarks || null,
    );
    const resolvedMarksPerQuestion = firstDisplayValue(
        bundle?.marksPerQuestion,
        bundle?.defaultMarks,
        bundle?.positiveMarks,
        bundle?.correctMarks,
        getPatternValue(patternSources, ['marksPerQuestion', 'defaultMarks', 'positiveMarks', 'correctMarks']),
        parsedPattern.marksPerQuestion !== '-' ? parsedPattern.marksPerQuestion : null,
        firstQuiz ? getQuizMarksPerQuestion(firstQuiz) || null : null,
        hasDisplayValue(bundleQuestions) && hasDisplayValue(bundleMarks) && Number(bundleQuestions) > 0
            ? (Number(bundleMarks) / Number(bundleQuestions)).toFixed(2)
            : null,
    );
    const resolvedNegativeMarking = firstDisplayValue(
        bundle?.negativeMarking?.value,
        bundle?.negativeMarking,
        bundle?.negativeMarks,
        bundle?.penalty,
        getPatternValue(patternSources, ['negativeMarking', 'negativeMarks', 'penalty']),
        parsedPattern.negativeMarking !== '-' ? parsedPattern.negativeMarking : null,
        firstQuiz ? getQuizNegativeMarking(firstQuiz) : null,
    );
    const resolvedDuration = firstDisplayValue(
        bundle?.durationMinutes,
        bundle?.duration,
        bundle?.timeLimit,
        getPatternValue(patternSources, ['duration', 'durationMinutes', 'timeLimit']),
        parsedPattern.duration !== '-' ? parsedPattern.duration : null,
        durationMinutes ? `${durationMinutes} min` : null,
    );
    const resolvedNote = firstDisplayValue(
        getPatternValue(patternSources, ['note', 'description', 'instruction']),
        parsedPattern.note !== '-' ? parsedPattern.note : null,
        bundle?.description?.trim(),
        'Tap a mock to continue.',
    );

    return {
        questions: hasDisplayValue(bundleQuestions) ? `${bundleQuestions}` : examPattern.questions,
        marks: hasDisplayValue(bundleMarks) ? `${bundleMarks}` : examPattern.marks,
        marksPerQuestion: hasDisplayValue(resolvedMarksPerQuestion) ? `${resolvedMarksPerQuestion}` : examPattern.marksPerQuestion,
        negativeMarking: hasDisplayValue(resolvedNegativeMarking) ? `${resolvedNegativeMarking}` : examPattern.negativeMarking,
        duration: hasDisplayValue(resolvedDuration) ? `${resolvedDuration}` : examPattern.duration,
        note: hasDisplayValue(resolvedNote) ? `${resolvedNote}` : examPattern.note,
    };
};

const buildQuizCards = (bundle: any) =>
    getBundleQuizzes(bundle)
        .map((quiz: any, index: number) => {
            if (!quiz || typeof quiz !== 'object') {
                return null;
            }

            return {
                id: getQuizId(quiz) || `${index}`,
                title: quiz?.title || quiz?.name || `Mock ${index + 1}`,
                topicName: getQuizTopicName(quiz),
                questionCount: getQuizQuestionCount(quiz),
                durationMinutes: getQuizDuration(quiz),
                price: getQuizPrice(quiz),
                totalMarks: getQuizTotalMarks(quiz),
                negativeMarking: getQuizNegativeMarking(quiz),
                marking: getQuizMarking(quiz),
                rawQuiz: quiz,
            };
        })
        .filter(Boolean);

const buildQuizGroups = (bundle: any) => {
    const groups = buildQuizCards(bundle).reduce((acc: any, quiz: any) => {
        const key = quiz.topicName;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(quiz);
        return acc;
    }, {});

    return Object.entries(groups).map(([title, quizzes]) => ({
        title,
        quizzes,
    }));
};

const buildSelectedExam = (bundle: any, forceEnrolled = false) => {
    const normalizedBundle = getBundlePayload(bundle);
    const examMeta = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');

    return {
        ...examMeta,
        id: getBundleId(normalizedBundle),
        name: normalizedBundle?.title || normalizedBundle?.name || '',
        description: normalizedBundle?.description || '',
        quizIds: getBundleQuizzes(normalizedBundle),
        pattern: {
            ...examMeta.pattern,
            ...buildPatternFromBundle(normalizedBundle, examMeta.pattern),
        },
        quizGroups: buildQuizGroups(normalizedBundle),
        isEnrolled: forceEnrolled,
        rawBundle: normalizedBundle,
    };
};

const collectEnrolledBundleIds = (studentModules: any) => {
    let allCandidates: any[] = [];
    if (studentModules?.bundles) allCandidates = [...allCandidates, ...ensureArray(studentModules.bundles)];
    if (studentModules?.data?.bundles) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.bundles)];
    if (studentModules?.modules) allCandidates = [...allCandidates, ...ensureArray(studentModules.modules)];
    if (studentModules?.data?.modules) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.modules)];
    if (studentModules?.items) allCandidates = [...allCandidates, ...ensureArray(studentModules.items)];
    if (studentModules?.data?.items) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.items)];
    if (studentModules?.data && Array.isArray(studentModules.data)) allCandidates = [...allCandidates, ...studentModules.data];
    if (Array.isArray(studentModules)) allCandidates = [...allCandidates, ...studentModules];

    return allCandidates.reduce((acc: string[], item: any) => {
        if (typeof item !== 'object' || item === null) return acc;

        const bundleId =
            item?.bundleId ||
            item?.bundle?.id ||
            item?.bundle?._id ||
            item?.id ||
            item?._id;
        const isEnrolled = item?.isEnrolled !== undefined ? Boolean(item?.isEnrolled) : true;

        if (bundleId && isEnrolled) {
            acc.push(String(bundleId));
        }

        return acc;
    }, []);
};

const COURSE_CARD_THEMES = [
    {
        top: ['#0F766E', '#115E59', '#134E4A'],
        tint: '#ECFEFF',
        accent: '#0F766E',
        accentSoft: '#D1FAE5',
        badge: '#0F172A',
        footer: '#0F172A',
        price: '#0F766E',
    },
    {
        top: ['#1D4ED8', '#1E40AF', '#1E3A8A'],
        tint: '#EFF6FF',
        accent: '#1D4ED8',
        accentSoft: '#DBEAFE',
        badge: '#1E3A8A',
        footer: '#0F172A',
        price: '#1D4ED8',
    },
    {
        top: ['#C2410C', '#9A3412', '#7C2D12'],
        tint: '#FFF7ED',
        accent: '#C2410C',
        accentSoft: '#FED7AA',
        badge: '#7C2D12',
        footer: '#0F172A',
        price: '#C2410C',
    },
    {
        top: ['#7C3AED', '#6D28D9', '#5B21B6'],
        tint: '#F5F3FF',
        accent: '#7C3AED',
        accentSoft: '#E9D5FF',
        badge: '#4C1D95',
        footer: '#0F172A',
        price: '#7C3AED',
    },
];

const getCourseCardTheme = (index: number) => COURSE_CARD_THEMES[index % COURSE_CARD_THEMES.length];

const MOCK_CARD_THEMES = [
    {
        top: ['#ECFDF5', '#CCFBF1', '#E0F2FE'],
        badge: ['#0F766E', '#14B8A6', '#0EA5E9'],
        border: 'rgba(15, 118, 110, 0.10)',
    },
    {
        top: ['#EEF2FF', '#E0F2FE', '#DBEAFE'],
        badge: ['#4F46E5', '#06B6D4', '#2563EB'],
        border: 'rgba(79, 70, 229, 0.10)',
    },
    {
        top: ['#F5F3FF', '#E9D5FF', '#FCE7F3'],
        badge: ['#7C3AED', '#A855F7', '#EC4899'],
        border: 'rgba(124, 58, 237, 0.10)',
    },
    {
        top: ['#FEF3C7', '#FDE68A', '#FED7AA'],
        badge: ['#D97706', '#F59E0B', '#EA580C'],
        border: 'rgba(217, 119, 6, 0.10)',
    },
    {
        top: ['#FEE2E2', '#FECACA', '#FFE4E6'],
        badge: ['#DC2626', '#FB7185', '#F97316'],
        border: 'rgba(220, 38, 38, 0.10)',
    },
    {
        top: ['#ECFEFF', '#E0F2FE', '#F0FDFA'],
        badge: ['#0EA5E9', '#06B6D4', '#14B8A6'],
        border: 'rgba(14, 165, 233, 0.10)',
    },
];

const getMockCardTheme = (index: number) => MOCK_CARD_THEMES[index % MOCK_CARD_THEMES.length];

const resolveBundlePricing = (bundle: any) => {
    const originalPrice = Number(bundle?.price || bundle?.amount || 0);
    const discountPrice = Number(bundle?.discountPrice || 0);
    const discountPercentage = Number(bundle?.discountPercentage || 0);

    let finalPrice = originalPrice;
    if (discountPrice > 0) {
        finalPrice = discountPrice;
    } else if (discountPercentage > 0) {
        finalPrice = originalPrice - (originalPrice * discountPercentage) / 100;
    }

    finalPrice = Math.max(0, Math.round(finalPrice));

    return {
        originalPrice,
        discountPrice,
        discountPercentage,
        finalPrice,
        hasDiscount: finalPrice > 0 && finalPrice < originalPrice,
        isFree: finalPrice === 0,
    };
};

const normalizePaymentSession = (session: any) => {
    if (!session || typeof session !== 'object') {
        return null;
    }

    const paymentUrl = session.paymentUrl || session.checkout_url || session.checkoutUrl || session.payment_url || session.paymentUrl || session.paymentLink || session.short_url || session.shortUrl || session.url || session.redirect_url;
    const resourceId = String(session.resourceId || session.bundleId || session.id || '');

    if (!paymentUrl || !resourceId) {
        return null;
    }

    return {
        ...session,
        paymentUrl,
        resourceId,
        amount: Number(session.amount || 0),
        createdAt: Number(session.createdAt || Date.now()),
    };
};

const posterStyles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        borderRadius: normalize(28),
        overflow: 'hidden',
    },
    topSection: {
        padding: normalize(16),
        paddingTop: verticalScale(18),
        paddingBottom: verticalScale(18),
        alignItems: 'flex-start',
        position: 'relative',
        minHeight: verticalScale(210),
    },
    posterGlowOne: {
        position: 'absolute',
        top: -normalize(26),
        right: -normalize(28),
        width: normalize(96),
        height: normalize(96),
        borderRadius: normalize(48),
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    posterGlowTwo: {
        position: 'absolute',
        bottom: -normalize(22),
        left: -normalize(18),
        width: normalize(76),
        height: normalize(76),
        borderRadius: normalize(38),
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    posterTopRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: normalize(12),
        marginBottom: verticalScale(18),
    },
    posterBadge: {
        maxWidth: '68%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(6),
        backgroundColor: '#FFFFFF',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(6),
        borderRadius: normalize(999),
    },
    posterBadgeText: {
        color: '#0F766E',
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    posterPricePill: {
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
        borderRadius: normalize(16),
        alignItems: 'flex-end',
    },
    posterPriceLabel: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: normalize(9),
        fontWeight: '700',
    },
    posterPriceValue: {
        color: '#FFFFFF',
        fontSize: normalize(18),
        fontWeight: '900',
    },
    mainTitleTop: {
        color: '#D1FAE5',
        fontSize: normalize(12),
        fontWeight: '900',
        letterSpacing: 1.6,
        marginBottom: verticalScale(8),
    },
    mainTitleYellow: {
        color: '#FFFFFF',
        fontSize: normalize(22),
        fontWeight: '900',
        lineHeight: normalize(28),
        marginBottom: verticalScale(10),
    },
    posterSubtitle: {
        color: 'rgba(255,255,255,0.88)',
        fontSize: normalize(12),
        lineHeight: normalize(18),
        marginBottom: verticalScale(14),
    },
    posterChipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: normalize(8),
    },
    posterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(5),
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(6),
        borderRadius: normalize(999),
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
    },
    posterChipText: {
        color: '#FFFFFF',
        fontSize: normalize(10),
        fontWeight: '700',
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    priceLeft: {
        flex: 1,
        backgroundColor: '#ECFEFF',
        padding: normalize(12),
    },
    discountHint: {
        marginTop: verticalScale(6),
        fontSize: normalize(10),
        color: '#475467',
        lineHeight: normalize(14),
        fontWeight: '600',
    },
    specialPriceLabel: {
        color: '#0F766E',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(2),
    },
    oldPrice: {
        color: '#4B5563',
        fontSize: normalize(11),
        textDecorationLine: 'line-through',
        marginRight: normalize(6),
    },
    newPrice: {
        color: '#0F766E',
        fontSize: normalize(19),
        fontWeight: '900',
    },
    priceRight: {
        flex: 1.2,
        backgroundColor: '#0F172A',
        padding: normalize(12),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
    },
    priceRightTextWrap: {
        flex: 1,
    },
    preparationTitle: {
        color: '#FFFFFF',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 0.6,
    },
    preparationSubtitle: {
        color: '#CBD5E1',
        fontSize: normalize(7),
    },
    featuresSection: {
        padding: normalize(14),
        gap: verticalScale(10),
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIconWrap: {
        width: normalize(34),
        height: normalize(34),
        borderRadius: normalize(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(10),
    },
    featureTextWrap: {
        flex: 1,
    },
    featureTitle: {
        fontSize: normalize(10),
        fontWeight: '900',
        marginBottom: verticalScale(2),
    },
    featureDesc: {
        color: '#475467',
        fontSize: normalize(8),
        lineHeight: normalize(12),
    },
    featureDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: verticalScale(2),
    },
    bottomFooter: {
        backgroundColor: '#0F172A',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: normalize(14),
        gap: normalize(10),
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
        padding: normalize(12),
    },
    primaryActionButton: {
        flex: 1,
        minHeight: verticalScale(44),
        borderRadius: normalize(14),
        paddingHorizontal: normalize(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    secondaryActionButton: {
        flex: 1,
        minHeight: verticalScale(44),
        borderRadius: normalize(14),
        paddingHorizontal: normalize(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    primaryActionText: {
        color: '#FFFFFF',
        fontSize: normalize(12),
        fontWeight: '800',
    },
    secondaryActionText: {
        color: '#FFFFFF',
        fontSize: normalize(12),
        fontWeight: '800',
    },
    footerCol: {
        alignItems: 'center',
        flex: 1,
    },
    footerText: {
        color: '#FFFFFF',
        fontSize: normalize(8),
        fontWeight: '700',
        textAlign: 'center',
        marginTop: verticalScale(4),
        lineHeight: normalize(11),
    },
});

const CoursePosterCard = ({
    bundle,
    index = 0,
    isEnrolled = false,
    isPending = false,
    onView,
    onEnroll,
    onBuyAndEnroll,
}: any) => {
    const normalizedBundle = getBundlePayload(bundle);
    const collections = getDetailCollections(bundle);
    const quizzes = getBundleQuizzes(normalizedBundle);
    const examMeta = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');
    const pricing = resolveBundlePricing(normalizedBundle);
    const theme = getCourseCardTheme(index);

    const fullTitle = String(normalizedBundle?.title || normalizedBundle?.name || 'COMPLETE COURSE');
    const bundleSubtitle =
        normalizedBundle?.description
            ? htmlToPlainText(String(normalizedBundle.description)).split('\n').find(Boolean) || 'Complete study support with mock tests and materials'
            : 'Complete study support with mock tests and materials';
    const countChips = [
        { label: `${quizzes.length || 0} mocks`, icon: 'clipboard' },
        { label: `${collections.noteBanks.length || 0} notes`, icon: 'book-open' },
        { label: `${collections.questionBanks.length || 0} banks`, icon: 'help-circle' },
    ];

    const availableFeatures = [];
    if (collections.videoBanks.length > 0 || collections.youtubeBanks.length > 0) {
        availableFeatures.push({ id: 'video', icon: 'monitor', title: 'VIDEO BANK', desc: 'Curated video links for focused revision' });
    }
    if (quizzes.length > 0) {
        availableFeatures.push({ id: 'mock', icon: 'clipboard', title: 'MOCK TESTS', desc: 'Practice with a clean, exam-first flow' });
    }
    if (collections.noteBanks.length > 0) {
        availableFeatures.push({ id: 'note', icon: 'book-open', title: 'NOTE BANK', desc: 'Topic-wise notes made easy to scan' });
    }
    if (collections.questionBanks.length > 0) {
        availableFeatures.push({ id: 'question', icon: 'help-circle', title: 'QUESTION BANK', desc: 'Practice with comprehensive questions' });
    }
    if (collections.documentFolders.length > 0) {
        availableFeatures.push({ id: 'document', icon: 'file-text', title: 'DOCUMENT', desc: 'Essential study documents and materials' });
    }

    return (
        <View style={posterStyles.container}>
            <LinearGradient
                colors={theme.top as [string, string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={posterStyles.topSection}
            >
                <View style={posterStyles.posterGlowOne} />
                <View style={posterStyles.posterGlowTwo} />
                <View style={posterStyles.posterTopRow}>
                    <View style={[posterStyles.posterBadge, { backgroundColor: theme.tint }]}>
                        <Feather name={examMeta.icon as any} size={normalize(12)} color={theme.accent} />
                        <Text style={posterStyles.posterBadgeText}>Premium course</Text>
                    </View>
                    <View style={[posterStyles.posterPricePill, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
                        <Text style={posterStyles.posterPriceLabel}>From</Text>
                        <Text style={posterStyles.posterPriceValue}>₹{pricing.finalPrice}</Text>
                    </View>
                </View>

                <Text style={posterStyles.mainTitleTop}>COURSE HUB</Text>
                <Text style={posterStyles.mainTitleYellow} numberOfLines={2}>
                    {fullTitle.toUpperCase()}
                </Text>
                <Text style={posterStyles.posterSubtitle} numberOfLines={3}>
                    {bundleSubtitle}
                </Text>

                <View style={posterStyles.posterChipRow}>
                    {countChips.map((chip) => (
                        <View key={chip.label} style={[posterStyles.posterChip, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                            <Feather name={chip.icon as any} size={normalize(11)} color="#FFFFFF" />
                            <Text style={posterStyles.posterChipText}>{chip.label}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>

            <View style={posterStyles.priceSection}>
                <View style={[posterStyles.priceLeft, { backgroundColor: theme.tint }]}>
                    <Text style={posterStyles.specialPriceLabel}>SPECIAL PRICE</Text>
                    <View style={posterStyles.priceRow}>
                        {pricing.hasDiscount ? <Text style={posterStyles.oldPrice}>₹{pricing.originalPrice}/-</Text> : null}
                        <Text style={[posterStyles.newPrice, { color: theme.price }]}>₹{pricing.finalPrice}/-</Text>
                    </View>
                    {pricing.discountPercentage > 0 || pricing.discountPrice > 0 ? (
                        <Text style={posterStyles.discountHint}>
                            {pricing.discountPrice > 0
                                ? 'Discount applied from the latest course pricing'
                                : `Save ${pricing.discountPercentage}% on this course`}
                        </Text>
                    ) : null}
                </View>
                <View style={[posterStyles.priceRight, { backgroundColor: theme.footer }]}>
                    <FontAwesome5 name="award" size={normalize(18)} color="#FBBF24" />
                    <View style={posterStyles.priceRightTextWrap}>
                        <Text style={posterStyles.preparationTitle}>COMPLETE PREPARATION</Text>
                        <Text style={posterStyles.preparationSubtitle}>Mock tests, notes, and video content</Text>
                    </View>
                </View>
            </View>

            <View style={posterStyles.featuresSection}>
                {availableFeatures.map((feature, idx) => (
                    <React.Fragment key={feature.id}>
                        <View style={posterStyles.featureRow}>
                            <View style={[posterStyles.featureIconWrap, { backgroundColor: theme.accent }]}>
                                <Feather name={feature.icon as any} size={normalize(18)} color="#FFF" />
                            </View>
                            <View style={posterStyles.featureTextWrap}>
                                <Text style={[posterStyles.featureTitle, { color: theme.accent }]}>{feature.title}</Text>
                                <Text style={posterStyles.featureDesc}>{feature.desc}</Text>
                            </View>
                        </View>
                        {idx < availableFeatures.length - 1 && <View style={posterStyles.featureDivider} />}
                    </React.Fragment>
                ))}
            </View>

            <View style={[posterStyles.actionBar, { backgroundColor: theme.footer }]}>
                {isEnrolled ? (
                    <Pressable
                        onPress={onView}
                        style={[posterStyles.primaryActionButton, { backgroundColor: theme.accent }]}
                        disabled={isPending}
                    >
                        <Feather name="eye" size={normalize(14)} color="#FFFFFF" />
                        <Text style={posterStyles.primaryActionText}>View</Text>
                    </Pressable>
                ) : (
                    <>
                        <Pressable
                            onPress={onView}
                            style={posterStyles.secondaryActionButton}
                            disabled={isPending}
                        >
                            <Feather name="eye" size={normalize(14)} color="#FFFFFF" />
                            <Text style={posterStyles.secondaryActionText}>View</Text>
                        </Pressable>
                        <Pressable
                            onPress={pricing.isFree ? onEnroll : onBuyAndEnroll}
                            style={[posterStyles.primaryActionButton, { backgroundColor: theme.accent }]}
                            disabled={isPending}
                        >
                            <Feather name={pricing.isFree ? 'check-circle' : 'shopping-cart'} size={normalize(14)} color="#FFFFFF" />
                            <Text style={posterStyles.primaryActionText}>
                                {pricing.isFree ? 'Enroll' : `Buy & Enroll (₹${pricing.finalPrice})`}
                            </Text>
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    );
};

const QBankBundleCard = ({ bundle, index, isEnrolled, isPending, onView, onEnroll, onBuyAndEnroll, onMock }: any) => {
    const normalizedBundle = getBundlePayload(bundle);
    const pricing = resolveBundlePricing(normalizedBundle);
    const title = normalizedBundle?.title || normalizedBundle?.name || 'Untitled Course';
    const originalImage = normalizedBundle?.thumbnail || normalizedBundle?.poster || normalizedBundle?.image;
    const imageUrl = typeof originalImage === 'string' && originalImage.trim() ? originalImage : null;
    const fallbackTheme = EXAM_ICON_THEMES[index % EXAM_ICON_THEMES.length];

    return (
        <View style={smallCardStyles.cardContainer}>
            <View style={smallCardStyles.row}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={smallCardStyles.thumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.16)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[smallCardStyles.thumbnail, smallCardStyles.badgeShell]}
                    >
                        <View style={[smallCardStyles.badgeInner, { backgroundColor: fallbackTheme.bgColor }]}>
                            <Feather name="book-open" size={normalize(24)} color={fallbackTheme.iconColor} />
                        </View>
                    </LinearGradient>
                )}
                <View style={smallCardStyles.infoContainer}>
                    <View style={smallCardStyles.detailStack}>
                        <View style={smallCardStyles.detailRow}>
                            <View style={[smallCardStyles.detailIconWrap, { backgroundColor: 'rgba(79, 70, 229, 0.10)' }]}>
                                <Feather name="tag" size={normalize(12)} color="#4F46E5" />
                            </View>
                            <View style={smallCardStyles.detailTextWrap}>
                                <Text style={smallCardStyles.detailLabel}>Name</Text>
                                <Text style={smallCardStyles.detailValue} numberOfLines={2}>{title}</Text>
                            </View>
                        </View>

                        <View style={smallCardStyles.detailRow}>
                            <View style={[smallCardStyles.detailIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.10)' }]}>
                                <FontAwesome5 name="rupee-sign" size={normalize(11)} color="#10B981" />
                            </View>
                            <View style={smallCardStyles.detailTextWrap}>
                                <Text style={smallCardStyles.detailLabel}>Price</Text>
                                <View style={smallCardStyles.priceValueRow}>
                                    <Text style={smallCardStyles.detailValue}>{pricing.isFree ? 'Free' : `₹${pricing.finalPrice}`}</Text>
                                    {!pricing.isFree && pricing.originalPrice > pricing.finalPrice && (
                                        <Text style={smallCardStyles.originalPrice}>₹{pricing.originalPrice}</Text>
                                    )}
                                </View>
                            </View>
                        </View>

                        <View style={smallCardStyles.detailRow}>
                            <View style={[smallCardStyles.detailIconWrap, { backgroundColor: 'rgba(15, 118, 110, 0.10)' }]}>
                                <Feather name="clock" size={normalize(12)} color="#0F766E" />
                            </View>
                            <View style={smallCardStyles.detailTextWrap}>
                                <Text style={smallCardStyles.detailLabel}>Time Duration</Text>
                                <Text style={smallCardStyles.detailValue}>{CONTENT_ACCESS_DURATION_LABEL}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View style={smallCardStyles.actionsRow}>
                {/* Functional Buttons */}
                <View style={smallCardStyles.quickLinks}>
                    <TouchableOpacity style={smallCardStyles.iconBtn} onPress={onMock}>
                        <Ionicons name="document-text-outline" size={16} color="#475569" />
                        <Text style={smallCardStyles.iconBtnText}>Mock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={smallCardStyles.iconBtn} onPress={onView}>
                        <Ionicons name="book-outline" size={16} color="#475569" />
                        <Text style={smallCardStyles.iconBtnText}>Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={smallCardStyles.iconBtn} onPress={onView}>
                        <Ionicons name="videocam-outline" size={16} color="#475569" />
                        <Text style={smallCardStyles.iconBtnText}>Bank</Text>
                    </TouchableOpacity>
                </View>

                {/* Primary Actions */}
                <View style={smallCardStyles.primaryActions}>
                    <TouchableOpacity style={smallCardStyles.viewBtn} onPress={onView}>
                        <Text style={smallCardStyles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                    {isPending ? (
                        <View style={[smallCardStyles.enrollBtn, smallCardStyles.pendingBtn]}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        </View>
                    ) : isEnrolled ? (
                        <TouchableOpacity style={[smallCardStyles.enrollBtn, smallCardStyles.enrolledBtn]} onPress={onView}>
                            <Text style={smallCardStyles.enrollBtnText}>Open</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={smallCardStyles.enrollBtn} onPress={pricing.isFree ? onEnroll : onBuyAndEnroll}>
                            <Text style={smallCardStyles.enrollBtnText}>{pricing.isFree ? 'Enroll' : 'Buy'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const smallCardStyles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        padding: normalize(14),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: '#E5ECF5',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        marginBottom: verticalScale(14),
    },
    thumbnail: {
        width: normalize(68),
        height: normalize(68),
        borderRadius: normalize(14),
        backgroundColor: '#F1F5F9',
        marginRight: normalize(14),
    },
    badgeShell: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.32)',
        shadowColor: '#0F172A',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        overflow: 'hidden',
    },
    badgeInner: {
        width: '100%',
        height: '100%',
        borderRadius: normalize(13),
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: normalize(15),
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: verticalScale(6),
        lineHeight: normalize(20),
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailStack: {
        gap: verticalScale(10),
        marginTop: verticalScale(2),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    detailIconWrap: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(8),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(8),
        marginTop: verticalScale(1),
    },
    detailTextWrap: {
        flex: 1,
    },
    detailLabel: {
        fontSize: normalize(10),
        color: '#64748B',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: normalize(13),
        color: '#0F172A',
        fontWeight: '800',
        lineHeight: normalize(18),
        marginTop: verticalScale(2),
    },
    priceValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: normalize(6),
    },
    originalPrice: {
        fontSize: normalize(12),
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderColor: '#F1F5F9',
        rowGap: verticalScale(10),
        columnGap: normalize(10),
    },
    quickLinks: {
        flexDirection: 'row',
        gap: normalize(14),
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    iconBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: normalize(54),
        paddingVertical: verticalScale(6),
        paddingHorizontal: normalize(4),
        borderRadius: normalize(10),
        backgroundColor: '#F8FAFC',
    },
    iconBtnText: {
        fontSize: normalize(11),
        color: '#475569',
        marginTop: verticalScale(3),
        fontWeight: '600',
    },
    primaryActions: {
        flexDirection: 'row',
        gap: normalize(10),
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        flexBasis: '100%',
        width: '100%',
    },
    viewBtn: {
        flex: 1,
        minHeight: verticalScale(48),
        minWidth: 0,
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(12),
        borderRadius: normalize(12),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewBtnText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#475569',
    },
    enrollBtn: {
        flex: 1,
        minHeight: verticalScale(48),
        minWidth: 0,
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(12),
        borderRadius: normalize(12),
        backgroundColor: '#1E40AF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(6),
    },
    enrollBtnText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#FFFFFF',
    },
    pendingBtn: {
        backgroundColor: '#94A3B8',
        flex: 1,
    },
    enrolledBtn: {
        backgroundColor: '#10B981',
    },
});

const CoursesScreen = ({ navigation }: CoursesScreenProps) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
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
    const [mainTab, setMainTab] = useState<'subject' | 'exam'>('subject');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [viewMoreStates, setViewMoreStates] = useState<Record<string, boolean>>({});
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [selectedSubBundleExam, setSelectedSubBundleExam] = useState<any>(null);
    const [activeBundleId, setActiveBundleId] = useState<string | null>(null);
    const [_activeSubBundleId, setActiveSubBundleId] = useState<string | null>(null);
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
    const arrowPulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(arrowPulse, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(arrowPulse, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();

        return () => animation.stop();
    }, [arrowPulse]);
    const [selectedNotePageDetail, setSelectedNotePageDetail] = useState<any>(null);
    const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
    const [isLoadingQuestionBank, setIsLoadingQuestionBank] = useState(false);
    const [selectedQuestionBankTitle, setSelectedQuestionBankTitle] = useState('');
    const [selectedQuestionBankQuestions, setSelectedQuestionBankQuestions] = useState<any[]>([]);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [selectedQuestionBankMeta, setSelectedQuestionBankMeta] = useState<any>(null);
    const [_showQuestionAnswer, setShowQuestionAnswer] = useState(false);
    const [showQuestionAnswerModal, setShowQuestionAnswerModal] = useState(false);
    const [selectedQuestionAnswerDetail, setSelectedQuestionAnswerDetail] = useState<any>(null);
    const [mockMarkingMap, setMockMarkingMap] = useState<Record<string, any>>({});
    const [isPaymentWebViewVisible, setIsPaymentWebViewVisible] = useState(false);
    const [activePaymentSession, setActivePaymentSession] = useState<any>(null);
    const [showVideoBankModal, setShowVideoBankModal] = useState(false);
    const [isLoadingVideoBank, setIsLoadingVideoBank] = useState(false);
    const [selectedVideoBankTitle, setSelectedVideoBankTitle] = useState('');
    const [selectedVideoBankItems, setSelectedVideoBankItems] = useState<any[]>([]);

    const [showDocumentFolderModal, setShowDocumentFolderModal] = useState(false);
    const [selectedDocumentFolderTitle, setSelectedDocumentFolderTitle] = useState('');
    const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
    const [subjectBankSkeletonVisible, setSubjectBankSkeletonVisible] = useState(false);
    const [detailSearchQuery, setDetailSearchQuery] = useState('');

    const authToken = useSelector((state: RootState) => state.AuthReducer.token);
    const { paymentHistoryData, paymentHistoryLoading } = useSelector((state: RootState) => state.ProfileReducer);
    const resetSubjectBankView = useCallback(() => {
        setMainTab('subject');
        setExpandedCategory(null);
        setViewMoreStates({});
        setSelectedModule(null);
        setSelectedExam(null);
        setSelectedSubBundleExam(null);
        setActiveBundleId(null);
        setActiveSubBundleId(null);
        setActiveDetailTab('mock');
        setActiveCourseSection('');
        setSearchQuery('');
        setDetailSearchQuery('');
        setShowNoteViewerModal(false);
        setSelectedNoteBankTitle('');
        setSelectedNotePages([]);
        setSelectedNotePageIndex(0);
        setShowNotePageModal(false);
        setSelectedNotePageDetail(null);
        setShowQuestionBankModal(false);
        setIsLoadingQuestionBank(false);
        setSelectedQuestionBankTitle('');
        setSelectedQuestionBankQuestions([]);
        setSelectedQuestionIndex(0);
        setSelectedQuestionBankMeta(null);
        setShowQuestionAnswer(false);
        setShowQuestionAnswerModal(false);
        setSelectedQuestionAnswerDetail(null);
        setShowVideoBankModal(false);
        setIsLoadingVideoBank(false);
        setSelectedVideoBankTitle('');
        setSelectedVideoBankItems([]);
        setShowDocumentFolderModal(false);
        setSelectedDocumentFolderTitle('');
        setDownloadingDocId(null);
        setSubjectBankSkeletonVisible(false);
    }, []);

    const bundleItems = useMemo(() => getBundleItems(bundleList), [bundleList]);
    const subBundleItems = useMemo(() => getSubBundleItems(subBundleList), [subBundleList]);
    const { enrolledBundleIds, failedPendingBundleIds } = useMemo(() => {
        const collectedIds = collectEnrolledBundleIds(studentModules);
        const paymentsList = paymentHistoryData?.data?.items || paymentHistoryData?.items || [];
        const failedPending = new Set<string>();

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
        const paymentsList = paymentHistoryData?.data?.items || paymentHistoryData?.items || paymentHistoryData?.data || (Array.isArray(paymentHistoryData) ? paymentHistoryData : []);
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
        const paymentsList = paymentHistoryData?.data?.items || paymentHistoryData?.items || paymentHistoryData?.data || (Array.isArray(paymentHistoryData) ? paymentHistoryData : []);

        return Array.isArray(paymentsList) && paymentsList.some((item: any) => {
            const status = String(item?.status || '').trim().toUpperCase();
            const resourceTitle = String(item?.resourceTitle || '').trim().toLowerCase();

            return status === 'COMPLETED' && resourceTitle === 'all subject bundle';
        });
    }, [paymentHistoryData]);
    const canUseCategoryExam = purchasedSubjectCount >= MIN_SUBJECTS_FOR_CATEGORY_EXAM || hasAllSubjectBundlePayment;

    const apiCategories = useMemo(() => {
        let cats: any[] = [];
        if (Array.isArray(bundleList?.categories)) cats = bundleList.categories;
        else if (Array.isArray(bundleList?.data?.categories)) cats = bundleList.data.categories;
        else if (Array.isArray(bundleList?.data?.data?.categories)) cats = bundleList.data.data.categories;

        return cats.map(c => String(c?.name || c?.title || '')).filter(Boolean);
    }, [bundleList]);

    const activeOptions = useMemo(() => {
        const subjects = new Set<string>();
        const dynamicExams = new Set<string>();

        bundleItems.forEach((bundle: any) => {
            const title = String(bundle?.title || bundle?.name || '').trim();
            const lowerTitle = title.toLowerCase();
            const category = String(bundle?.category || '').toLowerCase();
            const isFreeMock = isFreeMockBundle(bundle);

            const isExam = !isFreeMock && (isEliteMockBundle(bundle) || (apiCategories.length > 0 ? apiCategories : EXAM_CHIPS).some(chip => lowerTitle.includes(chip.toLowerCase()) || category.includes(chip.toLowerCase())));

            if (isExam) {
                // If we need to fallback when API has no categories
                if (apiCategories.length === 0) {
                    if (isEliteMockBundle(bundle)) {
                        dynamicExams.add('Elite Mock Bundle');
                    }
                    for (const chip of EXAM_CHIPS) {
                        if (lowerTitle.includes(chip.toLowerCase()) || category.includes(chip.toLowerCase())) {
                            dynamicExams.add(chip);
                        }
                    }
                }
            } else {
                let subjectLabel = bundle?.subject || bundle?.module || bundle?.category;
                if (!subjectLabel) subjectLabel = title || 'Other';

                const finalLabel = getNursingSubjectName(String(subjectLabel).trim());
                if (finalLabel) subjects.add(finalLabel);
            }
        });

        if (mainTab === 'exam') {
            return apiCategories.length > 0 ? apiCategories : Array.from(dynamicExams);
        }
        return sortNursingTitles(Array.from(subjects));
    }, [bundleItems, mainTab]);

    const moduleOptions = useMemo(() => {
        if (!searchQuery.trim()) return activeOptions;
        return activeOptions.filter((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [activeOptions, searchQuery]);
    const enrolledCourseCount = useMemo(() => {
        const enrolledSet = new Set(enrolledBundleIds);
        return bundleItems.filter((bundle: any) => {
            const bundleId = String(getBundleId(getBundlePayload(bundle)) || '');
            return bundleId ? enrolledSet.has(bundleId) : false;
        }).length;
    }, [bundleItems, enrolledBundleIds]);

    const clearPaymentSession = useCallback(async () => {
        setActivePaymentSession(null);
        setIsPaymentWebViewVisible(false);
        setPendingEnrollmentId(null);
        dispatch(clearPaymentSessionAction());
    }, [dispatch]);

    const verifyPaymentAndContinue = useCallback(async (bundleId: string) => {
        if (!bundleId) {
            return;
        }

        await clearPaymentSession();
        setPendingEnrollmentId(null);
        setEnrolledBundleOverrides(prev => {
            const next = new Set(prev);
            next.add(String(bundleId));
            return next;
        });
        dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        dispatch(bundleIDRequest({ id: bundleId }));
    }, [clearPaymentSession, dispatch]);
    useEffect(() => {
        dispatch(getBundleListRequest({ limit: 50, page: 1, ...(selectedModule ? { module: selectedModule } : {}) }));
    }, [dispatch, selectedModule]);

    useEffect(() => {
        if (isFocused) {
            resetSubjectBankView();
            dispatch(getStudentModulesRequest({}));
            dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        }
    }, [dispatch, isFocused, resetSubjectBankView]);

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
            dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        }, 5000);

        return () => clearInterval(interval);
    }, [activePaymentSession?.resourceId, dispatch]);

    useEffect(() => {
        if (!bundleDetails) {
            return;
        }

        const resolvedBundleId = String(getBundleId(bundleDetails) || activeBundleId || '');
        const isEnrolled =
            enrolledBundleOverrides.has(resolvedBundleId) ||
            (!failedPendingBundleIds.has(resolvedBundleId) &&
                (Boolean(bundleDetails?.isEnrolled) ||
                    (resolvedBundleId ? enrolledBundleIds.includes(resolvedBundleId) : false)));

        setSelectedExam(buildSelectedExam(bundleDetails, isEnrolled));
        if (resolvedBundleId) {
            setActiveBundleId(resolvedBundleId);
            dispatch(getSubBundleListRequest({ bundleId: resolvedBundleId }));
        }
    }, [activeBundleId, bundleDetails, dispatch, enrolledBundleIds, enrolledBundleOverrides, failedPendingBundleIds]);

    useEffect(() => {
        if (!subBundleDetails) {
            return;
        }

        const parentBundleId = activeBundleId ? String(activeBundleId) : '';
        const isEnrolled =
            enrolledBundleOverrides.has(parentBundleId) ||
            (!failedPendingBundleIds.has(parentBundleId) &&
                (Boolean(subBundleDetails?.isEnrolled) ||
                    Boolean(selectedExam?.isEnrolled) ||
                    (parentBundleId ? enrolledBundleIds.includes(parentBundleId) : false)));
        setSelectedSubBundleExam(buildSelectedExam(subBundleDetails, isEnrolled));
    }, [activeBundleId, enrolledBundleIds, subBundleDetails, selectedExam, failedPendingBundleIds]);

    useEffect(() => {
        if (
            status === enrollBundleSuccess.type ||
            status === enrollBundleFailure.type ||
            status === paymentFailure.type
        ) {
            setPendingEnrollmentId(null);

            if (status === enrollBundleSuccess.type && activeBundleId) {
                dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
                setEnrolledBundleOverrides(prev => {
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
            : [
                normalizedUrl,
                normalizedUrl.replace('youtu.be/', 'www.youtube.com/watch?v='),
            ];

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
        const isUpiScheme = upiSchemes.some(scheme => reqUrl.startsWith(scheme));

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

        openUpiApp().catch(() => undefined);
        return false;
    }, []);

    const showCategoryExamInfo = useCallback(() => {
        Toast.show({
            type: 'info',
            text1: `Buy at least ${MIN_SUBJECTS_FOR_CATEGORY_EXAM} subjects to enable By Category Exam.`,
            text2: `You have purchased ${purchasedSubjectCount} subject${purchasedSubjectCount === 1 ? '' : 's'} so far.`,
        });
    }, [purchasedSubjectCount]);

    const showCategoryExamContentLockedToast = useCallback((contentName: string) => {
        const lockedName = contentName || 'This content';
        Toast.show({
            type: 'info',
            text1: `${lockedName} is locked`,
            text2: `Buy at least ${MIN_SUBJECTS_FOR_CATEGORY_EXAM} subjects to access it. You have purchased ${purchasedSubjectCount} subject${purchasedSubjectCount === 1 ? '' : 's'} so far.`,
        });
    }, [purchasedSubjectCount]);

    const filteredExams = bundleItems.filter((bundle: any) => {
        const title = (bundle?.title || bundle?.name || '').toLowerCase();
        const matchesSearch = title.includes(searchQuery.toLowerCase());
        const isFreeMock = isFreeMockBundle(bundle);
        const isExam = !isFreeMock && (title.includes('norcet') || title.includes('cho') || (bundle?.category && (bundle.category.toLowerCase().includes('norcet') || bundle.category.toLowerCase().includes('cho'))));
        const matchesTab = mainTab === 'exam' ? isExam : !isExam;
        return matchesSearch && matchesTab;
    });
    const isEnrollingBundle = isLoading && (status === enrollBundleRequest.type || status === paymentRequest.type);
    const showSubjectBankSkeleton = isLoading && (status === getBundleListRequest.type || status === getStudentModulesRequest.type);
    const detailScreen = selectedSubBundleExam || selectedExam;
    const showingSubBundle = Boolean(selectedSubBundleExam);
    const canAttemptMocks = Boolean(detailScreen?.isEnrolled);
    const showSubBundleList = Boolean(selectedExam) && !showingSubBundle && subBundleItems.length > 0;
    const courseSections = useMemo(
        () => normalizeCourseSections(detailScreen?.rawBundle || detailScreen),
        [detailScreen],
    );
    const examPatternItems = useMemo(() => {
        if (!detailScreen) return [];

        const collections = getDetailCollections(detailScreen?.rawBundle || detailScreen);
        const quizzes = getBundleQuizzes(detailScreen?.rawBundle || detailScreen);
        const items = [];

        if (collections.videoBanks.length > 0 || collections.youtubeBanks.length > 0) {
            items.push({ key: 'youtube', label: 'Video Bank', icon: 'youtube', color: '#FF0000', bg: '#FEF2F2' });
        }
        if (quizzes.length > 0) {
            items.push({ key: 'mock', label: 'Mock Bank', icon: 'layers', color: '#1D4ED8', bg: '#EFF6FF' });
        }
        if (collections.noteBanks.length > 0) {
            items.push({ key: 'note', label: 'Note Bank Content', icon: 'book-open', color: '#059669', bg: '#ECFDF5' });
        }
        if (collections.questionBanks.length > 0) {
            items.push({ key: 'question', label: 'Question Bank', icon: 'help-circle', color: '#7C3AED', bg: '#F5F3FF' });
        }
        if (collections.documentFolders.length > 0) {
            items.push({ key: 'document', label: 'Document', icon: 'file-text', color: '#0F766E', bg: '#CCFBF1' });
        }

        return items;
    }, [detailScreen]);
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
        () => [
            mockContentAvailable ? { key: 'mock', label: 'Mock Bank' } : null,
            courseSections.length > 0 ? { key: 'course', label: 'Study Materials' } : null,
        ].filter(Boolean) as Array<{ key: 'mock' | 'course'; label: string }>,
        [courseSections.length, mockContentAvailable],
    );
    const detailTabs = availableDetailTabs;
    const normalizedDetailSearchQuery = normalizeTitle(detailSearchQuery);

    const filteredSubBundleItems = useMemo(() => {
        if (!normalizedDetailSearchQuery) {
            return subBundleItems;
        }

        return subBundleItems.filter((subBundle: any) => {
            const normalizedSubBundle = getBundlePayload(subBundle);
            const title = normalizeTitle(String(normalizedSubBundle?.title || normalizedSubBundle?.name || ''));
            const description = normalizeTitle(String(normalizedSubBundle?.description || normalizedSubBundle?.summary || ''));
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
                const quizDescription = normalizeTitle(String(quiz?.description || quiz?.summary || quiz?.topic || ''));

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

        return filteredCourseSections.find(section => section.key === activeCourseSection) || filteredCourseSections[0];
    }, [activeCourseSection, filteredCourseSections]);

    const fetchMockMarkings = useCallback(async () => {
        const quizIds = detailScreen?.quizIds;
        if (!quizIds || !Array.isArray(quizIds) || quizIds.length === 0) return;

        try {
            const header = {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: authToken,
            };

            // Extract the string ID safely whether the array contains objects { id: '...' } or string IDs
            const validIds = quizIds.map((item: any) => {
                if (typeof item === 'object' && item !== null) {
                    return item.id || item._id || item.quizId;
                }
                return item;
            }).filter(Boolean);

            if (validIds.length === 0) return;

            const results = await Promise.all(
                validIds.map((id: string) =>
                    getApi(`quizzes/${id}`, header).catch(() => null)
                )
            );

            const newMap: Record<string, any> = {};
            results.forEach((res, index) => {
                if (res?.data?.success === true || res?.status === 200) {
                    const quizData = res?.data?.data || res?.data;
                    const id = validIds[index];
                    newMap[id] = quizData;
                }
            });

            // Only update state once after all network requests finish to prevent multiple re-renders
            setMockMarkingMap(prev => ({ ...prev, ...newMap }));
        } catch (e) {
            console.log('Error fetching mock markings in bulk', e);
        }
    }, [detailScreen, authToken]);

    useEffect(() => {
        fetchMockMarkings();
    }, [fetchMockMarkings]);

    useEffect(() => {
        if (availableDetailTabs.length === 0) {
            setActiveDetailTab('mock');
            return;
        }

        if (!availableDetailTabs.find(tab => tab.key === activeDetailTab)) {
            setActiveDetailTab(availableDetailTabs[0].key);
        }
    }, [activeDetailTab, availableDetailTabs]);

    useEffect(() => {
        if (courseSections.length === 0) {
            setActiveCourseSection('');
            return;
        }

        if (!courseSections.find(section => section.key === activeCourseSection)) {
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

        const fetchedQuiz = mockMarkingMap[quizId];
        const targetQuiz = fetchedQuiz || quiz?.rawQuiz || quiz;

        navigation.navigate('MockTestRulesScreen', {
            testId: quizId,
            testData: targetQuiz,
        });
    };

    const handleOpenNoteBank = useCallback(async (item: any) => {
        const noteId = getNoteBankId(item);

        if (!noteId) {
            return null;
        }

        try {
            setIsLoadingNotePages(true);
            const response = await getApi(`student/note-banks/${noteId}/pages`, {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: authToken,
            });

            const pages = response?.data?.data || response?.data || [];
            setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
            setSelectedNotePages(Array.isArray(pages) ? pages : []);
            setSelectedNotePageIndex(0);
            setShowNoteViewerModal(true);
        } catch {
            setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
            setSelectedNotePages([]);
            setSelectedNotePageIndex(0);
            setShowNoteViewerModal(true);
        } finally {
            setIsLoadingNotePages(false);
        }
    }, [authToken]);

    const handleOpenQuestionBank = useCallback(async (item: any) => {
        const questionBankId = getItemId(item);

        if (!questionBankId) {
            return;
        }

        setShowQuestionBankModal(true);
        setIsLoadingQuestionBank(true);
        setSelectedQuestionBankTitle(getItemTitle(item, 'Question Bank'));
        setSelectedQuestionBankMeta(item);
        setSelectedQuestionBankQuestions([]);
        setSelectedQuestionIndex(0);
        setShowQuestionAnswer(false);
        setShowQuestionAnswerModal(false);
        setSelectedQuestionAnswerDetail(null);

        try {
            const response = await getApi(`student/question-banks/${questionBankId}/questions`, {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: authToken,
            });
            const questions = getQuestionBankQuestions(response);
            setSelectedQuestionBankQuestions(Array.isArray(questions) ? questions : []);
        } catch {
            setSelectedQuestionBankQuestions([]);
        } finally {
            setIsLoadingQuestionBank(false);
        }
    }, [authToken]);

    const handleOpenVideoBank = useCallback(async (item: any) => {
        const videoBankId = getItemId(item) || item?.videoBankId;
        const directVideoUrl = getVideoBankUrl(item);

        if (directVideoUrl) {
            await openExternalVideoUrl(directVideoUrl);
            return;
        }

        if (!videoBankId) {
            return;
        }

        try {
            setIsLoadingVideoBank(true);
            setSelectedVideoBankTitle(getItemTitle(item, 'Video Bank'));
            const response = await getApi(`student/video-banks/${videoBankId}/items`, {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: authToken,
            });
            const items = getVideoBankItems(response);
            setSelectedVideoBankItems(items);

            if (items.length === 1) {
                const singleUrl = getVideoBankUrl(items[0]);
                if (singleUrl) {
                    await openExternalVideoUrl(singleUrl);
                    return;
                }
            }

            setShowVideoBankModal(true);
        } catch {
            setSelectedVideoBankItems([]);
            setShowVideoBankModal(false);
        } finally {
            setIsLoadingVideoBank(false);
        }
    }, [authToken, openExternalVideoUrl]);

    const handleOpenDocumentFolder = useCallback((item: any) => {
        const folderId = getItemId(item);

        if (!folderId) {
            return;
        }

        setSelectedDocumentFolderTitle(getItemTitle(item, 'Document'));
        setShowDocumentFolderModal(true);
        dispatch(documentRequest(folderId));
    }, [dispatch]);

    const handleDownloadAndOpenDocument = useCallback(async (docId: string, url: string, fileName: string) => {
        try {
            console.log('[DocumentDownload] Started for docId:', docId);
            console.log('[DocumentDownload] URL:', url);
            setDownloadingDocId(docId);

            // On Android, save into an external cache location so the PDF viewer can read it.
            const dirPath = Platform.OS === 'android'
                ? RNFS.ExternalCachesDirectoryPath || RNFS.CachesDirectoryPath
                : RNFS.DocumentDirectoryPath;
            const hasExtension = /\.[a-z0-9]{1,5}$/i.test(fileName.trim());
            let safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            if (!hasExtension) {
                safeName += '.pdf';
            }
            const localFile = `${dirPath}/${safeName}`;
            console.log('[DocumentDownload] Local file path:', localFile);

            const options = {
                fromUrl: url,
                toFile: localFile,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                }
            };

            const downloadResult = await RNFS.downloadFile(options).promise;
            console.log('[DocumentDownload] Download result:', downloadResult);

            if (downloadResult.statusCode === 200) {
                console.log('[DocumentDownload] Download successful, attempting to open with FileViewer');
                await FileViewer.open(localFile, { showOpenWithDialog: true })
                    .then(() => {
                        console.log('[DocumentDownload] FileViewer opened successfully');
                    })
                    .catch((err) => {
                        console.log('[DocumentDownload] FileViewer error caught internally:', err);
                        Toast.show({ type: 'error', text1: 'Error in FileViewer', text2: String(err?.message || err) });
                    });
            } else {
                console.log('[DocumentDownload] Download failed with status:', downloadResult.statusCode);
                Toast.show({ type: 'error', text1: `Download failed with status ${downloadResult.statusCode}` });
            }
        } catch (error: any) {
            console.log('[DocumentDownload] Exception caught:', error);
            Toast.show({ type: 'error', text1: 'Error opening document', text2: String(error?.message || error) });
        } finally {
            console.log('[DocumentDownload] Finished');
            setDownloadingDocId(null);
        }
    }, [authToken]);

    const handleOpenCourseItem = useCallback((sectionKey: string, item: any) => {
        const contentName = getItemTitle(item, sectionKey === 'note'
            ? 'Note Bank'
            : sectionKey === 'question'
                ? 'Question Bank'
                : sectionKey === 'video'
                    ? 'Video Bank'
                    : sectionKey === 'document'
                        ? 'Document'
                        : 'Content');

        if (paymentHistoryLoading) {
            Toast.show({ type: 'info', text1: 'Verifying payment status, please wait...' });
            return;
        }

        if (activePaymentSession?.resourceId && !enrolledBundleIds.includes(String(activePaymentSession.resourceId))) {
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
    }, [activePaymentSession?.resourceId, enrolledBundleIds, handleOpenNoteBank, handleOpenQuestionBank, handleOpenVideoBank, handleOpenDocumentFolder, paymentHistoryLoading, detailScreen?.isEnrolled, showCategoryExamContentLockedToast]);

    const renderMockSetCards = () => {
        if (!showingSubBundle && filteredSubBundleItems.length > 0) {
            return (
                <View style={styles.subjectList}>
                    <View style={styles.quizCardsWrap}>
                        {filteredSubBundleItems.map((subBundle: any, index: number) => {
                            const normalizedSubBundle = getBundlePayload(subBundle);
                            const mockCount = getBundleMockCount(normalizedSubBundle);

                            return (
                                <Pressable
                                    key={String(getBundleId(normalizedSubBundle) || index)}
                                    style={styles.quizCardPressable}
                                    onPress={() => handleSubBundlePress(normalizedSubBundle)}
                                >
                                    <View style={styles.quizCard}>
                                        {/* No SUB-BUNDLE badge displayed */}

                                        <Text style={styles.quizCardTitle}>{normalizedSubBundle?.title || normalizedSubBundle?.name || `Sub Bundle ${index + 1}`}</Text>

                                        <View style={styles.quizMetaRow}>
                                            <View style={styles.quizMetaItem}>
                                                <Feather name="layers" size={normalize(14)} color="#667085" />
                                                <Text style={styles.quizMetaText}>{mockCount} Mock Test{mockCount === 1 ? '' : 's'}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.quizActionButton}>
                                            <Text style={styles.quizActionText}>Explore Curriculum</Text>
                                            <Feather name="chevron-right" size={normalize(14)} color="#FFFFFF" />
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            );
        }

        if (filteredDetailQuizGroups.length > 0) {
            return (
                <>
                    <Text style={styles.sectionTitle}>Mock Bank</Text>
                    <Text style={styles.subjectSubtitle}>
                        {filteredDetailQuizGroups.length > 0
                            ? `${filteredDetailQuizGroups.reduce((total: number, group: any) => total + (group?.quizzes?.length || 0), 0)} quizzes in this ${showingSubBundle ? 'course' : 'category'}`
                            : 'No quizzes returned from the API'}
                    </Text>

                    <View style={styles.subjectList}>
                        {filteredDetailQuizGroups.map((group: any, groupIndex: number) => (
                            <View key={`${group.title || 'group'}-${groupIndex}`} style={styles.quizSection}>
                                <View style={styles.topicRow}>
                                    <View style={styles.topicDot} />
                                    <Text style={styles.topicTitle}>{group.title}</Text>
                                </View>

                                <View style={styles.quizCardsWrap}>
                                    {group.quizzes.map((quiz: any, quizIndex: number) => {
                                        const fetchedQuiz = mockMarkingMap[quiz.id || quiz._id || quiz.quizId || quiz.testId];
                                        const targetQuiz = fetchedQuiz || quiz?.rawQuiz || quiz;

                                        const calculatedTotalMarks = getQuizTotalMarks(targetQuiz) || (getQuizQuestionCount(targetQuiz) * (getQuizMarksPerQuestion(targetQuiz) || 1));
                                        const markingStr = fetchedQuiz?.marking || quiz?.marking || getQuizMarking(targetQuiz);

                                        const attemptsDisplay = quiz.attempts !== undefined && quiz.attempts !== null
                                            ? (String(quiz.attempts).toLowerCase() === 'unlimited' ? 'Unlimited' : quiz.attempts)
                                            : null;

                                        return (
                                            <View key={String(quiz.id || quizIndex)} style={styles.quizCardPressable}>
                                                <View style={[styles.quizCard, { borderTopWidth: 4, borderTopColor: '#0EA5E9', backgroundColor: '#FFFFFF' }]}>
                                                    <Text numberOfLines={2} style={[styles.quizCardTitle, { marginBottom: normalize(8), minHeight: normalize(38) }]}>
                                                        {quiz.title || quiz.name || 'Mock Bank'}
                                                    </Text>

                                                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: normalize(8) }} />

                                                    <View style={{ gap: normalize(4), marginBottom: normalize(12) }}>
                                                        {calculatedTotalMarks !== null && calculatedTotalMarks > 0 && (
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Feather name="award" size={normalize(12)} color="#64748B" style={{ marginRight: normalize(6) }} />
                                                                <Text style={{ fontSize: normalize(11), color: '#64748B', fontFamily: Fonts.intermedium }}>Marks: <Text style={{ color: '#0F766E', fontWeight: 'bold' }}>{calculatedTotalMarks}</Text></Text>
                                                            </View>
                                                        )}
                                                        {quiz.durationMinutes ? (
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Feather name="clock" size={normalize(12)} color="#64748B" style={{ marginRight: normalize(6) }} />
                                                                <Text style={{ fontSize: normalize(11), color: '#64748B', fontFamily: Fonts.intermedium }}>Time: <Text style={{ color: '#0EA5E9', fontWeight: 'bold' }}>{quiz.durationMinutes}m</Text></Text>
                                                            </View>
                                                        ) : null}
                                                        {attemptsDisplay ? (
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Feather name="rotate-ccw" size={normalize(12)} color="#64748B" style={{ marginRight: normalize(6) }} />
                                                                <Text style={{ fontSize: normalize(11), color: '#64748B', fontFamily: Fonts.intermedium }}>Attempts: <Text style={{ color: '#D97706', fontWeight: 'bold' }}>{attemptsDisplay}</Text></Text>
                                                            </View>
                                                        ) : null}
                                                    </View>

                                                    {canAttemptMocks ? (
                                                        <Pressable
                                                            style={[styles.quizActionButton, isEnrollingBundle && styles.quizActionButtonDisabled]}
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
                                    })}
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            );
        }

        return (
            <View style={styles.emptyStateBox}>
                <Feather name="search" size={normalize(24)} color="#94A3B8" />
                <Text style={styles.emptyStateText}>
                    {normalizedDetailSearchQuery ? 'No matching mock tests found' : 'No Data Available'}
                </Text>
            </View>
        );
    };

    const renderCourseSectionItem = useCallback(({ item }: { item: any }) => {
        const section = filteredActiveCourseSection || courseSections.find(current => current.key === activeCourseSection);
        if (!section) {
            return null;
        }

        if (section.key === 'note') {
            return (
                <Pressable style={styles.courseCardPressable} onPress={() => handleOpenCourseItem(section.key, item)}>
                    <LinearGradient
                        colors={['#ECFDF5', '#FFFFFF', '#E0F2FE']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.courseCard}
                    >
                        <LinearGradient
                            colors={['#ECFDF5', '#D1FAE5', '#CCFBF1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.courseCardBadge}
                        >
                            <Text style={styles.courseCardBadgeText}>NOTES</Text>
                        </LinearGradient>
                        <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Note Bank')}</Text>
                        {getItemDescription(item) ? <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text> : null}
                        <View style={styles.courseCardFooter}>
                            <Feather name="book-open" size={normalize(16)} color={Colorpath.Primary} />
                            <Text style={styles.courseCardFooterText}>Open note pages</Text>
                        </View>
                    </LinearGradient>
                </Pressable>
            );
        }

        if (section.key === 'question') {
            return (
                <Pressable style={styles.courseCardPressable} onPress={() => handleOpenCourseItem(section.key, item)}>
                    <LinearGradient
                        colors={['#F5F3FF', '#FFFFFF', '#FCE7F3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.courseCard}
                    >
                        <LinearGradient
                            colors={['#F5F3FF', '#E9D5FF', '#DBEAFE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.courseCardBadge}
                        >
                            <Text style={styles.courseCardBadgeText}>QUESTION BANK</Text>
                        </LinearGradient>
                        <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Question Bank')}</Text>
                        {getQuestionBankYear(item) ? <Text style={styles.courseCardSubtitle}>Year: {getQuestionBankYear(item)}</Text> : null}
                        <View style={styles.courseCardFooter}>
                            <Feather name="help-circle" size={normalize(16)} color={Colorpath.Primary} />
                            <Text style={styles.courseCardFooterText}>View questions & answers</Text>
                        </View>
                    </LinearGradient>
                </Pressable>
            );
        }

        if (section.key === 'document') {
            return (
                <Pressable style={styles.courseCardPressable} onPress={() => handleOpenCourseItem(section.key, item)}>
                    <LinearGradient
                        colors={['#F0FDF4', '#FFFFFF', '#DCFCE7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.courseCard}
                    >
                        <LinearGradient
                            colors={['#DCFCE7', '#BBF7D0', '#86EFAC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.courseCardBadge}
                        >
                            <Text style={styles.courseCardBadgeText}>DOCUMENT</Text>
                        </LinearGradient>
                        <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Document')}</Text>
                        {getItemDescription(item) ? <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text> : <Text style={styles.courseCardSubtitle}>PDF Document</Text>}
                        <View style={styles.courseCardFooter}>
                            <Feather name="file-text" size={normalize(16)} color="#16A34A" />
                            <Text style={[styles.courseCardFooterText, { color: '#16A34A', marginLeft: normalize(4) }]}>Open Document</Text>
                        </View>
                    </LinearGradient>
                </Pressable>
            );
        }

        return (
            <Pressable style={styles.courseCardPressable} onPress={() => handleOpenCourseItem(section.key, item)}>
                <LinearGradient
                    colors={['#FEF2F2', '#FFFFFF', '#EEF2FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.courseCard}
                >
                    <View style={styles.courseCardBadge}>
                        <Text style={styles.courseCardBadgeText}>VIDEOLINK BANK</Text>
                    </View>
                    <View style={styles.videoCardTitleRow}>
                        <Feather name="play-circle" size={normalize(18)} color={Colorpath.Primary} />
                        <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Video Bank')}</Text>
                    </View>
                    {getItemDescription(item) ? <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text> : <Text style={styles.courseCardSubtitle}>YouTube Video</Text>}
                    <View style={styles.courseCardFooter}>
                        <Feather name="youtube" size={normalize(16)} color="#FF0000" />
                        <Text style={[styles.courseCardFooterText, { color: '#FF0000', marginLeft: normalize(4) }]}>Open in YouTube</Text>
                    </View>
                </LinearGradient>
            </Pressable>
        );
    }, [activeCourseSection, courseSections, filteredActiveCourseSection, handleOpenCourseItem]);

    const renderCourseTabContent = () => {
        if (filteredCourseSections.length === 0) {
            return (
                <View style={styles.emptyStateBox}>
                    <Feather name="folder" size={normalize(24)} color="#94A3B8" />
                    <Text style={styles.emptyStateText}>
                        {normalizedDetailSearchQuery ? 'No matching study materials found' : 'No Data Available'}
                    </Text>
                </View>
            );
        }

        const activeSection = filteredActiveCourseSection;

        return (
            <View style={styles.courseLayout}>
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
                                        <View style={[
                                            styles.courseSectionItemDot,
                                            isActiveSection && styles.courseSectionItemDotActive,
                                        ]} />
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
                            <Text style={styles.courseSectionBannerPillValue}>{(activeSection?.items || []).length}</Text>
                            <Text style={styles.courseSectionBannerPillLabel}>ITEMS</Text>
                        </View>
                    </LinearGradient>
                    <FlatList
                        data={activeSection?.items || []}
                        keyExtractor={(item: any, index: number) => String(getItemId(item) || index)}
                        renderItem={renderCourseSectionItem}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                        ListEmptyComponent={(
                            <View style={styles.emptyStateBox}>
                                <Feather name="inbox" size={normalize(24)} color="#94A3B8" />
                                <Text style={styles.emptyStateText}>No Data Available</Text>
                            </View>
                        )}
                        scrollEnabled={false}
                    />
                </LinearGradient>
            </View>
        );
    };

    const renderDetailTabCards = () => (
        activeDetailTab === 'course' ? renderCourseTabContent() : renderMockSetCards()
    );

    const openBundleDetails = (bundle: any, mode: 'view' | 'enroll') => {
        const normalizedBundle = getBundlePayload(bundle);
        const bundleId = getBundleId(normalizedBundle);
        const resolvedBundleId = bundleId ? String(bundleId) : null;
        const bundleTitle = String(getItemTitle(normalizedBundle, 'This content')).trim();

        if (!resolvedBundleId) {
            return;
        }

        if (activePaymentSession?.resourceId && String(activePaymentSession.resourceId) !== resolvedBundleId) {
            Toast.show({ type: 'info', text1: 'Complete the current payment first.' });
            return;
        }

        if (activePaymentSession?.resourceId === resolvedBundleId && !enrolledBundleIds.includes(resolvedBundleId)) {
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
                (Boolean(normalizedBundle?.isEnrolled) ||
                    enrolledBundleIds.includes(resolvedBundleId)));

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
    };

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

        if (activePaymentSession?.resourceId && !enrolledBundleIds.includes(String(activePaymentSession.resourceId))) {
            Toast.show({ type: 'info', text1: 'Please complete the current payment first.' });
            return;
        }

        const resolvedSubBundleId = String(subBundleId);
        setActiveSubBundleId(resolvedSubBundleId);
        dispatch(getSubBundleDetailsRequest({
            bundleId: activeBundleId,
            subBundleId: resolvedSubBundleId,
        }));
    };

    const handleBackPress = () => {
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

        if (selectedModule) {
            setSelectedModule(null);
            return;
        }
    };

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
                                <Text style={styles.headerTagline}>{showingSubBundle ? 'COURSE' : 'EXAM CATEGORY'}</Text>
                                <Text style={styles.headerMainTitle}>{detailScreen.name}</Text>
                                <Text style={styles.detailSubtitle}>
                                    {showingSubBundle
                                        ? (detailScreen.isEnrolled ? 'You are enrolled. Start any mock below.' : 'Enroll in the parent bundle to unlock attempts.')
                                        : (detailScreen.isEnrolled ? 'Open any curriculum item below.' : 'Enroll once to unlock every mock in this course.')}
                                </Text>
                            </View>
                            <View style={styles.headerRightIcon}>
                                {renderIcon(detailScreen.icon, detailScreen.iconType, normalize(20), detailScreen.iconColor)}
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.detailScrollContent, { paddingBottom: Math.max(insets.bottom + verticalScale(112), verticalScale(140)) }]}>
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
                        <>
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
                                                    <Text style={[
                                                        styles.dynamicTabText,
                                                        isActiveTab && styles.dynamicTabTextActive,
                                                    ]}>
                                                        {tab.label}
                                                    </Text>
                                                    <View style={[
                                                        styles.dynamicTabIndicator,
                                                        isActiveTab && styles.dynamicTabIndicatorActive,
                                                    ]} />
                                                </LinearGradient>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            </LinearGradient>

                            {renderDetailTabCards()}
                        </>
                    ) : showSubBundleList ? (
                        <>
                            <Text style={styles.sectionTitle}>Course Curriculum</Text>
                            <Text style={styles.subjectSubtitle}>
                                {`${filteredSubBundleItems.length} course${filteredSubBundleItems.length === 1 ? '' : 's'} available in this course`}
                            </Text>

                            {filteredSubBundleItems.length === 0 ? (
                                <View style={styles.emptyStateBox}>
                                    <Feather name="search" size={normalize(24)} color="#94A3B8" />
                                    <Text style={styles.emptyStateText}>
                                        {normalizedDetailSearchQuery ? 'No matching courses found' : 'No Data Available'}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.subjectList}>
                                    <View style={styles.quizCardsWrap}>
                                        {filteredSubBundleItems.map((subBundle: any, index: number) => {
                                            const normalizedSubBundle = getBundlePayload(subBundle);
                                            const mockCount = getBundleMockCount(normalizedSubBundle);

                                            return (
                                                <Pressable
                                                    key={String(getBundleId(normalizedSubBundle) || index)}
                                                    style={styles.quizCardPressable}
                                                    onPress={() => handleSubBundlePress(normalizedSubBundle)}
                                                >
                                                    <LinearGradient
                                                        colors={['#ECFDF5', '#FFFFFF']}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                        style={styles.quizCard}
                                                    >
                                                        <Text style={styles.quizCardTitle}>{normalizedSubBundle?.title || normalizedSubBundle?.name || `Sub Bundle ${index + 1}`}</Text>

                                                        <View style={styles.quizMetaRow}>
                                                            <View style={styles.quizMetaItem}>
                                                                <Feather name="layers" size={normalize(14)} color="#667085" />
                                                                <Text style={styles.quizMetaText}>{mockCount} Mock Test{mockCount === 1 ? '' : 's'}</Text>
                                                            </View>
                                                        </View>

                                                        <View style={styles.quizActionButton}>
                                                            <Text style={styles.quizActionText}>Explore Curriculum</Text>
                                                            <Feather name="chevron-right" size={normalize(14)} color="#FFFFFF" />
                                                        </View>
                                                    </LinearGradient>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            <Text style={styles.sectionTitle}>Mock Bank</Text>
                            <Text style={styles.subjectSubtitle}>
                                {detailScreen.quizGroups?.length > 0
                                    ? `${detailScreen.quizIds?.length || 0} quizzes in this ${showingSubBundle ? 'course' : 'category'}`
                                    : 'No quizzes returned from the API'}
                            </Text>

                            <View style={styles.subjectList}>
                                {detailScreen.quizGroups?.map((group: any, groupIndex: number) => {
                                    const sectionTheme = SUBJECT_CARD_THEMES[groupIndex % SUBJECT_CARD_THEMES.length];

                                    return (
                                        <LinearGradient
                                            key={`${group.title || 'group'}-${groupIndex}`}
                                            colors={sectionTheme.colors as [string, string, string]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={[styles.quizSectionCard, { borderColor: sectionTheme.tint }]}
                                        >
                                            <View style={styles.quizSectionHeader}>
                                                <View style={styles.topicRow}>
                                                    <View style={[styles.topicDot, { backgroundColor: '#FFFFFF' }]} />
                                                    <Text style={[styles.topicTitle, styles.topicTitleLight]}>{String(group.title || 'General').toUpperCase()}</Text>
                                                </View>
                                                <Animated.Text
                                                    style={[
                                                        styles.sectionArrowMark,
                                                        {
                                                            opacity: arrowPulse.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [0.65, 1],
                                                            }),
                                                            transform: [
                                                                {
                                                                    translateX: arrowPulse.interpolate({
                                                                        inputRange: [0, 1],
                                                                        outputRange: [0, 8],
                                                                    }),
                                                                },
                                                            ],
                                                        },
                                                    ]}
                                                >
                                                    {'>>>'}
                                                </Animated.Text>
                                            </View>

                                            <View style={styles.quizCardsWrap}>
                                                {group.quizzes.map((quiz: any, quizIndex: number) => {
                                                    const fetchedQuiz = mockMarkingMap[quiz.id || quiz._id || quiz.quizId || quiz.testId];
                                                    const targetQuiz = fetchedQuiz || quiz?.rawQuiz || quiz;
                                                    const quizTheme = getMockCardTheme(groupIndex + quizIndex);

                                                    const calculatedTotalMarks = getQuizTotalMarks(targetQuiz) || (getQuizQuestionCount(targetQuiz) * (getQuizMarksPerQuestion(targetQuiz) || 1));
                                                    const attemptsDisplay = quiz.attempts !== undefined && quiz.attempts !== null
                                                        ? (String(quiz.attempts).toLowerCase() === 'unlimited' ? 'Unlimited' : quiz.attempts)
                                                        : null;

                                                    return (
                                                        <Pressable key={String(quiz.id || quizIndex)} style={styles.quizCardPressable}>
                                                            <LinearGradient
                                                                colors={quizTheme.top as [string, string, string]}
                                                                start={{ x: 0, y: 0 }}
                                                                end={{ x: 1, y: 1 }}
                                                                style={[styles.quizCard, { borderTopWidth: 0, borderColor: quizTheme.border }]}
                                                            >
                                                                <Text numberOfLines={2} style={[styles.quizCardTitle, styles.quizCardTitleLight, { marginBottom: normalize(8), minHeight: normalize(38) }]}>
                                                                    {quiz.title || quiz.name || 'Mock Bank'}
                                                                </Text>

                                                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.22)', marginBottom: normalize(8) }} />

                                                                <View style={{ gap: normalize(4), marginBottom: normalize(12) }}>
                                                                    {calculatedTotalMarks !== null && calculatedTotalMarks > 0 && (
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                            <Feather name="award" size={normalize(12)} color="#FFFFFF" style={{ marginRight: normalize(6) }} />
                                                                            <Text style={{ fontSize: normalize(11), color: 'rgba(255,255,255,0.90)', fontFamily: Fonts.intermedium }}>Marks: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{calculatedTotalMarks}</Text></Text>
                                                                        </View>
                                                                    )}
                                                                    {quiz.durationMinutes ? (
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                            <Feather name="clock" size={normalize(12)} color="#FFFFFF" style={{ marginRight: normalize(6) }} />
                                                                            <Text style={{ fontSize: normalize(11), color: 'rgba(255,255,255,0.90)', fontFamily: Fonts.intermedium }}>Time: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{quiz.durationMinutes}m</Text></Text>
                                                                        </View>
                                                                    ) : null}
                                                                    {attemptsDisplay ? (
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                            <Feather name="rotate-ccw" size={normalize(12)} color="#FFFFFF" style={{ marginRight: normalize(6) }} />
                                                                            <Text style={{ fontSize: normalize(11), color: 'rgba(255,255,255,0.90)', fontFamily: Fonts.intermedium }}>Attempts: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{attemptsDisplay}</Text></Text>
                                                                        </View>
                                                                    ) : null}
                                                                </View>

                                                                {canAttemptMocks ? (
                                                                    <Pressable
                                                                        style={[styles.quizActionButton, isEnrollingBundle && styles.quizActionButtonDisabled]}
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
                                                                        <Feather name="eye" size={normalize(14)} color="#FFFFFF" />
                                                                        <Text style={styles.quizViewOnlyTextLight}>View only</Text>
                                                                    </View>
                                                                )}
                                                            </LinearGradient>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        </LinearGradient>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    <View style={{ height: verticalScale(50) }} />
                </ScrollView>

                <Modal
                    visible={showNoteViewerModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowNoteViewerModal(false)}
                >
                    <View style={styles.noteViewerContainer}>
                        <SafeAreaView edges={['top']} style={styles.noteViewerSafeArea}>
                            <View style={styles.noteViewerHeader}>
                                <View style={styles.noteViewerHeaderText}>
                                    <Text style={styles.noteViewerLabel}>NOTE BANK</Text>
                                    <Text style={styles.noteViewerTitle}>{selectedNoteBankTitle || 'Note Bank'}</Text>
                                    <Text style={styles.noteViewerSubtitle}>READ AND LEARN WITH CURATED NOTES</Text>
                                </View>
                                <Pressable onPress={() => setShowNoteViewerModal(false)} style={styles.noteViewerCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        {isLoadingNotePages ? (
                            <View style={styles.noteViewerStateBox}>
                                <SubjectBankSkeleton />
                            </View>
                        ) : selectedNotePages.length === 0 ? (
                            <View style={styles.noteViewerStateBox}>
                                <Feather name="file-text" size={normalize(24)} color="#94A3B8" />
                                <Text style={styles.noteViewerStateText}>No note pages found.</Text>
                            </View>
                        ) : (
                            <View style={styles.noteViewerLayout}>
                                <View style={styles.noteViewerLeftPanel}>
                                    <Text style={styles.noteViewerPanelLabel}>PAGES</Text>
                                    <FlatList
                                        data={selectedNotePages}
                                        keyExtractor={(page: any, index: number) => `${page?._id || page?.id || index}`}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.noteViewerListContent}
                                        renderItem={({ item, index }) => {
                                            const pageTitle = toDisplayText(item?.title, `Page ${index + 1}`);

                                            return (
                                                <Pressable
                                                    onPress={() => setSelectedNotePageIndex(index)}
                                                    style={[
                                                        styles.noteViewerListItem,
                                                        selectedNotePageIndex === index && styles.noteViewerListItemActive,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.noteViewerListIndex,
                                                            selectedNotePageIndex === index && styles.noteViewerListIndexActive,
                                                        ]}
                                                    >
                                                        {index + 1}.
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.noteViewerListText,
                                                            selectedNotePageIndex === index && styles.noteViewerListTextActive,
                                                        ]}
                                                        numberOfLines={2}
                                                    >
                                                        {pageTitle}
                                                    </Text>
                                                </Pressable>
                                            );
                                        }}
                                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                                    />
                                </View>

                                <View style={styles.noteViewerRightPanel}>
                                    {(() => {
                                        const currentPage = selectedNotePages[selectedNotePageIndex];

                                        if (!currentPage) {
                                            return (
                                                <View style={styles.noteViewerStateBox}>
                                                    <Feather name="file-text" size={normalize(24)} color="#94A3B8" />
                                                    <Text style={styles.noteViewerStateText}>No note pages found.</Text>
                                                </View>
                                            );
                                        }

                                        return (
                                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.noteViewerDetailScroll, { paddingBottom: Math.max(insets.bottom + verticalScale(24), verticalScale(48)) }]}>
                                                <View style={styles.noteViewerDetailCard}>
                                                    <View style={styles.noteViewerDetailTopRow}>
                                                        <Text style={styles.noteViewerDetailTag}>PAGE {selectedNotePageIndex + 1}</Text>
                                                        <Text style={styles.noteViewerDetailTitle}>{toDisplayText(currentPage?.title, `Page ${selectedNotePageIndex + 1}`)}</Text>
                                                    </View>
                                                    <Text style={styles.noteViewerDetailBody} numberOfLines={5} ellipsizeMode="tail">
                                                        {htmlToNoteText(currentPage?.htmlContent || '') || 'No content available.'}
                                                    </Text>
                                                    <Text style={styles.noteViewerDetailHint}>Tap View to read the full page.</Text>
                                                    <Pressable
                                                        style={styles.noteViewerViewButton}
                                                        onPress={() => {
                                                            setSelectedNotePageDetail(currentPage);
                                                            setShowNotePageModal(true);
                                                        }}
                                                    >
                                                        <Text style={styles.noteViewerViewButtonText}>View</Text>
                                                        <Feather name="chevron-right" size={normalize(16)} color="#FFFFFF" />
                                                    </Pressable>
                                                </View>
                                            </ScrollView>
                                        );
                                    })()}
                                </View>
                            </View>
                        )}
                    </View>
                </Modal>

                <Modal
                    visible={showQuestionBankModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowQuestionBankModal(false)}
                >
                    <View style={styles.questionBankContainer}>
                        <SafeAreaView edges={['top']} style={styles.questionBankSafeArea}>
                            <View style={styles.questionBankHeader}>
                                <View style={styles.questionBankHeaderText}>
                                    <Text style={styles.questionBankLabel}>QUESTION BANK</Text>
                                    <Text style={styles.questionBankTitle}>{selectedQuestionBankTitle || 'Previous Year Question'}</Text>
                                    <Text style={styles.questionBankSubtitle}>PRACTICE WITH CURATED QUESTIONS AND EXPLANATIONS</Text>
                                </View>
                                <Pressable onPress={() => setShowQuestionBankModal(false)} style={styles.questionBankCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        {isLoadingQuestionBank ? (
                            <View style={styles.questionBankLoadingState}>
                                <SubjectBankSkeleton />
                            </View>
                        ) : selectedQuestionBankQuestions.length === 0 ? (
                            <View style={styles.questionBankEmptyState}>
                                <Feather name="inbox" size={normalize(26)} color="#94A3B8" />
                                <Text style={styles.questionBankEmptyText}>No Data Available</Text>
                            </View>
                        ) : (
                            <View style={styles.questionBankLayout}>
                                <View style={styles.questionBankLeftPanel}>
                                    <Text style={styles.questionBankPanelLabel}>QUESTIONS</Text>
                                    <FlatList
                                        data={selectedQuestionBankQuestions}
                                        keyExtractor={(item: any, index: number) => `${item?._id || item?.id || index}`}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.questionBankListContent}
                                        renderItem={({ item, index }) => {
                                            const itemTitle = toDisplayText(getQuestionPrompt(item), `Question ${index + 1}`);
                                            return (
                                                <Pressable
                                                    onPress={() => {
                                                        setSelectedQuestionIndex(index);
                                                    }}
                                                    style={[
                                                        styles.questionBankListItem,
                                                        selectedQuestionIndex === index && styles.questionBankListItemActive,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.questionBankListIndex,
                                                            selectedQuestionIndex === index && styles.questionBankListIndexActive,
                                                        ]}
                                                    >
                                                        {index + 1}.
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.questionBankListText,
                                                            selectedQuestionIndex === index && styles.questionBankListTextActive,
                                                        ]}
                                                        numberOfLines={2}
                                                    >
                                                        {itemTitle}
                                                    </Text>
                                                </Pressable>
                                            );
                                        }}
                                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                                    />
                                </View>

                                <View style={styles.questionBankRightPanel}>
                                    {(() => {
                                        const currentQuestion = selectedQuestionBankQuestions[selectedQuestionIndex];

                                        if (!currentQuestion) {
                                            return (
                                                <View style={styles.questionBankEmptyState}>
                                                    <Feather name="file-text" size={normalize(26)} color="#94A3B8" />
                                                    <Text style={styles.questionBankEmptyText}>No Data Available</Text>
                                                </View>
                                            );
                                        }

                                        const options = getQuestionOptions(currentQuestion);
                                        const prompt = toDisplayText(getQuestionPrompt(currentQuestion), 'Question');
                                        const answer = toDisplayText(getQuestionAnswer(currentQuestion), '');
                                        const explanation = toDisplayText(getQuestionExplanation(currentQuestion), '');
                                        const year = toDisplayText(getQuestionBankYear(selectedQuestionBankMeta || currentQuestion), '');

                                        return (
                                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.questionBankDetailScroll, { paddingBottom: Math.max(insets.bottom + verticalScale(24), verticalScale(48)) }]}>
                                                <View style={styles.questionBankDetailCard}>
                                                    <View style={styles.questionBankDetailTopRow}>
                                                        <Text style={styles.questionBankDetailTag}>QUESTION {selectedQuestionIndex + 1}</Text>
                                                        <Text style={styles.questionBankDetailTitle}>{prompt}</Text>
                                                    </View>

                                                    {currentQuestion?.htmlContent ? (
                                                        <Text style={{ fontSize: normalize(15), color: '#334155', marginTop: verticalScale(10), marginBottom: verticalScale(16), lineHeight: normalize(22) }}>
                                                            {htmlToPlainText(currentQuestion.htmlContent)}
                                                        </Text>
                                                    ) : null}

                                                    {year ? <Text style={styles.questionBankYearText}>Year: {year}</Text> : null}

                                                    {options.length > 0 ? (
                                                        <View style={styles.questionBankOptionsWrap}>
                                                            {options.map((option: any, optionIndex: number) => {
                                                                const optionText = toDisplayText(
                                                                    option,
                                                                    `Option ${optionIndex + 1}`,
                                                                );

                                                                return (
                                                                    <View key={`${optionText}-${optionIndex}`} style={styles.questionBankOptionRow}>
                                                                        <View style={styles.questionBankOptionDot} />
                                                                        <Text style={styles.questionBankOptionText}>{optionText}</Text>
                                                                    </View>
                                                                );
                                                            })}
                                                        </View>
                                                    ) : null}

                                                    {(answer || explanation) ? (
                                                        <Pressable
                                                            onPress={() => {
                                                                setSelectedQuestionAnswerDetail({
                                                                    questionNumber: selectedQuestionIndex + 1,
                                                                    title: prompt,
                                                                    answer,
                                                                    explanation,
                                                                });
                                                                setShowQuestionAnswerModal(true);
                                                            }}
                                                            style={styles.questionBankToggleBtn}
                                                        >
                                                            <Text style={styles.questionBankToggleText}>Show Answer</Text>
                                                            <Feather
                                                                name="chevron-right"
                                                                size={normalize(18)}
                                                                color={Colorpath.Primary}
                                                            />
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            </ScrollView>
                                        );
                                    })()}
                                </View>
                            </View>
                        )}
                    </View>
                </Modal>

                <Modal
                    visible={showQuestionAnswerModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowQuestionAnswerModal(false)}
                >
                    <View style={styles.questionAnswerContainer}>
                        <SafeAreaView edges={['top']} style={styles.questionAnswerSafeArea}>
                            <View style={styles.questionAnswerHeader}>
                                <View style={styles.questionAnswerHeaderText}>
                                    <Text style={styles.questionAnswerLabel}>ANSWER & EXPLANATION</Text>
                                    <Text style={styles.questionAnswerTitle}>
                                        {selectedQuestionAnswerDetail?.title || 'Question Answer'}
                                    </Text>
                                    <Text style={styles.questionAnswerSubtitle}>
                                        QUESTION {selectedQuestionAnswerDetail?.questionNumber || ''}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() => setShowQuestionAnswerModal(false)}
                                    style={styles.questionAnswerCloseBtn}
                                >
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.questionAnswerScrollContent, { paddingBottom: Math.max(insets.bottom + verticalScale(24), verticalScale(48)) }]}>
                            <View style={styles.questionAnswerCard}>
                                {selectedQuestionAnswerDetail?.answer ? (
                                    <Text style={styles.questionAnswerBody}>{selectedQuestionAnswerDetail.answer}</Text>
                                ) : null}
                                {selectedQuestionAnswerDetail?.explanation ? (
                                    <Text style={styles.questionAnswerExplanation}>
                                        {selectedQuestionAnswerDetail.explanation}
                                    </Text>
                                ) : null}
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

                <Modal
                    visible={showVideoBankModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowVideoBankModal(false)}
                >
                    <View style={styles.videoBankContainer}>
                        <SafeAreaView edges={['top']} style={styles.videoBankSafeArea}>
                            <View style={styles.videoBankHeader}>
                                <View style={styles.videoBankHeaderText}>
                                    <Text style={styles.videoBankLabel}>VIDEO BANK</Text>
                                    <Text style={styles.videoBankTitle}>{selectedVideoBankTitle || 'Video Bank'}</Text>
                                    <Text style={styles.videoBankSubtitle}>Select a video to open in YouTube</Text>
                                </View>
                                <Pressable onPress={() => setShowVideoBankModal(false)} style={styles.videoBankCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        {isLoadingVideoBank ? (
                            <View style={styles.videoBankLoadingState}>
                                <SubjectBankSkeleton />
                            </View>
                        ) : selectedVideoBankItems.length === 0 ? (
                            <View style={styles.videoBankEmptyState}>
                                <Feather name="youtube" size={normalize(28)} color="#94A3B8" />
                                <Text style={styles.videoBankEmptyText}>No Data Available</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={selectedVideoBankItems}
                                keyExtractor={(videoItem: any, index: number) => `${videoItem?._id || videoItem?.id || index}`}
                                contentContainerStyle={styles.videoBankListContent}
                                ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                                renderItem={({ item, index }) => {
                                    const title = toDisplayText(getItemTitle(item, `Video ${index + 1}`), `Video ${index + 1}`);
                                    const subtitle = toDisplayText(getItemDescription(item), 'YouTube Video') || 'YouTube Video';
                                    const videoUrl = getVideoBankUrl(item);

                                    return (
                                        <Pressable
                                            style={styles.videoBankCard}
                                            onPress={async () => {
                                                if (!videoUrl) {
                                                    return;
                                                }
                                                await openExternalVideoUrl(videoUrl);
                                            }}
                                        >
                                            <View style={styles.videoBankCardTopRow}>
                                                <View style={styles.videoBankPlayIconWrap}>
                                                    <Feather name="play-circle" size={normalize(18)} color="#FF0000" />
                                                </View>
                                                <View style={styles.videoBankCardTextWrap}>
                                                    <Text style={styles.videoBankCardTitle} numberOfLines={2}>{title}</Text>
                                                    <Text style={styles.videoBankCardSubtitle} numberOfLines={1}>{subtitle}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.videoBankCardFooter}>
                                                <Feather name="youtube" size={normalize(16)} color="#FF0000" />
                                                <Text style={styles.videoBankCardFooterText}>Open in YouTube</Text>
                                            </View>
                                        </Pressable>
                                    );
                                }}
                            />
                        )}
                    </View>
                </Modal>

                <Modal
                    visible={showDocumentFolderModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowDocumentFolderModal(false)}
                >
                    <View style={styles.videoBankContainer}>
                        <SafeAreaView edges={['top']} style={styles.videoBankSafeArea}>
                            <View style={styles.videoBankHeader}>
                                <View style={styles.videoBankHeaderText}>
                                    <Text style={styles.videoBankLabel}>DOCUMENT FOLDER</Text>
                                    <Text style={styles.videoBankTitle}>{selectedDocumentFolderTitle || 'Documents'}</Text>
                                    <Text style={styles.videoBankSubtitle}>Select a document to open</Text>
                                </View>
                                <Pressable onPress={() => setShowDocumentFolderModal(false)} style={styles.videoBankCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        {documentLoading ? (
                            <View style={styles.videoBankLoadingState}>
                                <SubjectBankSkeleton />
                            </View>
                        ) : !documentResponse || documentResponse.length === 0 ? (
                            <View style={styles.videoBankEmptyState}>
                                <Feather name="file-text" size={normalize(28)} color="#94A3B8" />
                                <Text style={styles.videoBankEmptyText}>No Data Available</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={documentResponse}
                                keyExtractor={(docItem: any, index: number) => `${docItem?._id || docItem?.id || index}`}
                                contentContainerStyle={styles.videoBankListContent}
                                ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                                renderItem={({ item, index }) => {
                                    const fallbackTitle = getItemTitle(item, `Document ${index + 1}`);
                                    const title = item?.originalName || toDisplayText(fallbackTitle, `Document ${index + 1}`);
                                    const documentId = getItemId(item);
                                    const documentUrl = documentId ? `${constants.BASE_URL}/documents/student/stream/${documentId}` : null;

                                    return (
                                        <Pressable
                                            style={styles.videoBankCard}
                                            onPress={() => {
                                                if (downloadingDocId === documentId) return;
                                                if (!documentUrl) {
                                                    Toast.show({ type: 'info', text1: 'Document URL not found.' });
                                                    return;
                                                }
                                                const fileName = item?.originalName || item?.fileName || `${documentId}.pdf`;
                                                handleDownloadAndOpenDocument(String(documentId), documentUrl, fileName);
                                            }}
                                        >
                                            <View style={styles.videoBankCardTopRow}>
                                                <View style={styles.videoBankPlayIconWrap}>
                                                    {downloadingDocId === documentId ? (
                                                        <ActivityIndicator size="small" color={Colorpath.Primary} />
                                                    ) : (
                                                        <Feather name="file-text" size={normalize(18)} color={Colorpath.Primary} />
                                                    )}
                                                </View>
                                                <View style={styles.videoBankCardTextWrap}>
                                                    <Text style={styles.videoBankCardTitle} numberOfLines={2}>{title}</Text>
                                                </View>
                                            </View>
                                        </Pressable>
                                    );
                                }}
                            />
                        )}
                    </View>
                </Modal>


                <Modal
                    visible={showNotePageModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowNotePageModal(false)}
                >
                    <View style={styles.notePageViewerContainer}>
                        <SafeAreaView edges={['top']} style={styles.notePageViewerSafeArea}>
                            <View style={styles.notePageViewerHeader}>
                                <View style={styles.notePageViewerHeaderText}>
                                    <Text style={styles.notePageViewerLabel}>NOTE PAGE</Text>
                                    <Text style={styles.notePageViewerTitle}>
                                        {toDisplayText(selectedNotePageDetail?.title, 'Note Page')}
                                    </Text>
                                </View>
                                <Pressable onPress={() => setShowNotePageModal(false)} style={styles.notePageViewerCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        <View style={styles.notePageViewerContent}>
                            <View style={styles.notePageViewerCard}>
                                {selectedNotePageDetail?.htmlContent ? (
                                    <WebView
                                        originWhitelist={['*']}
                                        source={{ html: buildNoteHtmlDocument(selectedNotePageDetail.htmlContent) }}
                                        javaScriptEnabled={false}
                                        domStorageEnabled={false}
                                        nestedScrollEnabled
                                        style={styles.notePageViewerWebView}
                                    />
                                ) : (
                                    <View style={styles.notePageViewerEmptyState}>
                                        <Text style={styles.notePageViewerBody}>No content available.</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + verticalScale(112), verticalScale(140)) }]}>
                <View style={styles.qBankSurfaceCard}>
                    <View style={styles.segmentedControl}>
                        <Pressable
                            style={styles.segmentButtonWrap}
                            onPress={() => setMainTab('exam')}
                        >
                            <LinearGradient
                                colors={mainTab === 'exam' ? SEGMENT_THEMES[0].colors as [string, string] : ['#F8FAFC', '#FFFFFF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[
                                    styles.segmentButton,
                                    mainTab === 'exam' && canUseCategoryExam && styles.segmentButtonActive,
                                    { borderColor: SEGMENT_THEMES[0].border },
                                ]}
                            >
                                <View style={styles.segmentTextRow}>
                                    <Text style={[styles.segmentText, mainTab === 'exam' && canUseCategoryExam && styles.segmentTextActive]}>
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
                                            color={mainTab === 'exam' && canUseCategoryExam ? '#FFFFFF' : '#1D4ED8'}
                                        />
                                    </Pressable>
                                </View>
                            </LinearGradient>
                        </Pressable>
                        <Pressable style={styles.segmentButtonWrap} onPress={() => setMainTab('subject')}>
                            <LinearGradient
                                colors={mainTab === 'subject' ? SEGMENT_THEMES[1].colors as [string, string] : ['#F8FAFC', '#FFFFFF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[
                                    styles.segmentButton,
                                    mainTab === 'subject' && styles.segmentButtonActive,
                                    { borderColor: SEGMENT_THEMES[1].border },
                                ]}
                            >
                                <Text style={[styles.segmentText, mainTab === 'subject' && styles.segmentTextActive]}>
                                    By Subject
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </View>

                    <View style={styles.qBankListContainer}>
                        {subjectBankSkeletonVisible ? (
                            <SubjectBankSkeleton />
                        ) : moduleOptions.map((title, index) => {
                            const matchingBundles = bundleItems.filter((bundle: any) => {
                                const bTitle = String(bundle?.title || bundle?.name || '').trim();
                                const lowerTitle = bTitle.toLowerCase();
                                const category = String(bundle?.category || '').toLowerCase();
                                const isEliteMock = isEliteMockBundle(bundle);
                                const isFreeMock = isFreeMockBundle(bundle);

                                const isExam = !isFreeMock && (isEliteMock || (apiCategories.length > 0 ? apiCategories : EXAM_CHIPS).some(chip => lowerTitle.includes(chip.toLowerCase()) || category.includes(chip.toLowerCase())));

                                if (mainTab === 'exam') {
                                    const lowerSearch = title.toLowerCase();
                                    if (lowerSearch === 'elite mock bundle') {
                                        return isEliteMock;
                                    }
                                    return lowerTitle.includes(lowerSearch) || category.includes(lowerSearch) || (isEliteMock && lowerSearch.includes('mock'));
                                } else {
                                    if (isExam) return false; // Hide ALL exams from the Subjects tab!

                                    let subjectLabel = bundle?.subject || bundle?.module || bundle?.category;
                                    if (!subjectLabel) subjectLabel = bTitle || 'Other';

                                    return getNursingSubjectName(String(subjectLabel).trim()) === title;
                                }
                            });
                            const uniqueMatchingBundles = uniqueBundlesById(matchingBundles);

                            let totalQuestions = 0;
                            uniqueMatchingBundles.forEach((b: any) => {
                                const quizzes = getBundleQuizzes(getBundlePayload(b));
                                quizzes.forEach((q: any) => {
                                    totalQuestions += getQuizQuestionCount(q) || 10;
                                });
                            });
                            if (totalQuestions === 0) totalQuestions = 50;

                            const theme = SUBJECT_CARD_THEMES[index % SUBJECT_CARD_THEMES.length];
                            const accentColor = ['#2FB0FF', '#63D1D2', '#FFB648', '#B27EFF', '#FF7A7A'][index % 5];
                            const iconName = getCategoryIconName(title, mainTab);
                            return (
                                <View key={index}>
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
                                                <Text style={[styles.qBankCardSubtitle, styles.qBankCardSubtitleLight]}>Tap to explore</Text>
                                            </View>
                                            <Animated.Text
                                                style={[
                                                    styles.qBankArrowMark,
                                                    {
                                                        opacity: arrowPulse.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [0.65, 1],
                                                        }),
                                                        transform: [
                                                            {
                                                                translateX: arrowPulse.interpolate({
                                                                    inputRange: [0, 1],
                                                                    outputRange: [0, 8],
                                                                }),
                                                            },
                                                        ],
                                                    },
                                                ]}
                                            >
                                                {'>>>>>>>'}
                                            </Animated.Text>
                                        </LinearGradient>
                                    </Pressable>
                                    {expandedCategory === title && (
                                        <View style={styles.expandedCategoryContainer}>
                                            {uniqueMatchingBundles
                                                .slice(0, viewMoreStates[title] ? undefined : 2)
                                                .map((bundle: any, bIndex: number) => {
                                                    const normalizedBundle = getBundlePayload(bundle);
                                                    const bundleId = String(getBundleId(normalizedBundle) || bIndex);
                                                    const hasEnrolledAccess =
                                                        enrolledBundleOverrides.has(bundleId) ||
                                                        (!failedPendingBundleIds.has(bundleId) &&
                                                            (Boolean(normalizedBundle?.isEnrolled) ||
                                                                enrolledBundleIds.includes(bundleId)));
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
                                                                    navigation.navigate('MockTestRules', { testId: getQuizId(quizzes[0]), testData: quizzes[0] });
                                                                } else {
                                                                    Toast.show({ type: 'info', text1: 'No Mock Tests available for this course yet.' });
                                                                }
                                                            }}
                                                        />
                                                    );
                                                })}
                                            {uniqueMatchingBundles.length > 2 && (
                                                <TouchableOpacity
                                                    style={styles.viewMoreBtn}
                                                    onPress={() => {
                                                        setViewMoreStates((prev) => ({ ...prev, [title]: !prev[title] }));
                                                    }}
                                                >
                                                    <Text style={styles.viewMoreBtnText}>
                                                        {viewMoreStates[title] ? 'View Less' : `View More (${uniqueMatchingBundles.length - 2})`}
                                                    </Text>
                                                    <Feather name={viewMoreStates[title] ? 'chevron-up' : 'chevron-down'} size={16} color="#1D4ED8" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: verticalScale(100) }} />
            </ScrollView>

            <Modal
                visible={isPaymentWebViewVisible && Boolean(activePaymentSession?.paymentUrl)}
                animationType="slide"
                onRequestClose={() => {
                    clearPaymentSession().catch(() => undefined);
                }}
            >
                <View style={styles.paymentWebViewContainer}>
                    <SafeAreaView edges={['top']} style={styles.paymentWebViewSafeArea}>
                        <View style={styles.paymentWebViewHeader}>
                            <View style={styles.paymentWebViewHeaderText}>
                                <Text style={styles.paymentWebViewLabel}>PAYMENT IN PROGRESS</Text>
                                <Text style={styles.paymentWebViewTitle}>Complete your payment</Text>
                                <Text style={styles.paymentWebViewSubtitle}>
                                    Stay in this screen until payment is confirmed. The course will unlock automatically.
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => {
                                    clearPaymentSession().catch(() => undefined);
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
                                    const successHints = ['success', 'payment-success', 'verified', 'paid', 'thank', 'complete'];
                                    if (successHints.some((hint) => currentUrl.toLowerCase().includes(hint))) {
                                        verifyPaymentAndContinue(String(activePaymentSession.resourceId)).catch(() => undefined);
                                    }
                                }}
                                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                                onError={() => {
                                    Toast.show({ type: 'error', text1: 'Unable to load payment page. Please try again.' });
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

            <CategoriesFAB />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    qBankHeaderBackground: {
        backgroundColor: theme.colors.primary,
        paddingBottom: verticalScale(16),
    },
    qBankHeader: {
        backgroundColor: 'transparent',
    },
    qBankSearchWrap: {
        paddingHorizontal: normalize(20),
        marginBottom: verticalScale(0),
    },
    qBankZeroMargin: {
        marginBottom: 0,
    },
    qBankSearchInput: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D8E6F8',
        borderRadius: normalize(12),
    },
    qBankSearchText: {
        color: theme.colors.text,
        fontSize: normalize(14),
    },
    qBankSurfaceCard: {
        backgroundColor: '#F8FAFC',
        marginHorizontal: normalize(16),
        marginBottom: verticalScale(14),
        borderRadius: normalize(24),
        paddingVertical: verticalScale(14),
        paddingHorizontal: normalize(12),
        borderColor: Colorpath.Primary,
        borderWidth: 0.5
        // shadowColor: '#0F172A',
        // shadowOffset: { width: 0, height: 8 },
        // shadowOpacity: 0.05,
        // shadowRadius: 18,
        // elevation: 3,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#EAF2FB',
        borderRadius: normalize(18),
        padding: normalize(4),
        marginBottom: verticalScale(14),
    },
    segmentButtonWrap: {
        flex: 1,
        marginHorizontal: 0,
    },
    segmentButton: {
        minHeight: verticalScale(42),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: normalize(14),
        borderWidth: 1,
        overflow: 'hidden',
    },
    segmentButtonActive: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 2,
    },
    segmentText: {
        color: '#475467',
        fontFamily: Fonts.intersemibold,
        fontSize: normalize(12),
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    segmentTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(6),
    },
    segmentInfoButton: {
        width: normalize(18),
        height: normalize(18),
        borderRadius: normalize(9),
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentTextActive: {
        color: theme.colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#F1F5F9',
    },
    coursesListContainer: {
        paddingHorizontal: normalize(16),
        paddingBottom: verticalScale(20),
    },
    horizontalCard: {
        width: normalize(280),
        marginRight: normalize(16),
    },
    emptyCoursesCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(24),
        marginTop: verticalScale(20),
        backgroundColor: '#F8FAFC',
        borderRadius: normalize(16),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    emptyCoursesTitle: {
        color: '#334155',
        fontSize: normalize(15),
        fontWeight: '600',
        marginTop: verticalScale(12),
        marginBottom: verticalScale(4),
    },
    emptyCoursesSubtitle: {
        color: '#64748B',
        fontSize: normalize(13),
        textAlign: 'center',
    },
    expandedCategoryContainer: {
        paddingHorizontal: 0,
        paddingBottom: verticalScale(8),
    },
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        backgroundColor: '#F8FAFC',
        borderRadius: normalize(8),
        marginTop: verticalScale(8),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    viewMoreBtnText: {
        color: '#1D4ED8',
        fontSize: normalize(13),
        fontWeight: '600',
        marginRight: normalize(6),
    },
    qBankListContainer: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
    qBankCardPressable: {
        width: '100%',
        marginBottom: verticalScale(6),
    },
    qBankCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(12),
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        overflow: 'hidden',
        minHeight: verticalScale(84),
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    qBankIconContainer: {
        width: normalize(44),
        height: normalize(44),
        borderRadius: normalize(16),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(10),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.32)',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        overflow: 'hidden',
    },
    qBankIconInner: {
        width: '100%',
        height: '100%',
        borderRadius: normalize(15),
        alignItems: 'center',
        justifyContent: 'center',
    },
    qBankCardContent: {
        flex: 1,
        paddingRight: normalize(8),
    },
    qBankCardTitle: {
        color: '#0F172A',
        fontSize: normalize(15),
        fontWeight: '800',
        marginBottom: verticalScale(4),
    },
    qBankCardTitleLight: {
        color: '#FFFFFF',
    },
    qBankCardSubtitle: {
        color: '#64748B',
        fontSize: normalize(11),
        fontWeight: '500',
    },
    qBankCardSubtitleLight: {
        color: 'rgba(255,255,255,0.88)',
    },
    qBankCountPill: {
        minWidth: normalize(46),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(7),
        borderRadius: normalize(14),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
    },
    qBankCountText: {
        fontSize: normalize(11),
        fontWeight: '800',
    },
    qBankCountTextLight: {
        color: '#FFFFFF',
    },
    qBankArrowMark: {
        fontSize: normalize(18),
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1.4,
        marginLeft: normalize(6),
    },
    posterImage: {
        width: '100%',
        aspectRatio: 3 / 4,
        backgroundColor: '#F3F4F6',
    },
    fallbackPoster: {
        width: '100%',
        height: verticalScale(160),
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(16),
    },
    fallbackIconWrap: {
        width: normalize(70),
        height: normalize(70),
        borderRadius: normalize(35),
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(16),
    },
    fallbackTextWrap: {
        flex: 1,
        justifyContent: 'center',
    },
    fallbackTitle: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: verticalScale(8),
    },
    fallbackBadgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    fallbackBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: normalize(8),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(4),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    fallbackBadgeText: {
        fontSize: normalize(10),
        fontWeight: 'bold',
        color: '#374151',
    },
    detailHeader: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(20),
        borderBottomRightRadius: normalize(20),
    },
    detailHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(20),
    },
    backBtn: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(16),
    },
    headerTextColumn: {
        flex: 1,
    },
    headerTagline: {
        fontSize: normalize(10),
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 1,
    },
    headerMainTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: verticalScale(2),
    },
    detailSubtitle: {
        fontSize: normalize(11),
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: verticalScale(4),
    },
    headerRightIcon: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailScrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(20),
    },
    detailSearchWrap: {
        marginBottom: verticalScale(14),
    },
    detailSearchZeroMargin: {
        marginBottom: 0,
    },
    detailSearchInput: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D8E6F8',
        borderRadius: normalize(12),
    },
    detailSearchText: {
        color: theme.colors.text,
        fontSize: normalize(14),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: verticalScale(12),
    },
    patternCard: {
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.10)',
        padding: normalize(16),
        marginBottom: verticalScale(20),
        overflow: 'hidden',
    },
    sectionCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: normalize(12),
        marginBottom: verticalScale(16),
    },
    sectionCardHeaderText: {
        flex: 1,
    },
    sectionCardKicker: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: Colorpath.Primary,
        letterSpacing: 1.2,
        marginBottom: verticalScale(4),
    },
    sectionCardTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: '#0F172A',
    },
    sectionCardPill: {
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(5),
        borderRadius: normalize(999),
        backgroundColor: 'rgba(15, 118, 110, 0.10)',
    },
    sectionCardPillText: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: Colorpath.Primary,
        letterSpacing: 0.8,
    },
    patternGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: verticalScale(12),
    },
    patternItemCard: {
        width: '48%',
        flexBasis: '48%',
        maxWidth: '48%',
        borderRadius: normalize(16),
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.08)',
        padding: normalize(12),
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: verticalScale(72),
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
    },
    patternIconWrap: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(10),
    },
    patternTextWrap: {
        flex: 1,
        minHeight: verticalScale(40),
        justifyContent: 'center',
    },
    patternLabel: {
        fontSize: normalize(11),
        color: '#111827',
        fontWeight: '800',
        lineHeight: normalize(16),
    },
    subjectSubtitle: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginTop: -verticalScale(8),
        marginBottom: verticalScale(12),
    },
    dynamicTabsScrollContent: {
        paddingVertical: verticalScale(6),
        paddingHorizontal: normalize(6),
        gap: normalize(10),
    },
    dynamicTabsCard: {
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.10)',
        paddingVertical: verticalScale(8),
        paddingHorizontal: normalize(8),
        marginBottom: verticalScale(10),
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
        overflow: 'hidden',
    },
    dynamicTabPressable: {
        marginRight: normalize(10),
    },
    dynamicTabItem: {
        minWidth: normalize(112),
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(10),
        borderRadius: normalize(999),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.08)',
    },
    dynamicTabItemActive: {
        borderColor: 'rgba(255,255,255,0.18)',
        transform: [{ scale: 1.02 }],
    },
    dynamicTabItemActiveGlow: {
        borderColor: 'rgba(255,255,255,0.16)',
        shadowColor: '#0F172A',
        shadowOpacity: 0.10,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    dynamicTabText: {
        fontSize: normalize(13),
        fontWeight: '800',
        color: '#475467',
        letterSpacing: 0.4,
    },
    dynamicTabTextActive: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.12)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    dynamicTabIndicator: {
        height: verticalScale(6),
        width: normalize(26),
        borderRadius: normalize(999),
        backgroundColor: 'rgba(255,255,255,0.24)',
        marginTop: verticalScale(8),
    },
    dynamicTabIndicatorActive: {
        backgroundColor: 'rgba(255,255,255,0.92)',
    },
    subjectList: {
        marginBottom: verticalScale(20),
    },
    quizSection: {
        marginBottom: verticalScale(22),
    },
    quizSectionCard: {
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.10)',
        padding: normalize(16),
        marginBottom: verticalScale(16),
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    quizSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
        gap: normalize(10),
    },
    topicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    topicDot: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: '#9AE6B4',
        marginRight: normalize(10),
    },
    topicTitle: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#475467',
    },
    topicTitleLight: {
        color: '#FFFFFF',
    },
    topicCountPill: {
        minWidth: normalize(34),
        height: verticalScale(28),
        borderRadius: normalize(999),
        paddingHorizontal: normalize(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    topicCountText: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    sectionArrowMark: {
        fontSize: normalize(18),
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1.4,
    },
    quizCardsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: normalize(10),
    },
    quizCardPressable: {
        width: '48%',
        minWidth: normalize(140),
    },
    quizCard: {
        width: '100%',
        borderRadius: normalize(16),
        padding: normalize(10),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        minHeight: verticalScale(106),
    },
    courseCardPressable: {
        width: '100%',
    },
    courseSectionBanner: {
        borderRadius: normalize(22),
        padding: normalize(16),
        marginBottom: verticalScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    courseSectionBannerPillOnly: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    courseSectionBannerPill: {
        minWidth: normalize(62),
        borderRadius: normalize(18),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    courseSectionBannerPillValue: {
        fontSize: normalize(18),
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: normalize(20),
    },
    courseSectionBannerPillLabel: {
        fontSize: normalize(9),
        fontWeight: '800',
        color: 'rgba(255,255,255,0.88)',
        letterSpacing: 0.8,
        marginTop: verticalScale(2),
    },
    quizBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        marginBottom: verticalScale(12),
        borderWidth: 0,
        overflow: 'hidden',
    },
    quizBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.8,
    },
    quizCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1D2939',
        marginBottom: verticalScale(2),
    },
    quizCardTitleLight: {
        color: '#FFFFFF',
    },
    quizCardSubtitle: {
        fontSize: normalize(11),
        color: '#667085',
        lineHeight: normalize(16),
        marginBottom: verticalScale(14),
    },
    resourceCardSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        lineHeight: normalize(18),
        marginBottom: verticalScale(14),
    },
    quizMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: verticalScale(16),
    },
    quizMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: normalize(14),
    },
    quizMetaText: {
        fontSize: normalize(12),
        color: '#667085',
        marginLeft: normalize(6),
        fontWeight: '600',
    },
    quizPriceText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    quizActionButton: {
        height: verticalScale(34),
        borderRadius: normalize(10),
        backgroundColor: '#0F766E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
    },
    quizActionButtonDisabled: {
        opacity: 0.7,
    },
    quizActionText: {
        color: '#FFFFFF',
        fontSize: normalize(13),
        fontWeight: '800',
    },
    quizViewOnlyTag: {
        height: verticalScale(34),
        borderRadius: normalize(10),
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.20)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(6),
    },
    quizViewOnlyText: {
        color: '#667085',
        fontSize: normalize(13),
        fontWeight: '700',
    },
    quizViewOnlyTextLight: {
        color: '#FFFFFF',
        fontSize: normalize(13),
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: normalize(24),
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(20),
        padding: normalize(22),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: verticalScale(8),
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(8),
    },
    noteViewerContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    noteViewerSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    noteViewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    noteViewerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteViewerHeaderText: {
        flex: 1,
    },
    noteViewerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    noteViewerTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(2),
    },
    noteViewerSubtitle: {
        fontSize: normalize(12),
        color: '#64748B',
    },
    noteViewerScrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(18),
    },
    noteViewerStateBox: {
        minHeight: verticalScale(220),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: normalize(16),
    },
    noteViewerStateText: {
        marginTop: verticalScale(12),
        fontSize: normalize(13),
        color: '#64748B',
        textAlign: 'center',
    },
    noteViewerLayout: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    noteViewerLeftPanel: {
        width: '35%',
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        padding: normalize(18),
    },
    noteViewerRightPanel: {
        width: '65%',
        padding: normalize(18),
        backgroundColor: '#F8FAFC',
    },
    noteViewerPanelLabel: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#667085',
        letterSpacing: 2,
        marginBottom: verticalScale(14),
    },
    noteViewerListContent: {
        paddingBottom: verticalScale(12),
    },
    noteViewerListItem: {
        minHeight: verticalScale(60),
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    noteViewerListItemActive: {
        backgroundColor: Colorpath.Primary,
        borderColor: Colorpath.Primary,
    },
    noteViewerListIndex: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#98A2B3',
        width: normalize(22),
    },
    noteViewerListIndexActive: {
        color: '#FFFFFF',
    },
    noteViewerListText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#344054',
    },
    noteViewerListTextActive: {
        color: '#FFFFFF',
    },
    noteViewerDetailScroll: {
        paddingBottom: verticalScale(24),
    },
    noteViewerDetailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        padding: normalize(20),
    },
    noteViewerDetailTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: normalize(12),
        marginBottom: verticalScale(12),
    },
    noteViewerDetailTag: {
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        borderRadius: normalize(999),
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    noteViewerDetailTitle: {
        flex: 1,
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#101828',
    },
    noteViewerDetailBody: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    noteViewerDetailHint: {
        marginTop: verticalScale(12),
        fontSize: normalize(12),
        color: '#64748B',
        fontWeight: '600',
    },
    noteViewerViewButton: {
        alignSelf: 'flex-start',
        marginTop: verticalScale(18),
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(12),
        paddingHorizontal: normalize(16),
        height: verticalScale(44),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
    },
    noteViewerViewButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    notePageViewerContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    notePageViewerSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    notePageViewerHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    notePageViewerHeaderText: {
        flex: 1,
    },
    notePageViewerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    notePageViewerTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#0F172A',
    },
    notePageViewerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    notePageViewerScrollContent: {
        padding: normalize(18),
    },
    notePageViewerContent: {
        flex: 1,
        padding: normalize(18),
    },
    notePageViewerCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        overflow: 'hidden',
    },
    notePageViewerWebView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    notePageViewerEmptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(20),
    },
    notePageViewerBody: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    notePageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: normalize(16),
        marginBottom: verticalScale(14),
    },
    notePageTitle: {
        fontSize: normalize(17),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(10),
    },
    notePageBody: {
        fontSize: normalize(13),
        color: '#334155',
        lineHeight: normalize(20),
    },
    modalDescription: {
        fontSize: normalize(13),
        color: '#475569',
        lineHeight: normalize(20),
        marginBottom: verticalScale(18),
    },
    courseLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: normalize(16),
        marginTop: verticalScale(8),
    },
    courseLeftPanel: {
        width: '30%',
        minWidth: normalize(180),
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(14),
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
    },
    coursePanelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    courseRightPanel: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(14),
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
    },
    coursePanelLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: '#667085',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    coursePanelCountPill: {
        minWidth: normalize(32),
        height: verticalScale(28),
        borderRadius: normalize(999),
        paddingHorizontal: normalize(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    coursePanelCountText: {
        fontSize: normalize(11),
        fontWeight: '900',
        color: Colorpath.Primary,
    },
    courseSectionItemPressable: {
        borderRadius: normalize(18),
        overflow: 'hidden',
    },
    courseSectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.10)',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        minHeight: verticalScale(58),
        justifyContent: 'space-between',
        gap: normalize(12),
    },
    courseSectionItemActive: {
        borderColor: 'rgba(255,255,255,0.14)',
    },
    courseSectionText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#475467',
    },
    courseSectionTextActive: {
        color: '#FFFFFF',
    },
    courseSectionItemDot: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: '#C7D2FE',
    },
    courseSectionItemDotActive: {
        backgroundColor: '#FFFFFF',
    },
    courseCard: {
        width: '100%',
        minHeight: verticalScale(164),
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.10)',
        padding: normalize(16),
        justifyContent: 'space-between',
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    courseCardBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        backgroundColor: '#F0FDFA',
        borderWidth: 1,
        borderColor: '#99F6E4',
        marginBottom: verticalScale(10),
    },
    courseCardBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: Colorpath.Primary,
        letterSpacing: 0.6,
    },
    courseCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(6),
    },
    courseCardSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        lineHeight: normalize(18),
        marginBottom: verticalScale(12),
    },
    courseCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: normalize(10),
    },
    courseCardFooterText: {
        flex: 1,
        fontSize: normalize(12),
        fontWeight: '700',
        color: '#475467',
    },
    videoCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        marginBottom: verticalScale(10),
    },
    emptyStateBox: {
        minHeight: verticalScale(220),
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(16),
    },
    emptyStateText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
        textAlign: 'center',
    },
    questionBankContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    questionBankSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    questionBankHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: normalize(14),
    },
    questionBankCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionBankHeaderText: {
        flex: 1,
    },
    questionBankLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    questionBankTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(4),
    },
    questionBankSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    questionBankLoadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(10),
    },
    questionBankLoadingText: {
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
    },
    questionBankEmptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(20),
    },
    questionBankEmptyText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
        textAlign: 'center',
    },
    questionBankLayout: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    questionBankLeftPanel: {
        width: '30%',
        minWidth: normalize(180),
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        padding: normalize(18),
    },
    questionBankRightPanel: {
        flex: 1,
        padding: normalize(18),
        backgroundColor: '#F8FAFC',
    },
    questionBankPanelLabel: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#667085',
        letterSpacing: 2,
        marginBottom: verticalScale(14),
    },
    questionBankListContent: {
        paddingBottom: verticalScale(12),
    },
    questionBankListItem: {
        minHeight: verticalScale(60),
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    questionBankListItemActive: {
        backgroundColor: Colorpath.Primary,
        borderColor: Colorpath.Primary,
    },
    questionBankListItemInactive: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
    },
    questionBankListIndex: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#98A2B3',
        width: normalize(22),
    },
    questionBankListIndexActive: {
        color: '#FFFFFF',
    },
    questionBankListText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#344054',
    },
    questionBankListTextActive: {
        color: '#FFFFFF',
    },
    questionBankDetailScroll: {
        paddingBottom: verticalScale(24),
    },
    questionBankDetailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        padding: normalize(20),
    },
    questionBankDetailTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: normalize(12),
        marginBottom: verticalScale(12),
    },
    questionBankDetailTag: {
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        borderRadius: normalize(999),
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    questionBankDetailTitle: {
        flex: 1,
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#101828',
    },
    questionBankYearText: {
        fontSize: normalize(12),
        color: '#667085',
        fontWeight: '600',
        marginBottom: verticalScale(16),
    },
    questionBankOptionsWrap: {
        marginTop: verticalScale(6),
        marginBottom: verticalScale(18),
        gap: verticalScale(10),
    },
    questionBankOptionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(10),
    },
    questionBankOptionDot: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: Colorpath.Primary,
        marginTop: verticalScale(5),
    },
    questionBankOptionText: {
        flex: 1,
        fontSize: normalize(14),
        color: '#344054',
        lineHeight: normalize(22),
    },
    questionBankToggleBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(18),
    },
    questionBankToggleText: {
        fontSize: normalize(13),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    questionBankAnswerCard: {
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        padding: normalize(18),
    },
    questionBankAnswerLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: Colorpath.Primary,
        letterSpacing: 1,
        marginBottom: verticalScale(12),
    },
    questionBankAnswerText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: normalize(22),
        marginBottom: verticalScale(10),
    },
    questionBankExplanationText: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    questionAnswerContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    questionAnswerSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    questionAnswerHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    questionAnswerHeaderText: {
        flex: 1,
    },
    questionAnswerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    questionAnswerTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(4),
    },
    questionAnswerSubtitle: {
        fontSize: normalize(12),
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    questionAnswerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    questionAnswerScrollContent: {
        padding: normalize(18),
    },
    questionAnswerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        padding: normalize(20),
    },
    questionAnswerBody: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
        marginBottom: verticalScale(14),
    },
    questionAnswerExplanation: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    paymentWebViewContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    paymentWebViewSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    paymentWebViewHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    paymentWebViewHeaderText: {
        flex: 1,
        paddingRight: normalize(12),
    },
    paymentWebViewLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#BFDBFE',
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    paymentWebViewTitle: {
        fontSize: normalize(22),
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: verticalScale(4),
    },
    paymentWebViewSubtitle: {
        fontSize: normalize(12),
        color: '#64748B',
        lineHeight: normalize(18),
    },
    paymentWebViewCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    paymentWebViewBody: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    paymentWebViewLoading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(20),
        backgroundColor: '#FFFFFF',
    },
    paymentWebViewLoadingText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: '#64748B',
        fontWeight: '600',
        textAlign: 'center',
    },
    videoBankContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    videoBankSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    videoBankHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: normalize(14),
    },
    videoBankHeaderText: {
        flex: 1,
    },
    videoBankLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#BFDBFE',
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    videoBankTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(4),
    },
    videoBankSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    videoBankCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBankLoadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(10),
    },
    videoBankLoadingText: {
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
    },
    videoBankEmptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(20),
    },
    videoBankEmptyText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
        textAlign: 'center',
    },
    videoBankListContent: {
        padding: normalize(18),
    },
    videoBankCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(16),
        minHeight: verticalScale(120),
        justifyContent: 'space-between',
    },
    videoBankCardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(12),
    },
    videoBankPlayIconWrap: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBankCardTextWrap: {
        flex: 1,
    },
    videoBankCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(4),
    },
    videoBankCardSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        lineHeight: normalize(18),
    },
    videoBankCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        marginTop: verticalScale(12),
    },
    videoBankCardFooterText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#FF0000',
    },
    modalSecondaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        marginBottom: verticalScale(12),
    },
    modalSecondaryButtonText: {
        color: '#0F172A',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    modalPrimaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: '#0D9F6E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    modalPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    modalPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: verticalScale(10),
        backgroundColor: '#F1F5F9',
        paddingVertical: verticalScale(6),
        paddingHorizontal: normalize(12),
        borderRadius: normalize(8),
    },
    modalPriceText: {
        fontSize: normalize(14),
        color: '#4B5563',
        fontWeight: '600',
    },
});

export const CourseScreen = CoursesScreen;
