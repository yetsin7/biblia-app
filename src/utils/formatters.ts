// formatters.ts
// Ubicación: C:\Users\ymaur\Documents\Programacion\apps-React-Native-Expo-Go\biblia-app\src/utils/formatters.ts

export const formatBookName = (name: string): string => {
  return name.trim();
};

export const formatChapterTitle = (bookName: string, chapter: number): string => {
  return `${bookName} ${chapter}`;
};

export const formatVerseReference = (
  bookName: string, 
  chapter: number, 
  verse: number
): string => {
  return `${bookName} ${chapter}:${verse}`;
};

export const formatSearchResult = (
  bookName: string,
  chapter: number,
  verse: number,
  text: string,
  maxLength: number = 100
): string => {
  const reference = formatVerseReference(bookName, chapter, verse);
  const truncatedText = text.length > maxLength 
    ? `${text.substring(0, maxLength)}...` 
    : text;
  return `${reference} - ${truncatedText}`;
};