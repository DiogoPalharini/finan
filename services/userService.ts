import { auth, rtdb } from '../config/firebaseConfig';
import { ref, set, get, update } from 'firebase/database';
import { User, updateProfile } from 'firebase/auth';

// Interface para os dados adicionais do usuário
export interface UserProfile {
  displayName: string;
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
  createdAt: string;
  updatedAt: string;
}

// Salvar perfil do usuário no Realtime Database
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
    
    // Se for a primeira vez, adicionar data de criação
    if (!existingData.createdAt) {
      updatedData.createdAt = new Date().toISOString();
    }
    
    // Salvar no banco de dados
    await set(userRef, updatedData);
    
    // Atualizar displayName no Auth se fornecido
    if (profileData.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName
      });
    }
    
    return;
  } catch (error) {
    console.error('Erro ao salvar perfil do usuário:', error);
    throw error;
  }
}

// Obter perfil do usuário
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

// Atualizar perfil do usuário com verificação de senha
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<UserProfile>, 
  password: string
): Promise<void> {
  try {
    // Verificar senha (reautenticação)
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('Usuário não autenticado');
    }
    
    // Atualizar perfil
    await saveUserProfile(userId, profileData);
    
    return;
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    throw error;
  }
}

// Verificar se o perfil do usuário está completo
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

// Obter dados para estatísticas do perfil
export async function getProfileStats(userId: string): Promise<{
  goalCount: number;
  savingsRate: number;
  monthsActive: number;
}> {
  // Implementação futura: obter dados reais
  return {
    goalCount: 12,
    savingsRate: 85,
    monthsActive: 6
  };
}
