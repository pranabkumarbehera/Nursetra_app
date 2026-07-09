import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colorpath, Fonts, theme } from '../../Themes';

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
  const isPrimary = variant === 'primary';

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const textColor = disabled
    ? theme.colors.textLight
    : isOutline || isGhost
      ? theme.colors.primary
      : theme.colors.white;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} style={styles.loader} />
      ) : null}
      <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
    </>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.touchable,
          !isPrimary && { backgroundColor: disabled ? theme.colors.border : isOutline || isGhost ? 'transparent' : theme.colors.secondary },
          isOutline && styles.outline,
          isGhost && styles.ghost,
          disabled && styles.disabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {isPrimary && !disabled && !isOutline && !isGhost ? (
          <LinearGradient
           colors={[Colorpath.TextSecondary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientContainer}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View style={styles.flatContainer}>
            {renderContent()}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    height: 56,
    borderRadius: 18,
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  flatContainer: {
    flex: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: '#E2E8F0',
  },
  loader: {
    marginRight: 8,
  },
  text: {
    ...theme.typography.h3,
    fontSize: 16,
    fontFamily: Fonts.interbold,
    color: theme.colors.white,
  },
});
