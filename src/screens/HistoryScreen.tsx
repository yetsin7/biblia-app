// Ubicación: src/screens/HistoryScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { historyService, ReadingHistoryItem } from '../services/storage/HistoryService';
import { useFocusEffect } from '@react-navigation/native';

type HistoryScreenProps = StackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const colors = useColors();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
      Alert.alert('Error', 'No se pudo cargar el historial de lectura.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de que deseas eliminar todo el historial de lectura? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.clearHistory();
              setHistory([]);
              Alert.alert('Éxito', 'Historial eliminado correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el historial.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Eliminar',
      '¿Deseas eliminar esta entrada del historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.removeHistoryItem(id);
              await loadHistory();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el elemento.');
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (item: ReadingHistoryItem) => {
    // Navegar a MainTabs y luego a la pestaña Reading con los parámetros
    (navigation as any).navigate('MainTabs', {
      screen: 'ReadingStack',
      params: {
        screen: 'Reading',
        params: {
          bookId: item.bookId,
          bookName: item.bookName,
          chapter: item.chapter,
        },
      },
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate.getTime() === today.getTime()) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (itemDate.getTime() === yesterday.getTime()) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderItem = ({ item }: { item: ReadingHistoryItem }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="book-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.bookName, { color: colors.text.primary }]}>{item.bookName}</Text>
          <Text style={[styles.chapterText, { color: colors.text.secondary }]}>Capítulo {item.chapter}</Text>
          <Text style={[styles.dateText, { color: colors.text.tertiary }]}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteItem(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={80} color={colors.text.tertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Sin historial</Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Tu historial de lectura aparecerá aquí cuando comiences a leer.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.header, { backgroundColor: colors.background.card, borderBottomColor: colors.border.light }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Historial de Lectura</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
            <Text style={[styles.clearButtonText, { color: colors.danger }]}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={history.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
  },
  clearButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  clearButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  list: {
    padding: Layout.spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  bookName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  chapterText: {
    fontSize: Layout.fontSize.sm,
    marginBottom: 2,
  },
  dateText: {
    fontSize: Layout.fontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  emptyTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});