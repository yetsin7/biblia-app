// VerseCard.tsx
// Ubicación: biblia-app/src/components/biblia/VerseCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Layout } from '../../constants';
import { Verse } from '../../types/Biblia';

interface VerseCardProps {
  verse: Verse;
  onPress?: (verse: Verse) => void;
  showBookName?: boolean;
  highlight?: boolean;
}

export default function VerseCard({ 
  verse, 
  onPress, 
  showBookName = false,
  highlight = false 
}: VerseCardProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        highlight && styles.highlighted,
        onPress && styles.pressable
      ]}
      onPress={() => onPress?.(verse)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.verseNumber}>{verse.verse}</Text>
          {showBookName && (
            <Text style={styles.reference}>
              Capítulo {verse.chapter}
            </Text>
          )}
        </View>
        
        <Text style={styles.verseText}>{verse.text}</Text>
      </View>
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  highlighted: {
    backgroundColor: Colors.bible.highlight + '20',
    borderColor: Colors.bible.highlight,
  },
  pressable: {
    // Efecto visual cuando es presionable
  },
  content: {
    padding: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  verseNumber: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    minWidth: 28,
    textAlign: 'center',
  },
  reference: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  verseText: {
    fontSize: Layout.fontSize.md,
    lineHeight: 22,
    color: Colors.bible.verse,
    marginTop: Layout.spacing.sm,
  },
});