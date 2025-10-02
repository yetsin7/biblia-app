// Ubicación: src/screens/AboutScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';

export default function AboutScreen() {
  const colors = useColors();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Acerca de Biblia RV 1960</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Versión 1.0.0</Text>
      <Text style={[styles.text, { color: colors.text.primary }]}>
        Biblia RV 1960 es una aplicación para leer la Biblia Reina Valera 1960.
        Puedes navegar por los libros, capítulos y versículos, buscar textos y acceder a tus favoritos.
      </Text>
      <Text style={[styles.text, { color: colors.text.primary }]}>
        Esta app fue desarrollada con React Native + Expo, usando navegación con Stack, Drawer y Bottom Tabs.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '500',
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  text: {
    fontSize: Layout.fontSize.md,
    marginBottom: Layout.spacing.md,
    lineHeight: 22,
  },
});