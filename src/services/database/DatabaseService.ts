// DatabaseService.ts
// Ubicación: biblia-app/src/services/database/DatabaseService.ts

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      console.log('Iniciando configuración de base de datos...');
      
      // Método: Copiar desde assets y abrir desde documentos
      const dbName = 'biblia-rv-1960-limpia.db';
      const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
      
      // Verificar si ya existe la base de datos copiada
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      
      if (!fileInfo.exists) {
        console.log('Copiando base de datos desde assets...');
        await this.copyDatabaseFromAssets(dbPath);
      } else {
        console.log('Base de datos ya existe en documentos');
      }
      
      // Abrir la base de datos copiada
      console.log('Abriendo base de datos...');
      this.db = await SQLite.openDatabaseAsync(dbName);
      this.isInitialized = true;
      
      // Verificar estructura
      await this.verifyDatabaseStructure();
      console.log('Base de datos inicializada correctamente');
      
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
      throw error;
    }
  }

  private async copyDatabaseFromAssets(targetPath: string): Promise<void> {
    try {
      // Crear directorio SQLite si no existe
      const dbDir = `${FileSystem.documentDirectory}SQLite/`;
      const dirInfo = await FileSystem.getInfoAsync(dbDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
      }
      
      // Cargar el asset
      console.log('Cargando asset de base de datos...');
      const asset = Asset.fromModule(require('../../../assets/database/biblia-rv-1960-limpia.sqlite'));
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        throw new Error('No se pudo cargar el asset de la base de datos');
      }
      
      console.log('Asset cargado, copiando archivo...');
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: targetPath,
      });
      
      console.log('Base de datos copiada exitosamente');
      
    } catch (error) {
      console.error('Error copiando base de datos:', error);
      throw new Error(`Error copiando base de datos: ${error}`);
    }
  }

  private async verifyDatabaseStructure(): Promise<void> {
    try {
      // Obtener todas las tablas
      const tablesResult = await this.executeQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      
      const tableNames = tablesResult.map((t: any) => t.name);
      console.log('Tablas en la base de datos:', tableNames);
      
      if (tableNames.length === 0) {
        throw new Error('No se encontraron tablas en la base de datos');
      }
      
      // Verificar tabla book
      if (!tableNames.includes('book')) {
        throw new Error('Tabla book no encontrada');
      }
      
      // Contar libros
      const bookCount = await this.executeQueryFirst<{count: number}>(
        "SELECT COUNT(*) as count FROM book"
      );
      
      console.log(`Verificación exitosa: ${bookCount?.count || 0} libros encontrados`);
      
    } catch (error) {
      console.error('Error verificando estructura:', error);
      throw error;
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db || !this.isInitialized) {
      throw new Error('Base de datos no inicializada');
    }
    return this.db;
  }

  async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const db = this.getDatabase();
    try {
      const result = await db.getAllAsync(query, params);
      return result as T[];
    } catch (error) {
      console.error('Error ejecutando query:', query, error);
      throw error;
    }
  }

  async executeQueryFirst<T = any>(query: string, params: any[] = []): Promise<T | null> {
    const db = this.getDatabase();
    try {
      const result = await db.getFirstAsync(query, params);
      return result as T | null;
    } catch (error) {
      console.error('Error ejecutando query:', query, error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
export default DatabaseService;