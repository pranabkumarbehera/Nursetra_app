import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../Themes';
import { Header } from '../../Components/headers/Header';

export const AllMock = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="All Mock Tests" />
      <View style={styles.content}>
        <Text style={styles.text}>Mock Tests will be displayed here.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.l,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
});
