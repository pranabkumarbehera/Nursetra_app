import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './RouteNames';

import { SplashScreen } from '../Screen/Splash';
import { OnboardingScreen } from '../Screen/Onboarding';
import { LoginScreen } from '../Screen/Auth/Login';
import { RegisterScreen } from '../Screen/Auth/Register';
import { ForgotPassword } from '../Screen/Auth/ForgotPassword';
import { OtpVerification } from '../Screen/Auth/OtpVerification';
import { ChangePassword } from '../Screen/Auth/ChangePassword';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={ROUTES.SPLASH}>
      <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
      <Stack.Screen name={ROUTES.OTP_VERIFICATION} component={OtpVerification} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePassword} />
    </Stack.Navigator>
  );
};
