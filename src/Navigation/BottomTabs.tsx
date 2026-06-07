import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../Themes';
import { ROUTES } from './RouteNames';

import { HomeScreen } from '../Screen/Dashboard/Home';
import { QuestionBankScreen } from '../Screen/QuestionBank';
import { SubjectTestsScreen } from '../Screen/SubjectTests';
import { ProfileScreen } from '../Screen/Auth/Profile';
import { PYQ } from '../Screen/Subject/PYQ';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse-outline';

          if (route.name === ROUTES.HOME) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === ROUTES.SUBJECT_TESTS) {
            iconName = focused ? 'reader' : 'reader-outline';
          } else if (route.name === ROUTES.QUESTION_BANK) {
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
          borderTopWidth: 0,
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
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
      <Tab.Screen name={ROUTES.SUBJECT_TESTS} component={SubjectTestsScreen} options={{ title: 'Tests' }} />
      <Tab.Screen name={ROUTES.QUESTION_BANK} component={QuestionBankScreen} options={{ title: 'Q.Bank' }} />
      <Tab.Screen name={ROUTES.PYQ} component={PYQ} options={{ title: 'PYQ' }} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
