import React from 'react';

import { PaginatedList } from './PaginatedList';

import { View, Text, Pressable, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

import constants from '../../../Utils/Helpers/constants';

import { SubjectBankSkeleton } from '../../../Components/LoadingSkeletons';

import Toast from 'react-native-toast-message';

import { getItemId, getItemTitle, toDisplayText } from '../utils/courseHelpers';
import { styles } from '../coursesStyles';

export function DocumentFolderModal({
    showDocumentFolderModal,
    setShowDocumentFolderModal,
    selectedDocumentFolderTitle,
    documentLoading,
    documentResponse,
    handleOpenDocumentPdf,
}: any) {
    const documents = Array.isArray(documentResponse) ? documentResponse : [];
    return (
        <Modal
            visible={showDocumentFolderModal}
            transparent={false}
            animationType="slide"
            onRequestClose={() => setShowDocumentFolderModal(false)}
        >
            <View style={styles.videoBankContainer}>
                <SafeAreaView edges={['top']} style={styles.videoBankSafeArea}>
                    <View style={styles.videoBankHeader}>
                        <View style={styles.videoBankHeaderText}>
                            <Text style={styles.videoBankLabel}>DOCUMENT FOLDER</Text>
                            <Text style={styles.videoBankTitle}>
                                {selectedDocumentFolderTitle || 'Documents'}
                            </Text>
                            <Text style={styles.videoBankSubtitle}>Select a document to open</Text>
                        </View>
                        <Pressable
                            onPress={() => setShowDocumentFolderModal(false)}
                            style={styles.videoBankCloseBtn}
                        >
                            <Feather name="x" size={normalize(22)} color="#0F172A" />
                        </Pressable>
                    </View>
                </SafeAreaView>

                {documentLoading ? (
                    <View style={styles.videoBankLoadingState}>
                        <SubjectBankSkeleton />
                    </View>
                ) : documents.length === 0 ? (
                    <View style={styles.videoBankEmptyState}>
                        <Feather name="file-text" size={normalize(28)} color="#94A3B8" />
                        <Text style={styles.videoBankEmptyText}>No Data Available</Text>
                    </View>
                ) : (
                    <PaginatedList
                        data={documents}
                        keyExtractor={(docItem: any, index: number) =>
                            `${docItem?._id || docItem?.id || index}`
                        }
                        contentContainerStyle={styles.videoBankListContent}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                        renderItem={({ item, index }) => {
                            const fallbackTitle = getItemTitle(item, `Document ${index + 1}`);
                            const title =
                                item?.originalName || toDisplayText(fallbackTitle, `Document ${index + 1}`);
                            const documentId = getItemId(item);

                            return (
                                <Pressable
                                    style={styles.videoBankCard}
                                    onPress={() => {
                                        if (!documentId) {
                                            Toast.show({ type: 'info', text1: 'Document ID not found.' });
                                            return;
                                        }
                                        handleOpenDocumentPdf(String(documentId), title);
                                    }}
                                >
                                    <View style={styles.videoBankCardTopRow}>
                                        <View style={styles.videoBankPlayIconWrap}>
                                            <Feather
                                                name="file-text"
                                                size={normalize(18)}
                                                color={Colorpath.Primary}
                                            />
                                        </View>
                                        <View style={styles.videoBankCardTextWrap}>
                                            <Text style={styles.videoBankCardTitle} numberOfLines={2}>
                                                {title}
                                            </Text>
                                        </View>
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
