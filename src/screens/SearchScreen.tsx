// SearchScreen.tsx
// Ubicación: src/screens/SearchScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Layout } from '../constants';
import { BibleQueries } from '../services/database/BibleQueries';
import { SearchResult } from '../types/Biblia';
import CustomHeader from '../components/navigation/CustomHeader'; // <-- Importado
import { useNavigation } from '@react-navigation/native'; // <-- Importado
import { DrawerNavigationProp } from '@react-navigation/drawer'; // <-- Importado

export default function SearchScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>(); // <-- Inicializado
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 🔎 búsqueda en vivo con debounce (300ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length >= 3) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const performSearch = async (term?: string) => {
    const query = term ?? searchTerm;
    if (query.trim().length < 3) return;

    try {
      setIsLoading(true);
      setHasSearched(true);
      const results = await BibleQueries.searchVerses(query.trim(), 50);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      Alert.alert('Error', 'Ocurrió un error al realizar la búsqueda.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const copyVerse = async () => {
      const formatted = `_"${item.text.trim()}"_\n— _*${item.book} ${item.chapter}:${item.verse}*_`;
      await Clipboard.setStringAsync(formatted);
      Alert.alert('Copiado', 'El versículo se copió al portapapeles.');
    };

    return (
      <View style={styles.resultItem}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultReference}>
            {item.book} {item.chapter}:{item.verse}
          </Text>
          <TouchableOpacity onPress={copyVerse}>
            <Ionicons name="copy-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.resultText}>{item.text}</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Buscar en la Biblia</Text>
          <Text style={styles.emptySubtitle}>
            Ingresa una palabra o frase para buscar en todos los versículos
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptySubtitle}>
            No se encontraron versículos que contengan &quot;{searchTerm}&quot;
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* AÑADIDO: Custom Header para la barra superior */}
      <CustomHeader
        title="Búsqueda"
        subtitle="Versículos y frases"
        showBackButton={false}
      />
      
      {/* Barra de búsqueda (anteriormente en el top del render) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar versículos..."
            placeholderTextColor={Colors.text.secondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Botón aún disponible (opcional) */}
        <TouchableOpacity
          style={[styles.searchButton, !searchTerm.trim() && styles.searchButtonDisabled]}
          onPress={() => performSearch()}
          disabled={!searchTerm.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.text.white} />
          ) : (
            <Text style={styles.searchButtonText}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Resultados */}
      <View style={styles.resultsContainer}>
        {hasSearched && searchResults.length > 0 && (
          <Text style={styles.resultsCount}>
            {searchResults.length} resultado
            {searchResults.length !== 1 ? 's' : ''} encontrado
            {searchResults.length !== 1 ? 's' : ''}
          </Text>
        )}

        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) => `${item.bookId}-${item.chapter}-${item.verse}-${index}`}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            searchResults.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  searchContainer: {
    flexDirection: 'row',
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchInput: {
    flex: 1,
    height: Layout.heights.input,
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    marginLeft: Layout.spacing.sm,
  },
  clearButton: { padding: Layout.spacing.xs },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: { backgroundColor: Colors.text.tertiary },
  searchButtonText: {
    color: Colors.text.white,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  resultsContainer: { flex: 1 },
  resultsCount: {
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  emptyListContainer: { flex: 1, paddingHorizontal: Layout.spacing.md },
  resultItem: {
    backgroundColor: Colors.background.card,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  resultReference: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  resultText: {
    fontSize: Layout.fontSize.md,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.sm,
  },
  copyButton: { flexDirection: 'row', alignItems: 'center' },
  copyButtonText: {
    marginLeft: 6,
    color: Colors.primary,
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});