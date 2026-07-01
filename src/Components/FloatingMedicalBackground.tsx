import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../Themes';

const { width, height } = Dimensions.get('window');

const ICONS = [
  'medkit-outline',
  'pulse-outline',
  'fitness-outline',
  'briefcase-outline',
  'book-outline',
  'ribbon-outline',
  'trophy-outline',
  'flask-outline',
  'school-outline',
  'document-text-outline',
  'reader-outline',
  'bandage-outline',
  'thermometer-outline',
];

const WORDS = [
  'AIIMS', 'CHO', 'Medical', 'Nursing Officer ', 'RRB Nursing Officer', 'SNO',
  'MBBS', 'NEET PG', 'Mock Test', 'PYQ', 'Success',
  'Healthcare', 'Hospital', 'Doctor', 'Nurse', 'Job'
];

interface FloatingItemProps {
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  type: 'icon' | 'text';
  content: string;
  size: number;
  opacity: number;
  driftRange: number;
}

const FloatingItem: React.FC<FloatingItemProps> = ({
  delay,
  duration,
  startX,
  startY,
  type,
  content,
  size,
  opacity,
  driftRange,
}) => {
  const transY = useRef(new Animated.Value(0)).current;
  const transX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(transY, {
            toValue: -driftRange,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(transX, {
            toValue: driftRange * 0.3,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(transY, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(transX, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        opacity,
        transform: [{ translateY: transY }, { translateX: transX }],
      }}
    >
      {type === 'icon' ? (
        <Icon name={content} size={size} color={theme.colors.primary} style={styles.glow} />
      ) : (
        <Text style={[styles.wordText, { fontSize: size, color: theme.colors.primary }]}>
          {content}
        </Text>
      )}
    </Animated.View>
  );
};

export const FloatingMedicalBackground = () => {
  // Generate random items in top 25% and bottom 30% zones
  const items = React.useMemo(() => {
    const generated: React.ReactElement[] = [];
    const numIcons = 12;
    const numWords = 10;

    const getZoneY = () => {
      // 50% chance top zone (0 to 25%), 50% chance bottom zone (70% to 95%)
      if (Math.random() > 0.5) {
        return Math.random() * (height * 0.25);
      } else {
        return height * 0.70 + Math.random() * (height * 0.25);
      }
    };

    // Icons
    for (let i = 0; i < numIcons; i++) {
      generated.push(
        <FloatingItem
          key={`icon-${i}`}
          delay={Math.random() * 4000}
          duration={6000 + Math.random() * 6000}
          startX={Math.random() * (width - 40)}
          startY={getZoneY()}
          type="icon"
          content={ICONS[Math.floor(Math.random() * ICONS.length)]}
          size={24 + Math.random() * 20}
          opacity={0.15 + Math.random() * 0.15}
          driftRange={40 + Math.random() * 60}
        />
      );
    }

    // Words
    for (let i = 0; i < numWords; i++) {
      generated.push(
        <FloatingItem
          key={`word-${i}`}
          delay={Math.random() * 4000}
          duration={8000 + Math.random() * 4000}
          startX={Math.random() * (width - 80)}
          startY={getZoneY()}
          type="text"
          content={WORDS[Math.floor(Math.random() * WORDS.length)]}
          size={14 + Math.random() * 10}
          opacity={0.1 + Math.random() * 0.15}
          driftRange={30 + Math.random() * 50}
        />
      );
    }

    return generated;
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {items}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, // Stay behind main content, but above background gradient
    overflow: 'hidden',
  },
  wordText: {
    fontFamily: Fonts.interbold,
    letterSpacing: 1,
    opacity: 0.8,
  },
  glow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  }
});
