// BookList.tsx
// Ubicación: biblia-app/src/components/biblia/BookList.tsx

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
import { Book } from '../../types/Biblia';

interface BookListProps {
  books: Book[];
  onBookPress: (book: Book) => void;
  showTestamentHeaders?: boolean;
}

export default function BookList({ 
  books, 
  onBookPress,
  showTestamentHeaders = true 
}: BookListProps) {

  const renderBook: ListRenderItem<Book> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.bookItem,
        { backgroundColor: item.testament === 'AT' 
          ? Colors.bible.oldTestament + '20' 
          : Colors.bible.newTestament + '20' 
        }
      ]}
      onPress={() => onBookPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.bookContent}>
        <Text style={styles.bookName}>{item.name}</Text>
        <Text style={styles.bookInfo}>
          {item.chapters} capítulos
        </Text>
        <View style={[
          styles.testamentBadge,
          { backgroundColor: item.testament === 'AT' 
            ? Colors.bible.oldTestament 
            : Colors.bible.newTestament 
          }
        ]}>
          <Text style={styles.testamentText}>
            {item.testament === 'AT' ? 'A.T.' : 'N.T.'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (showTestamentHeaders) {
    const oldTestamentBooks = books.filter(book => book.testament === 'AT');
    const newTestamentBooks = books.filter(book => book.testament === 'NT');

    return (
      <View style={styles.container}>
        <FlatList
          data={[
            { 
              key: 'oldTestament', 
              title: 'Antiguo Testamento', 
              books: oldTestamentBooks,
              color: Colors.bible.oldTestament
            },
            { 
              key: 'newTestament', 
              title: 'Nuevo Testamento', 
              books: newTestamentBooks,
              color: Colors.bible.newTestament
            },
          ]}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { borderBottomColor: item.color }]}>
                <Text style={[styles.sectionTitle, { color: item.color }]}>
                  {item.title}
                </Text>
                <Text style={styles.sectionCount}>
                  {item.books.length} libros
                </Text>
              </View>
              <FlatList
                data={item.books}
                renderItem={renderBook}
                keyExtractor={(book) => book.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: 2,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  bookItem: {
    marginBottom: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
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
  bookContent: {
    padding: Layout.spacing.md,
    position: 'relative',
  },
  bookName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
    paddingRight: 50, // Espacio para el badge
  },
  bookInfo: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
  },
  testamentBadge: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  testamentText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
    color: Colors.text.white,
  },
});