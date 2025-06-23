// services/userService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, set, get, update } from 'firebase/database';
import { User, updateProfile } from 'firebase/auth';
import { getCurrentUser } from './authService';
import { getTransactions } from './transactionService';
import { getGoals } from './goalService';
import { Transaction } from '../types/transaction';

// Interface para os dados do perfil do usuário
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  cpf?: string;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';
  profession?: string;
  employmentStatus?: 'clt' | 'autonomo' | 'empresario' | 'estudante' | 'aposentado' | 'outro';
  monthlyIncome?: 'ate_2000' | '2000_5000' | '5000_10000' | 'acima_10000';
  financialGoal?: 'economizar' | 'investir' | 'controlar_gastos' | 'quitar_dividas' | 'outro';
  planningHorizon?: 'curto' | 'medio' | 'longo';
  preferredCurrency?: string;
  monthClosingDay?: number;
  notificationPreference?: 'diaria' | 'semanal' | 'mensal' | 'nenhuma';
  totalBalance: number;
  pushToken?: string;
  photoURL?: string;
  photoUpdatedAt?: string;
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
    console.log('updateUserBalance: Iniciando atualização do saldo');
    console.log('updateUserBalance: Usuário:', userId);
    console.log('updateUserBalance: Valor a ser alterado:', amount);
    
    const userRef = ref(rtdb, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      console.log('updateUserBalance: Perfil não encontrado, criando perfil inicial');
      // Criar perfil inicial com saldo zero
      const initialProfile: UserProfile = {
        id: userId,
        displayName: '',
        email: '',
        totalBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(userRef, initialProfile);
      console.log('updateUserBalance: Perfil inicial criado com saldo:', amount);
      return;
    }
    
    const profile = snapshot.val() as UserProfile;
    const currentBalance = profile.totalBalance || 0;
    const newBalance = currentBalance + amount;
    
    console.log('updateUserBalance: Saldo atual:', currentBalance);
    console.log('updateUserBalance: Novo saldo:', newBalance);
    
    // Atualizar o saldo
    await update(userRef, {
      totalBalance: newBalance,
      updatedAt: new Date().toISOString()
    });
    
    console.log('updateUserBalance: Saldo atualizado com sucesso');
  } catch (error) {
    console.error('updateUserBalance: Erro ao atualizar saldo do usuário:', error);
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
    console.log('getUserBalance: Iniciando busca do saldo do usuário:', userId);
    const userRef = ref(rtdb, `users/${userId}/profile`);
    console.log('getUserBalance: Referência do banco:', userRef.toString());
    
    const snapshot = await get(userRef);
    console.log('getUserBalance: Dados encontrados:', snapshot.exists());
    console.log('getUserBalance: Dados brutos:', snapshot.val());
    
    if (!snapshot.exists()) {
      console.log('getUserBalance: Perfil não encontrado, criando perfil inicial');
      // Criar perfil inicial com saldo zero
      const initialProfile: UserProfile = {
        id: userId,
        displayName: '',
        email: '',
        totalBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(userRef, initialProfile);
      console.log('getUserBalance: Perfil inicial criado com sucesso');
      return 0;
    }
    
    const profile = snapshot.val() as UserProfile;
    console.log('getUserBalance: Perfil encontrado:', {
      displayName: profile.displayName,
      totalBalance: profile.totalBalance,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    });
    
    // Se o saldo não estiver definido, inicializar com zero
    if (profile.totalBalance === undefined) {
      console.log('getUserBalance: Saldo não definido, inicializando com zero');
      await update(userRef, {
        totalBalance: 0,
        updatedAt: new Date().toISOString()
      });
      return 0;
    }
    
    return profile.totalBalance;
  } catch (error) {
    console.error('getUserBalance: Erro ao buscar saldo:', error);
    throw error;
  }
}

export const getProfileStats = async (userId: string): Promise<{
  goalCount: number;
  savingsRate: number;
  monthsActive: number;
}> => {
  try {
    // Obter todas as transações do usuário
    const transactions = await getTransactions(userId);
    
    // Calcular meses ativos
    const firstTransaction = transactions[transactions.length - 1];
    const monthsActive = firstTransaction 
      ? Math.ceil((new Date().getTime() - new Date(firstTransaction.date).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;
    
    // Calcular taxa de economia
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach((transaction: Transaction) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        totalExpenses += transaction.amount;
      }
    });
    
    // Taxa de economia = (Renda Total - Despesas Totais) / Renda Total * 100
    const savingsRate = totalIncome > 0 
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0;
    
    // Obter contagem de metas
    const goals = await getGoals(userId);
    const goalCount = goals.length;
    
    return {
      goalCount,
      savingsRate: Math.max(0, savingsRate), // Garantir que não seja negativo
      monthsActive
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do perfil:', error);
    return {
      goalCount: 0,
      savingsRate: 0,
      monthsActive: 0
    };
  }
};
