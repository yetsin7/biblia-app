// MoreScreen.tsx
// Ubicación: src/screens/MoreScreen.tsx

import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import CustomHeader from '../components/navigation/CustomHeader';
import { Layout } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../hooks/useColors';

interface MenuItem {
  title: string;
  subtitle?: string;
  targetScreen?: string;
  action?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

export default function MoreScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { theme, toggleTheme } = useTheme();
  const colors = useColors();

  const handleNavigate = (screenName: string) => {
    (navigation as any).navigate(screenName);
  };

  const handleVersion = () => {
    Alert.alert(
      'Biblia RV 1960',
      'Versión 1.0.0\n\nDesarrollada con React Native + Expo\n\n© 2024',
      [{ text: 'Cerrar', style: 'default' }]
    );
  };

  const menuSections = [
    {
      title: 'Lectura',
      items: [
        {
          title: 'Historial',
          subtitle: 'Ver lecturas recientes',
          targetScreen: 'History',
        },
        {
          title: 'Estadísticas',
          subtitle: 'Progreso de lectura',
          targetScreen: 'Stats',
        },
        {
          title: 'Planes',
          subtitle: 'Organiza tu estudio',
          action: () => Alert.alert('Próximamente', 'Planes de lectura disponibles pronto.'),
        },
      ],
    },
    {
      title: 'Guardado',
      items: [
        {
          title: 'Favoritos',
          subtitle: 'Versículos guardados',
          targetScreen: 'Favorites',
        },
        {
          title: 'Notas',
          subtitle: 'Tus apuntes',
          targetScreen: 'Notes',
        },
      ],
    },
    {
      title: 'Apariencia',
      items: [
        {
          title: 'Tema Oscuro',
          subtitle: theme === 'dark' ? 'Activado' : 'Desactivado',
          isSwitch: true,
          switchValue: theme === 'dark',
          onSwitchChange: toggleTheme,
        },
      ],
    },
    {
      title: 'Información',
      items: [
        {
          title: 'Configuración',
          targetScreen: 'Settings',
        },
        {
          title: 'Acerca de',
          targetScreen: 'About',
        },
        {
          title: 'Versión',
          subtitle: '1.0.0',
          action: handleVersion,
        },
      ],
    },
  ];

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItem, { backgroundColor: colors.background.card, borderBottomColor: colors.border.light }]}
      onPress={
        item.isSwitch
          ? undefined
          : item.action || (() => item.targetScreen && handleNavigate(item.targetScreen))
      }
      activeOpacity={item.isSwitch ? 1 : 0.6}
      disabled={item.isSwitch}
    >
      <View style={styles.itemLeft}>
        <Text style={[styles.menuTitle, { color: colors.text.primary }]}>{item.title}</Text>
        {item.subtitle && !item.isSwitch && (
          <Text style={[styles.menuSubtitle, { color: colors.text.secondary }]}>
            {item.subtitle}
          </Text>
        )}
      </View>

      {item.isSwitch ? (
        <Switch
          value={item.switchValue}
          onValueChange={item.onSwitchChange}
          trackColor={{ false: colors.border.medium, true: colors.primary }}
          thumbColor={colors.background.card}
        />
      ) : (
        <Text style={[styles.chevron, { color: colors.text.tertiary }]}>›</Text>
      )}
    </TouchableOpacity>
  );

  const renderSection = (section: { title: string; items: MenuItem[] }) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        {section.title.toUpperCase()}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}>
        {section.items.map(renderItem)}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <CustomHeader
        title="Más"
        subtitle="Opciones y configuración"
        showBackButton={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map(renderSection)}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            Biblia Reina Valera 1960
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Layout.spacing.lg,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Layout.spacing.sm,
    marginHorizontal: Layout.spacing.lg,
  },
  sectionContent: {
    marginHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '400',
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingTop: Layout.spacing.xl,
    paddingBottom: Layout.spacing.lg,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});