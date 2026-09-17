import React from 'react';

import { PaginatedList } from './PaginatedList';

import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

import { SubjectBankSkeleton } from '../../../Components/LoadingSkeletons';

import { toDisplayText, htmlToNoteText } from '../utils/courseHelpers';
import { styles } from '../coursesStyles';

export function NoteBankModal({
    showNoteViewerModal,
    setShowNoteViewerModal,
    selectedNoteBankTitle,
    isLoadingNotePages,
    selectedNotePages,
    setSelectedNotePageIndex,
    selectedNotePageIndex,
    insets,
    setSelectedNotePageDetail,
    setShowNotePageModal,
}: any) {
    return (
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
                        <Pressable
                            onPress={() => setShowNoteViewerModal(false)}
                            style={styles.noteViewerCloseBtn}
                        >
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
                            <PaginatedList
                                data={selectedNotePages}
                                keyExtractor={(page: any, index: number) =>
                                    `${page?._id || page?.id || index}`
                                }
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.noteViewerListContent}
                                renderItem={({ item, index }) => {
                                    const pageTitle = toDisplayText(item?.title, `Page ${index + 1}`);

                                    return (
                                        <Pressable
                                            onPress={() => setSelectedNotePageIndex(index)}
                                            style={[
                                                styles.noteViewerListItem,
                                                selectedNotePageIndex === index &&
                                                    styles.noteViewerListItemActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.noteViewerListIndex,
                                                    selectedNotePageIndex === index &&
                                                        styles.noteViewerListIndexActive,
                                                ]}
                                            >
                                                {index + 1}.
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.noteViewerListText,
                                                    selectedNotePageIndex === index &&
                                                        styles.noteViewerListTextActive,
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
                                            <Text style={styles.noteViewerStateText}>
                                                No note pages found.
                                            </Text>
                                        </View>
                                    );
                                }

                                return (
                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={[
                                            styles.noteViewerDetailScroll,
                                            {
                                                paddingBottom: Math.max(
                                                    insets.bottom + verticalScale(24),
                                                    verticalScale(48),
                                                ),
                                            },
                                        ]}
                                    >
                                        <View style={styles.noteViewerDetailCard}>
                                            <View style={styles.noteViewerDetailTopRow}>
                                                <Text style={styles.noteViewerDetailTag}>
                                                    PAGE {selectedNotePageIndex + 1}
                                                </Text>
                                                <Text style={styles.noteViewerDetailTitle}>
                                                    {toDisplayText(
                                                        currentPage?.title,
                                                        `Page ${selectedNotePageIndex + 1}`,
                                                    )}
                                                </Text>
                                            </View>
                                            <Text
                                                style={styles.noteViewerDetailBody}
                                                numberOfLines={5}
                                                ellipsizeMode="tail"
                                            >
                                                {htmlToNoteText(currentPage?.htmlContent || '') ||
                                                    'No content available.'}
                                            </Text>
                                            <Text style={styles.noteViewerDetailHint}>
                                                Tap View to read the full page.
                                            </Text>
                                            <Pressable
                                                style={styles.noteViewerViewButton}
                                                onPress={() => {
                                                    setSelectedNotePageDetail(currentPage);
                                                    setShowNotePageModal(true);
                                                }}
                                            >
                                                <Text style={styles.noteViewerViewButtonText}>View</Text>
                                                <Feather
                                                    name="chevron-right"
                                                    size={normalize(16)}
                                                    color="#FFFFFF"
                                                />
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
    );
}
