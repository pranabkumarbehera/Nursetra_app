import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// The app container has a maxWidth of 600 in App.tsx, so the UI should never scale beyond that width.
const EFFECTIVE_WIDTH = Math.min(SCREEN_WIDTH, 600);

// Based on standard ~5" screen mobile device (iPhone 8 / standard Android)
// Cap the scale at 1.25 so tablet screens don't get comically large UI elements.
const scale = Math.min(EFFECTIVE_WIDTH / 375, 1.25);

export function normalize(size: number) {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
}

export function verticalScale(size: number) {
    const vScale = Math.min(SCREEN_HEIGHT / 812, 1.25);
    return Math.round(PixelRatio.roundToNearestPixel(size * vScale));
}
