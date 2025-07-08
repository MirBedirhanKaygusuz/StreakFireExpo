import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Android gesture navigation'ı tespit eden basit hook
export const useNavigationBarHeight = () => {
  const insets = useSafeAreaInsets();
  const [hasGestureNavigation, setHasGestureNavigation] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Bottom inset 20'den büyükse gesture navigation var demektir
      setHasGestureNavigation(insets.bottom > 20);
    }
  }, [insets.bottom]);

  return {
    hasGestureNavigation,
    navigationBarHeight: Platform.OS === 'android' ? insets.bottom : 0,
  };
};
