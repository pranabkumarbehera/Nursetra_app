import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currentBorderColor = error ? (theme.colors.error || '#EF4444') : isFocused ? (theme.colors.primary || '#4F46E5') : '#E2E8F0';
  const currentBackgroundColor = isFocused ? (theme.colors.surface || '#FFFFFF') : '#F8FAFC';

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={[styles.label, { color: isFocused ? (theme.colors.primary || '#4F46E5') : '#64748B' }]}>
          {label}
        </Text>
      )}
      
      <View style={[
          styles.inputContainer,
          { backgroundColor: currentBackgroundColor, borderColor: currentBorderColor, borderWidth: 1.5 }
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.textLight}
            style={styles.icon}
          />
        )}
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, inputStyle]}
            placeholderTextColor={theme.colors.textLight}
            onFocus={(e) => { setIsFocused(true); props.onFocus && props.onFocus(e); }}
            onBlur={(e) => { setIsFocused(false); props.onBlur && props.onBlur(e); }}
            secureTextEntry={isPassword && !showPassword}
            value={value}
            {...props}
          />
        </View>

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontFamily: Fonts.interbold,
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "bold"
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    height: 52, // Reduced height as requested
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: Fonts.intermedium,
    fontSize: 15,
    paddingVertical: 0,
    height: '100%',
  },
  eyeIcon: {
    marginLeft: 12,
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
