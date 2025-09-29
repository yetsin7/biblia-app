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
} from 'react-native';
import { Colors, Layout } from '../constants';
import { BibleQueries } from '../services/database/BibleQueries';
import { Book, Verse } from '../types/Biblia';
import CustomHeader from '../components/navigation/CustomHeader';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReadingStackParamList } from '../navigation/BottomTabNavigator';
import BookSelectionModal from '../components/BookSelectionModal';

type ReadingScreenRouteProp = RouteProp<
    { Reading: { bookId: number; chapter: number; bookName: string } }, 
    'Reading'
>;

type NavigationProp = StackNavigationProp<ReadingStackParamList, 'Reading'>;

export default function ReadingScreen() {
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

    useEffect(() => {
        loadChapter(routeBookId, routeChapter);
    }, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <CustomHeader
                    title="Cargando..."
                    subtitle="RVR1960"
                    onSearchPress={handleSearchPress}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Cargando capítulo...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <CustomHeader
                    title="Error"
                    subtitle="RVR1960"
                    onSearchPress={handleSearchPress}
                />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={Colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => loadChapter(currentBookId, currentChapter)}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                        <View key={verse.id} style={styles.verseContainer}>
                            <Text style={styles.verseNumber}>{verse.verse}</Text>
                            <Text style={styles.verseText}>{verse.text}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Flechas de navegación transparentes sobre el contenido */}
                <TouchableOpacity 
                    style={styles.leftArrow} 
                    onPress={goToPreviousChapter}
                    activeOpacity={0.6}
                >
                    <View style={styles.arrowContainer}>
                        <Ionicons name="chevron-back" size={28} color={Colors.primary} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.rightArrow} 
                    onPress={goToNextChapter}
                    activeOpacity={0.6}
                >
                    <View style={styles.arrowContainer}>
                        <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
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
        color: Colors.text.secondary,
        marginRight: Layout.spacing.sm,
        marginTop: 2,
        minWidth: 20,
        textAlign: 'right',
    },
    verseText: {
        flex: 1,
        fontSize: Layout.fontSize.md,
        lineHeight: 24,
        color: Colors.text.primary,
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
        backgroundColor: Colors.background.primary,
    },
    loadingText: {
        marginTop: Layout.spacing.lg,
        fontSize: Layout.fontSize.md,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        padding: Layout.spacing.lg,
    },
    errorText: {
        marginTop: Layout.spacing.lg,
        fontSize: Layout.fontSize.md,
        color: Colors.danger,
        textAlign: 'center',
        marginBottom: Layout.spacing.lg,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Layout.spacing.xl,
        paddingVertical: Layout.spacing.md,
        borderRadius: Layout.borderRadius.lg,
    },
    retryButtonText: {
        color: Colors.text.white,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
});