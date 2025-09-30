// Colors.ts
// Ubicación: src/constants/Colors.ts

export const LightColors = {
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

export const DarkColors = {
  // Colores principales - ajustados para modo oscuro
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',

  // Colores de texto - modo oscuro
  text: {
    primary: '#FFFFFF',
    secondary: '#98989D',
    tertiary: '#48484A',
    white: '#FFFFFF',
    inverse: '#1C1C1E',
  },

  // Colores de fondo - modo oscuro
  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    card: '#1C1C1E',
    elevated: '#2C2C2E',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Colores de borde - modo oscuro
  border: {
    light: '#38383A',
    medium: '#48484A',
    dark: '#636366',
    primary: '#0A84FF',
  },

  // Colores específicos de la app - modo oscuro
  bible: {
    oldTestament: '#D2691E',
    newTestament: '#6495ED',
    verse: '#FFFFFF',
    highlight: '#FFD700',
    selected: '#0A84FF',
  },

  // Estados interactivos
  interactive: {
    pressed: 'rgba(10, 132, 255, 0.2)',
    hover: 'rgba(10, 132, 255, 0.1)',
    disabled: '#48484A',
  },

  // Sombras y elevaciones
  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    strong: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

// Exportar tema por defecto (light) como Colors para compatibilidad
export const Colors = LightColors;
export default Colors;