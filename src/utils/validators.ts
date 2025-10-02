// validators.ts
// Ubicación: C:\Users\ymaur\Documents\Programacion\apps-React-Native-Expo-Go\biblia-app\src/utils/validators.ts

export const isValidBookId = (id: any): boolean => {
  return typeof id === 'number' && id > 0 && id <= 66;
};

export const isValidChapter = (chapter: any): boolean => {
  return typeof chapter === 'number' && chapter > 0;
};

export const isValidVerse = (verse: any): boolean => {
  return typeof verse === 'number' && verse > 0;
};

export const isValidSearchTerm = (term: any): boolean => {
  return typeof term === 'string' && term.trim().length >= 3;
};