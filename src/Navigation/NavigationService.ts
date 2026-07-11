import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function reset(state: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).dispatch(CommonActions.reset(state));
  }
}
