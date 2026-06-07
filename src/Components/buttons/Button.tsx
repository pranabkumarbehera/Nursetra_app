import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Fonts, theme } from '../../Themes';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const backgroundColor = disabled
    ? theme.colors.border
    : isOutline || isGhost
      ? theme.colors.white
      : variant === 'secondary'
        ? theme.colors.secondary
        : theme.colors.primary;

  const textColor = disabled
    ? theme.colors.textLight
    : isOutline || isGhost
      ? theme.colors.primary
      : theme.colors.white;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor },
        isOutline && styles.outline,
        isGhost && styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: theme.borderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  outline: {
    borderWidth: 1.2,
    borderColor: theme.colors.border,
    shadowOpacity: 0.05,
    elevation: 1,
  },
  ghost: {
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    ...theme.typography.h3,
    fontSize: 17,
    fontFamily: Fonts.intersemibold,
    fontWeight: "bold",
    color: theme.colors.white,
  },
});
