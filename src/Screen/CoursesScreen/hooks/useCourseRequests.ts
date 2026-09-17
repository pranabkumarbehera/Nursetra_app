import { useCallback, useEffect, useRef } from 'react';

/** Ignore stale completions and coalesce taps; transport cancellation is not assumed. */
export function useCourseRequests() {
    const mounted = useRef(true);
    const pending = useRef(new Map<string, object>());
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            pending.current.clear();
        };
    }, []);
    const cancel = useCallback((key: string) => {
        pending.current.delete(key);
    }, []);
    const begin = useCallback((key: string) => {
        if (!mounted.current || pending.current.has(key)) return null;
        const token = {};
        pending.current.set(key, token);
        const isCurrent = () => mounted.current && pending.current.get(key) === token;
        return {
            isCurrent,
            finish: () => {
                if (isCurrent()) pending.current.delete(key);
            },
        };
    }, []);
    return { begin, cancel };
}
