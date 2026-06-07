import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Fonts, Imagepath, theme } from '../../Themes';
import { ROUTES } from '../../Navigation/RouteNames';
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

  const progress = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const circleAnim = React.useRef(new Animated.Value(1)).current;
  const assembleAnim = React.useRef(new Animated.Value(0)).current;
  const taglineAnim = React.useRef(new Animated.Value(0)).current;
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
      Animated.spring(assembleAnim, {
        toValue: 1,
        friction: 5,
        tension: 30,
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
            timeout = setTimeout(() => {
              navigation.replace(ROUTES.ONBOARDING);
            }, 800);
          });
        });
      });
    });

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [navigation]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
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
          <Icon name={icon.name} size={icon.size} color="rgba(255,255,255,0.12)" />
        </Animated.View>
      ))}

      <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoBadge}>
          <View style={{ width: 110, height: 110 }}>
            {/* Top-Left Piece */}
            <Animated.View style={[styles.logoPiece, { top: 0, left: 0, transform: [{ translateX: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }, { translateY: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }, { rotate: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) }] }]}>
              <Image source={Imagepath.Logo} style={[styles.logo, { top: 0, left: 0 }]} resizeMode="contain" />
            </Animated.View>

            {/* Top-Right Piece */}
            <Animated.View style={[styles.logoPiece, { top: 0, left: 55, transform: [{ translateX: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }, { translateY: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }, { rotate: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] }) }] }]}>
              <Image source={Imagepath.Logo} style={[styles.logo, { top: 0, left: -55 }]} resizeMode="contain" />
            </Animated.View>

            {/* Bottom-Left Piece */}
            <Animated.View style={[styles.logoPiece, { top: 55, left: 0, transform: [{ translateX: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }, { translateY: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }, { rotate: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) }] }]}>
              <Image source={Imagepath.Logo} style={[styles.logo, { top: -55, left: 0 }]} resizeMode="contain" />
            </Animated.View>

            {/* Bottom-Right Piece */}
            <Animated.View style={[styles.logoPiece, { top: 55, left: 55, transform: [{ translateX: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }, { translateY: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }, { rotate: assembleAnim.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] }) }] }]}>
              <Image source={Imagepath.Logo} style={[styles.logo, { top: -55, left: -55 }]} resizeMode="contain" />
            </Animated.View>

            {/* Full Logo fallback to cover seams after assembly */}
            <Animated.Image source={Imagepath.Logo} style={[styles.logo, { opacity: assembleAnim.interpolate({ inputRange: [0, 0.9, 1], outputRange: [0, 0, 1] }) }]} resizeMode="contain" />
          </View>
        </View>
        <Text style={styles.appName}>Nursetra</Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineAnim, transform: [{ scale: taglineAnim }] }]}>
          Empowering Nursing Aspirants for Success
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
  logoBadge: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BFE1FF',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 24,
  },
  logoPiece: {
    position: 'absolute',
    width: 55,
    height: 55,
    overflow: 'hidden',
  },
  logo: {
    position: 'absolute',
    width: 110,
    height: 110,
  },
  appName: {
    ...theme.typography.h1,
    fontFamily: Fonts.interbold,
    fontSize: 34,
    color: theme.colors.white,
    marginBottom: 10,
  },
  tagline: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    color: theme.colors.white,
    fontFamily: Fonts.intermedium,
    fontSize: 12,
  },
  loadingTrack: {
    width: 140,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.26)',
    overflow: 'hidden',
  },
  loadingBar: {
    width: '62%',
    height: '100%',
    backgroundColor: theme.colors.white,
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Fonts.interregular,
    fontSize: 12,
  },
});
