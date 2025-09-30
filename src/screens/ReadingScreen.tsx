// ReadingScreen.tsx
// Ubicación: src/screens/ReadingScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Pressable,
    Share,
    Clipboard,
} from 'react-native';
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';
import { BibleQueries } from '../services/database/BibleQueries';
import { Book, Verse } from '../types/Biblia';
import CustomHeader from '../components/navigation/CustomHeader';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReadingStackParamList } from '../navigation/BottomTabNavigator';
import BookSelectionModal from '../components/BookSelectionModal';
import { historyService } from '../services/storage/HistoryService';

type ReadingScreenRouteProp = RouteProp<
    { Reading: { bookId: number; chapter: number; bookName: string } }, 
    'Reading'
>;

type NavigationProp = StackNavigationProp<ReadingStackParamList, 'Reading'>;

export default function ReadingScreen() {
    const colors = useColors();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ReadingScreenRouteProp>();

    const routeBookId = route.params?.bookId ?? 1;
    const routeChapter = route.params?.chapter ?? 1;

    const [verses, setVerses] = useState<Verse[]>([]);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [currentChapter, setCurrentChapter] = useState(routeChapter);
    const [currentBookId, setCurrentBookId] = useState(routeBookId);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
    const [isVerseMenuVisible, setIsVerseMenuVisible] = useState(false);

    // Estados para precarga
    const [previousChapterData, setPreviousChapterData] = useState<{verses: Verse[], book: Book} | null>(null);
    const [nextChapterData, setNextChapterData] = useState<{verses: Verse[], book: Book} | null>(null);

    const loadChapter = async (newBookId: number, newChapter: number, usePreloaded: boolean = false) => {
        try {
            setIsLoading(!usePreloaded);
            setError(null);

            let bookInfo: Book | null = null;
            let chapterVerses: Verse[] = [];

            // Si tenemos datos precargados y coinciden, usarlos
            if (usePreloaded && previousChapterData && 
                previousChapterData.book.id === newBookId) {
                bookInfo = previousChapterData.book;
                chapterVerses = previousChapterData.verses;
            } else if (usePreloaded && nextChapterData && 
                    nextChapterData.book.id === newBookId) {
                bookInfo = nextChapterData.book;
                chapterVerses = nextChapterData.verses;
            } else {
                // Siempre cargar el libro si cambia O si no tenemos libro actual
                if (currentBookId !== newBookId || !currentBook) {
                    bookInfo = await BibleQueries.getBookById(newBookId);
                } else {
                    bookInfo = currentBook;
                }
                
                chapterVerses = await BibleQueries.getVersesByChapter(newBookId, newChapter);
            }

            if (!bookInfo) {
                throw new Error('Libro no encontrado');
            }

            setVerses(chapterVerses);
            
            // Actualizar el estado del libro
            if (currentBookId !== newBookId || !currentBook) {
                setCurrentBook(bookInfo);
            }
            
            setCurrentBookId(newBookId);
            setCurrentChapter(newChapter);

            // Actualizar navegación
            navigation.setParams({ 
                bookId: newBookId, 
                chapter: newChapter, 
                bookName: bookInfo.name 
            });

            // Precargar capítulos anterior y siguiente
            preloadAdjacentChapters(newBookId, newChapter);

            // Registrar en historial de lectura
            if (bookInfo) {
                try {
                    await historyService.addReading(
                        newBookId,
                        bookInfo.name,
                        newChapter,
                        chapterVerses.length > 0 ? chapterVerses[chapterVerses.length - 1].verse : undefined
                    );
                } catch (historyError) {
                    console.error('Error registrando lectura en historial:', historyError);
                    // No mostramos error al usuario, es un error silencioso
                }
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar el capítulo';
            setError(errorMessage);
            console.error('Error cargando capítulo:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const preloadAdjacentChapters = async (bookId: number, chapter: number) => {
        try {
            // Precargar capítulo anterior
            const prevChapter = await BibleQueries.getPreviousChapter(bookId, chapter);
            if (prevChapter) {
                const [prevBook, prevVerses] = await Promise.all([
                    BibleQueries.getBookById(prevChapter.bookId),
                    BibleQueries.getVersesByChapter(prevChapter.bookId, prevChapter.chapter),
                ]);
                if (prevBook) {
                    setPreviousChapterData({ verses: prevVerses, book: prevBook });
                }
            } else {
                setPreviousChapterData(null);
            }

            // Precargar capítulo siguiente
            const nextChapter = await BibleQueries.getNextChapter(bookId, chapter);
            if (nextChapter) {
                const [nextBook, nextVerses] = await Promise.all([
                    BibleQueries.getBookById(nextChapter.bookId),
                    BibleQueries.getVersesByChapter(nextChapter.bookId, nextChapter.chapter),
                ]);
                if (nextBook) {
                    setNextChapterData({ verses: nextVerses, book: nextBook });
                }
            } else {
                setNextChapterData(null);
            }
        } catch (error) {
            console.error('Error precargando capítulos:', error);
        }
    };

    const goToPreviousChapter = async () => {
        try {
            const previousChapter = await BibleQueries.getPreviousChapter(
                currentBookId,
                currentChapter
            );
            if (previousChapter) {
                await loadChapter(previousChapter.bookId, previousChapter.chapter, true);
            } else {
                Alert.alert('Información', 'Ya estás en el primer capítulo de la Biblia');
            }
        } catch (error) {
            console.error('Error navegando al capítulo anterior:', error);
        }
    };

    const goToNextChapter = async () => {
        try {
            const nextChapter = await BibleQueries.getNextChapter(
                currentBookId,
                currentChapter
            );
            if (nextChapter) {
                await loadChapter(nextChapter.bookId, nextChapter.chapter, true);
            } else {
                Alert.alert('Información', 'Ya estás en el último capítulo de la Biblia');
            }
        } catch (error) {
            console.error('Error navegando al capítulo siguiente:', error);
        }
    };
    
    const handleBookChapterSelect = (bookId: number, bookName: string, chapter: number) => {
        setIsModalVisible(false);
        if (bookId !== currentBookId || chapter !== currentChapter) {
            loadChapter(bookId, chapter, false);
        }
    };

    const handleSearchPress = () => {
        navigation.navigate('Search');
    };

    const handleVerseLongPress = (verse: Verse) => {
        setSelectedVerse(verse);
        setIsVerseMenuVisible(true);
    };

    const closeVerseMenu = () => {
        setIsVerseMenuVisible(false);
        setSelectedVerse(null);
    };

    const handleCopyVerse = async () => {
        if (!selectedVerse || !currentBook) return;

        const verseText = `${currentBook.name} ${currentChapter}:${selectedVerse.verse}\n"${selectedVerse.text}"\n(RVR1960)`;

        try {
            Clipboard.setString(verseText);
            closeVerseMenu();
            Alert.alert('Copiado', 'Versículo copiado al portapapeles');
        } catch (error) {
            Alert.alert('Error', 'No se pudo copiar el versículo');
        }
    };

    const handleCreateNote = () => {
        closeVerseMenu();
        Alert.alert('Próximamente', 'Crear nota desde versículo disponible pronto.');
    };

    const handleAddToFavorites = () => {
        closeVerseMenu();
        Alert.alert('Próximamente', 'Añadir a favoritos disponible pronto.');
    };

    const handleShareVerse = async () => {
        if (!selectedVerse || !currentBook) return;

        const verseText = `${currentBook.name} ${currentChapter}:${selectedVerse.verse}\n\n"${selectedVerse.text}"\n\n(Biblia RVR1960)`;

        try {
            await Share.share({
                message: verseText,
            });
            closeVerseMenu();
        } catch (error) {
            console.error('Error compartiendo:', error);
        }
    };

    useEffect(() => {
        loadChapter(routeBookId, routeChapter);
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <CustomHeader
                    title="Cargando..."
                    subtitle="RVR1960"
                    onSearchPress={handleSearchPress}
                />
                <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Cargando capítulo...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <CustomHeader
                    title="Error"
                    subtitle="RVR1960"
                    onSearchPress={handleSearchPress}
                />
                <View style={[styles.errorContainer, { backgroundColor: colors.background.primary }]}>
                    <Ionicons name="alert-circle" size={64} color={colors.danger} />
                    <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                        onPress={() => loadChapter(currentBookId, currentChapter)}
                    >
                        <Text style={[styles.retryButtonText, { color: colors.text.white }]}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <CustomHeader
                title={currentBook ? `${currentBook.name.toUpperCase()} ${currentChapter}` : 'Cargando...'}
                subtitle="RVR1960"
                onTitlePress={() => setIsModalVisible(true)}
                onSearchPress={handleSearchPress}
            />

            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {verses.map((verse) => (
                        <Pressable
                            key={verse.id}
                            style={styles.verseContainer}
                            onLongPress={() => handleVerseLongPress(verse)}
                            delayLongPress={300}
                        >
                            <Text style={[styles.verseNumber, { color: colors.text.secondary }]}>{verse.verse}</Text>
                            <Text style={[styles.verseText, { color: colors.text.primary }]}>{verse.text}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Flechas de navegación transparentes sobre el contenido */}
                <TouchableOpacity
                    style={styles.leftArrow}
                    onPress={goToPreviousChapter}
                    activeOpacity={0.6}
                >
                    <View style={styles.arrowContainer}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.rightArrow}
                    onPress={goToNextChapter}
                    activeOpacity={0.6}
                >
                    <View style={styles.arrowContainer}>
                        <Ionicons name="chevron-forward" size={28} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            </View>
            
            <BookSelectionModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                currentBookId={currentBookId}
                currentChapter={currentChapter}
                onSelect={handleBookChapterSelect}
            />

            {/* Menú contextual del versículo */}
            <Modal
                visible={isVerseMenuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeVerseMenu}
            >
                <Pressable style={styles.modalOverlay} onPress={closeVerseMenu}>
                    <View style={[styles.verseMenuContainer, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}>
                        <View style={[styles.verseMenuHeader, { borderBottomColor: colors.border.light }]}>
                            <Text style={[styles.verseMenuTitle, { color: colors.text.primary }]}>
                                {currentBook?.name} {currentChapter}:{selectedVerse?.verse}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.verseMenuItem, { borderBottomColor: colors.border.light }]}
                            onPress={handleCopyVerse}
                        >
                            <Ionicons name="copy-outline" size={24} color={colors.primary} />
                            <Text style={[styles.verseMenuItemText, { color: colors.text.primary }]}>Copiar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.verseMenuItem, { borderBottomColor: colors.border.light }]}
                            onPress={handleCreateNote}
                        >
                            <Ionicons name="create-outline" size={24} color={colors.primary} />
                            <Text style={[styles.verseMenuItemText, { color: colors.text.primary }]}>Crear Nota</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.verseMenuItem, { borderBottomColor: colors.border.light }]}
                            onPress={handleAddToFavorites}
                        >
                            <Ionicons name="heart-outline" size={24} color={colors.primary} />
                            <Text style={[styles.verseMenuItemText, { color: colors.text.primary }]}>Añadir a Favoritos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.verseMenuItem}
                            onPress={handleShareVerse}
                        >
                            <Ionicons name="share-outline" size={24} color={colors.primary} />
                            <Text style={[styles.verseMenuItemText, { color: colors.text.primary }]}>Compartir</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.verseMenuCancel, { backgroundColor: colors.background.secondary }]}
                            onPress={closeVerseMenu}
                        >
                            <Text style={[styles.verseMenuCancelText, { color: colors.text.secondary }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.spacing.lg,
        paddingBottom: Layout.spacing.xxl,
    },
    verseContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Layout.spacing.md,
    },
    verseNumber: {
        fontSize: Layout.fontSize.xs,
        fontWeight: '600',
        marginRight: Layout.spacing.sm,
        marginTop: 2,
        minWidth: 20,
        textAlign: 'right',
    },
    verseText: {
        flex: 1,
        fontSize: Layout.fontSize.md,
        lineHeight: 24,
        textAlign: 'justify',
    },
    leftArrow: {
        position: 'absolute',
        left: Layout.spacing.lg,
        bottom: Layout.spacing.xl,
        zIndex: 10,
    },
    rightArrow: {
        position: 'absolute',
        right: Layout.spacing.lg,
        bottom: Layout.spacing.xl,
        zIndex: 10,
    },
    arrowContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Layout.spacing.lg,
        fontSize: Layout.fontSize.md,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Layout.spacing.lg,
    },
    errorText: {
        marginTop: Layout.spacing.lg,
        fontSize: Layout.fontSize.md,
        textAlign: 'center',
        marginBottom: Layout.spacing.lg,
    },
    retryButton: {
        paddingHorizontal: Layout.spacing.xl,
        paddingVertical: Layout.spacing.md,
        borderRadius: Layout.borderRadius.lg,
    },
    retryButtonText: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Layout.spacing.lg,
    },
    verseMenuContainer: {
        width: '90%',
        maxWidth: 400,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    verseMenuHeader: {
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
    },
    verseMenuTitle: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
        textAlign: 'center',
    },
    verseMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
    },
    verseMenuItemText: {
        fontSize: Layout.fontSize.md,
        fontWeight: '500',
        marginLeft: Layout.spacing.md,
    },
    verseMenuCancel: {
        padding: Layout.spacing.md,
        alignItems: 'center',
    },
    verseMenuCancelText: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
});