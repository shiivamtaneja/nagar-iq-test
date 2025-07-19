import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import authService from './src/services/authService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the app
    initializeApp();
    
    // Listen to authentication state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const initializeApp = async () => {
    try {
      // Request notification permissions
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Notification permissions not granted');
        }
      }

      // Initialize Firebase and other services
      console.log('NagarIQ App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize app');
    }
  };

  if (isLoading) {
    // In a real app, you would show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator isAuthenticated={isAuthenticated} />
    </SafeAreaProvider>
  );
}
