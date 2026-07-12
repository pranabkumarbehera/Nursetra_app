import React, { memo, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';

const Shimmer = createShimmerPlaceholder(LinearGradient);

type SkeletonBlockProps = {
    style?: ViewStyle | ViewStyle[];
};

export const SkeletonBlock = memo(({ style }: SkeletonBlockProps) => {
    return <Shimmer style={[styles.block, style]} />;
});

type SkeletonCircleProps = {
    size?: number;
    style?: ViewStyle | ViewStyle[];
};

export const SkeletonCircle = memo(({ size = 48, style }: SkeletonCircleProps) => {
    return <Shimmer style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
});

type SkeletonLineProps = {
    width?: number | string;
    height?: number;
    style?: ViewStyle | ViewStyle[];
};

export const SkeletonLine = memo(({ width = '100%', height = 14, style }: SkeletonLineProps) => {
    return <Shimmer style={[{ width, height, borderRadius: height / 2 }, style]} />;
});

type SkeletonListProps = {
    count?: number;
    itemHeight?: number;
    gap?: number;
    widths?: Array<number | string>;
    style?: ViewStyle | ViewStyle[];
};

export const SkeletonList = memo(({ count = 5, itemHeight = 72, gap = 12, widths = [], style }: SkeletonListProps) => {
    const items = useMemo(() => Array.from({ length: count }), [count]);

    return (
        <View style={style}>
            {items.map((_, index) => {
                const width = widths[index] ?? '100%';
                return (
                    <Shimmer
                        key={`skeleton-${index}`}
                        style={[
                            styles.block,
                            {
                                height: itemHeight,
                                width,
                                marginBottom: index === count - 1 ? 0 : gap,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
});

export const SkeletonCard = memo(({ height = 120, style }: { height?: number; style?: ViewStyle | ViewStyle[] }) => {
    return <Shimmer style={[styles.block, { height }, style]} />;
});

export const SkeletonChipRow = memo(({ count = 6 }: { count?: number }) => {
    return (
        <View style={styles.chipRow}>
            {Array.from({ length: count }).map((_, index) => (
                <Shimmer key={`chip-${index}`} style={styles.chip} />
            ))}
        </View>
    );
});

export const HomeSkeleton = memo(() => {
    return (
        <View style={styles.screen}>
            <View style={styles.homeHeader}>
                <View style={{ flex: 1 }}>
                    <SkeletonLine width="42%" height={18} />
                    <SkeletonLine width="58%" height={12} style={{ marginTop: verticalScale(8) }} />
                </View>
            </View>
            <SkeletonCard height={152} style={styles.homeBanner} />
            <View style={styles.homeStatsRow}>
                <SkeletonCard height={78} style={styles.homeStatCard} />
                <SkeletonCard height={78} style={styles.homeStatCard} />
            </View>
            <SkeletonLine width="28%" height={16} style={styles.sectionLabel} />
            <SkeletonChipRow />
            <SkeletonLine width="38%" height={16} style={styles.sectionLabel} />
            <SkeletonList count={3} itemHeight={108} gap={14} />
        </View>
    );
});

export const MockBankSkeleton = memo(() => {
    return (
        <View>
            <SkeletonLine width="38%" height={18} />
            <SkeletonCard height={48} style={{ marginTop: verticalScale(16) }} />
            <SkeletonLine width="26%" height={14} style={styles.sectionLabel} />
            <SkeletonChipRow count={5} />
            <SkeletonLine width="30%" height={14} style={styles.sectionLabel} />
            <SkeletonChipRow count={4} />
            <View style={{ marginTop: verticalScale(16) }}>
                <SkeletonList count={4} itemHeight={158} gap={16} />
            </View>
        </View>
    );
});

export const SubjectBankSkeleton = memo(() => {
    return (
        <View>
            <SkeletonLine width="48%" height={18} />
            <SkeletonCard height={52} style={{ marginTop: verticalScale(16) }} />
            <SkeletonLine width="28%" height={14} style={styles.sectionLabel} />
            <SkeletonChipRow count={4} />
            <SkeletonLine width="32%" height={14} style={styles.sectionLabel} />
            <SkeletonList count={3} itemHeight={120} gap={14} />
        </View>
    );
});

export const ProfileSkeleton = memo(() => {
    return (
        <View style={styles.profileWrap}>
            <SkeletonCard height={180} />
            <View style={styles.profileAvatarWrap}>
                <SkeletonCircle size={104} />
                <SkeletonLine width="56%" height={18} style={styles.profileName} />
                <SkeletonLine width="42%" height={12} />
                <SkeletonLine width="72%" height={12} style={{ marginTop: verticalScale(10) }} />
            </View>
            <View style={styles.profileStatsRow}>
                <SkeletonCard height={72} style={styles.profileStatCard} />
                <SkeletonCard height={72} style={styles.profileStatCard} />
            </View>
            <SkeletonLine width="38%" height={16} style={styles.sectionLabel} />
            <SkeletonList count={2} itemHeight={88} gap={12} />
            <SkeletonLine width="44%" height={16} style={styles.sectionLabel} />
            <SkeletonList count={4} itemHeight={60} gap={10} />
        </View>
    );
});

export const CategoriesSkeleton = memo(() => {
    return (
        <View style={styles.categoriesWrap}>
            <SkeletonLine width="28%" height={18} />
            <SkeletonList count={4} itemHeight={72} gap={12} style={{ marginTop: verticalScale(16) }} />
            <SkeletonLine width="34%" height={18} style={styles.sectionLabel} />
            <SkeletonList count={4} itemHeight={64} gap={12} />
        </View>
    );
});

export const CategoriesModalSkeleton = memo(() => {
    return (
        <View>
            <SkeletonLine width="34%" height={18} />
            <CategoriesSkeleton />
        </View>
    );
});

const styles = StyleSheet.create({
    block: {
        backgroundColor: '#E5EEF7',
        borderRadius: normalize(18),
        overflow: 'hidden',
    },
    screen: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    homeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(18),
    },
    homeBanner: {
        borderRadius: 24,
    },
    homeStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: verticalScale(16),
        marginBottom: verticalScale(20),
    },
    homeStatCard: {
        flex: 1,
        borderRadius: 20,
    },
    sectionLabel: {
        marginTop: verticalScale(18),
        marginBottom: verticalScale(12),
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        width: 88,
        height: 34,
        borderRadius: 999,
        marginBottom: 10,
    },
    profileWrap: {
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    profileAvatarWrap: {
        alignItems: 'center',
        marginTop: -44,
        marginBottom: 12,
    },
    profileName: {
        marginTop: 16,
        marginBottom: 8,
    },
    profileStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: verticalScale(16),
    },
    profileStatCard: {
        flex: 1,
        borderRadius: 18,
    },
    categoriesWrap: {
        paddingHorizontal: 0,
    },
});

export default {
    SkeletonBlock,
    SkeletonCircle,
    SkeletonLine,
    SkeletonList,
    SkeletonCard,
    SkeletonChipRow,
    HomeSkeleton,
    MockBankSkeleton,
    SubjectBankSkeleton,
    ProfileSkeleton,
    CategoriesSkeleton,
    CategoriesModalSkeleton,
};
