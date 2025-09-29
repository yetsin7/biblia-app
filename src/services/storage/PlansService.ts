// PlansService.ts
// Ubicación: src/services/storage/PlansService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  type: 'daily' | 'weekly' | 'custom';
  isActive: boolean;
  startDate?: string;
}

const PLANS_STORAGE_KEY = '@biblia_app_plans';

class PlansService {
  async getAllPlans(): Promise<ReadingPlan[]> {
    try {
      const plansJson = await AsyncStorage.getItem(PLANS_STORAGE_KEY);
      if (plansJson) {
        return JSON.parse(plansJson);
      }
      return [];
    } catch (error) {
      console.error('Error al obtener planes:', error);
      return [];
    }
  }

  async savePlan(plan: ReadingPlan): Promise<void> {
    try {
      const plans = await this.getAllPlans();
      const updatedPlans = [plan, ...plans];
      await AsyncStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Error al guardar plan:', error);
      throw error;
    }
  }

  async updatePlan(planId: string, updatedPlan: Partial<ReadingPlan>): Promise<void> {
    try {
      const plans = await this.getAllPlans();
      const planIndex = plans.findIndex(p => p.id === planId);
      
      if (planIndex !== -1) {
        plans[planIndex] = { ...plans[planIndex], ...updatedPlan };
        await AsyncStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
      }
    } catch (error) {
      console.error('Error al actualizar plan:', error);
      throw error;
    }
  }

  async deletePlan(planId: string): Promise<void> {
    try {
      const plans = await this.getAllPlans();
      const filteredPlans = plans.filter(p => p.id !== planId);
      await AsyncStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(filteredPlans));
    } catch (error) {
      console.error('Error al eliminar plan:', error);
      throw error;
    }
  }

  async activatePlan(planId: string): Promise<void> {
    try {
      const plans = await this.getAllPlans();
      const updatedPlans = plans.map(plan => ({
        ...plan,
        isActive: plan.id === planId,
        startDate: plan.id === planId ? new Date().toISOString().split('T')[0] : plan.startDate
      }));
      await AsyncStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Error al activar plan:', error);
      throw error;
    }
  }

  async updateProgress(planId: string, progress: number): Promise<void> {
    try {
      await this.updatePlan(planId, { progress });
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      throw error;
    }
  }

  async clearAllPlans(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PLANS_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar planes:', error);
      throw error;
    }
  }
}

export const plansService = new PlansService();
export default PlansService;