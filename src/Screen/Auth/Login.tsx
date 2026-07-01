import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { FloatingMedicalBackground } from '../../Components/FloatingMedicalBackground';
import { ROUTES } from '../../Navigation/RouteNames';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Staggered slide-up animations for the form
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(30)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const slideAnim2 = useRef(new Animated.Value(30)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const slideAnim3 = useRef(new Animated.Value(30)).current;

  // Header abstract shape animations
  const shapeAnim1 = useRef(new Animated.Value(0)).current;
  const shapeAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Form intro animation
    const animateIn = (fade: Animated.Value, slide: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(slide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
        ])
      ]).start();
    };

    animateIn(fadeAnim1, slideAnim1, 100);
    animateIn(fadeAnim2, slideAnim2, 200);
    animateIn(fadeAnim3, slideAnim3, 300);

    // Abstract header background slow drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(shapeAnim1, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(shapeAnim1, { toValue: 0, duration: 8000, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shapeAnim2, { toValue: 1, duration: 10000, useNativeDriver: true }),
        Animated.timing(shapeAnim2, { toValue: 0, duration: 10000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const handleLogin = () => {
    navigation.replace(ROUTES.MAIN_STACK);
  };

  const headerScale1 = shapeAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const headerTrans1 = shapeAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const headerTrans2 = shapeAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Abstract Gradient Header (25% height) */}
      <View style={styles.headerContainer}>
        <Animated.View style={[styles.abstractShape, styles.shapePrimary, { transform: [{ scale: headerScale1 }, { translateY: headerTrans1 }] }]} />
        <Animated.View style={[styles.abstractShape, styles.shapeSecondary, { transform: [{ translateY: headerTrans2 }] }]} />
        <LinearGradient
          colors={['rgba(248, 250, 252, 0.4)', theme.colors.background]}
          style={styles.headerOverlay}
        />

        <View style={styles.headerTextWrap}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue your learning journey.</Text>
        </View>
      </View>

      <FloatingMedicalBackground />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, zIndex: 10 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Animated.View style={{ opacity: fadeAnim1, transform: [{ translateY: slideAnim1 }] }}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.8}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe ? <Icon name="checkmark" size={14} color={theme.colors.white} /> : null}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)} activeOpacity={0.8}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim2, transform: [{ translateY: slideAnim2 }] }}>
            <Button title="Sign In" onPress={handleLogin} style={styles.primaryBtn} />

            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Icon name="logo-google" size={20} color={theme.colors.text} style={styles.socialIcon} />
              <Text style={styles.socialBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Icon name="logo-apple" size={20} color={theme.colors.text} style={styles.socialIcon} />
                <Text style={styles.socialBtnText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

        </ScrollView>

        <Animated.View style={[styles.footer, { opacity: fadeAnim3, transform: [{ translateY: slideAnim3 }] }]}>
          <TouchableOpacity
            style={styles.footerWrap}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
          >
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text style={styles.footerAction}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    height: '25%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 60,
  },
  abstractShape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.8,
  },
  shapePrimary: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(79, 70, 229, 0.15)', // Light Primary Indigo
    top: -100,
    right: -50,
  },
  shapeSecondary: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(6, 182, 212, 0.15)', // Light Secondary Teal
    top: -50,
    left: -80,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTextWrap: {
    position: 'relative',
    zIndex: 10,
  },
  welcomeText: {
    fontFamily: Fonts.interbold,
    fontSize: 32,
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontFamily: Fonts.interregular,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rememberText: {
    color: theme.colors.text,
    fontFamily: Fonts.intermedium,
    fontSize: 14,
  },
  forgotText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
    fontSize: 14,
  },
  primaryBtn: {
    marginBottom: 24,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.intermedium,
    fontSize: 12,
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    marginBottom: 16,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialBtnText: {
    color: theme.colors.text,
    fontFamily: Fonts.intersemibold,
    fontSize: 16,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.intermedium,
    fontSize: 15,
  },
  footerAction: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 15,
  },
});
