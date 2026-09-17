import React from 'react';

import { PaginatedList } from './PaginatedList';

import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

import { SubjectBankSkeleton } from '../../../Components/LoadingSkeletons';

import {
    toDisplayText,
    getQuestionBankYear,
    getQuestionPrompt,
    getQuestionAnswer,
    getQuestionExplanation,
    getQuestionOptions,
    htmlToPlainText,
} from '../utils/courseHelpers';
import { styles } from '../coursesStyles';

export function QuestionBankModal({
    showQuestionBankModal,
    setShowQuestionBankModal,
    selectedQuestionBankTitle,
    isLoadingQuestionBank,
    selectedQuestionBankQuestions,
    setSelectedQuestionIndex,
    selectedQuestionIndex,
    selectedQuestionBankMeta,
    insets,
    setSelectedQuestionAnswerDetail,
    setShowQuestionAnswerModal,
}: any) {
    return (
        <Modal
            visible={showQuestionBankModal}
            transparent={false}
            animationType="slide"
            onRequestClose={() => setShowQuestionBankModal(false)}
        >
            <View style={styles.questionBankContainer}>
                <SafeAreaView edges={['top']} style={styles.questionBankSafeArea}>
                    <View style={styles.questionBankHeader}>
                        <View style={styles.questionBankHeaderText}>
                            <Text style={styles.questionBankLabel}>QUESTION BANK</Text>
                            <Text style={styles.questionBankTitle}>
                                {selectedQuestionBankTitle || 'Previous Year Question'}
                            </Text>
                            <Text style={styles.questionBankSubtitle}>
                                PRACTICE WITH CURATED QUESTIONS AND EXPLANATIONS
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => setShowQuestionBankModal(false)}
                            style={styles.questionBankCloseBtn}
                        >
                            <Feather name="x" size={normalize(22)} color="#0F172A" />
                        </Pressable>
                    </View>
                </SafeAreaView>

                {isLoadingQuestionBank ? (
                    <View style={styles.questionBankLoadingState}>
                        <SubjectBankSkeleton />
                    </View>
                ) : selectedQuestionBankQuestions.length === 0 ? (
                    <View style={styles.questionBankEmptyState}>
                        <Feather name="inbox" size={normalize(26)} color="#94A3B8" />
                        <Text style={styles.questionBankEmptyText}>No Data Available</Text>
                    </View>
                ) : (
                    <View style={styles.questionBankLayout}>
                        <View style={styles.questionBankLeftPanel}>
                            <Text style={styles.questionBankPanelLabel}>QUESTIONS</Text>
                            <PaginatedList
                                data={selectedQuestionBankQuestions}
                                keyExtractor={(item: any, index: number) =>
                                    `${item?._id || item?.id || index}`
                                }
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.questionBankListContent}
                                renderItem={({ item, index }) => {
                                    const itemTitle = toDisplayText(
                                        getQuestionPrompt(item),
                                        `Question ${index + 1}`,
                                    );
                                    return (
                                        <Pressable
                                            onPress={() => {
                                                setSelectedQuestionIndex(index);
                                            }}
                                            style={[
                                                styles.questionBankListItem,
                                                selectedQuestionIndex === index &&
                                                    styles.questionBankListItemActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.questionBankListIndex,
                                                    selectedQuestionIndex === index &&
                                                        styles.questionBankListIndexActive,
                                                ]}
                                            >
                                                {index + 1}.
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.questionBankListText,
                                                    selectedQuestionIndex === index &&
                                                        styles.questionBankListTextActive,
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {itemTitle}
                                            </Text>
                                        </Pressable>
                                    );
                                }}
                                ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                            />
                        </View>

                        <View style={styles.questionBankRightPanel}>
                            {(() => {
                                const currentQuestion = selectedQuestionBankQuestions[selectedQuestionIndex];

                                if (!currentQuestion) {
                                    return (
                                        <View style={styles.questionBankEmptyState}>
                                            <Feather name="file-text" size={normalize(26)} color="#94A3B8" />
                                            <Text style={styles.questionBankEmptyText}>
                                                No Data Available
                                            </Text>
                                        </View>
                                    );
                                }

                                const options = getQuestionOptions(currentQuestion);
                                const prompt = toDisplayText(getQuestionPrompt(currentQuestion), 'Question');
                                const answer = toDisplayText(getQuestionAnswer(currentQuestion), '');
                                const explanation = toDisplayText(
                                    getQuestionExplanation(currentQuestion),
                                    '',
                                );
                                const year = toDisplayText(
                                    getQuestionBankYear(selectedQuestionBankMeta || currentQuestion),
                                    '',
                                );

                                return (
                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={[
                                            styles.questionBankDetailScroll,
                                            {
                                                paddingBottom: Math.max(
                                                    insets.bottom + verticalScale(24),
                                                    verticalScale(48),
                                                ),
                                            },
                                        ]}
                                    >
                                        <View style={styles.questionBankDetailCard}>
                                            <View style={styles.questionBankDetailTopRow}>
                                                <Text style={styles.questionBankDetailTag}>
                                                    QUESTION {selectedQuestionIndex + 1}
                                                </Text>
                                                <Text style={styles.questionBankDetailTitle}>{prompt}</Text>
                                            </View>

                                            {currentQuestion?.htmlContent ? (
                                                <Text
                                                    style={{
                                                        fontSize: normalize(15),
                                                        color: '#334155',
                                                        marginTop: verticalScale(10),
                                                        marginBottom: verticalScale(16),
                                                        lineHeight: normalize(22),
                                                    }}
                                                >
                                                    {htmlToPlainText(currentQuestion.htmlContent)}
                                                </Text>
                                            ) : null}

                                            {year ? (
                                                <Text style={styles.questionBankYearText}>Year: {year}</Text>
                                            ) : null}

                                            {options.length > 0 ? (
                                                <View style={styles.questionBankOptionsWrap}>
                                                    {options.map((option: any, optionIndex: number) => {
                                                        const optionText = toDisplayText(
                                                            option,
                                                            `Option ${optionIndex + 1}`,
                                                        );

                                                        return (
                                                            <View
                                                                key={`${optionText}-${optionIndex}`}
                                                                style={styles.questionBankOptionRow}
                                                            >
                                                                <View style={styles.questionBankOptionDot} />
                                                                <Text style={styles.questionBankOptionText}>
                                                                    {optionText}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            ) : null}

                                            {answer || explanation ? (
                                                <Pressable
                                                    onPress={() => {
                                                        setSelectedQuestionAnswerDetail({
                                                            questionNumber: selectedQuestionIndex + 1,
                                                            title: prompt,
                                                            answer,
                                                            explanation,
                                                        });
                                                        setShowQuestionAnswerModal(true);
                                                    }}
                                                    style={styles.questionBankToggleBtn}
                                                >
                                                    <Text style={styles.questionBankToggleText}>
                                                        Show Answer
                                                    </Text>
                                                    <Feather
                                                        name="chevron-right"
                                                        size={normalize(18)}
                                                        color={Colorpath.Primary}
                                                    />
                                                </Pressable>
                                            ) : null}
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
