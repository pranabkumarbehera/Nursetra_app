import {
    FREE_MOCK_BUNDLE_NAME,
    getNursingSubjectName,
    getNursingSubjectOrder,
} from '../../../Utils/Constants/Subjects';

const memoizeResponse = <T>(normalize: (value: any) => T) => {
    const cache = new WeakMap<object, T>();
    return (value: any): T => {
        if (!value || typeof value !== 'object') return normalize(value);
        if (cache.has(value)) return cache.get(value)!;
        const result = normalize(value);
        cache.set(value, result);
        return result;
    };
};

export const DEFAULT_EXAM_META = {
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

export const EXAM_ICON_THEMES = [
    { bgColor: '#EEF2FF', iconColor: '#4F46E5' },
    { bgColor: '#E0F2FE', iconColor: '#0284C7' },
    { bgColor: '#FEF3C7', iconColor: '#D97706' },
    { bgColor: '#D1FAE5', iconColor: '#059669' },
    { bgColor: '#F3E8FF', iconColor: '#7C3AED' },
    { bgColor: '#FEE2E2', iconColor: '#DC2626' },
    { bgColor: '#FFEDD5', iconColor: '#EA580C' },
];

export const SUBJECT_CARD_THEMES = [
    { colors: ['#0F766E', '#14B8A6', '#2DD4BF'], tint: 'rgba(15, 118, 110, 0.14)' },
    { colors: ['#1D4ED8', '#38BDF8', '#60A5FA'], tint: 'rgba(29, 78, 216, 0.14)' },
    { colors: ['#D97706', '#F59E0B', '#FBBF24'], tint: 'rgba(217, 119, 6, 0.14)' },
    { colors: ['#7C3AED', '#A855F7', '#EC4899'], tint: 'rgba(124, 58, 237, 0.14)' },
    { colors: ['#DC2626', '#FB7185', '#F97316'], tint: 'rgba(220, 38, 38, 0.14)' },
];

export const EXAM_CHIPS = ['NORCET', 'NORCET 12', 'GNM', 'B.Sc Nursing', 'CHO', 'ESIC', 'RRB', 'RRB Nursing Superintendent'];

export const SEGMENT_THEMES = [
    { colors: ['#0F766E', '#14B8A6'], border: 'rgba(15, 118, 110, 0.18)' },
    { colors: ['#1D4ED8', '#38BDF8'], border: 'rgba(29, 78, 216, 0.18)' },
];

export const MIN_SUBJECTS_FOR_CATEGORY_EXAM = 2;
export const CONTENT_ACCESS_DURATION_LABEL = '1 Month';

export const hasValidDuration = (item: any) => {
    if (!item || typeof item !== 'object') {
        return false;
    }

    const payload = typeof getBundlePayload === 'function' ? getBundlePayload(item) : item;
    const orig = item?.originalData || payload?.originalData || {};
    const rawValue = item?.durationValue ?? payload?.durationValue ?? orig?.durationValue ?? item?.accessDurationValue ?? payload?.accessDurationValue;
    const rawUnit = item?.durationUnit ?? payload?.durationUnit ?? orig?.durationUnit ?? item?.accessDurationUnit ?? payload?.accessDurationUnit;

    if (rawValue === null || rawValue === undefined) {
        return false;
    }

    const numValue = Number(rawValue);
    if (!Number.isFinite(numValue) || numValue <= 0) {
        return false;
    }

    if (rawUnit === null || rawUnit === undefined || String(rawUnit).trim() === '') {
        return false;
    }

    return true;
};

export const getValidityRange = (item: any, userAccess?: any) => {
    if (!hasValidDuration(item)) {
        return null;
    }

    const payload = typeof getBundlePayload === 'function' ? getBundlePayload(item) : item;
    const orig = item?.originalData || payload?.originalData || {};
    const rawValue = item?.durationValue ?? payload?.durationValue ?? orig?.durationValue ?? item?.accessDurationValue ?? payload?.accessDurationValue;
    const rawUnit = item?.durationUnit ?? payload?.durationUnit ?? orig?.durationUnit ?? item?.accessDurationUnit ?? payload?.accessDurationUnit;

    const rawStartDate =
        userAccess?.accessStartDate ||
        userAccess?.purchasedAt ||
        userAccess?.enrolledAt ||
        userAccess?.activatedAt ||
        userAccess?.subscriptionStartDate ||
        userAccess?.validFrom ||
        userAccess?.purchaseDate ||
        userAccess?.orderDate ||
        item?.accessStartDate ||
        item?.purchasedAt ||
        item?.enrolledAt ||
        item?.activatedAt ||
        item?.subscriptionStartDate ||
        item?.validFrom ||
        item?.purchaseDate ||
        item?.orderDate ||
        orig?.accessStartDate ||
        orig?.purchasedAt ||
        orig?.enrolledAt ||
        orig?.activatedAt ||
        orig?.subscriptionStartDate ||
        orig?.validFrom ||
        orig?.purchaseDate ||
        orig?.orderDate ||
        payload?.accessStartDate ||
        payload?.purchasedAt ||
        payload?.enrolledAt ||
        payload?.activatedAt ||
        payload?.subscriptionStartDate ||
        payload?.validFrom ||
        payload?.purchaseDate ||
        payload?.orderDate ||
        item?.startDate ||
        orig?.startDate ||
        payload?.startDate ||
        item?.createdAt ||
        orig?.createdAt ||
        payload?.createdAt ||
        new Date();

    const startObj = new Date(rawStartDate);
    if (isNaN(startObj.getTime())) {
        return null;
    }

    const numVal = Number(rawValue);
    const unitStr = String(rawUnit).trim().toUpperCase();

    // Calendar-safe date calculations
    const endObj = new Date(startObj.getTime());
    const startDay = startObj.getUTCDate();

    if (unitStr === 'DAY' || unitStr === 'DAYS') {
        endObj.setUTCDate(endObj.getUTCDate() + numVal);
    } else if (unitStr === 'WEEK' || unitStr === 'WEEKS') {
        endObj.setUTCDate(endObj.getUTCDate() + numVal * 7);
    } else if (unitStr === 'MONTH' || unitStr === 'MONTHS') {
        endObj.setUTCMonth(endObj.getUTCMonth() + numVal);
        if (endObj.getUTCDate() !== startDay) {
            endObj.setUTCDate(0);
        }
    } else if (unitStr === 'YEAR' || unitStr === 'YEARS') {
        endObj.setUTCFullYear(endObj.getUTCFullYear() + numVal);
        if (endObj.getUTCDate() !== startDay) {
            endObj.setUTCDate(0);
        }
    } else {
        return null;
    }

    const formatCalendarDate = (d: Date) => {
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = d.getUTCFullYear();
        return `${dd}-${mm}-${yyyy}`;
    };

    const formattedStart = formatCalendarDate(startObj);
    const formattedEnd = formatCalendarDate(endObj);

    return {
        startDate: formattedStart,
        endDate: formattedEnd,
        formatted: `${formattedStart} - ${formattedEnd}`,
    };
};

export const getCategoryIconName = (title: string, tab: 'subject' | 'exam') => {
    const value = String(title || '').toLowerCase();

    if (tab === 'exam') {
        if (value.includes('norcet')) return 'medkit-outline';
        if (value.includes('cho')) return 'heart-outline';
        if (value.includes('gnm') || value.includes('anm')) return 'document-text-outline';
        if (value.includes('rrb')) return 'ribbon-outline';
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

export const sortNursingTitles = (titles: string[]) =>
    [...titles].sort((left, right) => {
        const leftOrder = getNursingSubjectOrder(left);
        const rightOrder = getNursingSubjectOrder(right);

        if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
        }

        return left.localeCompare(right);
    });

export const normalizeTitle = (value: string = '') =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

export const ensureArray = (value: any) => (Array.isArray(value) ? value : []);

export const getBundlePayload = (bundle: any) =>
    bundle?.bundle ||
    bundle?.data?.bundle ||
    bundle?.data ||
    bundle?.details ||
    bundle?.item ||
    bundle?.result ||
    bundle;

export const getThemeByIndex = (index: number, themes: any[]) => themes[index % themes.length];

export const getThemeIndexFromText = (value: string = '') =>
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

export const getBundleId = (bundle: any) =>
    bundle?.id || bundle?._id || bundle?.testId || bundle?.bundleId || null;

export const getQuizId = (quiz: any) => quiz?.id || quiz?._id || quiz?.testId || quiz?.quizId;

export const getItemId = (item: any) =>
    item?.id ||
    item?._id ||
    item?.noteId ||
    item?.questionBankId ||
    item?.videoBankId ||
    item?.bankId ||
    null;

export const getBundleItems = (bundleList: any) =>
    ensureArray(
        Array.isArray(bundleList)
            ? bundleList
            : bundleList?.data?.bundles ||
                  bundleList?.data?.items ||
                  bundleList?.data?.quizzes ||
                  bundleList?.bundles ||
                  bundleList?.quizzes ||
                  bundleList?.items ||
                  bundleList?.data ||
                  [],
    ).map(getBundlePayload);

export const getSubBundleItems = (subBundleList: any) =>
    ensureArray(
        Array.isArray(subBundleList)
            ? subBundleList
            : subBundleList?.data?.subBundles ||
                  subBundleList?.data?.items ||
                  subBundleList?.subBundles ||
                  subBundleList?.items ||
                  subBundleList?.data ||
                  [],
    ).map(getBundlePayload);

export const uniqueBundlesById = (bundles: any[]) => {
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

export const parseMaybeJson = (value: any) => {
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

export const getBundleQuizzes = memoizeResponse((bundle: any) => {
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
});

export const isEliteMockBundle = (bundle: any) => {
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

export const isFreeMockBundle = (bundle: any) => {
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

export const getDetailCollections = memoizeResponse((bundle: any) => {
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
    const videoBanks = getCollection(
        'video_banks',
        'videoBanks',
        'videos',
        'youtube_banks',
        'youtubeBanks',
        'youtube',
    );
    const youtubeBanks = getCollection('youtube_banks', 'youtubeBanks', 'youtube');
    const documentFolders = getCollection('document_folders', 'documentFolders', 'documents');
    const quizCount = Number(
        firstDisplayValue(payload?.quizCount, parsedData?.quizCount, quizzes.length) || 0,
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
});

export const getItemTitle = (item: any, fallback: string) =>
    item?.title ||
    item?.name ||
    item?.label ||
    item?.heading ||
    item?.questionTitle ||
    item?.videoTitle ||
    item?.noteTitle ||
    fallback;

export const getItemDescription = (item: any) =>
    item?.description ||
    item?.subtitle ||
    item?.summary ||
    item?.text ||
    item?.question ||
    item?.questionText ||
    '';

export const toDisplayText = (value: any, fallback = ''): string => {
    if (typeof value === 'string') {
        return htmlToPlainText(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value
            .map((entry) => toDisplayText(entry, ''))
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

export const getQuestionBankYear = (item: any) =>
    item?.year || item?.examYear || item?.sessionYear || item?.academicYear || null;

export const getQuestionBankQuestions = (response: any) => {
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

    const payloadCandidates = [response?.data?.data, response?.data, response];

    for (const candidate of payloadCandidates) {
        const questions = walk(candidate);
        if (questions.length > 0) {
            return questions;
        }
    }

    return [];
};

export const getQuestionPrompt = (item: any) =>
    item?.question || item?.questionText || item?.text || item?.title || item?.prompt || '';

export const getQuestionAnswer = (item: any) =>
    item?.answer || item?.correctAnswer || item?.correct_answer || item?.solution || item?.response || '';

export const getQuestionExplanation = (item: any) =>
    item?.explanation ||
    item?.answerExplanation ||
    item?.answer_explanation ||
    item?.solutionExplanation ||
    item?.solution ||
    '';

export const getQuestionOptions = (item: any) =>
    ensureArray(
        item?.options ||
            item?.choices ||
            item?.answers ||
            item?.variants ||
            item?.mcqOptions ||
            item?.optionList ||
            [],
    );

export const getVideoBankUrl = (item: any) =>
    item?.videoUrl || item?.youtubeUrl || item?.url || item?.link || item?.contentUrl || item?.path || null;

export const getYouTubeVideoId = (url: string) => {
    if (!url) {
        return '';
    }

    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]+)/i);
    return match?.[1] || '';
};

export const getVideoBankItems = (response: any) => {
    const payloadCandidates = [response?.data?.data, response?.data, response];

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

export const normalizeCourseSections = (bundle: any) => {
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
    ].filter((section) => Array.isArray(section.items) && section.items.length > 0);
};

export const getNoteBankId = (item: any) =>
    item?.noteId ||
    item?.note_id ||
    item?.note?.noteId ||
    item?.parentNoteId ||
    item?.id ||
    item?._id ||
    null;

export const htmlToPlainText = (html: string = '') => {
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

export const htmlToNoteText = (html: string = '') => {
    if (!html) {
        return '';
    }

    return html
        .replace(/<\s*style[^>]*>[\s\S]*?<\/\s*style\s*>/gi, '')
        .replace(/<\s*script[^>]*>[\s\S]*?<\/\s*script\s*>/gi, '')
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(
            /<\s*\/\s*(p|div|section|article|header|footer|blockquote|table|tbody|thead|tfoot|tr)\s*>/gi,
            '\n\n',
        )
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

export const buildNoteHtmlDocument = (html: string = '') => {
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
                        -webkit-user-select: none;
                        user-select: none;
                        -webkit-touch-callout: none;
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

export const getBundleMockCount = (bundle: any) => {
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

export const getQuizTopicName = (quiz: any) =>
    quiz?.masterTopicId?.name ||
    quiz?.masterTopic?.name ||
    quiz?.topic?.name ||
    quiz?.topicName ||
    quiz?.category ||
    'General';

export const getQuizQuestionCount = (quiz: any) =>
    Number(
        quiz?.questionCount || quiz?.questionsCount || quiz?.totalQuestions || quiz?.questions?.length || 0,
    );

export const getQuizDuration = (quiz: any) =>
    Number(quiz?.durationMinutes || quiz?.duration || quiz?.timeLimit || 0);

export const getQuizPrice = (quiz: any) => Number(quiz?.price || 0);

export const getQuizMarking = (quiz: any) => {
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

export const getQuizTotalMarks = (quiz: any) =>
    Number(quiz?.totalMarks || quiz?.maxMarks || quiz?.fullMarks || quiz?.marks || 0);

export const getQuizMarksPerQuestion = (quiz: any) => {
    const directValue =
        quiz?.marksPerQuestion ?? quiz?.defaultMarks ?? quiz?.positiveMarks ?? quiz?.correctMarks;

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

export const getQuizNegativeMarking = (quiz: any) => {
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

export const hasDisplayValue = (value: any) =>
    value !== undefined && value !== null && (!(typeof value === 'string') || value.trim() !== '');

export const firstDisplayValue = (...values: any[]) => values.find((value) => hasDisplayValue(value));

export const getPatternValue = (sources: any[], keys: string[]) => {
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

export const getExamMetaByTitle = (title: string = '') => {
    const normalizedBundleTitle = normalizeTitle(title);
    const theme = getThemeByIndex(getThemeIndexFromText(normalizedBundleTitle), EXAM_ICON_THEMES);

    if (normalizedBundleTitle.includes('pgt') || normalizedBundleTitle.includes('graduate')) {
        return { ...DEFAULT_EXAM_META, icon: 'graduation-cap', iconType: 'FontAwesome5', ...theme };
    }
    if (
        normalizedBundleTitle.includes('teacher') ||
        normalizedBundleTitle.includes('tgt') ||
        normalizedBundleTitle.includes('school')
    ) {
        return { ...DEFAULT_EXAM_META, icon: 'book', iconType: 'Feather', ...theme };
    }
    if (
        normalizedBundleTitle.includes('net') ||
        normalizedBundleTitle.includes('jrf') ||
        normalizedBundleTitle.includes('award')
    ) {
        return { ...DEFAULT_EXAM_META, icon: 'award', iconType: 'Feather', ...theme };
    }
    if (
        normalizedBundleTitle.includes('science') ||
        normalizedBundleTitle.includes('pcm') ||
        normalizedBundleTitle.includes('cbz')
    ) {
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

export const parseBundleDescription = (description: string = '') => {
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

export const buildPatternFromBundle = (bundle: any, examPattern: any) => {
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
    const durationMinutes = quizzes.reduce(
        (max: number, quiz: any) => Math.max(max, getQuizDuration(quiz)),
        0,
    );
    const firstQuiz = quizzes.find((quiz: any) => quiz && typeof quiz === 'object');
    const bundleQuestions = firstDisplayValue(
        bundle?.questionCount,
        bundle?.questionsCount,
        bundle?.totalQuestions,
        bundle?.noOfQuestions,
        getPatternValue(patternSources, [
            'questions',
            'questionCount',
            'questionsCount',
            'totalQuestions',
            'noOfQuestions',
        ]),
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
        getPatternValue(patternSources, [
            'marksPerQuestion',
            'defaultMarks',
            'positiveMarks',
            'correctMarks',
        ]),
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
        marksPerQuestion: hasDisplayValue(resolvedMarksPerQuestion)
            ? `${resolvedMarksPerQuestion}`
            : examPattern.marksPerQuestion,
        negativeMarking: hasDisplayValue(resolvedNegativeMarking)
            ? `${resolvedNegativeMarking}`
            : examPattern.negativeMarking,
        duration: hasDisplayValue(resolvedDuration) ? `${resolvedDuration}` : examPattern.duration,
        note: hasDisplayValue(resolvedNote) ? `${resolvedNote}` : examPattern.note,
    };
};

export const buildQuizCards = (bundle: any) =>
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

export const buildQuizGroups = (bundle: any) => {
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

export const buildSelectedExam = (bundle: any, forceEnrolled = false) => {
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

export const collectEnrolledBundleIds = (studentModules: any) => {
    let allCandidates: any[] = [];
    if (studentModules?.bundles) allCandidates = [...allCandidates, ...ensureArray(studentModules.bundles)];
    if (studentModules?.data?.bundles)
        allCandidates = [...allCandidates, ...ensureArray(studentModules.data.bundles)];
    if (studentModules?.modules) allCandidates = [...allCandidates, ...ensureArray(studentModules.modules)];
    if (studentModules?.data?.modules)
        allCandidates = [...allCandidates, ...ensureArray(studentModules.data.modules)];
    if (studentModules?.items) allCandidates = [...allCandidates, ...ensureArray(studentModules.items)];
    if (studentModules?.data?.items)
        allCandidates = [...allCandidates, ...ensureArray(studentModules.data.items)];
    if (studentModules?.data && Array.isArray(studentModules.data))
        allCandidates = [...allCandidates, ...studentModules.data];
    if (Array.isArray(studentModules)) allCandidates = [...allCandidates, ...studentModules];

    return allCandidates.reduce((acc: string[], item: any) => {
        if (typeof item !== 'object' || item === null) return acc;

        const bundleId = item?.bundleId || item?.bundle?.id || item?.bundle?._id || item?.id || item?._id;
        const isEnrolled = item?.isEnrolled !== undefined ? Boolean(item?.isEnrolled) : true;

        if (bundleId && isEnrolled) {
            acc.push(String(bundleId));
        }

        return acc;
    }, []);
};

export const resolveBundlePricing = (bundle: any) => {
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

export const normalizePaymentSession = (session: any) => {
    if (!session || typeof session !== 'object') {
        return null;
    }

    const paymentUrl =
        session.paymentUrl ||
        session.checkout_url ||
        session.checkoutUrl ||
        session.payment_url ||
        session.paymentUrl ||
        session.paymentLink ||
        session.short_url ||
        session.shortUrl ||
        session.url ||
        session.redirect_url;
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

/** Group subject metadata once, rather than scanning the response for every rendered row. */
export const buildCategoryGroups = (
    bundles: any[],
    titles: string[],
    tab: 'subject' | 'exam',
    apiCategories: string[],
) => {
    const groups = new Map<string, any[]>();
    const examTitles = titles.map((title) => ({ title, search: title.toLowerCase() }));
    const add = (title: string, bundle: any) => {
        const group = groups.get(title);
        if (group) group.push(bundle);
        else groups.set(title, [bundle]);
    };
    for (const bundle of bundles) {
        const title = String(bundle?.title || bundle?.name || '').trim();
        const lowerTitle = title.toLowerCase();
        const category = String(bundle?.category || bundle?.subject || bundle?.module || '').toLowerCase();
        const elite = isEliteMockBundle(bundle);
        const freeMock = isFreeMockBundle(bundle);
        if (tab === 'exam') {
            for (const candidate of examTitles) {
                const matches =
                    candidate.search === 'elite mock bundle'
                        ? elite
                        : candidate.search === 'free mock bundle' || candidate.search === 'free mock'
                        ? freeMock
                        : lowerTitle.includes(candidate.search) ||
                          category.includes(candidate.search) ||
                          candidate.search.includes(lowerTitle) ||
                          (elite && candidate.search.includes('mock'));
                if (matches) add(candidate.title, bundle);
            }
        } else {
            const subjectName = getNursingSubjectName(
                String(bundle?.subject || bundle?.module || bundle?.category || title || 'Other').trim(),
            );
            for (const candidate of examTitles) {
                const candLower = candidate.search;
                const matches =
                    candLower === 'free mock bundle' || candLower === 'free mock'
                        ? freeMock
                        : candLower === subjectName.toLowerCase() ||
                          lowerTitle.includes(candLower) ||
                          category.includes(candLower) ||
                          candLower.includes(lowerTitle);
                if (matches) add(candidate.title, bundle);
            }
        }
    }
    return titles.map((title, index) => ({
        title,
        index,
        bundles: uniqueBundlesById(groups.get(title) || []),
    }));
};
