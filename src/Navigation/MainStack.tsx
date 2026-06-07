import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './RouteNames';
import { BottomTabs } from './BottomTabs';
import { ResultScreen } from '../Screen/Results/ResultScreen';
import { MockTestScreen } from '../Screen/MockTests/MockTestScreen';
import { PYQ } from '../Screen/Subject/PYQ';
import { EditProfileScreen } from '../Screen/Auth/EditProfile';
import { ChangePassword } from '../Screen/Auth/ChangePassword';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.BOTTOM_TABS} component={BottomTabs} />
      <Stack.Screen name={ROUTES.MOCK_TEST_SCREEN} component={MockTestScreen} />
      <Stack.Screen name={ROUTES.PREVIOUS_YEAR_QUESTIONS} component={PYQ} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePassword} />
      <Stack.Screen name={ROUTES.RESULTS} component={ResultScreen} />
    </Stack.Navigator>
  );
};
