// NotesScreen.tsx
// Ubicación: src/screens/NotesScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Colors, Layout } from '../constants';
import CustomHeader from '../components/navigation/CustomHeader';
import SearchBar from '../components/ui/SearchBar';
import { notesService, Note } from '../services/storage/NotesService';

export default function NotesScreen() {
  const navigation = useNavigation<any>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const loadedNotes = await notesService.getAllNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Error cargando notas:', error);
      Alert.alert('Error', 'No se pudieron cargar las notas');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.bookName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert('Error', 'Por favor completa el título y contenido de la nota');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    try {
      await notesService.saveNote(newNote);
      await loadNotes();
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la nota');
    }
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await notesService.deleteNote(noteId);
              await loadNotes();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la nota');
            }
          }
        }
      ]
    );
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
      
      {item.verse && (
        <View style={styles.verseReference}>
          <Ionicons name="book-outline" size={16} color={Colors.primary} />
          <Text style={styles.verseReferenceText}>
            {item.bookName} {item.chapter}:{item.verseNumber}
          </Text>
        </View>
      )}
      
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      <Text style={styles.noteDate}>
        {new Date(item.date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color={Colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Sin notas aún</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primera nota tocando el botón +
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Mis Notas"
          subtitle="Apuntes y reflexiones"
          showBackButton={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Mis Notas"
        subtitle="Apuntes y reflexiones"
        showBackButton={false}
      />

      <SearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Buscar notas..."
      />

      <View style={styles.content}>
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredNotes.length === 0 && styles.emptyListContainer
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={Colors.text.white} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Nota</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Título de la nota"
              placeholderTextColor={Colors.text.secondary}
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              maxLength={50}
            />

            <TextInput
              style={styles.contentInput}
              placeholder="Escribe tu nota aquí..."
              placeholderTextColor={Colors.text.secondary}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={createNote}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: Layout.spacing.md,
  },
  emptyListContainer: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  noteTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  verseReference: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  verseReferenceText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
  },
  noteContent: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: Layout.spacing.sm,
  },
  noteDate: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: Layout.spacing.xl,
    right: Layout.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    height: 120,
    marginBottom: Layout.spacing.lg,
    backgroundColor: Colors.background.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  saveButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.white,
  },
});