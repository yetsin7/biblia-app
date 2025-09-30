// FavoritesScreen.tsx
// Ubicación: src/screens/FavoritesScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Share
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';
import CustomHeader from '../components/navigation/CustomHeader';
import SearchBar from '../components/ui/SearchBar';
import { favoritesService, FavoriteVerse } from '../services/storage/FavoritesService';

export default function FavoritesScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const loadedFavorites = await favoritesService.getAllFavorites();
      setFavorites(loadedFavorites);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  const getAllTags = () => {
    const allTags = favorites.flatMap(fav => fav.tags || []);
    return [...new Set(allTags)].sort();
  };

  const filteredFavorites = searchTerm
    ? favorites.filter(fav =>
        fav.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ).filter(fav =>
        selectedTags.length === 0 || fav.tags?.some(tag => selectedTags.includes(tag))
      )
    : selectedTags.length === 0
      ? favorites
      : favorites.filter(fav =>
          fav.tags?.some(tag => selectedTags.includes(tag))
        );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const removeFavorite = (favoriteId: string) => {
    Alert.alert(
      'Eliminar Favorito',
      '¿Estás seguro de que quieres eliminar este versículo de favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.deleteFavorite(favoriteId);
              await loadFavorites();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el favorito');
            }
          }
        }
      ]
    );
  };

  const copyVerse = async (favorite: FavoriteVerse) => {
    const formatted = `"${favorite.text}"\n— ${favorite.bookName} ${favorite.chapter}:${favorite.verse}`;
    await Clipboard.setStringAsync(formatted);
    Alert.alert('Copiado', 'El versículo se copió al portapapeles.');
  };

  const shareVerse = async (favorite: FavoriteVerse) => {
    const formatted = `"${favorite.text}"\n\n— ${favorite.bookName} ${favorite.chapter}:${favorite.verse}`;
    try {
      await Share.share({
        message: formatted,
        title: 'Versículo Bíblico',
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const renderTag = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    return (
      <TouchableOpacity
        key={tag}
        style={[
          styles.tagButton,
          { backgroundColor: colors.background.primary, borderColor: colors.border.light },
          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
        ]}
        onPress={() => toggleTag(tag)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.tagText,
          { color: colors.text.secondary },
          isSelected && { color: colors.text.white }
        ]}>
          {tag}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFavorite = ({ item }: { item: FavoriteVerse }) => (
    <View style={[styles.favoriteCard, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}>
      <View style={styles.favoriteHeader}>
        <View style={styles.referenceContainer}>
          <Text style={[styles.reference, { color: colors.primary }]}>
            {item.bookName} {item.chapter}:{item.verse}
          </Text>
          <Text style={[styles.dateAdded, { color: colors.text.secondary }]}>
            {new Date(item.dateAdded).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => removeFavorite(item.id)}>
          <Ionicons name="heart" size={24} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.verseText, { color: colors.text.primary }]}>{item.text}</Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.background.secondary }]}>
              <Text style={[styles.tagLabel, { color: colors.text.secondary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.actionButtons, { borderTopColor: colors.border.light }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => copyVerse(item)}
        >
          <Ionicons name="copy-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Copiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => shareVerse(item)}
        >
          <Ionicons name="share-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color={colors.text.tertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Sin favoritos aún</Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Agrega versículos a favoritos desde la pantalla de lectura
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <CustomHeader
        title="Favoritos"
        subtitle={`${filteredFavorites.length} versículos`}
        showBackButton={false}
      />

      <SearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Buscar favoritos..."
      />

      <View style={styles.content}>
        {getAllTags().length > 0 && (
          <View style={[styles.filtersContainer, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border.light }]}>
            <View style={styles.filtersHeader}>
              <Text style={[styles.filtersTitle, { color: colors.text.primary }]}>Filtrar por etiquetas:</Text>
              {selectedTags.length > 0 && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Limpiar</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.tagsFilterContainer}>
              {getAllTags().map(renderTag)}
            </View>
          </View>
        )}

        <FlatList
          data={filteredFavorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredFavorites.length === 0 && styles.emptyListContainer
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  filtersTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  clearFiltersText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  tagsFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
  },
  tagButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
  },
  listContainer: {
    padding: Layout.spacing.md,
  },
  emptyListContainer: {
    flex: 1,
  },
  favoriteCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  referenceContainer: {
    flex: 1,
  },
  reference: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    marginBottom: Layout.spacing.xs,
  },
  dateAdded: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '500',
  },
  verseText: {
    fontSize: Layout.fontSize.md,
    lineHeight: 24,
    marginBottom: Layout.spacing.md,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.xs,
  },
  tag: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  tagLabel: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  actionButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
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
  },
  emptySubtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});