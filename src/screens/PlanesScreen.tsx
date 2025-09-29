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
import { Colors, Layout } from '../constants';
import CustomHeader from '../components/navigation/CustomHeader';
import SearchBar from '../components/ui/SearchBar';
import { plansService, ReadingPlan } from '../services/storage/PlansService';

export default function PlanesScreen() {
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
    if (progress < 30) return Colors.danger;
    if (progress < 70) return Colors.warning;
    return Colors.success;
  };

  const renderPlan = ({ item }: { item: ReadingPlan }) => (
    <View style={[styles.planCard, item.isActive && styles.activePlanCard]}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={[styles.planTitle, item.isActive && styles.activePlanTitle]}>
            {item.title}
          </Text>
          <Text style={styles.planDuration}>{item.duration}</Text>
        </View>
        
        <View style={styles.planActions}>
          {item.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Activo</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => deletePlan(item.id)}>
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.planDescription}>{item.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso</Text>
          <Text style={styles.progressPercentage}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
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
          style={styles.activateButton}
          onPress={() => activatePlan(item.id)}
        >
          <Text style={styles.activateButtonText}>Comenzar Plan</Text>
        </TouchableOpacity>
      )}

      {item.isActive && (
        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continuar Lectura</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAvailablePlan = ({ item }: { item: ReadingPlan }) => (
    <TouchableOpacity 
      style={styles.availablePlanCard}
      onPress={() => addAvailablePlan(item)}
    >
      <View style={styles.availablePlanContent}>
        <Text style={styles.availablePlanTitle}>{item.title}</Text>
        <Text style={styles.availablePlanDescription}>{item.description}</Text>
        <Text style={styles.availablePlanDuration}>{item.duration}</Text>
      </View>
      <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={Colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Sin planes activos</Text>
      <Text style={styles.emptySubtitle}>
        Crea o selecciona un plan de lectura para comenzar
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
              <Text style={styles.sectionTitle}>Mis Planes</Text>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View>
            <Text style={styles.sectionTitle}>Planes Disponibles</Text>
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
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.text.white} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Plan Personalizado</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Título del plan"
              placeholderTextColor={Colors.text.secondary}
              value={newPlanTitle}
              onChangeText={setNewPlanTitle}
              maxLength={50}
            />

            <TextInput
              style={styles.descriptionInput}
              placeholder="Descripción del plan..."
              placeholderTextColor={Colors.text.secondary}
              value={newPlanDescription}
              onChangeText={setNewPlanDescription}
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
                onPress={createCustomPlan}
              >
                <Text style={styles.saveButtonText}>Crear Plan</Text>
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
  listContainer: {
    padding: Layout.spacing.md,
  },
  emptyListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },
  planCard: {
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
  activePlanCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
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
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  activePlanTitle: {
    color: Colors.primary,
  },
  planDuration: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  activeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.white,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
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
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Layout.borderRadius.sm,
  },
  activateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  activateButtonText: {
    color: Colors.text.white,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: Colors.success,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  continueButtonText: {
    color: Colors.text.white,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  availablePlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  availablePlanContent: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  availablePlanTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  availablePlanDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Layout.spacing.xs,
  },
  availablePlanDuration: {
    fontSize: Layout.fontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
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
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    height: 100,
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