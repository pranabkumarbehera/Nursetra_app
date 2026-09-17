import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

const mockCheck = jest.fn();
const mockStart = jest.fn();
const mockInstall = jest.fn();
const mockOpen = jest.fn();
const mockAddStatus = jest.fn();
const mockRemoveStatus = jest.fn();
const mockAddIntent = jest.fn();
const mockRemoveIntent = jest.fn();
const mockRemoveAppState = jest.fn();
let mockBuild = '4';

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: mockRemoveAppState })),
  },
  Linking: { openURL: (...args: unknown[]) => mockOpen(...args) },
  Platform: { OS: 'android' },
  Modal: 'Modal',
  Pressable: 'Pressable',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (styles: unknown) => styles, absoluteFill: {} },
}));
jest.mock('react-native-device-info', () => ({
  getBuildNumber: () => mockBuild,
  getVersion: () => '1.0.3',
}));
jest.mock('sp-react-native-in-app-updates', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    checkNeedsUpdate: (...args: unknown[]) => mockCheck(...args),
    startUpdate: (...args: unknown[]) => mockStart(...args),
    installUpdate: () => mockInstall(),
    addStatusUpdateListener: (...args: unknown[]) => mockAddStatus(...args),
    removeStatusUpdateListener: (...args: unknown[]) =>
      mockRemoveStatus(...args),
    addIntentSelectionListener: (...args: unknown[]) => mockAddIntent(...args),
    removeIntentSelectionListener: (...args: unknown[]) =>
      mockRemoveIntent(...args),
  })),
  AndroidAvailabilityStatus: { AVAILABLE: 2, DEVELOPER_TRIGGERED: 3 },
  AndroidUpdateType: { FLEXIBLE: 0, IMMEDIATE: 1 },
  AndroidInstallStatus: {
    PENDING: 1,
    DOWNLOADING: 2,
    INSTALLING: 3,
    INSTALLED: 4,
    FAILED: 5,
    CANCELED: 6,
    DOWNLOADED: 11,
  },
}));

import { AppUpdatePrompt } from '../src/Components/AppUpdatePrompt';

const available = (extra = {}) => ({
  shouldUpdate: true,
  storeVersion: '9',
  other: {
    versionCode: 9,
    updateAvailability: 2,
    isImmediateUpdateAllowed: true,
    isFlexibleUpdateAllowed: true,
    ...extra,
  },
});
let screen: ReactTestRenderer;
const mount = async () => {
  await act(async () => {
    screen = create(<AppUpdatePrompt />);
  });
};
const pressUpdate = async () => {
  const button = screen.root
    .findAllByType('Pressable' as any)
    .find(node =>
      node
        .findAllByType('Text' as any)
        .some(text => text.props.children === 'Update now'),
    )!;
  await act(async () => {
    await button.props.onPress();
  });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockBuild = '4';
  mockCheck.mockResolvedValue(available());
  mockStart.mockResolvedValue(undefined);
  mockOpen.mockResolvedValue(undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {}); // React 19 test-renderer deprecation
});
afterEach(() => {
  if (screen) act(() => screen.unmount());
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('compares Android build numbers numerically and labels known build 9 as 1.0.8', async () => {
  await mount();
  const options = mockCheck.mock.calls[0][0];
  expect(options.curVersion).toBe('4');
  expect(options.customVersionComparator('10', '9')).toBe(1);
  expect(options.customVersionComparator('4', '9')).toBe(-1);
  expect(options.customVersionComparator('9', '9')).toBe(0);
  expect(options.customVersionComparator('invalid', '9')).toBe(0);
  const output = JSON.stringify(screen.toJSON());
  expect(output).toContain('Version 1.0.8 is available.');
  expect(output).toContain('Installed version: 1.0.3.');
  expect(output).not.toContain('Version 9 is available');
});
test('does not invent a release name for an unknown build', async () => {
  mockCheck.mockResolvedValue(available({ versionCode: 14 }));
  await mount();
  expect(JSON.stringify(screen.toJSON())).toContain(
    'An update is available on Google Play.',
  );
  expect(JSON.stringify(screen.toJSON())).not.toContain(
    'Version 1.0.8 is available',
  );
});
test('refreshes eligibility and uses an allowed immediate update', async () => {
  await mount();
  await pressUpdate();
  expect(mockCheck).toHaveBeenCalledTimes(2);
  expect(mockStart).toHaveBeenCalledWith({ updateType: 1 });
  expect(mockOpen).not.toHaveBeenCalled();
});
test('uses flexible when required and installs a downloaded update only once', async () => {
  mockCheck.mockResolvedValue(available({ isImmediateUpdateAllowed: false }));
  await mount();
  await pressUpdate();
  expect(mockStart).toHaveBeenCalledWith({ updateType: 0 });
  const listener = mockAddStatus.mock.calls[0][0];
  act(() => {
    listener({ status: 11 });
    listener({ status: 11 });
  });
  expect(mockInstall).toHaveBeenCalledTimes(1);
  await act(async () => {
    jest.advanceTimersByTime(120000);
  });
  expect(mockCheck).toHaveBeenCalledTimes(2);
});
test('opens Play Store when neither native mode is allowed', async () => {
  mockCheck.mockResolvedValue(
    available({
      isImmediateUpdateAllowed: false,
      isFlexibleUpdateAllowed: false,
    }),
  );
  await mount();
  await pressUpdate();
  expect(mockStart).not.toHaveBeenCalled();
  expect(mockOpen).toHaveBeenCalledWith(
    'https://play.google.com/store/apps/details?id=com.nursetra',
  );
});
test('falls back to Play Store if native start rejects', async () => {
  mockStart.mockRejectedValue(new Error('Play failure'));
  await mount();
  await pressUpdate();
  expect(mockOpen).toHaveBeenCalledTimes(1);
});
test('does not start an update that became unavailable', async () => {
  await mount();
  mockCheck.mockResolvedValue({ ...available(), shouldUpdate: false });
  await pressUpdate();
  expect(mockStart).not.toHaveBeenCalled();
  expect(screen.root.findByType('Modal' as any).props.visible).toBe(false);
});
test('cleans listeners and does not show a prompt when checking fails', async () => {
  mockCheck.mockRejectedValue(new Error('Not owned by Play'));
  await mount();
  expect(screen.root.findByType('Modal' as any).props.visible).toBe(false);
  act(() => screen.unmount());
  expect(mockRemoveStatus).toHaveBeenCalledWith(mockAddStatus.mock.calls[0][0]);
  expect(mockRemoveIntent).toHaveBeenCalledWith(mockAddIntent.mock.calls[0][0]);
  expect(mockRemoveAppState).toHaveBeenCalled();
});

test('routes an interrupted native update to Play instead of the library unsupported resume path', async () => {
  mockCheck.mockResolvedValue({
    ...available({ updateAvailability: 3 }),
    shouldUpdate: false,
  });
  await mount();
  expect(screen.root.findByType('Modal' as any).props.visible).toBe(true);
  await pressUpdate();
  expect(mockStart).not.toHaveBeenCalled();
  expect(mockOpen).toHaveBeenCalledTimes(1);
});
test('coalesces rapid Update taps', async () => {
  await mount();
  let finish!: (value: unknown) => void;
  mockCheck.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  const button = screen.root
    .findAllByType('Pressable' as any)
    .find(node =>
      node
        .findAllByType('Text' as any)
        .some(text => text.props.children === 'Update now'),
    )!;
  await act(async () => {
    const first = button.props.onPress();
    await button.props.onPress();
    finish(available());
    await first;
  });
  expect(mockStart).toHaveBeenCalledTimes(1);
  expect(mockCheck).toHaveBeenCalledTimes(2);
});
test('keeps a retry prompt if both native update and Store opening fail', async () => {
  mockStart.mockRejectedValue(new Error('Cannot start'));
  mockOpen.mockRejectedValue(new Error('Cannot open Store'));
  await mount();
  await pressUpdate();
  expect(screen.root.findByType('Modal' as any).props.visible).toBe(true);
  expect(JSON.stringify(screen.toJSON())).toContain(
    'Unable to open Google Play. Please try again.',
  );
});
