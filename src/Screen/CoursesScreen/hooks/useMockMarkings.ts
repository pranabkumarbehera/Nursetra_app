import { useEffect, useRef, useState } from 'react';
import { getApi } from '../../../Utils/Helpers/ApiRequest';
import { getQuizId } from '../utils/courseHelpers';

export function useMockMarkings(visibleQuizzes: any[], authToken: string | null) {
    const [mockMarkingMap, setMockMarkingMap] = useState<Record<string, any>>({});
    const requests = useRef(new Map<string, Promise<any>>());
    const scheduler = useRef({ running: 0, queue: [] as Array<() => Promise<void>> });
    const wanted = useRef({ requests: requests.current, ids: new Set<string>() });

    useEffect(() => {
        requests.current = new Map();
        setMockMarkingMap({});
    }, [authToken]);

    useEffect(() => {
        let cancelled = false;
        const cache = requests.current;
        const ids = new Set(
            (authToken ? visibleQuizzes : [])
                .map((quiz) => String(getQuizId(quiz?.rawQuiz || quiz) || ''))
                .filter(Boolean),
        );
        const selection = { requests: cache, ids };
        wanted.current = selection;
        // The shared scheduler bounds in-flight work even across rapid filter/token changes.
        const pump = () => {
            const state = scheduler.current;
            while (state.running < 3 && state.queue.length) {
                const work = state.queue.shift()!;
                state.running += 1;
                void work().finally(() => {
                    state.running -= 1;
                    pump();
                });
            }
        };
        for (const id of ids) {
            let request = cache.get(id);
            if (!request) {
                let complete!: (value: any) => void;
                request = new Promise((resolve) => {
                    complete = resolve;
                });
                cache.set(id, request);
                scheduler.current.queue.push(async () => {
                    let response: any = null;
                    try {
                        if (wanted.current.requests === cache && wanted.current.ids.has(id)) {
                            response = await getApi(`quizzes/${id}`, {
                                Accept: 'application/json',
                                contenttype: 'application/json',
                                authorization: authToken,
                            });
                        }
                    } catch {
                        // Metadata failure must not prevent attempting the quiz with its original payload.
                    }
                    if (!(response?.data?.success === true || response?.status === 200)) cache.delete(id);
                    complete(response);
                });
            }
            void request.then((response) => {
                if (cancelled) return;
                if (response?.data?.success === true || response?.status === 200) {
                    const quiz = response?.data?.data || response?.data;
                    setMockMarkingMap((previous) =>
                        previous[id] === quiz ? previous : { ...previous, [id]: quiz },
                    );
                }
            });
        }
        pump();
        return () => {
            cancelled = true;
            if (wanted.current === selection) wanted.current = { requests: cache, ids: new Set() };
        };
    }, [visibleQuizzes, authToken]);
    return mockMarkingMap;
}
