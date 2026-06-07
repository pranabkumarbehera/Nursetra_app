import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts, theme } from '../../Themes';
import { Header } from '../../Components/headers/Header';
import { ROUTES } from '../../Navigation/RouteNames';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Icon name="person" size={40} color={theme.colors.white} />
        <View style={styles.premiumBadge}>
          <Icon name="star" size={12} color={theme.colors.warning} />
        </View>
      </View>
      <Text style={styles.userName}>Priya Sharma</Text>
      <Text style={styles.userPhone}>+91 98765 43210</Text>
      <View style={styles.premiumTag}>
        <View style={styles.premiumIconWrap}>
          <Icon name="diamond-outline" size={13} color={theme.colors.warning} />
        </View>
        <Text style={styles.premiumText}>Premium Member</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>47</Text>
          <Text style={styles.statLabel}>Tests Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12d</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>#98</Text>
          <Text style={styles.statLabel}>Best Rank</Text>
        </View>
      </View>
    </View>
  );

  const handleMenuPress = (item: any) => {
    if (item.route) {
      navigation.navigate(item.route);
    }
  };

  const renderSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
            <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
              <Icon name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerBackground}>
        <Header title="" showBack={false} style={styles.header} />
        {renderProfileHeader()}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderSection('MY LEARNING', [
          { title: 'My Courses', subtitle: '3 active courses', icon: 'book', color: theme.colors.primary, bgColor: 'rgba(10, 132, 255, 0.1)' },
          { title: 'My Results', subtitle: '47 tests completed', icon: 'bar-chart', color: theme.colors.success, bgColor: 'rgba(52, 199, 89, 0.1)' },
          { title: 'Bookmarks', subtitle: '128 saved questions', icon: 'bookmark', color: theme.colors.warning, bgColor: 'rgba(255, 149, 0, 0.1)' },
          { title: 'Screen Security', subtitle: 'Screenshot, recording, PDF download and sharing blocked', icon: 'shield-checkmark', color: theme.colors.accent, bgColor: 'rgba(0, 194, 255, 0.1)' },
        ])}

        {renderSection('ACCOUNT', [
          { title: 'Edit Profile', subtitle: 'Update your name, email and phone', icon: 'create-outline', color: theme.colors.primary, bgColor: 'rgba(10, 132, 255, 0.1)', route: ROUTES.EDIT_PROFILE },
          { title: 'Change Password', subtitle: 'Keep your account secure', icon: 'lock-closed-outline', color: theme.colors.warning, bgColor: 'rgba(255, 149, 0, 0.1)', route: ROUTES.CHANGE_PASSWORD },
          { title: 'Notifications', subtitle: 'All alerts enabled', icon: 'notifications', color: theme.colors.textLight, bgColor: theme.colors.border },
          { title: 'Privacy Policy', icon: 'shield-checkmark', color: theme.colors.textLight, bgColor: theme.colors.border },
          { title: 'Help & Support', icon: 'help-buoy', color: theme.colors.textLight, bgColor: theme.colors.border },
        ])}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: ROUTES.AUTH_STACK, state: { routes: [{ name: ROUTES.ONBOARDING }] } }],
              })
            )
          }
        >
          <Icon name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBackground: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: theme.borderRadius.xlarge,
    borderBottomRightRadius: theme.borderRadius.xlarge,
  },
  header: {
    backgroundColor: 'transparent',
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: theme.spacing.m,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: 2,
  },
  userPhone: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.8,
    marginBottom: 10,
    fontSize: 13,
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  premiumText: {
    color: theme.colors.warning,
    fontFamily: Fonts.interbold,
    fontSize: 11,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '78%',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontSize: 20,
  },
  statLabel: {
    ...theme.typography.small,
    color: theme.colors.white,
    opacity: 0.8,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollContent: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xl * 2,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
    marginLeft: theme.spacing.s,
  },
  sectionContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  menuSubtitle: {
    ...theme.typography.caption,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.m,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.m,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: 'bold',
    marginLeft: theme.spacing.s,
  },
});
