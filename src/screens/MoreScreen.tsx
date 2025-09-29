// MoreScreen.tsx
// Ubicación: src/screens/MoreScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView,
  Alert 
} from 'react-native';
import CustomHeader from '../components/navigation/CustomHeader';
import { Colors, Layout } from '../constants';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  targetScreen?: string;
  action?: () => void;
  badge?: string;
  color?: string;
}

export default function MoreScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const handleNavigate = (screenName: string) => {
    (navigation as any).navigate(screenName); 
  };

  const handleThemeToggle = () => {
    Alert.alert(
      'Tema',
      'La función de cambio de tema estará disponible próximamente.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const handleBackup = () => {
    Alert.alert(
      'Respaldo',
      'Tus notas y favoritos se respaldan automáticamente en tu dispositivo.',
      [{ text: 'Entendido', style: 'default' }]
    );
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
      title: 'Estudio Bíblico',
      items: [
        { 
          icon: 'time-outline' as const, 
          title: 'Historial de Lectura', 
          subtitle: 'Últimos capítulos leídos',
          targetScreen: 'History' 
        },
        { 
          icon: 'stats-chart-outline' as const, 
          title: 'Estadísticas', 
          subtitle: 'Progreso de lectura',
          action: () => Alert.alert('Próximamente', 'Estadísticas de lectura disponibles pronto.')
        },
        { 
          icon: 'calendar-outline' as const, 
          title: 'Plan de Lectura', 
          subtitle: 'Organiza tu estudio diario',
          action: () => Alert.alert('Próximamente', 'Planes de lectura disponibles pronto.')
        },
      ]
    },
    {
      title: 'Personalización',
      items: [
        { 
          icon: 'color-palette-outline' as const, 
          title: 'Tema', 
          subtitle: 'Claro u oscuro',
          action: handleThemeToggle
        },
        { 
          icon: 'text-outline' as const, 
          title: 'Tamaño de Texto', 
          subtitle: 'Ajustar legibilidad',
          action: () => Alert.alert('Próximamente', 'Ajustes de texto disponibles pronto.')
        },
        { 
          icon: 'notifications-outline' as const, 
          title: 'Notificaciones', 
          subtitle: 'Recordatorios de lectura',
          action: () => Alert.alert('Próximamente', 'Configuración de notificaciones disponible pronto.')
        },
      ]
    },
    {
      title: 'Datos y Respaldo',
      items: [
        { 
          icon: 'cloud-upload-outline' as const, 
          title: 'Respaldo', 
          subtitle: 'Guardar notas y favoritos',
          action: handleBackup
        },
        { 
          icon: 'download-outline' as const, 
          title: 'Importar', 
          subtitle: 'Restaurar desde respaldo',
          action: () => Alert.alert('Próximamente', 'Función de importación disponible pronto.')
        },
      ]
    },
    {
      title: 'Ayuda y Soporte',
      items: [
        { 
          icon: 'help-circle-outline' as const, 
          title: 'Ayuda', 
          subtitle: 'Guías y preguntas frecuentes',
          action: () => Alert.alert('Ayuda', 'Para más información visita la sección de ayuda en configuración.')
        },
        { 
          icon: 'mail-outline' as const, 
          title: 'Contacto', 
          subtitle: 'Enviar comentarios',
          action: () => Alert.alert('Contacto', 'Envía tus comentarios a: contacto@bibliaapp.com')
        },
        { 
          icon: 'star-outline' as const, 
          title: 'Calificar App', 
          subtitle: 'Comparte tu experiencia',
          action: () => Alert.alert('Calificación', '¡Gracias por usar nuestra app! La calificación estará disponible próximamente.')
        },
      ]
    },
    {
      title: 'Información',
      items: [
        { 
          icon: 'settings-outline' as const, 
          title: 'Configuración', 
          subtitle: 'Ajustes generales',
          targetScreen: 'Settings' 
        },
        { 
          icon: 'information-circle-outline' as const, 
          title: 'Acerca de', 
          subtitle: 'Información de la aplicación',
          targetScreen: 'About' 
        },
        { 
          icon: 'code-outline' as const, 
          title: 'Versión', 
          subtitle: '1.0.0',
          action: handleVersion
        },
      ]
    },
  ];

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity 
      key={item.title}
      style={styles.menuItem} 
      onPress={item.action || (() => item.targetScreen && handleNavigate(item.targetScreen))}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.color || Colors.primary + '15' }]}>
          <Ionicons 
            name={item.icon} 
            size={24} 
            color={item.color || Colors.primary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.itemRight}>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: { title: string; items: MenuItem[] }) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderItem)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Más Opciones"
        subtitle="Herramientas y configuración"
        showBackButton={false}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map(renderSection)}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Biblia Reina Valera 1960
          </Text>
          <Text style={styles.footerSubtext}>
            Hecho con ❤️ para el estudio bíblico
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingVertical: Layout.spacing.md,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    marginHorizontal: Layout.spacing.md,
  },
  sectionContent: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Colors.danger,
    borderRadius: Layout.borderRadius.full,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 2,
    marginRight: Layout.spacing.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.white,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: Layout.spacing.xl,
    paddingBottom: Layout.spacing.lg,
  },
  footerText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  footerSubtext: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});