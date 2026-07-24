import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet } from 'react-native';
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
  const tabBarBottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 0);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarItemStyle: styles.tabBarItem,
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
          height: Platform.OS === 'ios' ? (insets.bottom > 0 ? 88 : 74) : 64 + tabBarBottomInset,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? 22 : 10) : tabBarBottomInset,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          ...theme.typography.small,
          fontFamily: Fonts.intermedium,
          marginTop: 2,
          textAlign: 'center',
        },
        tabBarButton: props => {
          const { style, children, ...restProps } = props as any;

          return (
            <Pressable
              {...restProps}
              android_ripple={{ color: 'transparent', borderless: false }}
              style={({ pressed }) => [
                styles.tabBarButton,
                style,
                {
                  opacity: pressed ? 0.72 : 1,
                  backgroundColor: 'transparent',
                },
              ]}
            >
              {children}
            </Pressable>
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

const styles = StyleSheet.create({
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabBarButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
