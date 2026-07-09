import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

export function reset(state: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.reset(state));
  }
}
