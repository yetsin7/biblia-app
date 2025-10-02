// HistoryService.ts
// Ubicación: src/services/storage/HistoryService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReadingHistoryItem {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  timestamp: number;
  lastVerse?: number;
}

export interface ReadingStats {
  totalReadings: number;
  booksRead: number;
  chaptersRead: number;
  lastReadDate: number | null;
  consecutiveDays: number;
  favoriteBook: string | null;
  totalTimeMinutes: number;
}

const HISTORY_KEY = '@biblia_history';
const STATS_KEY = '@biblia_stats';
const MAX_HISTORY_ITEMS = 100;

class HistoryService {
  // Agregar lectura al historial
  async addReading(
    bookId: number,
    bookName: string,
    chapter: number,
    lastVerse?: number
  ): Promise<void> {
    try {
      const history = await this.getHistory();

      const newItem: ReadingHistoryItem = {
        id: `${bookId}_${chapter}_${Date.now()}`,
        bookId,
        bookName,
        chapter,
        timestamp: Date.now(),
        lastVerse,
      };

      // Agregar al inicio del array
      const updatedHistory = [newItem, ...history];

      // Mantener solo los últimos MAX_HISTORY_ITEMS
      const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));

      // Actualizar estadísticas
      await this.updateStats(bookId, bookName);
    } catch (error) {
      console.error('Error agregando lectura al historial:', error);
      throw error;
    }
  }

  // Obtener historial completo
  async getHistory(): Promise<ReadingHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  // Obtener historial reciente (últimos N items)
  async getRecentHistory(limit: number = 10): Promise<ReadingHistoryItem[]> {
    try {
      const history = await this.getHistory();
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error obteniendo historial reciente:', error);
      return [];
    }
  }

  // Limpiar historial
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error limpiando historial:', error);
      throw error;
    }
  }

  // Eliminar un item específico del historial
  async removeHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error eliminando item del historial:', error);
      throw error;
    }
  }

  // Actualizar estadísticas
  private async updateStats(bookId: number, bookName: string): Promise<void> {
    try {
      const stats = await this.getStats();
      const history = await this.getHistory();

      // Calcular libros únicos leídos
      const uniqueBooks = new Set(history.map(item => item.bookId));

      // Calcular capítulos únicos leídos
      const uniqueChapters = new Set(
        history.map(item => `${item.bookId}_${item.chapter}`)
      );

      // Calcular libro favorito (más leído)
      const bookCounts: { [key: string]: number } = {};
      history.forEach(item => {
        bookCounts[item.bookName] = (bookCounts[item.bookName] || 0) + 1;
      });

      const bookKeys = Object.keys(bookCounts);
      const favoriteBook = bookKeys.length > 0
        ? Object.entries(bookCounts).reduce(
            (max, [book, count]) => count > (bookCounts[max] || 0) ? book : max,
            bookKeys[0]
          )
        : null;

      // Calcular días consecutivos
      const consecutiveDays = this.calculateConsecutiveDays(history);

      const updatedStats: ReadingStats = {
        totalReadings: history.length,
        booksRead: uniqueBooks.size,
        chaptersRead: uniqueChapters.size,
        lastReadDate: Date.now(),
        consecutiveDays,
        favoriteBook,
        totalTimeMinutes: stats.totalTimeMinutes + 5, // Estimación de 5 min por capítulo
      };

      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }

  // Obtener estadísticas
  async getStats(): Promise<ReadingStats> {
    try {
      const data = await AsyncStorage.getItem(STATS_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // Retornar estadísticas vacías por defecto
      return {
        totalReadings: 0,
        booksRead: 0,
        chaptersRead: 0,
        lastReadDate: null,
        consecutiveDays: 0,
        favoriteBook: null,
        totalTimeMinutes: 0,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalReadings: 0,
        booksRead: 0,
        chaptersRead: 0,
        lastReadDate: null,
        consecutiveDays: 0,
        favoriteBook: null,
        totalTimeMinutes: 0,
      };
    }
  }

  // Calcular días consecutivos de lectura
  private calculateConsecutiveDays(history: ReadingHistoryItem[]): number {
    if (history.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = new Set<number>();
    history.forEach(item => {
      const date = new Date(item.timestamp);
      date.setHours(0, 0, 0, 0);
      uniqueDays.add(date.getTime());
    });

    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

    let consecutive = 0;
    let expectedDate = today.getTime();

    for (const day of sortedDays) {
      if (day === expectedDate) {
        consecutive++;
        expectedDate -= 24 * 60 * 60 * 1000; // Restar un día
      } else {
        break;
      }
    }

    return consecutive;
  }

  // Resetear estadísticas
  async resetStats(): Promise<void> {
    try {
      const emptyStats: ReadingStats = {
        totalReadings: 0,
        booksRead: 0,
        chaptersRead: 0,
        lastReadDate: null,
        consecutiveDays: 0,
        favoriteBook: null,
        totalTimeMinutes: 0,
      };
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(emptyStats));
    } catch (error) {
      console.error('Error reseteando estadísticas:', error);
      throw error;
    }
  }
}

export const historyService = new HistoryService();
export default HistoryService;