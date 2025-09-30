// Ubicación: src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Configuración</Text>
      <Text style={[styles.text, { color: colors.text.primary }]}>Próximamente podrás personalizar la app, activar notificaciones, cambiar tema y más.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  text: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
  },
});