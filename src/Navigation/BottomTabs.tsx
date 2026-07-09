import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../Themes';
import { ROUTES } from './RouteNames';

import { HomeScreen } from '../Screen/Dashboard/Home';
import { SubjectTestsScreen } from '../Screen/SubjectTests';
import { ProfileScreen } from '../Screen/Auth/Profile';
import { CourseScreen } from '../Screen/CoursesScreen/CoursesScreen';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'ellipse-outline';

          if (route.name === ROUTES.HOME) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === ROUTES.SUBJECT_TESTS) {
            iconName = focused ? 'reader' : 'reader-outline';
          } else if (route.name === ROUTES.COURSE_SCREEN) {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === ROUTES.PYQ) {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === ROUTES.PROFILE) {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? (insets.bottom > 0 ? 88 : 74) : 68 + (insets.bottom > 0 ? insets.bottom : 8),
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? 25 : 10) : (insets.bottom > 0 ? insets.bottom : 8),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          ...theme.typography.small,
          fontFamily: Fonts.intermedium,
          marginTop: 4,
        },
        tabBarButton: props => {
          const { style, ...restProps } = props as any;

          return (
            <Pressable
              {...restProps}
              android_ripple={{ color: 'transparent', borderless: false }}
              style={({ pressed }) => [
                style,
                {
                  opacity: 1,
                  backgroundColor: '#FFFFFF',
                },
                Platform.OS === 'ios' && pressed ? { opacity: 1 } : null,
              ]}
            />
          );
        },
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name={ROUTES.SUBJECT_TESTS} component={SubjectTestsScreen} options={{ title: 'Mock Bank ' }} />
      <Tab.Screen name={ROUTES.COURSE_SCREEN} component={CourseScreen} options={{ title: 'Subject Bank' }} />
      {/* <Tab.Screen name={ROUTES.PYQ} component={PYQ} options={{ title: 'PYQ' }} /> */}
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            const state = navigation.getState();
            const currentRoute = state.routes[state.index];
            if (currentRoute?.name === route.name) {
              e.preventDefault();
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};
