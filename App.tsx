import 'react-native-gesture-handler';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { View, StyleSheet, Dimensions } from 'react-native';

import store from './src/Redux/Store';
import { RootNavigator } from './src/Navigation';
import { AppUpdatePrompt } from './src/Components/AppUpdatePrompt';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={styles.tabletWrapper}>
          <View style={styles.appContainer}>
            <AppUpdatePrompt />
            <RootNavigator />
          </View>
        </View>
      </SafeAreaProvider>
      <Toast />
    </Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  tabletWrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Subtle gray background for tablets
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 600, // Maximum width for tablets
    backgroundColor: '#FFFFFF', // Keep app background white
    // Add subtle shadow on tablets
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: Dimensions.get('window').width > 600 ? 0.1 : 0,
    shadowRadius: Dimensions.get('window').width > 600 ? 10 : 0,
    elevation: Dimensions.get('window').width > 600 ? 5 : 0,
  }
});
