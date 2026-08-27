import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts, Imagepath, theme } from '../../Themes';
import constants from '../../Utils/Helpers/constants';
import { ROUTES } from '../../Navigation/RouteNames';
import { tokenSuccess } from '../../Redux/Reducers/AuthReducer';
import { clearProfile } from '../../Redux/Reducers/ProfileReducer';
import { clearHomeData } from '../../Redux/Reducers/HomeReducer';
import { clearMockTestData, clearBundleFlowState, clearPaymentSession } from '../../Redux/Reducers/MockTestReducer';
import { getApi } from '../../Utils/Helpers/ApiRequest';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EXAM_CHIPS = ['NORCET', 'ESIC', 'RRB', 'DSSSB', 'PGIMER', 'JIPMER', 'AFMS', 'CHO'];

const BG_ICONS = [
  { id: '1', name: 'stethoscope', top: '15%', left: '10%', size: 42, rotate: '-15deg' },
  { id: '2', name: 'plus', top: '20%', right: '15%', size: 36, rotate: '10deg' },
  { id: '3', name: 'plus', top: '45%', left: '80%', size: 28, rotate: '45deg' },
  { id: '4', name: 'stethoscope', bottom: '35%', right: '12%', size: 38, rotate: '15deg' },
  { id: '5', name: 'plus', bottom: '25%', left: '18%', size: 44, rotate: '-20deg' },
  { id: '6', name: 'stethoscope', bottom: '15%', right: '60%', size: 26, rotate: '0deg' },
];

const DotPattern = ({ position, anim, color }: { position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', anim: Animated.Value, color: string }) => {
  const cornerScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  const getPositionStyle = () => {
    switch (position) {
      case 'topLeft': return { top: 10, left: 10 };
      case 'topRight': return { top: 10, right: 10 };
      case 'bottomLeft': return { bottom: 10, left: 10 };
      case 'bottomRight': return { bottom: 10, right: 10 };
      default: return {};
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 120,
          height: 120,
          flexDirection: 'row',
          flexWrap: 'wrap',
          zIndex: 1,
        },
        getPositionStyle(),
        { transform: [{ scale: cornerScale }] }
      ]}
    >
      {Array.from({ length: 100 }).map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;

        let distance;
        if (position === 'topRight') {
          distance = row + (9 - col);
        } else if (position === 'bottomLeft') {
          distance = (9 - row) + col;
        } else if (position === 'topLeft') {
          distance = row + col;
        } else {
          distance = (9 - row) + (9 - col);
        }

        const opacity = Math.max(0.05, 0.7 - (distance * 0.06));
        const size = Math.max(1.5, 6 - (distance * 0.35));

        return (
          <View key={i} style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }} />
          </View>
        );
      })}
    </Animated.View>
  );
};

export const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const progress = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const circleAnim = React.useRef(new Animated.Value(1)).current;
  const cornerAnim = React.useRef(new Animated.Value(0)).current;
  const taglineAnim = React.useRef(new Animated.Value(0)).current;
  const colorAnim = React.useRef(new Animated.Value(0)).current;
  const chipAnims = React.useRef(EXAM_CHIPS.map(() => new Animated.Value(0))).current;
  const iconAnims = React.useRef(BG_ICONS.map(() => new Animated.Value(0))).current;
  const textAnims = React.useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let isActive = true;

    // Animate background circles continuously
    Animated.loop(
      Animated.sequence([
        Animated.timing(circleAnim, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
        Animated.timing(circleAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(cornerAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
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

      // 3. Animate the tagline container appearing
      Animated.spring(taglineAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start(() => {
        // Animate the three words sequentially
        Animated.stagger(200, textAnims.map(anim =>
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true })
        )).start(() => {
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
              // Verify the stored token before opening the main app.
              timeout = setTimeout(async () => {
                if (!isActive) {
                  return;
                }

                const token = await AsyncStorage.getItem(constants.TOKEN);
                if (token) {
                  try {
                    const response = await getApi('auth/me', { authorization: token });
                    if (!isActive) {
                      return;
                    }

                    if (response?.data?.success === true || response?.status === 200) {
                      dispatch(tokenSuccess(token));
                      navigation.replace(ROUTES.MAIN_STACK);
                      return;
                    }
                  } catch {
                    if (!isActive) {
                      return;
                    }
                    // Let the global API interceptor handle expired sessions when possible.
                  }

                  const keysToRemove = [
                    constants.TOKEN,
                    constants.REFRESH_TOKEN,
                    constants.USER_DATA,
                    constants.SAVED_EMAIL,
                    constants.SAVED_PASSWORD,
                  ];
                  if (typeof (AsyncStorage as any).multiRemove === 'function') {
                    await (AsyncStorage as any).multiRemove(keysToRemove);
                  } else {
                    await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
                  }
                  await AsyncStorage.setItem(constants.REMEMBER_PASSWORD, 'false');
                  dispatch(tokenSuccess(null));
                  dispatch(clearProfile());
                  dispatch(clearHomeData());
                  dispatch(clearMockTestData());
                  dispatch(clearBundleFlowState());
                  dispatch(clearPaymentSession());

                  if (!isActive) {
                    return;
                  }

                  const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
                  navigation.replace(hasSeenOnboarding === 'true' ? ROUTES.LOGIN : ROUTES.ONBOARDING);
                } else {
                  const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
                  if (isActive) {
                    navigation.replace(hasSeenOnboarding === 'true' ? ROUTES.LOGIN : ROUTES.ONBOARDING);
                  }
                }
              }, 800);
            });
          });
        });
      });
    });

    return () => {
      isActive = false;
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

  const cornerScale = cornerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.06],
  });

  const cornerOpacity = cornerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.9],
  });

  return (
    <View style={styles.container}>
      <DotPattern position="topLeft" anim={cornerAnim} color="#E83D8E" />
      <DotPattern position="topRight" anim={cornerAnim} color="#0A4B8F" />
      <DotPattern position="bottomLeft" anim={cornerAnim} color="#10B981" />
      <DotPattern position="bottomRight" anim={cornerAnim} color="#F59E0B" />

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
          <Image source={Imagepath.SpalshLogo} style={styles.logo} resizeMode="contain" />
        </View>
        <Animated.View style={[styles.promoCard, { opacity: taglineAnim, transform: [{ scale: taglineAnim }] }]}>
          <View style={{ flexDirection: 'row' }}>
            <Animated.Text style={{ color: '#0084FF', fontWeight: "bold", fontFamily: Fonts.interbold, fontSize: 16, opacity: textAnims[0], transform: [{ translateY: textAnims[0].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>Learn. </Animated.Text>
            <Animated.Text style={{ color: '#111827', fontWeight: "bold", fontFamily: Fonts.interbold, fontSize: 16, opacity: textAnims[1], transform: [{ translateY: textAnims[1].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>Succeed. </Animated.Text>
            <Animated.Text style={{ color: '#0084FF', fontWeight: "bold", fontFamily: Fonts.interbold, fontSize: 16, opacity: textAnims[2], transform: [{ translateY: textAnims[2].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>Get Hired.</Animated.Text>
          </View>
          {/* <Text style={styles.promoSubtitle}>
            Purchase any course once and enjoy unlimited premium access forever. No renewals. No expiry.
          </Text> */}
        </Animated.View>
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
    width: 220,
    height: 220,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  appName: {
    ...theme.typography.h1,
    fontFamily: Fonts.interbold,
    fontSize: 34,
    color: '#0A4B8F',
    marginBottom: 10,
  },
  promoCard: {
    // marginTop: 6,
    paddingHorizontal: 18,
    // paddingVertical: 14,
    borderRadius: 18,
    // backgroundColor: 'rgba(11, 95, 168, 0.08)',
    // borderWidth: 1,
    // borderColor: 'rgba(11, 95, 168, 0.14)',
    alignItems: 'center',
  },
  promoTitle: {
    ...theme.typography.body,
    color: '#0A4B8F',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    fontFamily: Fonts.interbold,
    marginBottom: 6,
  },
  promoSubtitle: {
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    fontFamily: Fonts.intermedium,
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
