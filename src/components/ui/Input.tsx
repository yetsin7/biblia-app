// Input.tsx
// Ubicación: biblia-app/src/components/ui/Input.tsx

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle 
} from 'react-native';
import { Colors, Layout } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'outlined' | 'filled';
}

export default function Input({
  label,
  error,
  containerStyle,
  variant = 'default',
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        styles[variant],
        isFocused && styles.focused,
        error && styles.error
      ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.secondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  inputContainer: {
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background.primary,
  },
  default: {
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    backgroundColor: 'transparent',
  },
  filled: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 0,
  },
  focused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: Colors.danger,
  },
  input: {
    height: Layout.heights.input,
    paddingHorizontal: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
  },
  errorText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.danger,
    marginTop: Layout.spacing.xs,
  },
});