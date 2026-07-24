import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../Themes';
import { Header } from '../../Components/headers/Header';

export const AllMock = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]} edges={['top', 'left', 'right']}>
      <Header title="All Mock Tests" />
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom + 72, 96) }]}>
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
