import React from 'react';

import { PaginatedList } from './PaginatedList';

import { View, Text, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

import { SubjectBankSkeleton } from '../../../Components/LoadingSkeletons';

import { getItemTitle, getItemDescription, toDisplayText, getVideoBankUrl } from '../utils/courseHelpers';
import { styles } from '../coursesStyles';

export function VideoBankModal({
    showVideoBankModal,
    setShowVideoBankModal,
    selectedVideoBankTitle,
    isLoadingVideoBank,
    selectedVideoBankItems,
    openExternalVideoUrl,
}: any) {
    return (
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
                            <Text style={styles.videoBankTitle}>
                                {selectedVideoBankTitle || 'Video Bank'}
                            </Text>
                            <Text style={styles.videoBankSubtitle}>Select a video to open in YouTube</Text>
                        </View>
                        <Pressable
                            onPress={() => setShowVideoBankModal(false)}
                            style={styles.videoBankCloseBtn}
                        >
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
                    <PaginatedList
                        data={selectedVideoBankItems}
                        keyExtractor={(videoItem: any, index: number) =>
                            `${videoItem?._id || videoItem?.id || index}`
                        }
                        contentContainerStyle={styles.videoBankListContent}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                        renderItem={({ item, index }) => {
                            const title = toDisplayText(
                                getItemTitle(item, `Video ${index + 1}`),
                                `Video ${index + 1}`,
                            );
                            const subtitle =
                                toDisplayText(getItemDescription(item), 'YouTube Video') || 'YouTube Video';
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
                                            <Feather
                                                name="play-circle"
                                                size={normalize(18)}
                                                color="#FF0000"
                                            />
                                        </View>
                                        <View style={styles.videoBankCardTextWrap}>
                                            <Text style={styles.videoBankCardTitle} numberOfLines={2}>
                                                {title}
                                            </Text>
                                            <Text style={styles.videoBankCardSubtitle} numberOfLines={1}>
                                                {subtitle}
                                            </Text>
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
    );
}
