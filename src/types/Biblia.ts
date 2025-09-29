// Biblia.ts
// Ubicación: src/types/Biblia.ts

export interface Book {
  id: number;
  name: string;
  abbreviation: string;
  chapters: number;
  testament: 'AT' | 'NT';
}

export interface Chapter {
  id: number;
  bookId: number;
  chapter: number;
  verses: number;
}

export interface Verse {
  id: number;
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  bookId: number;
}

export interface Testament {
  id: number;
  name: string;
}

export interface BookAbbreviation {
  id: number;
  full_name: string;
  abbreviation: string;
  search_name: string;
  search_name_min: string;
  search_name_may: string;
}