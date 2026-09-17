import React from 'react';

import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

import { styles } from '../coursesStyles';

export function QuestionAnswerModal({
    showQuestionAnswerModal,
    setShowQuestionAnswerModal,
    selectedQuestionAnswerDetail,
    insets,
}: any) {
    return (
        <Modal
            visible={showQuestionAnswerModal}
            transparent={false}
            animationType="slide"
            onRequestClose={() => setShowQuestionAnswerModal(false)}
        >
            <View style={styles.questionAnswerContainer}>
                <SafeAreaView edges={['top']} style={styles.questionAnswerSafeArea}>
                    <View style={styles.questionAnswerHeader}>
                        <View style={styles.questionAnswerHeaderText}>
                            <Text style={styles.questionAnswerLabel}>ANSWER & EXPLANATION</Text>
                            <Text style={styles.questionAnswerTitle}>
                                {selectedQuestionAnswerDetail?.title || 'Question Answer'}
                            </Text>
                            <Text style={styles.questionAnswerSubtitle}>
                                QUESTION {selectedQuestionAnswerDetail?.questionNumber || ''}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => setShowQuestionAnswerModal(false)}
                            style={styles.questionAnswerCloseBtn}
                        >
                            <Feather name="x" size={normalize(22)} color="#0F172A" />
                        </Pressable>
                    </View>
                </SafeAreaView>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.questionAnswerScrollContent,
                        { paddingBottom: Math.max(insets.bottom + verticalScale(24), verticalScale(48)) },
                    ]}
                >
                    <View style={styles.questionAnswerCard}>
                        {selectedQuestionAnswerDetail?.answer ? (
                            <Text style={styles.questionAnswerBody}>
                                {selectedQuestionAnswerDetail.answer}
                            </Text>
                        ) : null}
                        {selectedQuestionAnswerDetail?.explanation ? (
                            <Text style={styles.questionAnswerExplanation}>
                                {selectedQuestionAnswerDetail.explanation}
                            </Text>
                        ) : null}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}
