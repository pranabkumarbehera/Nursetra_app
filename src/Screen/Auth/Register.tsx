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

export const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

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

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const headerScale1 = shapeAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const headerTrans1 = shapeAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const headerTrans2 = shapeAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Abstract Gradient Header (20% height) */}
      <View style={styles.headerContainer}>
        <Animated.View style={[styles.abstractShape, styles.shapePrimary, { transform: [{ scale: headerScale1 }, { translateY: headerTrans1 }] }]} />
        <Animated.View style={[styles.abstractShape, styles.shapeSecondary, { transform: [{ translateY: headerTrans2 }] }]} />
        <LinearGradient
          colors={['rgba(248, 250, 252, 0.4)', theme.colors.background]}
          style={styles.headerOverlay}
        />

        <View style={styles.headerTextWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>Join thousands of learners today.</Text>
        </View>
      </View>

      <FloatingMedicalBackground />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, zIndex: 10 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Animated.View style={{ opacity: fadeAnim1, transform: [{ translateY: slideAnim1 }] }}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={(text) => handleChange('name', text)}
              leftIcon="person-outline"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Mobile Number"
              placeholder="Enter mobile number"
              value={form.mobile}
              onChangeText={(text) => handleChange('mobile', text)}
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              isPassword
              leftIcon="shield-checkmark-outline"
            />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim2, transform: [{ translateY: slideAnim2 }] }}>
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed ? <Icon name="checkmark" size={14} color={theme.colors.white} /> : null}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>.
                </Text>
              </TouchableOpacity>
            </View>

            <Button title="Create Account" onPress={() => { }} style={styles.primaryBtn} disabled={!agreed} />
          </Animated.View>

        </ScrollView>

        <Animated.View style={[styles.footer, { opacity: fadeAnim3, transform: [{ translateY: slideAnim3 }] }]}>
          <TouchableOpacity
            style={styles.footerWrap}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.footerAction}>Sign In</Text>
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
    height: '20%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    backgroundColor: '#E0E7FF',
    top: -100,
    right: -50,
  },
  shapeSecondary: {
    width: 200,
    height: 200,
    backgroundColor: '#CCFBF1',
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
  backButton: {
    marginBottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  optionsContainer: {
    marginBottom: 32,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  termsText: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: Fonts.intermedium,
    fontSize: 14,
    lineHeight: 22,
  },
  linkText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
  },
  primaryBtn: {
    marginBottom: 24,
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
