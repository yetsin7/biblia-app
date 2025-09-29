// CustomHeader.tsx
// Ubicación: src/components/navigation/CustomHeader.tsx

import { Colors } from '../../constants/Colors';
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
  // Ya no recibimos onMenuPress
  onTitlePress, 
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  // const navigation = useNavigation<DrawerNavigationProp<any>>(); // Ya no se usa

  // Lógica simplificada: si hay showBackButton, llamamos a onBackPress.
  // Si no hay back button, la sección izquierda queda vacía (solo un padding/espacio).
  const handleLeftButtonPress = () => {
    if (showBackButton && onBackPress) {
      onBackPress();
    }
    // No hay lógica para abrir el Drawer
  };

  const LeftIcon = () => {
    if (showBackButton) {
        // Mostrar flecha de retroceso si se pide
        return <Ionicons name="arrow-back" size={24} color={Colors.text.secondary} />;
    }
    // Si no hay botón de retroceso, devolvemos null (o un espacio vacío, el TouchableOpacity lo manejará)
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        
        {/* Sección Izquierda: Solo Botón Atrás (o vacía) */}
        <View style={styles.leftSection}>
          {(showBackButton) && ( // Solo renderiza el Touchable si hay botón de retroceso
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
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
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
              <Ionicons name="search" size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onAudioPress || (() => Alert.alert('Audio', 'Función de audio próximamente'))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="volume-high" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.heights.header,
    // ¡CLAVE 1: Eliminamos el padding horizontal del contenedor principal!
    paddingHorizontal: 0, 
  },
  // Mantenemos el ancho para que el título no ocupe ese espacio si hay botón
  leftSection: {
    width: 60, 
    alignItems: 'flex-start',
    justifyContent: 'center',
    // Opcional: Si quieres que el botón invisible tenga un padding propio
    paddingLeft: Layout.spacing.md, 
  },
  centerSection: {
    flex: 1,
    alignItems: 'flex-start', 
    justifyContent: 'center',
    // ¡CLAVE 2: Aseguramos que la sección central no agregue padding extra!
    paddingLeft: 0, 
  },
  rightSection: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // Opcional: Si quieres que los botones de la derecha tengan un padding
    paddingRight: Layout.spacing.md, 
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
  },
  iconButton: {
    padding: Layout.spacing.sm,
  },
});