import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize } from '../../../Utils/Helpers/normalize';
import { styles } from '../coursesStyles';
import { getItemTitle, getItemDescription, getQuestionBankYear } from '../utils/courseHelpers';

type Props = { item: any; section: { key: string }; onOpen: (section: string, item: any) => void };
export const StudyMaterialCard = memo(function StudyMaterialCard({
    item,
    section,
    onOpen: handleOpenCourseItem,
}: Props) {
    if (section.key === 'note') {
        return (
            <Pressable
                style={styles.courseCardPressable}
                onPress={() => handleOpenCourseItem(section.key, item)}
            >
                <LinearGradient
                    colors={['#ECFDF5', '#FFFFFF', '#E0F2FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.courseCard}
                >
                    <LinearGradient
                        colors={['#ECFDF5', '#D1FAE5', '#CCFBF1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.courseCardBadge}
                    >
                        <Text style={styles.courseCardBadgeText}>NOTES</Text>
                    </LinearGradient>
                    <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Note Bank')}</Text>
                    {getItemDescription(item) ? (
                        <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text>
                    ) : null}
                    <View style={styles.courseCardFooter}>
                        <Feather name="book-open" size={normalize(16)} color={Colorpath.Primary} />
                        <Text style={styles.courseCardFooterText}>Open note pages</Text>
                    </View>
                </LinearGradient>
            </Pressable>
        );
    }

    if (section.key === 'question') {
        return (
            <Pressable
                style={styles.courseCardPressable}
                onPress={() => handleOpenCourseItem(section.key, item)}
            >
                <LinearGradient
                    colors={['#F5F3FF', '#FFFFFF', '#FCE7F3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.courseCard}
                >
                    <LinearGradient
                        colors={['#F5F3FF', '#E9D5FF', '#DBEAFE']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.courseCardBadge}
                    >
                        <Text style={styles.courseCardBadgeText}>QUESTION BANK</Text>
                    </LinearGradient>
                    <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Question Bank')}</Text>
                    {getQuestionBankYear(item) ? (
                        <Text style={styles.courseCardSubtitle}>Year: {getQuestionBankYear(item)}</Text>
                    ) : null}
                    <View style={styles.courseCardFooter}>
                        <Feather name="help-circle" size={normalize(16)} color={Colorpath.Primary} />
                        <Text style={styles.courseCardFooterText}>View questions & answers</Text>
                    </View>
                </LinearGradient>
            </Pressable>
        );
    }

    if (section.key === 'document') {
        return (
            <Pressable
                style={styles.courseCardPressable}
                onPress={() => handleOpenCourseItem(section.key, item)}
            >
                <LinearGradient
                    colors={['#F0FDF4', '#FFFFFF', '#DCFCE7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.courseCard}
                >
                    <LinearGradient
                        colors={['#DCFCE7', '#BBF7D0', '#86EFAC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.courseCardBadge}
                    >
                        <Text style={styles.courseCardBadgeText}>DOCUMENT</Text>
                    </LinearGradient>
                    <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Document')}</Text>
                    {getItemDescription(item) ? (
                        <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text>
                    ) : (
                        <Text style={styles.courseCardSubtitle}>PDF Document</Text>
                    )}
                    <View style={styles.courseCardFooter}>
                        <Feather name="file-text" size={normalize(16)} color="#16A34A" />
                        <Text
                            style={[
                                styles.courseCardFooterText,
                                { color: '#16A34A', marginLeft: normalize(4) },
                            ]}
                        >
                            Open Document
                        </Text>
                    </View>
                </LinearGradient>
            </Pressable>
        );
    }

    return (
        <Pressable style={styles.courseCardPressable} onPress={() => handleOpenCourseItem(section.key, item)}>
            <LinearGradient
                colors={['#FEF2F2', '#FFFFFF', '#EEF2FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.courseCard}
            >
                <View style={styles.courseCardBadge}>
                    <Text style={styles.courseCardBadgeText}>VIDEOLINK BANK</Text>
                </View>
                <View style={styles.videoCardTitleRow}>
                    <Feather name="play-circle" size={normalize(18)} color={Colorpath.Primary} />
                    <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Video Bank')}</Text>
                </View>
                {getItemDescription(item) ? (
                    <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text>
                ) : (
                    <Text style={styles.courseCardSubtitle}>YouTube Video</Text>
                )}
                <View style={styles.courseCardFooter}>
                    <Feather name="youtube" size={normalize(16)} color="#FF0000" />
                    <Text
                        style={[styles.courseCardFooterText, { color: '#FF0000', marginLeft: normalize(4) }]}
                    >
                        Open in YouTube
                    </Text>
                </View>
            </LinearGradient>
        </Pressable>
    );
});
