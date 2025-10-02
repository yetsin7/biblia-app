// PlanesScreen.tsx
// Ubicación: src/screens/PlanesScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Layout } from '../constants';
import { useColors } from '../hooks/useColors';
import CustomHeader from '../components/navigation/CustomHeader';
import SearchBar from '../components/ui/SearchBar';
import { plansService, ReadingPlan } from '../services/storage/PlansService';

export default function PlanesScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const availablePlans: ReadingPlan[] = [
    {
      id: 'available-1',
      title: 'Evangelios',
      description: 'Lee los cuatro evangelios en 30 días',
      duration: '30 días',
      progress: 0,
      type: 'daily',
      isActive: false,
    },
    {
      id: 'available-2',
      title: 'Libros de Sabiduría',
      description: 'Job, Salmos, Proverbios, Eclesiastés y Cantares',
      duration: '60 días',
      progress: 0,
      type: 'daily',
      isActive: false,
    },
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const loadedPlans = await plansService.getAllPlans();
      setPlans(loadedPlans);
    } catch (error) {
      console.error('Error cargando planes:', error);
      Alert.alert('Error', 'No se pudieron cargar los planes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activatePlan = (planId: string) => {
    Alert.alert(
      'Activar Plan',
      '¿Deseas comenzar este plan de lectura? Se desactivará tu plan actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Comenzar', 
          onPress: async () => {
            try {
              await plansService.activatePlan(planId);
              await loadPlans();
            } catch (error) {
              Alert.alert('Error', 'No se pudo activar el plan');
            }
          }
        }
      ]
    );
  };

  const deletePlan = (planId: string) => {
    Alert.alert(
      'Eliminar Plan',
      '¿Estás seguro de que quieres eliminar este plan?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await plansService.deletePlan(planId);
              await loadPlans();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el plan');
            }
          }
        }
      ]
    );
  };

  const createCustomPlan = async () => {
    if (!newPlanTitle.trim() || !newPlanDescription.trim()) {
      Alert.alert('Error', 'Por favor completa el título y descripción del plan');
      return;
    }

    const newPlan: ReadingPlan = {
      id: Date.now().toString(),
      title: newPlanTitle.trim(),
      description: newPlanDescription.trim(),
      duration: 'Personalizado',
      progress: 0,
      type: 'custom',
      isActive: false,
    };

    try {
      await plansService.savePlan(newPlan);
      await loadPlans();
      setNewPlanTitle('');
      setNewPlanDescription('');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el plan');
    }
  };

  const addAvailablePlan = async (plan: ReadingPlan) => {
    const newPlan = {
      ...plan,
      id: Date.now().toString(),
    };

    try {
      await plansService.savePlan(newPlan);
      await loadPlans();
      Alert.alert('Plan Agregado', `${plan.title} se agregó a tus planes disponibles.`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el plan');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return colors.danger;
    if (progress < 70) return colors.warning;
    return colors.success;
  };

  const renderPlan = ({ item }: { item: ReadingPlan }) => (
    <View style={[
      styles.planCard,
      { backgroundColor: colors.background.card, borderColor: colors.border.light },
      item.isActive && { borderColor: colors.primary, backgroundColor: colors.primary + '05' }
    ]}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={[
            styles.planTitle,
            { color: colors.text.primary },
            item.isActive && { color: colors.primary }
          ]}>
            {item.title}
          </Text>
          <Text style={[styles.planDuration, { color: colors.text.secondary }]}>{item.duration}</Text>
        </View>

        <View style={styles.planActions}>
          {item.isActive && (
            <View style={[styles.activeBadge, { backgroundColor: colors.success }]}>
              <Text style={[styles.activeBadgeText, { color: colors.text.white }]}>Activo</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => deletePlan(item.id)}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.planDescription, { color: colors.text.primary }]}>{item.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>Progreso</Text>
          <Text style={[styles.progressPercentage, { color: colors.text.primary }]}>{item.progress}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.progress}%`,
                backgroundColor: getProgressColor(item.progress)
              }
            ]}
          />
        </View>
      </View>

      {!item.isActive && (
        <TouchableOpacity
          style={[styles.activateButton, { backgroundColor: colors.primary }]}
          onPress={() => activatePlan(item.id)}
        >
          <Text style={[styles.activateButtonText, { color: colors.text.white }]}>Comenzar Plan</Text>
        </TouchableOpacity>
      )}

      {item.isActive && (
        <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.success }]}>
          <Text style={[styles.continueButtonText, { color: colors.text.white }]}>Continuar Lectura</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAvailablePlan = ({ item }: { item: ReadingPlan }) => (
    <TouchableOpacity
      style={[styles.availablePlanCard, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}
      onPress={() => addAvailablePlan(item)}
    >
      <View style={styles.availablePlanContent}>
        <Text style={[styles.availablePlanTitle, { color: colors.text.primary }]}>{item.title}</Text>
        <Text style={[styles.availablePlanDescription, { color: colors.text.secondary }]}>{item.description}</Text>
        <Text style={[styles.availablePlanDuration, { color: colors.primary }]}>{item.duration}</Text>
      </View>
      <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={colors.text.tertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Sin planes activos</Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Crea o selecciona un plan de lectura para comenzar
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <CustomHeader
        title="Planes de Lectura"
        subtitle="Organiza tu estudio bíblico"
        showBackButton={false}
      />

      <SearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Buscar planes..."
      />

      <FlatList
        data={filteredPlans}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredPlans.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={() => (
          <View>
            {filteredPlans.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Mis Planes</Text>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Planes Disponibles</Text>
            <FlatList
              data={availablePlans}
              renderItem={renderAvailablePlan}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.text.white} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Crear Plan Personalizado</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.titleInput, { borderColor: colors.border.light, color: colors.text.primary, backgroundColor: colors.background.secondary }]}
              placeholder="Título del plan"
              placeholderTextColor={colors.text.secondary}
              value={newPlanTitle}
              onChangeText={setNewPlanTitle}
              maxLength={50}
            />

            <TextInput
              style={[styles.descriptionInput, { borderColor: colors.border.light, color: colors.text.primary, backgroundColor: colors.background.secondary }]}
              placeholder="Descripción del plan..."
              placeholderTextColor={colors.text.secondary}
              value={newPlanDescription}
              onChangeText={setNewPlanDescription}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.light }]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={createCustomPlan}
              >
                <Text style={[styles.saveButtonText, { color: colors.text.white }]}>Crear Plan</Text>
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
  },
  listContainer: {
    padding: Layout.spacing.md,
  },
  emptyListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },
  planCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activePlanCard: {
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  activePlanTitle: {
  },
  planDuration: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  activeBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: Layout.fontSize.md,
    lineHeight: 22,
    marginBottom: Layout.spacing.md,
  },
  progressContainer: {
    marginBottom: Layout.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  progressLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: Layout.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Layout.borderRadius.sm,
  },
  activateButton: {
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  activateButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  availablePlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
  },
  availablePlanContent: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  availablePlanTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  availablePlanDescription: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
    marginBottom: Layout.spacing.xs,
  },
  availablePlanDuration: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: Layout.spacing.xl,
    right: Layout.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
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
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    maxHeight: '70%',
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
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    marginBottom: Layout.spacing.md,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    height: 100,
    marginBottom: Layout.spacing.lg,
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
    borderWidth: 1,
  },
  saveButton: {
  },
  cancelButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
});