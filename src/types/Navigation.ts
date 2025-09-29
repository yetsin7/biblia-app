// Navigation.ts
// Ubicación: C:\Users\ymaur\Documents\Programacion\apps-React-Native-Expo-Go\biblia-app\src/types/Navigation.ts

export type RootStackParamList = {
  Books: undefined;
  Chapters: { bookId: number; bookName: string };
  Verses: { bookId: number; chapter: number; bookName: string };
  Search: undefined;
};

export type ScreenNavigationProp = any; // Definir según react-navigation