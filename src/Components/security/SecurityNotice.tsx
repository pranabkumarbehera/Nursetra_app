import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';

type SecurityNoticeProps = {
  text?: string;
};

export const SecurityNotice = ({
  text = 'Screenshots, screen recording, PDF download and sharing are blocked for this screen.',
}: SecurityNoticeProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name="shield-checkmark" size={16} color={theme.colors.primary} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDF6FF',
    borderColor: '#CFE6FF',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  text: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: Fonts.intermedium,
    fontSize: 12,
    lineHeight: 18,
  },
});
