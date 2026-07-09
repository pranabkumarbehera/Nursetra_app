import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './RouteNames';
import { BottomTabs } from './BottomTabs';
import { ResultScreen } from '../Screen/Results/ResultScreen';
import { MyResultsScreen } from '../Screen/Results/MyResultsScreen';
import { MockTestScreen } from '../Screen/MockTests/MockTestScreen';
import MockTestRulesScreen from '../Screen/MockTestRules/MockTestRulesScreen';
import MockTestQuestionScreen from '../Screen/MockTestQuestion/MockTestQuestionScreen';
import { PYQ } from '../Screen/Subject/PYQ';
import { EditProfileScreen } from '../Screen/Auth/EditProfile';
import { ChangePassword } from '../Screen/Auth/ChangePassword';
import { CoursesPaymentHistoryScreen } from '../Screen/CoursesPaymentHistoryScreen/CoursesPaymentHistoryScreen';
import { AboutUsScreen } from '../Screen/Legal/AboutUs';
import { PrivacyPolicyScreen } from '../Screen/Legal/PrivacyPolicy';
import { TermsConditionsScreen } from '../Screen/Legal/TermsConditions';

const Stack = createNativeStackNavigator();



export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.BOTTOM_TABS} component={BottomTabs} />
      <Stack.Screen name={ROUTES.MOCK_TEST_SCREEN} component={MockTestScreen} />
      <Stack.Screen name={ROUTES.MOCK_TEST_RULES} component={MockTestRulesScreen} />
      <Stack.Screen name={ROUTES.MOCK_TEST_QUESTION} component={MockTestQuestionScreen} />
      <Stack.Screen name={ROUTES.PREVIOUS_YEAR_QUESTIONS} component={PYQ} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePassword} />
      <Stack.Screen name={ROUTES.RESULTS} component={ResultScreen} />
      <Stack.Screen name={ROUTES.MY_RESULTS} component={MyResultsScreen} />
      <Stack.Screen name={ROUTES.COURSES_PAYMENT_HISTORY} component={CoursesPaymentHistoryScreen} />
      <Stack.Screen name={ROUTES.ABOUT_US} component={AboutUsScreen} />
      <Stack.Screen name={ROUTES.PRIVACY_POLICY} component={PrivacyPolicyScreen} />
      <Stack.Screen name={ROUTES.TERMS_CONDITIONS} component={TermsConditionsScreen} />
    </Stack.Navigator>
  );
};
