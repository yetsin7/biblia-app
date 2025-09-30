// SearchBar.tsx
// Ubicación: src/components/ui/SearchBar.tsx

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../../constants';
import { useColors } from '../../hooks/useColors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  containerStyle,
  autoFocus = false,
}: SearchBarProps) {
  const colors = useColors();

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border.light }, containerStyle]}>
      <View style={[styles.searchInputContainer, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}>
        <Ionicons name="search" size={20} color={colors.text.secondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoFocus={autoFocus}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: Layout.heights.input,
    fontSize: Layout.fontSize.md,
    marginLeft: Layout.spacing.sm,
  },
  clearButton: {
    padding: Layout.spacing.xs,
  },
});