import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { ROUTES } from '../../Navigation/RouteNames';

export const ChangePassword = () => {
  const navigation = useNavigation<any>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.AUTH_STACK, state: { routes: [{ name: ROUTES.LOGIN }] } }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Icon name="lock-closed-outline" size={28} color={theme.colors.white} />
        </View>

        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Enter your current password and set a new secure password for your account.
        </Text>

        <Input
          label="Current Password"
          placeholder="Enter current password"
          isPassword
          leftIcon="lock-closed-outline"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Input
          label="New Password"
          placeholder="Enter new password"
          isPassword
          leftIcon="key-outline"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Input
          label="Confirm New Password"
          placeholder="Re-enter new password"
          isPassword
          leftIcon="key-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button title="Submit" onPress={handleSubmit} style={styles.actionButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    ...theme.typography.h3,
     fontFamily: Fonts.interbold,
    fontSize:18,
    color:"#000000",
    fontWeight:'bold'
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 10,
  },
  title: {
    ...theme.typography.h1,
    fontFamily: Fonts.interbold,
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    marginTop: 8,
  },
});
