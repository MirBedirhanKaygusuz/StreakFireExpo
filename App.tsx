import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeSupabase } from './src/services/supabase';
import { notificationService } from './src/services/notificationService';

// Redux Provider içinde çalışacak iç bileşen
const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Supabase oturum dinleyicisi başlat
    const unsubscribe = initializeSupabase(dispatch);
    
    // Bildirim ayarları
    const setupNotifications = async () => {
      await notificationService.requestPermissions();
    };
    
    setupNotifications();
    
    // Temizlik
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

// Ana uygulama bileşeni
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
