// ChapterList.tsx
// Ubicación: biblia-app/src/components/biblia/ChapterList.tsx

import React from 'react';
import { 
  FlatList, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  ListRenderItem 
} from 'react-native';
import { Colors, Layout } from '../../constants';

interface ChapterListProps {
  chapters: number[];
  onChapterPress: (chapter: number) => void;
  currentChapter?: number;
}

export default function ChapterList({ 
  chapters, 
  onChapterPress,
  currentChapter 
}: ChapterListProps) {

  const renderChapter: ListRenderItem<number> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chapterItem,
        currentChapter === item && styles.currentChapter
      ]}
      onPress={() => onChapterPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.chapterNumber,
        currentChapter === item && styles.currentChapterText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.toString()}
        numColumns={4}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: Layout.spacing.md,
  },
  chapterItem: {
    flex: 1,
    margin: Layout.spacing.xs,
    minHeight: 60,
    backgroundColor: Colors.background.card,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentChapter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chapterNumber: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  currentChapterText: {
    color: Colors.text.white,
  },
  separator: {
    height: Layout.spacing.xs,
  },
});