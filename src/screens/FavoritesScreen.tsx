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
import { Colors, Layout } from '../constants';
import CustomHeader from '../components/navigation/CustomHeader';
import SearchBar from '../components/ui/SearchBar';
import { favoritesService, FavoriteVerse } from '../services/storage/FavoritesService';

export default function FavoritesScreen() {
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
        style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
        onPress={() => toggleTag(tag)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
          {tag}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFavorite = ({ item }: { item: FavoriteVerse }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteHeader}>
        <View style={styles.referenceContainer}>
          <Text style={styles.reference}>
            {item.bookName} {item.chapter}:{item.verse}
          </Text>
          <Text style={styles.dateAdded}>
            {new Date(item.dateAdded).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => removeFavorite(item.id)}>
          <Ionicons name="heart" size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <Text style={styles.verseText}>{item.text}</Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagLabel}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => copyVerse(item)}
        >
          <Ionicons name="copy-outline" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Copiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => shareVerse(item)}
        >
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color={Colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
      <Text style={styles.emptySubtitle}>
        Agrega versículos a favoritos desde la pantalla de lectura
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
          <View style={styles.filtersContainer}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Filtrar por etiquetas:</Text>
              {selectedTags.length > 0 && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Limpiar</Text>
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
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
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
    color: Colors.text.primary,
  },
  clearFiltersText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
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
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  tagButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: Colors.text.white,
  },
  listContainer: {
    padding: Layout.spacing.md,
  },
  emptyListContainer: {
    flex: 1,
  },
  favoriteCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  dateAdded: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  verseText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
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
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  tagLabel: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
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
    color: Colors.primary,
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
    color: Colors.text.primary,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});