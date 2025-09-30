// CustomHeader.tsx
// Ubicación: src/components/navigation/CustomHeader.tsx

import { Layout } from '../../constants/Layout';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';
// Ya no necesitamos 'DrawerNavigationProp' ni 'useNavigation' para abrir el Drawer
// import { DrawerNavigationProp } from '@react-navigation/drawer'; 
// import { useNavigation } from '@react-navigation/native';

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  onSearchPress?: () => void;
  onAudioPress?: () => void; 
  showBackButton?: boolean;
  onBackPress?: () => void;
  // Se elimina onMenuPress ya que no lo usaremos.
  onTitlePress?: () => void;
}

export default function CustomHeader({
  title,
  subtitle,
  onSearchPress,
  onAudioPress,
  showBackButton = false,
  onBackPress,
  onTitlePress,
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const handleLeftButtonPress = () => {
    if (showBackButton && onBackPress) {
      onBackPress();
    }
  };

  const LeftIcon = () => {
    if (showBackButton) {
      return <Ionicons name="arrow-back" size={24} color={colors.text.secondary} />;
    }
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background.card, borderBottomColor: colors.border.light }]}>
      <View style={styles.content}>

        {/* Sección Izquierda: Solo Botón Atrás (o vacía) */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleLeftButtonPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LeftIcon />
            </TouchableOpacity>
          )}
        </View>

        {/* Sección Central: Título y Subtítulo */}
        <TouchableOpacity
          style={styles.centerSection}
          onPress={onTitlePress}
          disabled={!onTitlePress}
        >
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.text.secondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </TouchableOpacity>

        {/* Sección Derecha: Buscar y Audio */}
        <View style={styles.rightSection}>
          {onSearchPress && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onSearchPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="search" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onAudioPress || (() => Alert.alert('Audio', 'Función de audio próximamente'))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="volume-high" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.heights.header,
    paddingHorizontal: 0,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  centerSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 0,
  },
  rightSection: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: Layout.fontSize.sm,
  },
  iconButton: {
    padding: Layout.spacing.sm,
  },
});