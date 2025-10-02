// App.tsx
// Ubicación: biblia-app/App.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation/AppNavigator';
import { useDatabase } from './src/hooks/useDatabase';
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  const { isLoading, isReady, error } = useDatabase();

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <StatusBar style="dark" />
          <Text style={styles.loadingTitle}>📖 Biblia RV 1960</Text>
          <Text style={styles.loadingText}>Inicializando base de datos...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (error || !isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <StatusBar style="dark" />
          <Text style={styles.errorTitle}>⚠️ Error</Text>
          <Text style={styles.errorText}>
            {error || 'No se pudo inicializar la base de datos'}
          </Text>
          <Text style={styles.errorHint}>
            Asegúrate de que el archivo biblia-rv-1960-limpia.sqlite esté en assets/database/
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});