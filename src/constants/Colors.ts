// Colors.ts
// Ubicación: src/constants/Colors.ts

export const Colors = {
  // Colores principales - estilo moderno y elegante
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  
  // Colores de texto - mejorada legibilidad
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    white: '#FFFFFF',
    inverse: '#FFFFFF',
  },
  
  // Colores de fondo - más suaves y elegantes
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#E5E5EA',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  
  // Colores de borde - más sutiles
  border: {
    light: '#E5E5EA',
    medium: '#C7C7CC',
    dark: '#8E8E93',
    primary: '#007AFF',
  },
  
  // Colores específicos de la app - mejorados
  bible: {
    oldTestament: '#8B4513',
    newTestament: '#4682B4',
    verse: '#1C1C1E',
    highlight: '#FFEB3B',
    selected: '#007AFF',
  },
  
  // Estados interactivos
  interactive: {
    pressed: 'rgba(0, 122, 255, 0.1)',
    hover: 'rgba(0, 122, 255, 0.05)',
    disabled: '#C7C7CC',
  },
  
  // Sombras y elevaciones
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.15)',
  },
} as const;

export default Colors;