import React from 'react';

import { FlatList, FlatListProps, Platform } from 'react-native';
import { useCoursePagination, PaginationMemory } from '../hooks/useCoursePagination';

type Props<T> = Omit<FlatListProps<T>, 'data'> & {
    data: readonly T[];
    pageSize?: number;
    paginationKey?: unknown;
    paginationMemory?: { current: PaginationMemory | null };
};

export function PaginatedList<T>({
    data,
    pageSize,
    paginationKey,
    paginationMemory,
    onScroll,
    onScrollBeginDrag,
    ...props
}: Props<T>) {
    const pagination = useCoursePagination(
        data,
        pageSize,
        paginationKey === undefined ? data : paginationKey,
        paginationMemory,
    );
    return (
        <FlatList
            {...props}
            data={pagination.visibleData}
            initialNumToRender={pageSize || 10}
            maxToRenderPerBatch={pageSize || 10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            onEndReached={pagination.loadMore}
            onEndReachedThreshold={0.4}
            scrollEventThrottle={16}
            onScroll={(event) => {
                pagination.onScroll(event);
                onScroll?.(event);
            }}
            onScrollBeginDrag={(event) => {
                pagination.onScrollBeginDrag();
                onScrollBeginDrag?.(event);
            }}
        />
    );
}
