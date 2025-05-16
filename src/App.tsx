// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import { TransactionProvider } from './contexts/TransactionContext';
import RootNavigator from './navigation/RootNavigator';
import { COLORS } from './constants/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <TransactionProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </TransactionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
