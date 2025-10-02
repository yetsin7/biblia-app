// NotesService.ts
// Ubicación: src/services/storage/NotesService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  verse?: string;
  date: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
}

const NOTES_STORAGE_KEY = '@biblia_app_notes';

class NotesService {
  async getAllNotes(): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (notesJson) {
        return JSON.parse(notesJson);
      }
      return [];
    } catch (error) {
      console.error('Error al obtener notas:', error);
      return [];
    }
  }

  async saveNote(note: Note): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const updatedNotes = [note, ...notes];
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error al guardar nota:', error);
      throw error;
    }
  }

  async updateNote(noteId: string, updatedNote: Partial<Note>): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const noteIndex = notes.findIndex(n => n.id === noteId);
      
      if (noteIndex !== -1) {
        notes[noteIndex] = { ...notes[noteIndex], ...updatedNote };
        await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      }
    } catch (error) {
      console.error('Error al actualizar nota:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(n => n.id !== noteId);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      throw error;
    }
  }

  async clearAllNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar notas:', error);
      throw error;
    }
  }
}

export const notesService = new NotesService();
export default NotesService;