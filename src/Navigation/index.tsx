import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { ROUTES } from './RouteNames';

const RootStack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={ROUTES.AUTH_STACK}>
        <RootStack.Screen name={ROUTES.AUTH_STACK} component={AuthStack} />
        <RootStack.Screen name={ROUTES.MAIN_STACK} component={MainStack} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
