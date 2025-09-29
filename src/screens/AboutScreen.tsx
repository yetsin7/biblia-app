// Ubicación: src/screens/AboutScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Layout } from '../constants';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Acerca de Biblia RV 1960</Text>
      <Text style={styles.subtitle}>Versión 1.0.0</Text>
      <Text style={styles.text}>
        Biblia RV 1960 es una aplicación para leer la Biblia Reina Valera 1960. 
        Puedes navegar por los libros, capítulos y versículos, buscar textos y acceder a tus favoritos.
      </Text>
      <Text style={styles.text}>
        Esta app fue desarrollada con React Native + Expo, usando navegación con Stack, Drawer y Bottom Tabs.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
    backgroundColor: Colors.background.primary,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  text: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    lineHeight: 22,
  },
});
