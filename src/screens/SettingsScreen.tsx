// Ubicación: src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Layout } from '../constants';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      <Text style={styles.text}>Próximamente podrás personalizar la app, activar notificaciones, cambiar tema y más.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  text: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
