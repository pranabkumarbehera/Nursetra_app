import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fonts, theme } from '../../Themes';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';

export const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('Priya Sharma');
  const [email, setEmail] = useState('priya@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Icon name="person" size={36} color={theme.colors.white} />
          </View>
          <Text style={styles.avatarTitle}>Update your details</Text>
          <Text style={styles.avatarText}>Keep your profile information accurate and up to date.</Text>
        </View>

        <Input label="Full Name" value={name} onChangeText={setName} leftIcon="person-outline" />
        <Input label="Email Address" value={email} onChangeText={setEmail} leftIcon="mail-outline" keyboardType="email-address" />
        <Input label="Mobile Number" value={phone} onChangeText={setPhone} leftIcon="call-outline" keyboardType="phone-pad" />

        <Button title="Save Changes" onPress={() => navigation.goBack()} style={styles.saveButton} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    alignItems: 'center',
    padding: 20,
    marginBottom: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.interbold,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  avatarText: {
    color: theme.colors.textLight,
    fontFamily: Fonts.interregular,
    fontSize: 13,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 8,
  },
});
