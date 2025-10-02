// useColors.ts
// Ubicación: src/hooks/useColors.ts

import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';

export function useColors() {
  const { theme } = useTheme();

  const colors = useMemo(() => {
    return theme === 'dark' ? DarkColors : LightColors;
  }, [theme]);

  return colors;
}