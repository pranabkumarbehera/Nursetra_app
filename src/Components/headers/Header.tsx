import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
  style?: StyleProp<ViewStyle>;
  light?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  rightIcon,
  onRightPress,
  style,
  light = false,
}) => {
  const navigation = useNavigation<any>();
  const rightIconScale = useRef(new Animated.Value(1)).current;
  const iconColor = light ? theme.colors.white : theme.colors.text;
  const titleColor = light ? theme.colors.white : theme.colors.text;
  const subtitleColor = light ? 'rgba(255,255,255,0.75)' : theme.colors.textLight;

  const handleRightPress = () => {
    if (!rightIcon) {
      return;
    }

    Animated.sequence([
      Animated.spring(rightIconScale, { toValue: 0.88, useNativeDriver: true, speed: 30, bounciness: 8 }),
      Animated.spring(rightIconScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }),
    ]).start();

    onRightPress?.();
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => showBack && navigation.goBack()}
        style={[styles.iconButton, !showBack && styles.hiddenButton]}
        activeOpacity={showBack ? 0.8 : 1}
      >
        {showBack ? <Icon name="chevron-back" size={22} color={iconColor} /> : null}
      </TouchableOpacity>

      <View style={styles.center}>
        {!!subtitle && <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>}
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleRightPress}
        style={[styles.iconButton, !rightIcon && styles.hiddenButton]}
        activeOpacity={rightIcon ? 0.8 : 1}
      >
        {rightIcon ? (
          <Animated.View style={{ transform: [{ scale: rightIconScale }] }}>
            <Icon name={rightIcon} size={20} color={iconColor} />
          </Animated.View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: theme.spacing.m,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  hiddenButton: {
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.intermedium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    ...theme.typography.h3,
    fontFamily: Fonts.interbold,
    fontSize: 18,
    fontWeight: 'bold'
  },
});
