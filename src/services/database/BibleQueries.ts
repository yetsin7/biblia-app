// BibleQueries.ts
// Ubicación: src/services/database/BibleQueries.ts

import { Book, SearchResult, Verse } from '../../types/Biblia';
import { databaseService } from './DatabaseService';

export class BibleQueries {
  
  // Obtener todos los libros ordenados por ID
  static async getAllBooks(): Promise<Book[]> {
    const query = `
      SELECT 
        b.id,
        b.name,
        b.abbreviation,
        b.testament_id,
        t.name as testament_name,
        COUNT(DISTINCT v.chapter) as chapters
      FROM book b
      LEFT JOIN testament t ON b.testament_id = t.id
      LEFT JOIN verse v ON b.id = v.book_id
      GROUP BY b.id, b.name, b.abbreviation, b.testament_id
      ORDER BY b.id
    `;
    
    const results = await databaseService.executeQuery<any>(query);
    
    return results.map(row => ({
      id: row.id,
      name: row.name,
      chapters: row.chapters || 0,
      testament: row.testament_id === 1 ? 'AT' : 'NT',
      abbreviation: row.abbreviation
    }));
  }

  // Obtener un libro específico por ID
  static async getBookById(bookId: number): Promise<Book | null> {
    const query = `
      SELECT 
        b.id,
        b.name,
        b.abbreviation,
        b.testament_id,
        COUNT(DISTINCT v.chapter) as chapters
      FROM book b
      LEFT JOIN verse v ON b.id = v.book_id
      WHERE b.id = ?
      GROUP BY b.id, b.name, b.abbreviation, b.testament_id
    `;
    
    const result = await databaseService.executeQueryFirst<any>(query, [bookId]);
    
    if (!result) return null;
    
    return {
      id: result.id,
      name: result.name,
      chapters: result.chapters || 0,
      testament: result.testament_id === 1 ? 'AT' : 'NT',
      abbreviation: result.abbreviation
    };
  }

  // Obtener versículos de un capítulo específico
  static async getVersesByChapter(bookId: number, chapter: number): Promise<Verse[]> {
    const query = `
      SELECT 
        v.id,
        v.book_id,
        v.chapter,
        v.verse,
        v.text,
        b.name as book_name
      FROM verse v
      JOIN book b ON v.book_id = b.id
      WHERE v.book_id = ? AND v.chapter = ?
      ORDER BY v.verse
    `;
    
    const results = await databaseService.executeQuery<any>(query, [bookId, chapter]);
    
    return results.map(row => ({
      id: row.id,
      bookId: row.book_id,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text
    }));
  }

  // Obtener información de capítulos de un libro
  static async getChaptersByBook(bookId: number): Promise<number[]> {
    const query = `
      SELECT DISTINCT chapter
      FROM verse
      WHERE book_id = ?
      ORDER BY chapter
    `;
    
    const results = await databaseService.executeQuery<any>(query, [bookId]);
    return results.map(row => row.chapter);
  }

  // Buscar versículos por texto
  static async searchVerses(searchTerm: string, limit: number = 50): Promise<SearchResult[]> {
    const query = `
      SELECT 
        v.book_id,
        v.chapter,
        v.verse,
        v.text,
        b.name as book_name,
        b.abbreviation
      FROM verse v
      JOIN book b ON v.book_id = b.id
      WHERE LOWER(v.text) LIKE LOWER(?)
      ORDER BY LENGTH(v.text) ASC, v.book_id, v.chapter, v.verse
      LIMIT ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const results = await databaseService.executeQuery<any>(query, [searchPattern, limit]);
    
    return results.map(row => ({
      bookId: row.book_id,
      book: row.book_name,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text
    }));
  }

  // Obtener versículo específico
  static async getVerse(bookId: number, chapter: number, verse: number): Promise<Verse | null> {
    const query = `
      SELECT 
        v.id,
        v.book_id,
        v.chapter,
        v.verse,
        v.text
      FROM verse v
      WHERE v.book_id = ? AND v.chapter = ? AND v.verse = ?
    `;
    
    const result = await databaseService.executeQueryFirst<any>(query, [bookId, chapter, verse]);
    
    if (!result) return null;
    
    return {
      id: result.id,
      bookId: result.book_id,
      chapter: result.chapter,
      verse: result.verse,
      text: result.text
    };
  }

  // Obtener el total de capítulos de un libro
  static async getChapterCount(bookId: number): Promise<number> {
    const query = `
      SELECT MAX(chapter) as max_chapter
      FROM verse
      WHERE book_id = ?
    `;
    
    const result = await databaseService.executeQueryFirst<any>(query, [bookId]);
    return result?.max_chapter || 0;
  }

  // Navegar al capítulo anterior
  static async getPreviousChapter(bookId: number, currentChapter: number): Promise<{bookId: number, chapter: number} | null> {
    if (currentChapter > 1) {
      return { bookId, chapter: currentChapter - 1 };
    }
    
    // Si es el primer capítulo, ir al último capítulo del libro anterior
    if (bookId > 1) {
      const prevBookId = bookId - 1;
      const maxChapter = await this.getChapterCount(prevBookId);
      return { bookId: prevBookId, chapter: maxChapter };
    }
    
    return null; // Ya estamos en Génesis 1
  }

  // Navegar al capítulo siguiente
  static async getNextChapter(bookId: number, currentChapter: number): Promise<{bookId: number, chapter: number} | null> {
    const maxChapter = await this.getChapterCount(bookId);
    
    if (currentChapter < maxChapter) {
      return { bookId, chapter: currentChapter + 1 };
    }
    
    // Si es el último capítulo, ir al primer capítulo del libro siguiente
    if (bookId < 66) {
      return { bookId: bookId + 1, chapter: 1 };
    }
    
    return null; // Ya estamos en Apocalipsis 22
  }
}

export default BibleQueries;