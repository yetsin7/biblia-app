// FavoritesService.ts
// Ubicación: src/services/storage/FavoritesService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteVerse {
  id: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  dateAdded: string;
  tags?: string[];
}

const FAVORITES_STORAGE_KEY = '@biblia_app_favorites';

class FavoritesService {
  async getAllFavorites(): Promise<FavoriteVerse[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favoritesJson) {
        return JSON.parse(favoritesJson);
      }
      return [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  }

  async saveFavorite(favorite: FavoriteVerse): Promise<void> {
    try {
      const favorites = await this.getAllFavorites();
      
      const exists = favorites.some(
        f => f.bookName === favorite.bookName && 
             f.chapter === favorite.chapter && 
             f.verse === favorite.verse
      );
      
      if (!exists) {
        const updatedFavorites = [favorite, ...favorites];
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error al guardar favorito:', error);
      throw error;
    }
  }

  async deleteFavorite(favoriteId: string): Promise<void> {
    try {
      const favorites = await this.getAllFavorites();
      const filteredFavorites = favorites.filter(f => f.id !== favoriteId);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filteredFavorites));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  }

  async updateFavoriteTags(favoriteId: string, tags: string[]): Promise<void> {
    try {
      const favorites = await this.getAllFavorites();
      const favoriteIndex = favorites.findIndex(f => f.id === favoriteId);
      
      if (favoriteIndex !== -1) {
        favorites[favoriteIndex].tags = tags;
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error al actualizar tags:', error);
      throw error;
    }
  }

  async clearAllFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar favoritos:', error);
      throw error;
    }
  }
}

export const favoritesService = new FavoritesService();
export default FavoritesService;