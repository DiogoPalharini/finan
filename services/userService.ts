// services/userService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, set, get, update } from 'firebase/database';
import { User, updateProfile } from 'firebase/auth';
import { getCurrentUser } from './authService';

// Interface para os dados do perfil do usuário
export interface UserProfile {
  displayName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  cpf?: string;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';
  profession?: string;
  employmentStatus?: 'clt' | 'autonomo' | 'empresario' | 'estudante' | 'aposentado' | 'outro';
  monthlyIncome?: string;
  financialGoal?: 'economizar' | 'investir' | 'controlar_gastos' | 'quitar_dividas' | 'outro';
  planningHorizon?: 'curto' | 'medio' | 'longo';
  preferredCurrency?: string;
  monthClosingDay?: number;
  notificationPreference?: 'diaria' | 'semanal' | 'mensal' | 'nenhuma';
  totalBalance: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Salva ou atualiza o perfil do usuário no Realtime Database
 * @param userId ID do usuário
 * @param profileData Dados do perfil a serem salvos/atualizados
 */
export async function saveUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = ref(rtdb, `users/${userId}/profile`);
    
    // Obter dados existentes para mesclar
    const snapshot = await get(userRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};
    
    // Mesclar dados existentes com novos dados
    const updatedData = {
      ...existingData,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    // Se for a primeira vez, adicionar data de criação e saldo inicial
    if (!existingData.createdAt) {
      updatedData.createdAt = new Date().toISOString();
      updatedData.totalBalance = updatedData.totalBalance || 0;
    }
    
    // Salvar no banco de dados
    await set(userRef, updatedData);
    
    // Atualizar displayName no Auth se fornecido
    const currentUser = getCurrentUser();
    if (profileData.displayName && currentUser) {
      await updateProfile(currentUser, {
        displayName: profileData.displayName
      });
    }
  } catch (error) {
    console.error('Erro ao salvar perfil do usuário:', error);
    throw error;
  }
}

/**
 * Obtém o perfil do usuário
 * @param userId ID do usuário
 * @returns Objeto com o perfil do usuário ou null se não existir
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = ref(rtdb, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error);
    throw error;
  }
}

/**
 * Atualiza o saldo total do usuário
 * @param userId ID do usuário
 * @param amount Valor a ser adicionado (positivo) ou subtraído (negativo)
 */
export async function updateUserBalance(userId: string, amount: number): Promise<void> {
  try {
    const userRef = ref(rtdb, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error('Perfil do usuário não encontrado');
    }
    
    const profile = snapshot.val() as UserProfile;
    const currentBalance = profile.totalBalance || 0;
    const newBalance = currentBalance + amount;
    
    await update(userRef, {
      totalBalance: newBalance,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao atualizar saldo do usuário:', error);
    throw error;
  }
}

/**
 * Verifica se o perfil do usuário está completo
 * @param userId ID do usuário
 * @returns Boolean indicando se o perfil está completo
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) return false;
    
    // Verificar campos obrigatórios
    const requiredFields: (keyof UserProfile)[] = [
      'displayName',
      'phoneNumber',
      'birthDate',
      'profession',
      'monthlyIncome',
      'financialGoal'
    ];
    
    return requiredFields.every(field => !!profile[field]);
  } catch (error) {
    console.error('Erro ao verificar completude do perfil:', error);
    return false;
  }
}

/**
 * Obtém o saldo atual do usuário
 * @param userId ID do usuário
 * @returns Saldo atual do usuário
 */
export async function getUserBalance(userId: string): Promise<number> {
  try {
    const profile = await getUserProfile(userId);
    return profile?.totalBalance || 0;
  } catch (error) {
    console.error('Erro ao obter saldo do usuário:', error);
    throw error;
  }
}
