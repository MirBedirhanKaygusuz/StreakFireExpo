import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeFirebase } from './src/services/firebase';
import { setupNotifications } from './src/services/notifications';

const App: React.FC = () => {
  useEffect(() => {
    const initialize = async () => {
      // Initialize Firebase
      initializeFirebase();
      
      // Setup push notifications
      await setupNotifications();
    };
    
    initialize();
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
