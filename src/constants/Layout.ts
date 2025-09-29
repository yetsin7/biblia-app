// Layout.ts
// Ubicación: C:\Users\ymaur\Documents\Programacion\apps-React-Native-Expo-Go\biblia-app\src/constants/Layout.ts

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Layout = {
  window: {
    width: screenWidth,
    height: screenHeight,
  },
  
  // Espaciado estilo iOS
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Bordes redondeados
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Tamaños de fuente
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Alturas estándar
  heights: {
    header: 44,
    tabBar: 49,
    button: 48,
    input: 44,
  },
} as const;

export default Layout;