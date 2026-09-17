import React from 'react';

import { View, Text, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import { WebView } from 'react-native-webview';

import { normalize } from '../../../Utils/Helpers/normalize';

import { toDisplayText, buildNoteHtmlDocument } from '../utils/courseHelpers';
import { styles } from '../coursesStyles';

export function NotePageModal({ showNotePageModal, setShowNotePageModal, selectedNotePageDetail }: any) {
    return (
        <Modal
            visible={showNotePageModal}
            transparent={false}
            animationType="slide"
            onRequestClose={() => setShowNotePageModal(false)}
        >
            <View style={styles.notePageViewerContainer}>
                <SafeAreaView edges={['top']} style={styles.notePageViewerSafeArea}>
                    <View style={styles.notePageViewerHeader}>
                        <View style={styles.notePageViewerHeaderText}>
                            <Text style={styles.notePageViewerLabel}>NOTE PAGE</Text>
                            <Text style={styles.notePageViewerTitle}>
                                {toDisplayText(selectedNotePageDetail?.title, 'Note Page')}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => setShowNotePageModal(false)}
                            style={styles.notePageViewerCloseBtn}
                        >
                            <Feather name="x" size={normalize(22)} color="#0F172A" />
                        </Pressable>
                    </View>
                </SafeAreaView>

                <View style={styles.notePageViewerContent}>
                    <View style={styles.notePageViewerCard}>
                        {selectedNotePageDetail?.htmlContent ? (
                            <WebView
                                originWhitelist={['*']}
                                onShouldStartLoadWithRequest={(request) => request.url === 'about:blank'}
                                setSupportMultipleWindows={false}
                                allowsLinkPreview={false}
                                allowFileAccess={false}
                                allowFileAccessFromFileURLs={false}
                                allowUniversalAccessFromFileURLs={false}
                                source={{ html: buildNoteHtmlDocument(selectedNotePageDetail.htmlContent) }}
                                javaScriptEnabled={false}
                                domStorageEnabled={false}
                                nestedScrollEnabled
                                style={styles.notePageViewerWebView}
                            />
                        ) : (
                            <View style={styles.notePageViewerEmptyState}>
                                <Text style={styles.notePageViewerBody}>No content available.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
