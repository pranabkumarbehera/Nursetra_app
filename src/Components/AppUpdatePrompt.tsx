import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { getBuildNumber, getVersion } from 'react-native-device-info';
import SpInAppUpdates, {
  AndroidAvailabilityStatus,
  AndroidInstallStatus,
  AndroidUpdateType,
  type AndroidNeedsUpdateResponse,
} from 'sp-react-native-in-app-updates';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.nursetra';
const CHECK_INTERVAL_MS = 2 * 60 * 1000;
// Play Core exposes versionCode, not the remote versionName. Only label known releases.
// Keep this mapping aligned with released Android builds; never derive a name from a code.
const RELEASE_NAMES: Record<string, string> = { '9': '1.0.8' };
let updateClient: SpInAppUpdates | undefined;
const getUpdateClient = () => (updateClient ??= new SpInAppUpdates(false));

const compareBuildCodes = (store: string, installed: string): -1 | 0 | 1 => {
  const remoteCode = Number(store);
  const localCode = Number(installed);
  if (!Number.isSafeInteger(remoteCode) || !Number.isSafeInteger(localCode))
    return 0;
  return remoteCode > localCode ? 1 : remoteCode < localCode ? -1 : 0;
};

const readUpdate = async () =>
  getUpdateClient().checkNeedsUpdate({
    curVersion: getBuildNumber(),
    customVersionComparator: compareBuildCodes,
  }) as Promise<AndroidNeedsUpdateResponse>;

export const AppUpdatePrompt = () => {
  const [visible, setVisible] = useState(false);
  const [storeVersion, setStoreVersion] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [installedVersion] = useState(() => getVersion());
  const appState = useRef(AppState.currentState);
  const checkingUpdate = useRef(false);
  const updating = useRef(false);
  const mounted = useRef(false);
  const downloaded = useRef(false);
  const downloadInProgress = useRef(false);

  const checkForUpdate = useCallback(async () => {
    if (
      Platform.OS !== 'android' ||
      checkingUpdate.current ||
      updating.current ||
      downloadInProgress.current
    )
      return;
    checkingUpdate.current = true;
    try {
      const result = await readUpdate();
      if (!mounted.current || updating.current) return;
      const resumable =
        result.other.updateAvailability ===
        AndroidAvailabilityStatus.DEVELOPER_TRIGGERED;
      setVisible(result.shouldUpdate || resumable);
      setStoreVersion(RELEASE_NAMES[String(result.other.versionCode)] || '');
      setErrorMessage('');
    } catch (error) {
      // A failed eligibility check is not evidence that an update exists.
      console.warn(
        'In-app update check failed. Verify Play installation, signing and test-track access.',
        error,
      );
    } finally {
      checkingUpdate.current = false;
    }
  }, []);

  const openStore = useCallback(async () => {
    try {
      await Linking.openURL(PLAY_STORE_URL);
      if (mounted.current) setVisible(false);
    } catch {
      if (mounted.current) {
        setErrorMessage('Unable to open Google Play. Please try again.');
        setVisible(true);
      }
    }
  }, []);

  const startUpdate = useCallback(async () => {
    if (updating.current) return;
    updating.current = true;
    setIsStarting(true);
    setErrorMessage('');
    try {
      // Refresh availability: the earlier check may no longer describe Play's current state.
      const result = await readUpdate();
      if (!mounted.current) return;
      const info = result.other;
      if (
        info.updateAvailability ===
        AndroidAvailabilityStatus.DEVELOPER_TRIGGERED
      ) {
        // This installed library rejects native startUpdate for an in-progress update.
        // Let Google Play finish it instead of repeatedly calling that unsupported path.
        await openStore();
        return;
      }
      if (!result.shouldUpdate) {
        setVisible(false);
        return;
      }
      const updateType = info.isImmediateUpdateAllowed
        ? AndroidUpdateType.IMMEDIATE
        : info.isFlexibleUpdateAllowed
        ? AndroidUpdateType.FLEXIBLE
        : null;
      if (updateType === null) {
        await openStore();
        return;
      }
      downloaded.current = false;
      downloadInProgress.current = true;
      await getUpdateClient().startUpdate({ updateType });
      if (mounted.current) setVisible(false);
    } catch (error) {
      downloadInProgress.current = false;
      console.warn('In-app update start failed; opening Google Play.', error);
      if (mounted.current) await openStore();
    } finally {
      updating.current = false;
      if (mounted.current) setIsStarting(false);
    }
  }, [openStore]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    mounted.current = true;
    const client = getUpdateClient();
    const onStatusUpdate = ({ status }: { status: AndroidInstallStatus }) => {
      if (!mounted.current) return;
      if (
        status === AndroidInstallStatus.PENDING ||
        status === AndroidInstallStatus.DOWNLOADING ||
        status === AndroidInstallStatus.INSTALLING
      ) {
        downloadInProgress.current = true;
      } else if (
        status === AndroidInstallStatus.DOWNLOADED &&
        !downloaded.current
      ) {
        downloaded.current = true;
        try {
          client.installUpdate();
        } catch {
          downloaded.current = false;
          downloadInProgress.current = false;
          setErrorMessage(
            'Unable to finish the update. Tap Update now to try Google Play.',
          );
          setVisible(true);
        }
      } else if (status === AndroidInstallStatus.FAILED) {
        downloaded.current = false;
        downloadInProgress.current = false;
        setErrorMessage('The update failed. Please try again.');
        setVisible(true);
      } else if (
        status === AndroidInstallStatus.CANCELED ||
        status === AndroidInstallStatus.INSTALLED
      ) {
        downloaded.current = false;
        downloadInProgress.current = false;
      }
    };
    // The library's intent result can arrive as a string. INSTALLED here means consent,
    // not completed installation; only cancellation resets the in-flight guard.
    const onIntentSelection: Parameters<
      SpInAppUpdates['addIntentSelectionListener']
    >[0] = result => {
      if (Number(result) === AndroidInstallStatus.CANCELED)
        downloadInProgress.current = false;
    };
    client.addIntentSelectionListener(onIntentSelection);
    client.addStatusUpdateListener(onStatusUpdate);
    void checkForUpdate();
    const intervalId = setInterval(() => {
      if (appState.current === 'active') void checkForUpdate();
    }, CHECK_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', nextAppState => {
      const wasInactive = /inactive|background/.test(appState.current);
      appState.current = nextAppState;
      if (wasInactive && nextAppState === 'active') void checkForUpdate();
    });
    return () => {
      mounted.current = false;
      clearInterval(intervalId);
      subscription.remove();
      client.removeStatusUpdateListener(onStatusUpdate);
      client.removeIntentSelectionListener(onIntentSelection);
    };
  }, [checkForUpdate]);

  if (Platform.OS !== 'android') return null;
  const dismiss = () => {
    if (!updating.current) setVisible(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={dismiss}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Update available</Text>
          </View>
          <Text style={styles.title}>A newer version is ready</Text>
          <Text style={styles.message}>
            {storeVersion
              ? `Version ${storeVersion} is available. `
              : 'An update is available on Google Play. '}
            {`Installed version: ${installedVersion}. `}
            You can update now or skip and continue using the app.
          </Text>
          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {errorMessage}
            </Text>
          ) : null}
          <View style={styles.buttonRow}>
            <Pressable
              onPress={dismiss}
              disabled={isStarting}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
            <Pressable
              onPress={startUpdate}
              disabled={isStarting}
              style={({ pressed }) => [
                styles.updateButton,
                pressed && styles.buttonPressed,
                isStarting && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.updateButtonText}>
                {isStarting ? 'Starting update...' : 'Update now'}
              </Text>
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
