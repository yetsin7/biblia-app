// Ubicación: src/screens/HistoryScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Colors, Layout } from '../constants';
import { RootStackParamList } from '../navigation/AppNavigator';

type HistoryScreenProps = StackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  return (
    <View style={styles.container}>
      {/* ELIMINADO: CustomHeader. Ahora se renderiza por AppNavigator.tsx */}

      <View style={styles.content}>
        <Text style={styles.title}>Función de Historial</Text>
        <Text style={styles.subtitle}>Aquí se mostrará tu registro de lectura.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});