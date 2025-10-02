// useDatabase.ts
// Ubicación: src/hooks/useDatabase.ts

import { useEffect, useState } from 'react';
import { databaseService } from '../services/database/DatabaseService';

interface UseDatabaseReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  initializeDatabase: () => Promise<void>;
}

export function useDatabase(): UseDatabaseReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeDatabase = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await databaseService.initialize();
      
      setIsReady(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setIsLoading(false);
      setIsReady(false);
    }
  };

  useEffect(() => {
    initializeDatabase();
    
    return () => {
      databaseService.closeDatabase();
    };
  }, []);

  return {
    isLoading,
    isReady,
    error,
    initializeDatabase,
  };
}

export default useDatabase;