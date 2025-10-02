// Database.ts
// Ubicación: C:\Users\ymaur\Documents\Programacion\apps-React-Native-Expo-Go\biblia-app\src/types/Database.ts

export interface DatabaseConfig {
  name: string;
  version: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  insertId?: number;
  rowsAffected: number;
}

export interface Database {
  isReady: boolean;
  error: string | null;
}