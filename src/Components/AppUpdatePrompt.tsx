import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SpInAppUpdates, {
  AndroidInstallStatus,
  AndroidUpdateType,
} from 'sp-react-native-in-app-updates';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.nursetra';
const CHECK_INTERVAL_MS = 2 * 60 * 1000;

const inAppUpdates = new SpInAppUpdates(false);

export const AppUpdatePrompt = () => {
  const [visible, setVisible] = useState(false);
  const [storeVersion, setStoreVersion] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const appState = useRef(AppState.currentState);
  const checkingUpdate = useRef(false);

  const checkForUpdate = async () => {
    if (Platform.OS !== 'android' || checkingUpdate.current) {
      return;
    }

    checkingUpdate.current = true;
    setIsChecking(true);

    try {
      const result = await inAppUpdates.checkNeedsUpdate();

      if (result.shouldUpdate) {
        setStoreVersion(result.storeVersion || '');
        setVisible(true);
      }
    } catch (error) {
      console.warn('In-app update check failed', error);
    } finally {
      checkingUpdate.current = false;
      setIsChecking(false);
    }
  };

  const startUpdate = async () => {
    setVisible(false);

    try {
      await inAppUpdates.startUpdate({
        updateType: AndroidUpdateType.FLEXIBLE,
      });
    } catch (startError) {
      console.warn('In-app update start failed', startError);

      try {
        await Linking.openURL(PLAY_STORE_URL);
      } catch (linkingError) {
        console.warn('Unable to open Play Store URL', linkingError);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const onStatusUpdate = ({ status }: { status: AndroidInstallStatus }) => {
      if (status === AndroidInstallStatus.DOWNLOADED) {
        inAppUpdates.installUpdate();
      }
    };

    inAppUpdates.addStatusUpdateListener(onStatusUpdate);
    checkForUpdate();

    const intervalId = setInterval(() => {
      if (appState.current === 'active') {
        checkForUpdate();
      }
    }, CHECK_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasInactive = /inactive|background/.test(appState.current);
      appState.current = nextAppState;

      if (wasInactive && nextAppState === 'active') {
        checkForUpdate();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
      inAppUpdates.removeStatusUpdateListener(onStatusUpdate);
    };
  }, []);

  if (Platform.OS !== 'android') {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Update available</Text>
          </View>
          <Text style={styles.title}>A newer version is ready</Text>
          <Text style={styles.message}>
            {storeVersion ? `Version ${storeVersion} is available. ` : ''}
            You can update now or skip and continue using the app.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => setVisible(false)}
              style={({ pressed }) => [styles.skipButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
            <Pressable
              onPress={startUpdate}
              disabled={isChecking}
              style={({ pressed }) => [
                styles.updateButton,
                pressed && styles.buttonPressed,
                isChecking && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.updateButtonText}>{isChecking ? 'Checking...' : 'Update now'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 10,
  },
  message: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  skipButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
  updateButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#0B5FA8',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
