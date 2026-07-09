import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '../../Components/buttons/Button';
import { ONBOARDING_DATA } from '../../Constants/dummyData';
import { Fonts, Imagepath, theme } from '../../Themes';
import { ROUTES } from '../../Navigation/RouteNames';

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;
  const sliderRef = useRef<ScrollView>(null);

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SLIDE_WIDTH = SCREEN_WIDTH - 44;

  const waveAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1.15, duration: 2500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 2500, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const floatUp = floatAnim;
  const floatDown = floatAnim.interpolate({ inputRange: [-8, 0], outputRange: [8, 0] });

  const handleNext = async () => {
    if (isLastSlide) {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      } catch (e) {}
      navigation.replace(ROUTES.LOGIN);
      return;
    }
    const nextIndex = currentIndex + 1;
    sliderRef.current?.scrollTo({ x: nextIndex * SLIDE_WIDTH, y: 0, animated: true });
    setCurrentIndex(nextIndex);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      sliderRef.current?.scrollTo({ x: prevIndex * SLIDE_WIDTH, y: 0, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SLIDE_WIDTH);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const renderHero = (slide: typeof ONBOARDING_DATA[0]) => {
    if (slide.id === '1') {
      return (
        <View style={styles.heroWrap}>
          <Animated.View style={[styles.orbitCircle1, { transform: [{ scale: waveAnim }] }]} />
          <Animated.View style={[styles.orbitCircle2, { transform: [{ scale: waveAnim }] }]} />
          <View style={styles.heroBadge}>
            <Icon name="trophy" size={60} color={theme.colors.primary} />
          </View>
          <Animated.View style={[styles.examPill, styles.pillTopLeft, { transform: [{ translateY: floatUp }] }]}><Text style={[styles.examPillText, { color: theme.colors.primary }]}>NORCET</Text></Animated.View>
          <Animated.View style={[styles.examPill, styles.pillTopRight, { transform: [{ translateY: floatDown }] }]}><Text style={[styles.examPillText, { color: '#8B5CF6' }]}>GNM</Text></Animated.View>
          <Animated.View style={[styles.examPill, styles.pillMidRight, { transform: [{ translateY: floatUp }] }]}><Text style={[styles.examPillText, { color: '#8B5CF6' }]}>B.Sc Nursing</Text></Animated.View>
          <Animated.View style={[styles.examPill, styles.pillBottomRight, { transform: [{ translateY: floatDown }] }]}><Text style={[styles.examPillText, { color: '#10B981' }]}>CHO</Text></Animated.View>
          <Animated.View style={[styles.examPill, styles.pillBottomLeft, { transform: [{ translateY: floatUp }] }]}><Text style={[styles.examPillText, { color: '#F59E0B' }]}>RRB</Text></Animated.View>
          <Animated.View style={[styles.examPill, styles.pillMidLeft, { transform: [{ translateY: floatDown }] }]}><Text style={[styles.examPillText, { color: '#10B981' }]}>ESIC</Text></Animated.View>
          <Animated.View style={[styles.examPill, { bottom: 10, alignSelf: 'center' }, { transform: [{ translateY: floatUp }] }]}><Text style={[styles.examPillText, { color: '#8B5CF6' }]}>PGIMER</Text></Animated.View>
          <Animated.View style={[styles.examPill, { bottom: 50, right: 10 }, { transform: [{ translateY: floatDown }] }]}><Text style={[styles.examPillText, { color: theme.colors.primary }]}>DSSSB</Text></Animated.View>
        </View>
      );
    }

    if (slide.id === '2') {
      return (
        <View style={styles.educatorHero}>
          <View style={styles.featuredEducator}>
            <View style={styles.educatorImageContainer}>
              <Image source={Imagepath.Slide1} style={styles.educatorPhoto} resizeMode="cover" />
            </View>
            <View style={styles.educatorBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="star" size={14} color="#FACC15" />
                <Text style={styles.educatorTag}> TOP STUDENT</Text>
              </View>
              <Text style={styles.educatorName}>Ms. Bijoylaxmi Behera</Text>
              <Text style={styles.educatorRole}>Nursing Officer · AIIMS Guwahati</Text>
              <View style={styles.educatorStats}>
                <Text style={styles.educatorChip}>₹10 LPA</Text>
                <Text style={styles.educatorChipSuccess}>Rank: 3211</Text>
              </View>
              <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                <Text style={[styles.educatorChip, { backgroundColor: '#38bdf8', color: '#fff' }]}>NORCET 9 2025</Text>
              </View>
            </View>
          </View>

          <View style={styles.educatorGrid}>
            <View style={styles.miniEducator}>
              <View style={[styles.miniAvatar, { borderColor: '#3B82F6', borderWidth: 1 }]}><Text style={[styles.miniAvatarText, { color: '#3B82F6' }]}>SN</Text></View>
              <View style={styles.miniTextWrap}>
                <Text style={styles.miniName} numberOfLines={1}>Dr. Sneha Nair</Text>
                <Text style={[styles.miniRole, { color: '#3B82F6', fontWeight: 'bold' }]}>NORCET</Text>
                <Text style={styles.miniStudents}>12K+ students</Text>
              </View>
            </View>
            <View style={styles.miniEducator}>
              <View style={[styles.miniAvatar, { borderColor: '#8B5CF6', borderWidth: 1 }]}><Text style={[styles.miniAvatarText, { color: '#8B5CF6' }]}>AK</Text></View>
              <View style={styles.miniTextWrap}>
                <Text style={styles.miniName} numberOfLines={1}>Dr. Arun Kumar</Text>
                <Text style={[styles.miniRole, { color: '#8B5CF6', fontWeight: 'bold' }]}>ESIC</Text>
                <Text style={styles.miniStudents}>8K+ students</Text>
              </View>
            </View>
            <View style={styles.miniEducator}>
              <View style={[styles.miniAvatar, { borderColor: '#10B981', borderWidth: 1 }]}><Text style={[styles.miniAvatarText, { color: '#10B981' }]}>PM</Text></View>
              <View style={styles.miniTextWrap}>
                <Text style={styles.miniName} numberOfLines={1}>Priti Mishra</Text>
                <Text style={[styles.miniRole, { color: '#10B981', fontWeight: 'bold' }]}>GNM</Text>
                <Text style={styles.miniStudents}>6K+ students</Text>
              </View>
            </View>
            <View style={styles.miniEducator}>
              <View style={[styles.miniAvatar, { borderColor: '#F59E0B', borderWidth: 1 }]}><Text style={[styles.miniAvatarText, { color: '#F59E0B' }]}>RD</Text></View>
              <View style={styles.miniTextWrap}>
                <Text style={styles.miniName} numberOfLines={1}>Rohit Das</Text>
                <Text style={[styles.miniRole, { color: '#F59E0B', fontWeight: 'bold' }]}>CHO/RRB</Text>
                <Text style={styles.miniStudents}>5K+ students</Text>
              </View>
            </View>
          </View>

          <View style={styles.bulletListGrid}>
            <View style={styles.bulletItem}><Icon name="checkmark-circle-outline" size={16} color={theme.colors.primary} /><Text style={styles.bulletText}>Live & Recorded Classes</Text></View>
            <View style={styles.bulletItem}><Icon name="checkmark-circle-outline" size={16} color={theme.colors.primary} /><Text style={styles.bulletText}>Rapid Revision Series</Text></View>
            <View style={styles.bulletItem}><Icon name="checkmark-circle-outline" size={16} color={theme.colors.primary} /><Text style={styles.bulletText}>Doubt Support</Text></View>
            <View style={styles.bulletItem}><Icon name="checkmark-circle-outline" size={16} color={theme.colors.primary} /><Text style={styles.bulletText}>Exam Strategy Sessions</Text></View>
          </View>
        </View>
      );
    }

    if (slide.id === '3') {
      return (
        <View style={styles.featureHero}>
          <View style={styles.featuredEducator}>
            <View style={[styles.educatorImageContainer, { backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' }]}>
              <Icon name="medkit" size={56} color={theme.colors.primary} />
            </View>
            <View style={styles.educatorBody}>
              <Text style={styles.educatorName}>Nursetra Premium</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' }}>
                <View style={{ alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, color: theme.colors.primary, fontWeight: 'bold' }}>1,00,000+</Text>
                  <Text style={{ fontSize: 9, color: '#64748B' }}>Students</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, color: theme.colors.primary, fontWeight: 'bold' }}>4.9★</Text>
                  <Text style={{ fontSize: 9, color: '#64748B' }}>Rating</Text>
                </View>
              </View>
              <View style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                <Text style={[styles.educatorChip, { backgroundColor: '#F0F9FF', color: theme.colors.primary, fontSize: 10 }]}>India's #1 Nursing App</Text>
              </View>
            </View>
          </View>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#F0F4F8' }]}><Icon name="videocam" size={26} color="#64748B" /></View>
              <Text style={styles.featureCardLabel}>Video Lectures</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#F0F9FF' }]}><Icon name="book" size={26} color="#0EA5E9" /></View>
              <Text style={styles.featureCardLabel}>Question Bank</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#FFFBEB' }]}><Icon name="create" size={26} color="#F59E0B" /></View>
              <Text style={styles.featureCardLabel}>Subject Tests</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#FEF2F2' }]}><Icon name="trophy" size={26} color="#EF4444" /></View>
              <Text style={styles.featureCardLabel}>Mock Tests</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#F0FDF4' }]}><Icon name="document-text" size={26} color="#10B981" /></View>
              <Text style={styles.featureCardLabel}>PYQ Papers</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#F5F3FF' }]}><Icon name="bar-chart" size={26} color="#8B5CF6" /></View>
              <Text style={styles.featureCardLabel}>Performance{'\n'}Analytics</Text>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSecurityPolicy = (slideId: string) => {
    if (slideId !== '3') {
      return null;
    }

    return (
      <View style={styles.policyCard}>
        <View style={styles.policyIconWrap}>
          <Icon name="shield-checkmark" size={16} color={theme.colors.primary} />
        </View>
        <View style={styles.policyCopy}>
          <Text style={styles.policyTitle}>Privacy & Content Policy</Text>
          <Text style={styles.policyText}>
            Screenshot and screen recording are restricted on exam-related screens to protect premium
            content and student privacy.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={async () => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        } catch (e) {}
        navigation.replace(ROUTES.LOGIN);
      }}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        ref={sliderRef}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ alignItems: 'flex-start' }}
      >
        {ONBOARDING_DATA.map((slide, index) => (
          <ScrollView
            key={slide.id}
            style={{ width: SLIDE_WIDTH }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {renderHero(slide)}

            <View style={styles.copyBlock}>
              <Text style={styles.title}>
                {slide.id === '1' ? (
                  <Text>
                    <Text style={{ fontFamily: Fonts.interbold, color: '#0F172A', fontSize: 23, fontWeight: "bold" }}>Prepare</Text>
                    <Text style={{ fontFamily: Fonts.interbold, color: '#0F172A', fontSize: 23, fontWeight: "bold" }}> for Every Nursing Exam</Text>
                  </Text>
                ) : (
                  slide.title
                )}
              </Text>
              <Text style={styles.description}>{slide.description}</Text>

              <View style={styles.pagination}>
                {ONBOARDING_DATA.map((_, dotIndex) => (
                  <View key={dotIndex} style={[styles.dot, dotIndex === currentIndex && styles.activeDot]} />
                ))}
              </View>

              {slide.id === '1' && (
                <View style={styles.badge}>
                  <Icon name="shield-checkmark" size={16} color={theme.colors.primary} />
                  <Text style={styles.badgeText}>   Trusted by 1,00,000+ Nursing Aspirants</Text>
                </View>
              )}
              {slide.id === '2' && (
                <View style={[styles.badge, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
                  <Icon name="ribbon" size={16} color="#F59E0B" />
                  <Text style={[styles.badgeText, { color: '#D97706' }]}>   Mentored by Top Govt. Rankers</Text>
                </View>
              )}
              {slide.id === '3' && (
                <View style={[styles.badge, { backgroundColor: '#F3F4F6', borderColor: '#E2E8F0' }]}>
                  <Icon name="heart" size={16} color="#EF4444" />
                  <Text style={[styles.badgeText, { color: '#475569' }]}>   Built for Nursing Aspirants Across India</Text>
                </View>
              )}

              {renderSecurityPolicy(slide.id)}
            </View>
          </ScrollView>
        ))}
      </ScrollView>

      <View style={styles.actionRow}>
        {currentIndex === 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack} activeOpacity={0.8}>
            <Icon name="chevron-back" size={18} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.secondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={currentIndex === 1 ? styles.primaryButtonHalf : styles.primaryButtonFull}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryText}>{isLastSlide ? 'Get Started' : 'Continue'}</Text>
          {isLastSlide ? (
            <Text style={{ fontSize: 16, marginLeft: 6 }}>🚀</Text>
          ) : (
            <Icon name="chevron-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EAF4FF',
  },
  skipText: {
    color: theme.colors.primary,
    fontFamily: Fonts.intersemibold,
    fontSize: 13,
  },
  heroWrap: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  orbitCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  orbitCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  heroBadge: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAF4FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  heroLogo: {
    width: 110,
    height: 110,
  },
  examPill: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examPillText: {
    fontSize: 10,
    fontFamily: Fonts.interbold,
  },
  pillTopLeft: { top: 40, left: 10 },
  pillTopRight: { top: 36, right: 15 },
  pillMidRight: { top: 90, right: 10 },
  pillBottomRight: { bottom: 90, right: 10 },
  pillBottomLeft: { bottom: 60, left: 10 },
  pillMidLeft: { top: 130, left: 5 },
  educatorHero: {
    marginTop: 18,
    gap: 12,
  },
  featuredEducator: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: 12,
    shadowColor: '#B6C9E7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  educatorImageContainer: {
    width: 110,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
  },
  educatorPhoto: {
    width: '100%',
    height: '100%',
  },
  educatorBody: {
    flex: 1,
    justifyContent: 'center',
  },
  educatorTag: {
    fontSize: 10,
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
  },
  educatorName: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.interbold,
    marginBottom: 2,
    fontWeight: "bold"
  },
  educatorRole: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.intermedium,
    marginBottom: 8,
  },
  educatorStats: {
    flexDirection: 'row',
    gap: 6,
  },
  educatorChip: {
    backgroundColor: '#EAF4FF',
    color: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontSize: 10,
    fontFamily: Fonts.interbold,
  },
  educatorChipSuccess: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontSize: 10,
    fontFamily: Fonts.interbold,
  },
  educatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  miniEducator: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontFamily: Fonts.interbold,
    fontSize: 12,
  },
  miniTextWrap: {
    flex: 1,
  },
  miniName: {
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    fontSize: 11,
    marginBottom: 1,
  },
  miniRole: {
    fontSize: 9,
    marginBottom: 2,
  },
  miniStudents: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: Fonts.intermedium,
  },
  bulletListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginTop: 4,
  },
  bulletItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletText: {
    fontSize: 12,
    color: '#334155',
    marginLeft: 6,
    fontFamily: Fonts.intersemibold,
  },
  featureHero: {
    marginTop: 18,
    gap: 14,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  featureCard: {
    width: '31%',
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureCardLabel: {
    fontSize: 10,
    fontFamily: Fonts.interbold,
    color: '#1E293B',
    textAlign: 'center',
  },
  copyBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 23,
    fontFamily: Fonts.interbold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: "bold"
  },
  description: {
    fontSize: 13,
    fontFamily: Fonts.interextrabold,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: theme.colors.primary,
    fontFamily: Fonts.interbold,
    fontSize: 11,
  },
  policyCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#DCEBFA',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  policyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  policyCopy: {
    flex: 1,
  },
  policyTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontFamily: Fonts.interbold,
    marginBottom: 3,
  },
  policyText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    fontFamily: Fonts.intermedium,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 36,
    paddingTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButton: {
    width: '30%',
    height: 56,
    backgroundColor: theme.colors.white,
    borderColor: '#E2E8F0',
    borderWidth: 1.2,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    color: '#475569',
    fontSize: 17,
    fontFamily: Fonts.intersemibold,
    fontWeight: "bold"
  },
  primaryButtonHalf: {
    width: '67%',
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryButtonFull: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryText: {
    color: theme.colors.white,
    fontSize: 17,
    fontFamily: Fonts.intersemibold,
    fontWeight: "bold"
  },
});
