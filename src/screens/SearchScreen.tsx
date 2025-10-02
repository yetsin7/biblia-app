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
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';
import { BibleQueries } from '../services/database/BibleQueries';
import { SearchResult } from '../types/Biblia';
import CustomHeader from '../components/navigation/CustomHeader'; // <-- Importado
import { useNavigation } from '@react-navigation/native'; // <-- Importado
import { DrawerNavigationProp } from '@react-navigation/drawer'; // <-- Importado

export default function SearchScreen() {
  const colors = useColors();
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
      <View style={[styles.resultItem, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultReference, { color: colors.primary }]}>
            {item.book} {item.chapter}:{item.verse}
          </Text>
          <TouchableOpacity onPress={copyVerse}>
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.resultText, { color: colors.text.primary }]}>{item.text}</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color={colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Buscar en la Biblia</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
            Ingresa una palabra o frase para buscar en todos los versículos
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Sin resultados</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
            No se encontraron versículos que contengan &quot;{searchTerm}&quot;
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* AÑADIDO: Custom Header para la barra superior */}
      <CustomHeader
        title="Búsqueda"
        subtitle="Versículos y frases"
        showBackButton={false}
      />

      {/* Barra de búsqueda (anteriormente en el top del render) */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border.light }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Buscar versículos..."
            placeholderTextColor={colors.text.secondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Botón aún disponible (opcional) */}
        <TouchableOpacity
          style={[
            styles.searchButton,
            { backgroundColor: colors.primary },
            !searchTerm.trim() && [styles.searchButtonDisabled, { backgroundColor: colors.text.tertiary }]
          ]}
          onPress={() => performSearch()}
          disabled={!searchTerm.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Text style={[styles.searchButtonText, { color: colors.text.white }]}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Resultados */}
      <View style={styles.resultsContainer}>
        {hasSearched && searchResults.length > 0 && (
          <Text style={[styles.resultsCount, { color: colors.text.secondary }]}>
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
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: Layout.heights.input,
    fontSize: Layout.fontSize.md,
    marginLeft: Layout.spacing.sm,
  },
  clearButton: { padding: Layout.spacing.xs },
  searchButton: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {},
  searchButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  resultsContainer: { flex: 1 },
  resultsCount: {
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  emptyListContainer: { flex: 1, paddingHorizontal: Layout.spacing.md },
  resultItem: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
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
  },
  resultText: {
    fontSize: Layout.fontSize.md,
    lineHeight: 22,
    marginBottom: Layout.spacing.sm,
  },
  copyButton: { flexDirection: 'row', alignItems: 'center' },
  copyButtonText: {
    marginLeft: 6,
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
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});