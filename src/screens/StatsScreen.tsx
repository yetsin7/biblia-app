// StatsScreen.tsx
// Ubicación: src/screens/StatsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { historyService, ReadingStats } from '../services/storage/HistoryService';
import { useFocusEffect } from '@react-navigation/native';

type StatsScreenProps = StackScreenProps<RootStackParamList, 'Stats'>;

export default function StatsScreen({ navigation }: StatsScreenProps) {
  const colors = useColors();
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await historyService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleResetStats = () => {
    Alert.alert(
      'Resetear Estadísticas',
      '¿Estás seguro de que deseas resetear todas las estadísticas? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.resetStats();
              await loadStats();
              Alert.alert('Éxito', 'Estadísticas reseteadas correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron resetear las estadísticas.');
            }
          },
        },
      ]
    );
  };

  const formatLastReadDate = (timestamp: number | null): string => {
    if (!timestamp) return 'Nunca';

    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (itemDate.getTime() === yesterday.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getProgressColor = (totalReadings: number) => {
    if (totalReadings < 10) return colors.danger;
    if (totalReadings < 50) return colors.warning;
    return colors.success;
  };

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    value: string | number,
    subtitle?: string,
    color?: string
  ) => (
    <View style={[styles.statCard, { backgroundColor: colors.background.card, borderColor: colors.border.light, borderLeftColor: color || colors.primary }]}>
      <View style={[styles.iconContainer, { backgroundColor: (color || colors.primary) + '15' }]}>
        <Ionicons name={icon} size={28} color={color || colors.primary} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text.primary }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.text.primary }]}>{title}</Text>
        {subtitle && <Text style={[styles.statSubtitle, { color: colors.text.secondary }]}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (loading || !stats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  const hasData = stats.totalReadings > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.header, { backgroundColor: colors.background.card, borderBottomColor: colors.border.light }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Estadísticas</Text>
        {hasData && (
          <TouchableOpacity onPress={handleResetStats} style={styles.resetButton}>
            <Ionicons name="refresh-outline" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {!hasData ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={80} color={colors.text.tertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Sin estadísticas</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
              Comienza a leer para ver tus estadísticas de progreso.
            </Text>
          </View>
        ) : (
          <>
            {/* Sección: Progreso General */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Progreso General</Text>

              {renderStatCard(
                'book-outline',
                'Lecturas Totales',
                stats.totalReadings,
                undefined,
                colors.primary
              )}

              {renderStatCard(
                'library-outline',
                'Libros Leídos',
                stats.booksRead,
                'Libros únicos',
                '#9C27B0'
              )}

              {renderStatCard(
                'albums-outline',
                'Capítulos Leídos',
                stats.chaptersRead,
                'Capítulos únicos',
                '#FF9800'
              )}
            </View>

            {/* Sección: Racha y Actividad */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Racha y Actividad</Text>

              {renderStatCard(
                'flame-outline',
                'Días Consecutivos',
                stats.consecutiveDays,
                stats.consecutiveDays > 0 ? '¡Sigue así!' : 'Lee hoy para comenzar',
                '#FF5722'
              )}

              {renderStatCard(
                'calendar-outline',
                'Última Lectura',
                formatLastReadDate(stats.lastReadDate),
                undefined,
                '#4CAF50'
              )}

              {renderStatCard(
                'time-outline',
                'Tiempo Total',
                formatTime(stats.totalTimeMinutes),
                'Estimado',
                '#2196F3'
              )}
            </View>

            {/* Sección: Favoritos */}
            {stats.favoriteBook && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Tu Favorito</Text>

                {renderStatCard(
                  'heart-outline',
                  'Libro Más Leído',
                  stats.favoriteBook,
                  'Tu libro favorito',
                  '#E91E63'
                )}
              </View>
            )}

            {/* Motivación */}
            <View style={[styles.motivationCard, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
              <Ionicons name="trophy-outline" size={32} color={colors.warning} />
              <Text style={[styles.motivationText, { color: colors.text.primary }]}>
                {stats.consecutiveDays >= 7
                  ? '¡Increíble racha! Sigue leyendo cada día.'
                  : stats.totalReadings >= 50
                  ? '¡Gran progreso! Has leído mucho.'
                  : stats.totalReadings >= 10
                  ? '¡Buen trabajo! Continúa con tu lectura diaria.'
                  : '¡Comienza tu viaje bíblico hoy!'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
  resetButton: {
    padding: Layout.spacing.sm,
  },
  scrollContent: {
    padding: Layout.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Layout.fontSize.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
    minHeight: 400,
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
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    marginBottom: Layout.spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '700',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: Layout.fontSize.sm,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginTop: Layout.spacing.md,
  },
  motivationText: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    marginLeft: Layout.spacing.md,
    lineHeight: 22,
  },
});