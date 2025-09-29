// BookSelectionModal.tsx
// Ubicación: src/components/BookSelectionModal.tsx

import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '../constants';
import { BibleQueries } from '../services/database/BibleQueries';
import { Book } from '../types/Biblia';

interface BookSelectionModalProps {
    isVisible: boolean;
    onClose: () => void;
    currentBookId: number;
    currentChapter: number;
    onSelect: (bookId: number, bookName: string, chapter: number) => void;
}

export default function BookSelectionModal({
    isVisible,
    onClose,
    currentBookId,
    currentChapter,
    onSelect,
}: BookSelectionModalProps) {
    const [oldTestamentBooks, setOldTestamentBooks] = useState<Book[]>([]);
    const [newTestamentBooks, setNewTestamentBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedBookId, setExpandedBookId] = useState<number | null>(null);

    useEffect(() => {
        if (isVisible && oldTestamentBooks.length === 0) {
            loadBooks();
        }
        // Expandir el libro actual al abrir el modal
        if (isVisible) {
            setExpandedBookId(currentBookId);
        }
    }, [isVisible]);

    const loadBooks = async () => {
        try {
            setIsLoading(true);
            const allBooks = await BibleQueries.getAllBooks();
            
            const oldTestament = allBooks.filter(book => book.testament === 'AT');
            const newTestament = allBooks.filter(book => book.testament === 'NT');
            
            setOldTestamentBooks(oldTestament);
            setNewTestamentBooks(newTestament);
        } catch (error) {
            console.error('Error cargando libros para el modal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChapterSelect = (bookId: number, bookName: string, chapter: number) => {
        onSelect(bookId, bookName, chapter);
        onClose();
    };

    const toggleBook = (bookId: number) => {
        setExpandedBookId(expandedBookId === bookId ? null : bookId);
    };

    const renderChapters = (book: Book) => {
        const chaptersArray = Array.from({ length: book.chapters }, (_, i) => i + 1);

        return (
            <View style={styles.chaptersGrid}>
                {chaptersArray.map((chapter) => {
                    const isCurrent = book.id === currentBookId && chapter === currentChapter;
                    return (
                        <TouchableOpacity
                            key={chapter}
                            style={[
                                styles.chapterItem,
                                isCurrent && styles.chapterItemActive,
                            ]}
                            onPress={() => handleChapterSelect(book.id, book.name, chapter)}
                        >
                            <Text style={[
                                styles.chapterNumber,
                                isCurrent && styles.chapterNumberActive,
                            ]}>
                                {chapter}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderBook = (item: Book) => {
        const isExpanded = item.id === expandedBookId;
        const arrowIcon = isExpanded ? 'chevron-up' : 'chevron-down';
        const bgColor = item.testament === 'AT' ? Colors.bible.oldTestament : Colors.bible.newTestament;

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={[
                        styles.bookItem,
                        { 
                            backgroundColor: bgColor + '10', 
                            borderColor: isExpanded ? Colors.primary : Colors.border.light,
                        }
                    ]}
                    onPress={() => toggleBook(item.id)}
                >
                    <View style={styles.bookInfo}>
                        <Text style={styles.bookName}>{item.name}</Text>
                        <Text style={styles.bookChapters}>{item.chapters} capítulos</Text>
                    </View>
                    <Ionicons name={arrowIcon as any} size={24} color={Colors.primary} />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.chaptersContainer}>
                        {renderChapters(item)}
                    </View>
                )}
            </View>
        );
    };

    const renderSection = (title: string, data: Book[]) => (
        <View style={styles.section} key={title}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {data.map(renderBook)}
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Seleccionar Libro y Capítulo</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={28} color={Colors.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                    <Text style={styles.loadingText}>Cargando libros...</Text>
                                </View>
                            ) : (
                                <ScrollView contentContainerStyle={styles.listContainer}>
                                    {renderSection('Antiguo Testamento', oldTestamentBooks)}
                                    <View style={styles.separator} />
                                    {renderSection('Nuevo Testamento', newTestamentBooks)}
                                </ScrollView>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        height: '80%', // Altura del modal
        backgroundColor: Colors.background.primary,
        borderTopLeftRadius: Layout.borderRadius.xl,
        borderTopRightRadius: Layout.borderRadius.xl,
        paddingTop: Layout.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.lg,
        paddingBottom: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    title: {
        fontSize: Layout.fontSize.xl,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    closeButton: {
        padding: Layout.spacing.xs,
    },
    listContainer: {
        padding: Layout.spacing.md,
        paddingBottom: Layout.spacing.xxl,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginVertical: Layout.spacing.lg,
    },
    section: {
        marginBottom: Layout.spacing.md,
    },
    sectionTitle: {
        fontSize: Layout.fontSize.xl,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.md,
        textAlign: 'center',
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Layout.spacing.md,
        marginBottom: Layout.spacing.sm,
        borderRadius: Layout.borderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border.light,
    },
    bookInfo: {
        flex: 1,
    },
    bookName: {
        fontSize: Layout.fontSize.lg,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    bookChapters: {
        fontSize: Layout.fontSize.sm,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    chaptersContainer: {
        paddingHorizontal: Layout.spacing.sm,
        paddingVertical: Layout.spacing.md,
        backgroundColor: Colors.background.primary,
        marginBottom: Layout.spacing.sm, 
    },
    chaptersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -Layout.spacing.xs, 
    },
    chapterItem: {
        width: '18.4%', 
        aspectRatio: 1,
        margin: Layout.spacing.xs,
        backgroundColor: Colors.background.card,
        borderRadius: Layout.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border.light,
    },
    chapterItemActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chapterNumber: {
        fontSize: Layout.fontSize.md, 
        fontWeight: '600',
        color: Colors.text.primary,
    },
    chapterNumberActive: {
        color: Colors.text.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Layout.spacing.md,
        fontSize: Layout.fontSize.md,
        color: Colors.text.secondary,
    }
});