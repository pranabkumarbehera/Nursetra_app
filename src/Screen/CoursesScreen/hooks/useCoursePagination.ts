import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const PAGE_SIZE = 10;

/** Rendering only: the API response remains the source of truth. */
export type PaginationMemory = { key: unknown; count: number };

export function useCoursePagination<T>(
    allData: readonly T[],
    pageSize = PAGE_SIZE,
    resetKey: unknown = allData,
    memory?: { current: PaginationMemory | null },
) {
    const [page, setPage] = useState(() => ({
        key: resetKey,
        count: memory?.current && memory.current.key === resetKey ? memory.current.count : pageSize,
    }));
    const count = page.key === resetKey ? page.count : pageSize;
    useEffect(() => {
        setPage((previous) => (previous.key === resetKey ? previous : { key: resetKey, count: pageSize }));
    }, [resetKey, pageSize]);
    useEffect(() => {
        if (memory) memory.current = { key: resetKey, count };
    }, [memory, resetKey, count]);
    const gate = useRef({ data: allData, armed: false, offset: 0, consumedOffset: 0 });
    if (gate.current.data !== allData) {
        gate.current = { data: allData, armed: false, offset: 0, consumedOffset: 0 };
    }
    const hasMore = count < allData.length;
    const visibleData = useMemo(() => allData.slice(0, count), [allData, count]);
    const onScrollBeginDrag = useCallback(() => {
        gate.current.armed = true;
    }, []);
    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = event.nativeEvent.contentOffset.y;
        if (offset > gate.current.consumedOffset + 24) gate.current.armed = true;
        gate.current.offset = offset;
    }, []);
    const loadMore = useCallback(() => {
        if (!hasMore || !gate.current.armed) return;
        // Synchronous gate prevents repeated end callbacks advancing several pages.
        gate.current.armed = false;
        gate.current.consumedOffset = gate.current.offset;
        setPage((previous) => ({
            key: resetKey,
            count: Math.min(
                (previous.key === resetKey ? previous.count : pageSize) + pageSize,
                allData.length,
            ),
        }));
    }, [allData, hasMore, pageSize, resetKey]);
    return {
        allData,
        visibleData,
        currentPage: Math.ceil(count / pageSize),
        hasMore,
        isLoadingMore: false,
        loadMore,
        onScroll,
        onScrollBeginDrag,
    };
}
