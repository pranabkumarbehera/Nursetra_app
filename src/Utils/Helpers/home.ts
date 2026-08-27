const AVATAR_COLORS = ['#2563EB', '#0F766E', '#9333EA', '#C2410C', '#BE185D', '#047857'];

const asNumber = (value: any) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const firstDefined = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '');

const firstNonEmpty = (...values: any[]) =>
    values.find(value => value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === ''));

const RANK_KEYS = new Set([
    'rank',
    'rankvalue',
    'rank_value',
    'rankposition',
    'rank_position',
    'allindiarank',
    'all_india_rank',
    'overallrank',
    'overall_rank',
    'air',
    'airrank',
    'air_rank',
]);

const normalizeRankValue = (value: any): string | null => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed || null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? String(value) : null;
    }

    if (typeof value === 'object') {
        return firstNonEmpty(
            normalizeRankValue(value?.rank),
            normalizeRankValue(value?.value),
            normalizeRankValue(value?.label),
            normalizeRankValue(value?.text),
            normalizeRankValue(value?.position),
            normalizeRankValue(value?.overallRank),
            normalizeRankValue(value?.overall_rank),
            normalizeRankValue(value?.allIndiaRank),
            normalizeRankValue(value?.air),
        );
    }

    return String(value);
};

const findRankDeep = (source: any, depth = 0, seen = new Set<any>()): string | null => {
    if (!source || typeof source !== 'object' || depth > 5 || seen.has(source)) {
        return null;
    }

    seen.add(source);

    if (Array.isArray(source)) {
        for (const item of source) {
            const found: string | null = findRankDeep(item, depth + 1, seen);
            if (found) return found;
        }
        return null;
    }

    for (const [key, value] of Object.entries(source)) {
        const normalizedKey = String(key).replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (RANK_KEYS.has(normalizedKey)) {
            const normalizedValue = normalizeRankValue(value);
            if (normalizedValue) {
                return normalizedValue;
            }
        }

        const found: string | null = findRankDeep(value, depth + 1, seen);
        if (found) return found;
    }

    return null;
};

const getRecentItemKey = (item: any, index: number) => {
    const id = firstNonEmpty(
        item?.attemptId,
        item?.id,
        item?._id,
        item?.resultId,
        item?.quizId,
    );

    if (id) {
        return String(id);
    }

    return [
        item?.title,
        item?.submittedAt,
        item?.date,
        item?.createdAt,
        item?.updatedAt,
        item?.completedAt,
        index,
    ]
        .map(value => (value === undefined || value === null ? '' : String(value)))
        .join('|');
};

const dedupeRecentItems = (items: any[]) => {
    const seen = new Set<string>();
    return items.filter((item, index) => {
        const key = getRecentItemKey(item, index);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

export const resolveDashboardRank = (dashboard: any) =>
    firstNonEmpty(
        findRankDeep(dashboard),
        findRankDeep(dashboard?.data),
        findRankDeep(dashboard?.data?.data),
        findRankDeep(dashboard?.student),
        findRankDeep(dashboard?.student?.data),
        findRankDeep(dashboard?.summary),
        findRankDeep(dashboard?.stats),
        findRankDeep(dashboard?.overview),
        findRankDeep(dashboard?.dashboard),
        findRankDeep(dashboard?.overallRank),
        findRankDeep(dashboard?.overall_rank),
    ) || null;

const toWords = (value: string) =>
    value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

export const getInitials = (name?: string | null) => {
    const source = (name || '').trim();
    if (!source) {
        return 'NA';
    }

    const words = toWords(source);
    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
};

export const getAvatarBackgroundColor = (seed?: string | null) => {
    const value = seed || 'avatar';
    const hash = Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const normalizeProfileData = (profile: any) => {
    const source = profile?.data ?? profile ?? {};

    return {
        ...source,
        firstName: firstDefined(
            source?.firstName,
            source?.firstname,
            source?.first_name,
            source?.fristname,
            source?.fristName,
            source?.profile?.firstName,
            source?.profile?.firstname,
            source?.profile?.first_name,
            source?.profile?.fristname,
            source?.profile?.fristName,
        ) || '',
        lastName: firstDefined(
            source?.lastName,
            source?.lastname,
            source?.last_name,
            source?.surName,
            source?.profile?.lastName,
            source?.profile?.lastname,
            source?.profile?.last_name,
            source?.profile?.surName,
        ) || '',
        phone: firstDefined(
            source?.phone,
            source?.mobile,
            source?.mobileNumber,
            source?.contactNumber,
            source?.profile?.phone,
            source?.profile?.mobile,
            source?.profile?.mobileNumber,
            source?.profile?.contactNumber,
        ) || '',
        bio: firstDefined(
            source?.bio,
            source?.about,
            source?.description,
            source?.profile?.bio,
            source?.profile?.about,
            source?.profile?.description,
        ) || '',
        avatarUrl: firstDefined(
            source?.avatarUrl,
            source?.profileImage,
            source?.profilePicture,
            source?.avatar,
            source?.image,
            source?.photo,
            source?.profile?.avatarUrl,
            source?.profile?.profileImage,
            source?.profile?.profilePicture,
            source?.profile?.avatar,
            source?.profile?.image,
            source?.profile?.photo,
        ) || '',
        email: firstDefined(
            source?.email,
            source?.emailId,
            source?.user?.email,
            source?.profile?.email,
        ) || '',
    };
};

export const formatPercent = (value: any) => {
    const num = asNumber(value);
    if (num === null) {
        return '--';
    }

    return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}%`;
};

export const formatScore = (value: any) => {
    const num = asNumber(value);
    return num === null ? '--' : `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}`;
};

export const formatDisplayDate = (value: any) => {
    if (!value) {
        return '--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export const formatTimeSpent = (value: any) => {
    if (typeof value === 'string' && /[a-z]/i.test(value)) {
        return value;
    }

    const totalSeconds = asNumber(value);
    if (totalSeconds === null) {
        return '--';
    }

    const seconds = totalSeconds > 1000 ? Math.round(totalSeconds) : Math.round(totalSeconds * 60);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
};

export const getProfileImageUri = (profile: any) =>
    firstDefined(
        profile?.profileImage,
        profile?.profilePicture,
        profile?.avatar,
        profile?.image,
        profile?.photo,
        profile?.profile?.profileImage,
        profile?.profile?.profilePicture,
        profile?.profile?.avatar,
        profile?.profile?.image,
        profile?.profile?.photo,
        profile?.user?.profileImage,
        profile?.user?.avatar,
    ) || null;

export const getProfileName = (profile: any) =>
    firstDefined(
        profile?.name,
        profile?.fullName,
        profile?.userName,
        profile?.username,
        profile?.studentName,
        [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim(),
        [profile?.firstname, profile?.lastname].filter(Boolean).join(' ').trim(),
        [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
        [profile?.fristname, profile?.lastname].filter(Boolean).join(' ').trim(),
        [profile?.firstName, profile?.surname].filter(Boolean).join(' ').trim(),
        [profile?.profile?.firstName, profile?.profile?.lastName].filter(Boolean).join(' ').trim(),
        [profile?.profile?.firstname, profile?.profile?.lastname].filter(Boolean).join(' ').trim(),
        [profile?.profile?.first_name, profile?.profile?.last_name].filter(Boolean).join(' ').trim(),
        [profile?.profile?.fristname, profile?.profile?.lastname].filter(Boolean).join(' ').trim(),
        profile?.profile?.name,
        profile?.profile?.fullName,
        profile?.user?.name,
    ) || 'Student';

export const normalizeDashboardStats = (dashboard: any) => {
    const dashboardSources = [
        dashboard,
        dashboard?.data,
        dashboard?.data?.dashboard,
        dashboard?.data?.summary,
        dashboard?.data?.stats,
        dashboard?.data?.overview,
        dashboard?.student,
        dashboard?.student?.data,
        dashboard?.user,
        dashboard?.profile,
        dashboard?.summary,
        dashboard?.stats,
        dashboard?.overview,
        dashboard?.dashboard,
    ].filter(Boolean);

    const summary = dashboard?.summary || dashboard?.stats || dashboard?.overview || dashboard?.dashboard || dashboard || {};
    const recentAttempts = Array.isArray(summary?.recentAttempts) ? summary.recentAttempts : [];
    const calculatedAverageAccuracy = recentAttempts.length > 0
        ? recentAttempts.reduce((total: number, item: any) => {
            const score = asNumber(item?.score) || 0;
            const maxScore = asNumber(item?.maxScore) || 0;
            const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
            return total + accuracy;
        }, 0) / recentAttempts.length
        : null;

    return {
        score: firstDefined(summary?.score, summary?.totalScore, summary?.avgScore, summary?.averageScore, summary?.points),
        accuracy: firstDefined(summary?.accuracy, summary?.accuracyPercentage, summary?.avgAccuracy, summary?.averageAccuracy, calculatedAverageAccuracy),
        timeSpent: firstDefined(summary?.timeSpent, summary?.timeSpend, summary?.timeTaken, summary?.studyTime, summary?.totalTimeSpent),
        rank: resolveDashboardRank(dashboard),
    };
};

const getRecentCollections = (dashboard: any) => {
    if (Array.isArray(dashboard?._mergedRecentItems)) {
        return dashboard._mergedRecentItems;
    }

    const candidates = [
        dashboard?.recentMocks,
        dashboard?.recentCourses,
        dashboard?.recentAttempts,
        dashboard?.recentTests,
        dashboard?.latestAttempts,
        dashboard?.items,
        dashboard?.history,
        dashboard?.activity,
        dashboard?.activities,
        dashboard?.results,
        dashboard?.data?.recentMocks,
        dashboard?.data?.recentCourses,
        dashboard?.data?.recentAttempts,
        dashboard?.data?.recentTests,
        dashboard?.data?.latestAttempts,
        dashboard?.data?.items,
        dashboard?.data?.history,
        dashboard?.data?.activity,
        dashboard?.data?.activities,
        dashboard?.data?.results,
        dashboard?.data?.dashboard?.recentMocks,
        dashboard?.data?.dashboard?.recentCourses,
        dashboard?.data?.dashboard?.recentAttempts,
        dashboard?.data?.dashboard?.recentTests,
        dashboard?.data?.dashboard?.latestAttempts,
        dashboard?.data?.dashboard?.items,
        dashboard?.data?.dashboard?.history,
        dashboard?.data?.dashboard?.activity,
        dashboard?.data?.dashboard?.activities,
        dashboard?.data?.dashboard?.results,
    ];

    return candidates.find(Array.isArray) || [];
};

export const normalizeRecentItem = (item: any, index: number) => {
    const score = firstDefined(item?.score, item?.obtainedMarks, item?.marks, item?.result?.score, 0);
    const maxScore = firstDefined(item?.maxScore, item?.totalMarks, item?.fullMarks, item?.result?.maxScore, 0);
    const calculatedAccuracy = Number(maxScore) > 0 ? ((Number(score) / Number(maxScore)) * 100).toFixed(0) : '0';

    return {
        id: firstDefined(item?._id, item?.id, item?.attemptId, item?.attempt?._id, item?.quizId, `recent-${index}`),
        attemptId: firstDefined(item?.attemptId, item?.attempt?._id, item?.attempt?.id, item?._id, item?.id),
        title: firstDefined(item?.title, item?.name, item?.quizTitle, item?.courseTitle, item?.mockTitle, item?.attempt?.title, item?.quiz?.title, `Mock #${index + 1}`),
        score,
        maxScore,
        accuracy: firstDefined(item?.accuracy, item?.accuracyPercentage, item?.result?.accuracy, calculatedAccuracy),
        percentile: (() => {
            const apiPercentile = firstDefined(item?.percentile, item?.result?.percentile, item?.stats?.percentile);
            if (apiPercentile !== undefined && apiPercentile !== null) return apiPercentile;
            
            const rank = item?.rank || item?.result?.rank;
            const total = item?.totalStudents || item?.totalParticipants || item?.result?.totalStudents;
            if (rank && total && total > 0) return ((total - rank) / total) * 100;

            const acc = Number(calculatedAccuracy);
            if (acc > 0) return Math.min(99.9, acc + (100 - acc) * 0.4);
            return 0;
        })(),
        date: firstDefined(item?.submittedAt, item?.date, item?.createdAt, item?.attemptedAt, item?.updatedAt, item?.completedAt),
        submittedAt: firstDefined(item?.submittedAt, item?.date, item?.createdAt, item?.attemptedAt, item?.updatedAt, item?.completedAt),
        type: firstDefined(item?.type, item?.contentType, item?.category, 'Mock Test'),
        exam: firstDefined(item?.exam, item?.course, item?.examCategory, item?.category, item?.quiz?.exam, item?.attempt?.exam, item?.tags?.[0], null),
        price: firstDefined(item?.price, item?.amount, 0),
        status: firstDefined(item?.status, item?.attemptStatus, 'SUBMITTED'),
    };
};

export const normalizeRecentItems = (dashboard: any) => getRecentCollections(dashboard).map(normalizeRecentItem);

const extractHistoryItems = (history: any) => {
    const candidates = [
        history,
        history?.data,
        history?.data?.data,
        history?.data?.history,
        history?.data?.items,
        history?.data?.results,
        history?.history,
        history?.items,
        history?.results,
        history?.records,
        history?.list,
    ];

    return candidates.find(Array.isArray) || [];
};

export const normalizeHistoryItems = (history: any) => extractHistoryItems(history).map(normalizeRecentItem);

export const mergeDashboardWithHistory = (dashboard: any, history: any) => {
    const historyItems = normalizeHistoryItems(history);
    if (!historyItems.length) {
        return dashboard;
    }

    const existingItems = getRecentCollections(dashboard);
    const mergedItems = dedupeRecentItems([...historyItems, ...existingItems]);

    return {
        ...dashboard,
        history: historyItems,
        recentAttempts: Array.isArray(dashboard?.recentAttempts) && dashboard.recentAttempts.length > 0 ? dashboard.recentAttempts : historyItems,
        recentTests: Array.isArray(dashboard?.recentTests) && dashboard.recentTests.length > 0 ? dashboard.recentTests : historyItems,
        recentMocks: Array.isArray(dashboard?.recentMocks) && dashboard.recentMocks.length > 0 ? dashboard.recentMocks : historyItems,
        items: Array.isArray(dashboard?.items) && dashboard.items.length > 0 ? dashboard.items : historyItems,
        _mergedRecentItems: mergedItems,
    };
};

export const getDashboardHeadline = (dashboard: any, items: any[]) =>
    firstDefined(
        dashboard?.recentSectionTitle,
        dashboard?.recentTitle,
        dashboard?.sectionTitle,
        items.length > 0 ? 'Recent Performance' : null,
    ) || 'Recent Performance';
