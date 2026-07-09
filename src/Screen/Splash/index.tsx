import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts, Imagepath, theme } from '../../Themes';
import constants from '../../Utils/Helpers/constants';
import { ROUTES } from '../../Navigation/RouteNames';
import { tokenSuccess } from '../../Redux/Reducers/AuthReducer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EXAM_CHIPS = ['NORCET', 'GNM', 'B.Sc Nursing', 'CHO', 'ESIC', 'RRB'];

const BG_ICONS = [
  { id: '1', name: 'stethoscope', top: '15%', left: '10%', size: 42, rotate: '-15deg' },
  { id: '2', name: 'plus', top: '20%', right: '15%', size: 36, rotate: '10deg' },
  { id: '3', name: 'plus', top: '45%', left: '80%', size: 28, rotate: '45deg' },
  { id: '4', name: 'stethoscope', bottom: '35%', right: '12%', size: 38, rotate: '15deg' },
  { id: '5', name: 'plus', bottom: '25%', left: '18%', size: 44, rotate: '-20deg' },
  { id: '6', name: 'stethoscope', bottom: '15%', right: '60%', size: 26, rotate: '0deg' },
];

export const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const progress = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const circleAnim = React.useRef(new Animated.Value(1)).current;
  const taglineAnim = React.useRef(new Animated.Value(0)).current;
  const colorAnim = React.useRef(new Animated.Value(0)).current;
  const chipAnims = React.useRef(EXAM_CHIPS.map(() => new Animated.Value(0))).current;
  const iconAnims = React.useRef(BG_ICONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    // Animate background circles continuously
    Animated.loop(
      Animated.sequence([
        Animated.timing(circleAnim, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
        Animated.timing(circleAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      ])
    ).start();

    // Animate logo color transition
    Animated.loop(
      Animated.sequence([
        Animated.delay(1500), // Show original logo for 1.5s
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 2000, // Fade into Primary
          useNativeDriver: false, // Color anim requires false
        }),
        Animated.delay(1000),
        Animated.timing(colorAnim, {
          toValue: 2,
          duration: 2000, // Shift to Secondary
          useNativeDriver: false,
        }),
        Animated.delay(1000),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 2000, // Fade back to original logo
          useNativeDriver: false,
        })
      ])
    ).start();

    // 1. Fade in the main content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Animate background icons merging in sequentially
      Animated.stagger(200, iconAnims.map(anim =>
        Animated.spring(anim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true })
      )).start();

      // 3. Animate the tagline appearing
      Animated.spring(taglineAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start(() => {
        // 4. Stagger animate the course chips
        Animated.stagger(150, chipAnims.map(anim =>
          Animated.spring(anim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true })
        )).start(() => {
          // 5. Start the loading progress bar AFTER chips
          Animated.timing(progress, {
            toValue: 100,
            duration: 1200,
            useNativeDriver: false,
          }).start(() => {
            // Navigate once loading is fully done
            timeout = setTimeout(async () => {
              const token = await AsyncStorage.getItem(constants.TOKEN);
              if (token) {
                dispatch(tokenSuccess(token));
                navigation.replace(ROUTES.MAIN_STACK);
              } else {
                const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
                navigation.replace(hasSeenOnboarding === 'true' ? ROUTES.LOGIN : ROUTES.ONBOARDING);
              }
            }, 800);
          });
        });
      });
    });

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [dispatch, navigation]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Opacity of the tinted overlay
  const overlayOpacity = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 1], // Transparent at 0, fully opaque at 1 and 2
  });

  // Color of the tinted overlay
  const overlayColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [theme.colors.primary, theme.colors.primary, theme.colors.secondary],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowCircle, styles.glowTop, { transform: [{ scale: circleAnim }] }]} />
      <Animated.View style={[styles.glowCircle, styles.glowBottom, { transform: [{ scale: circleAnim }] }]} />

      {BG_ICONS.map((icon, index) => (
        <Animated.View
          key={icon.id}
          style={[
            styles.bgIconContainer,
            { top: icon.top as any, bottom: icon.bottom as any, left: icon.left as any, right: icon.right as any },
            { opacity: iconAnims[index], transform: [{ scale: iconAnims[index] }, { rotate: icon.rotate }] }
          ]}
        >
          <Icon name={icon.name} size={icon.size} color="rgba(10, 75, 143, 0.08)" />
        </Animated.View>
      ))}

      <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoWrap}>
          {/* Base: Original Logo (Shows first) */}
          <Image source={Imagepath.Logo} style={styles.logo} resizeMode="contain" />
          
          {/* Overlay: Tinted Logo (Fades in over time) */}
          <Animated.Image 
            source={Imagepath.Logo} 
            style={[styles.logo, { opacity: overlayOpacity, tintColor: overlayColor }]} 
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.appName}>Nursetra</Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineAnim, transform: [{ scale: taglineAnim }] }]}>
          Learn. Succeed. Get Hired.
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.chipWrap}>
          {EXAM_CHIPS.map((chip, index) => (
            <Animated.View key={chip} style={[styles.chip, { opacity: chipAnims[index], transform: [{ scale: chipAnims[index] }] }]}>
              <Text style={styles.chipText}>{chip}</Text>
            </Animated.View>
          ))}
        </View>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingBar, { width }]} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(10, 75, 143, 0.05)',
  },
  glowTop: {
    width: 260,
    height: 260,
    top: -60,
    left: -80,
  },
  glowBottom: {
    width: 240,
    height: 240,
    bottom: -80,
    right: -60,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  logoWrap: {
    width: 350,
    height: 350,
    marginBottom: 24,
    position: 'relative',
  },
  logo: {
    position: 'absolute',
    width: 350,
    height: 350,
  },
  appName: {
    ...theme.typography.h1,
    fontFamily: Fonts.interbold,
    fontSize: 34,
    color: '#0A4B8F',
    marginBottom: 10,
  },
  tagline: {
    ...theme.typography.body,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "bold"
  },
  footer: {
    alignItems: 'center',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#D4E4FC',
  },
  chipText: {
    color: '#0A4B8F',
    fontFamily: Fonts.intermedium,
    fontSize: 12,
  },
  loadingTrack: {
    width: 140,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingBar: {
    width: '62%',
    height: '100%',
    backgroundColor: '#0A4B8F',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontFamily: Fonts.interregular,
    fontSize: 12,
  },
});
