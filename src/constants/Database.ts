// Database.ts
// biblia-app/src/constants/Database.ts

export const DatabaseConstants = {
  name: 'biblia-rv-1960-limpia.db',
  version: 1,
  
  tables: {
    books: 'books',
    chapters: 'chapters', 
    verses: 'verses',
  },
  
  queries: {
    getAllBooks: 'SELECT * FROM books ORDER BY id',
    getBookById: 'SELECT * FROM books WHERE id = ?',
    getChaptersByBook: 'SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter',
    getVersesByChapter: 'SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse',
    searchVerses: 'SELECT * FROM verses WHERE text LIKE ? LIMIT 50',
  },
} as const;

export default DatabaseConstants;