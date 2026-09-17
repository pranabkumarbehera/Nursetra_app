import React from 'react';

import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

import {
    EXAM_ICON_THEMES,
    getBundlePayload,
    resolveBundlePricing,
    getValidityRange,
} from '../utils/courseHelpers';

export const QBankBundleCard = ({
    bundle,
    index,
    isEnrolled,
    isPending,
    onView,
    onEnroll,
    onBuyAndEnroll,
    onMock,
}: any) => {
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
                    <Image source={{ uri: imageUrl }} style={smallCardStyles.thumbnail} resizeMode="cover" />
                ) : (
                    <LinearGradient
                        colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.16)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[smallCardStyles.thumbnail, smallCardStyles.badgeShell]}
                    >
                        <View
                            style={[smallCardStyles.badgeInner, { backgroundColor: fallbackTheme.bgColor }]}
                        >
                            <Feather name="book-open" size={normalize(24)} color={fallbackTheme.iconColor} />
                        </View>
                    </LinearGradient>
                )}
                <View style={smallCardStyles.infoContainer}>
                    <View style={smallCardStyles.detailStack}>
                        <View style={smallCardStyles.detailRow}>
                            <View
                                style={[
                                    smallCardStyles.detailIconWrap,
                                    { backgroundColor: 'rgba(79, 70, 229, 0.10)' },
                                ]}
                            >
                                <Feather name="tag" size={normalize(12)} color="#4F46E5" />
                            </View>
                            <View style={smallCardStyles.detailTextWrap}>
                                <Text style={smallCardStyles.detailLabel}>Name</Text>
                                <Text style={smallCardStyles.detailValue} numberOfLines={2}>
                                    {title}
                                </Text>
                            </View>
                        </View>

                        <View style={smallCardStyles.detailRow}>
                            <View
                                style={[
                                    smallCardStyles.detailIconWrap,
                                    { backgroundColor: 'rgba(16, 185, 129, 0.10)' },
                                ]}
                            >
                                <FontAwesome5 name="rupee-sign" size={normalize(11)} color="#10B981" />
                            </View>
                            <View style={smallCardStyles.detailTextWrap}>
                                <Text style={smallCardStyles.detailLabel}>Price</Text>
                                <View style={smallCardStyles.priceValueRow}>
                                    <Text style={smallCardStyles.detailValue}>
                                        {pricing.isFree ? 'Free' : `₹${pricing.finalPrice}`}
                                    </Text>
                                    {!pricing.isFree && pricing.originalPrice > pricing.finalPrice && (
                                        <Text style={smallCardStyles.originalPrice}>
                                            ₹{pricing.originalPrice}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>

                        {(() => {
                            const validity = getValidityRange(bundle);
                            if (!validity) return null;
                            return (
                                <View style={smallCardStyles.detailRow}>
                                    <View
                                        style={[
                                            smallCardStyles.detailIconWrap,
                                            { backgroundColor: 'rgba(15, 118, 110, 0.10)' },
                                        ]}
                                    >
                                        <Feather name="clock" size={normalize(12)} color="#0F766E" />
                                    </View>
                                    <View style={smallCardStyles.detailTextWrap}>
                                        <Text style={smallCardStyles.detailLabel}>Validity</Text>
                                        <Text style={smallCardStyles.detailValue}>
                                            {validity.formatted}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })()}
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
                        <TouchableOpacity
                            style={[smallCardStyles.enrollBtn, smallCardStyles.enrolledBtn]}
                            onPress={onView}
                        >
                            <Text style={smallCardStyles.enrollBtnText}>Open</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={smallCardStyles.enrollBtn}
                            onPress={pricing.isFree ? onEnroll : onBuyAndEnroll}
                        >
                            <Text style={smallCardStyles.enrollBtnText}>
                                {pricing.isFree ? 'Enroll' : 'Buy'}
                            </Text>
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
