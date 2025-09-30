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
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';
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
    const colors = useColors();
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
                                {
                                    backgroundColor: isCurrent ? colors.primary : colors.background.card,
                                    borderColor: isCurrent ? colors.primary : colors.border.light,
                                }
                            ]}
                            onPress={() => handleChapterSelect(book.id, book.name, chapter)}
                        >
                            <Text style={[
                                styles.chapterNumber,
                                { color: isCurrent ? colors.text.white : colors.text.primary }
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
        const bgColor = item.testament === 'AT' ? colors.bible.oldTestament : colors.bible.newTestament;

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={[
                        styles.bookItem,
                        {
                            backgroundColor: bgColor + '10',
                            borderColor: isExpanded ? colors.primary : colors.border.light,
                        }
                    ]}
                    onPress={() => toggleBook(item.id)}
                >
                    <View style={styles.bookInfo}>
                        <Text style={[styles.bookName, { color: colors.text.primary }]}>{item.name}</Text>
                        <Text style={[styles.bookChapters, { color: colors.text.secondary }]}>{item.chapters} capítulos</Text>
                    </View>
                    <Ionicons name={arrowIcon as any} size={24} color={colors.primary} />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={[styles.chaptersContainer, { backgroundColor: colors.background.primary }]}>
                        {renderChapters(item)}
                    </View>
                )}
            </View>
        );
    };

    const renderSection = (title: string, data: Book[]) => (
        <View style={styles.section} key={title}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
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
                        <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
                            <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
                                <Text style={[styles.title, { color: colors.text.primary }]}>Seleccionar Libro y Capítulo</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={28} color={colors.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Cargando libros...</Text>
                                </View>
                            ) : (
                                <ScrollView contentContainerStyle={styles.listContainer}>
                                    {renderSection('Antiguo Testamento', oldTestamentBooks)}
                                    <View style={[styles.separator, { backgroundColor: colors.border.light }]} />
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
        height: '80%',
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
    },
    title: {
        fontSize: Layout.fontSize.xl,
        fontWeight: '700',
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
        marginVertical: Layout.spacing.lg,
    },
    section: {
        marginBottom: Layout.spacing.md,
    },
    sectionTitle: {
        fontSize: Layout.fontSize.xl,
        fontWeight: '700',
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
    },
    bookInfo: {
        flex: 1,
    },
    bookName: {
        fontSize: Layout.fontSize.lg,
        fontWeight: '600',
    },
    bookChapters: {
        fontSize: Layout.fontSize.sm,
        marginTop: 2,
    },
    chaptersContainer: {
        paddingHorizontal: Layout.spacing.sm,
        paddingVertical: Layout.spacing.md,
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
        borderRadius: Layout.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    chapterNumber: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Layout.spacing.md,
        fontSize: Layout.fontSize.md,
    }
});