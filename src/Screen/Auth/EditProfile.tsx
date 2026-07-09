import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { reset as resetNavigation } from '../../Navigation/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, theme } from '../../Themes';
import { Input } from '../../Components/inputs/Input';
import { Button } from '../../Components/buttons/Button';
import { ROUTES } from '../../Navigation/RouteNames';
import { RootState } from '../../Redux/Store';
import { getProfileRequest, updateProfileRequest, updateProfileSuccess } from '../../Redux/Reducers/ProfileReducer';
import { getProfileName } from '../../Utils/Helpers/home';
import { normalizePhone, validateEmail, validatePhone } from '../../Utils/Helpers/validation';

export const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const profileState = useSelector((state: RootState) => state.ProfileReducer);
  const profile = profileState.profileData || {};
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });

  useEffect(() => {
    dispatch(updateProfileSuccess(null));
    dispatch(getProfileRequest({}));
  }, [dispatch]);

  useEffect(() => {
    if (profileState.profileData) {
      setName(getProfileName(profileState.profileData));
      setEmail(profileState.profileData?.email || '');
      setPhone(profileState.profileData?.phone || profileState.profileData?.mobile || '');
    }
  }, [profileState.profileData]);

  useEffect(() => {
    if (!profileState.updateProfileResponse) return;
    resetNavigation({
          index: 0,
          routes: [{ name: ROUTES.MAIN_STACK }],
        });
  }, [navigation, profileState.updateProfileResponse]);

  const nameError = touched.name && !name.trim() ? 'Name is required' : '';
  const emailError = touched.email ? validateEmail(email) : '';
  const phoneError = touched.phone ? validatePhone(phone) : '';
  const isInvalid = !name.trim() || !!validateEmail(email) || !!validatePhone(phone);

  const handleSubmit = () => {
    setTouched({ name: true, email: true, phone: true });
    if (!name.trim() || validateEmail(email) || validatePhone(phone)) return;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts.shift() || name.trim();
    const lastName = nameParts.join(' ');

    dispatch(
      updateProfileRequest({
        name: name.trim(),
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        mobile: phone.trim(),
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarCard}>
            <View style={styles.avatar}>
              <Icon name="person" size={36} color={theme.colors.white} />
            </View>
            <Text style={styles.avatarTitle}>Update your details</Text>
            <Text style={styles.avatarText}>Keep your profile information accurate and up to date.</Text>
          </View>

          <Input label="Full Name" value={name} onChangeText={setName} onBlur={() => setTouched(prev => ({ ...prev, name: true }))} leftIcon="person-outline" error={nameError} />
          <Input label="Email Address" value={email} onChangeText={setEmail} onBlur={() => setTouched(prev => ({ ...prev, email: true }))} leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" error={emailError} />
          <Input label="Mobile Number" value={phone} onChangeText={(value) => setPhone(normalizePhone(value))} onBlur={() => setTouched(prev => ({ ...prev, phone: true }))} leftIcon="call-outline" keyboardType="phone-pad" error={phoneError} />

          <Button title="Save Changes" onPress={handleSubmit} style={styles.saveButton} loading={profileState.isLoading} disabled={profileState.isLoading || isInvalid} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.white, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  avatarCard: { backgroundColor: theme.colors.white, borderRadius: 20, alignItems: 'center', padding: 20, marginBottom: 18 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTitle: { color: theme.colors.text, fontFamily: Fonts.interbold, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  avatarText: { color: theme.colors.textLight, fontFamily: Fonts.interregular, fontSize: 13, textAlign: 'center' },
  saveButton: { marginTop: 8 },
});
