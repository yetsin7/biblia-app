// Card.tsx
// Ubicación: biblia-app/src/components/ui/Card.tsx

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Layout } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md'
}: CardProps) {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone;
      case 'sm':
        return styles.paddingSm;
      case 'md':
        return styles.paddingMd;
      case 'lg':
        return styles.paddingLg;
      default:
        return styles.paddingMd;
    }
  };

  return (
    <View style={[
      styles.card,
      styles[variant],
      getPaddingStyle(),
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background.card,
  },
  default: {
    backgroundColor: Colors.background.card,
  },
  elevated: {
    backgroundColor: Colors.background.card,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Layout.spacing.sm,
  },
  paddingMd: {
    padding: Layout.spacing.md,
  },
  paddingLg: {
    padding: Layout.spacing.lg,
  },
});