// services/goalService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { updateUserBalance } from './userService';
import { allocateToGoal } from './utils/goalUtils';

// Interface para metas financeiras
export interface Goal {
  id?: string;
  title: string;
  description?: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  priority?: 'baixa' | 'media' | 'alta';
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para alocações em metas
export interface GoalAllocation {
  id?: string;
  amount: number;
  date: string;
  source?: string;  // ID da transação de origem (opcional)
  notes?: string;
  createdAt: string;
}

/**
 * Cria uma nova meta financeira
 * @param userId ID do usuário
 * @param goal Dados da meta
 * @returns ID da meta criada
 */
export async function createGoal(userId: string, goal: Omit<Goal, 'id' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Validar dados da meta
    if (goal.targetAmount <= 0) {
      throw new Error('O valor alvo deve ser maior que zero');
    }
    
    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline);
      if (deadlineDate < new Date()) {
        throw new Error('A data limite não pode ser no passado');
      }
    }
    
    const goalsRef = ref(rtdb, `users/${userId}/goals`);
    const newGoalRef = push(goalsRef);
    const goalId = newGoalRef.key as string;
    
    const now = new Date().toISOString();
    
    const completeGoal = {
      ...goal,
      id: goalId,
      currentAmount: 0,
      status: 'not_started' as const,
      createdAt: now,
      updatedAt: now
    };
    
    await set(newGoalRef, completeGoal);
    
    return goalId;
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    throw error;
  }
}

/**
 * Obtém todas as metas do usuário
 * @param userId ID do usuário
 * @returns Array de metas
 */
export async function getGoals(userId: string): Promise<Goal[]> {
  try {
    const goalsRef = ref(rtdb, `users/${userId}/goals`);
    const snapshot = await get(goalsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const goals: Goal[] = [];
    snapshot.forEach((childSnapshot) => {
      const goal = childSnapshot.val() as Goal;
      goals.push(goal);
    });
    
    // Ordenar por prioridade e depois por prazo
    return goals.sort((a, b) => {
      const priorityOrder = { alta: 0, media: 1, baixa: 2 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 3;
      const bPriority = b.priority ? priorityOrder[b.priority] : 3;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      
      return 0;
    });
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    throw error;
  }
}

/**
 * Obtém uma meta específica
 * @param userId ID do usuário
 * @param goalId ID da meta
 * @returns Objeto da meta ou null se não existir
 */
export async function getGoal(userId: string, goalId: string): Promise<Goal | null> {
  try {
    const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
    const snapshot = await get(goalRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Goal;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    throw error;
  }
}

/**
 * Atualiza uma meta existente
 * @param userId ID do usuário
 * @param goalId ID da meta
 * @param updates Campos a serem atualizados
 */
export async function updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
  try {
    const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
    const snapshot = await get(goalRef);
    
    if (!snapshot.exists()) {
      throw new Error('Meta não encontrada');
    }
    
    const currentGoal = snapshot.val() as Goal;
    
    // Validar atualizações
    if (updates.targetAmount !== undefined && updates.targetAmount <= 0) {
      throw new Error('O valor alvo deve ser maior que zero');
    }
    
    if (updates.currentAmount !== undefined) {
      if (updates.currentAmount < 0) {
        throw new Error('O valor atual não pode ser negativo');
      }
      
      if (updates.currentAmount > (updates.targetAmount || currentGoal.targetAmount)) {
        throw new Error('O valor atual não pode ser maior que o valor alvo');
      }
    }
    
    if (updates.deadline) {
      const deadlineDate = new Date(updates.deadline);
      if (deadlineDate < new Date()) {
        throw new Error('A data limite não pode ser no passado');
      }
    }
    
    await update(goalRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    // Se a meta foi concluída, verificar se precisa atualizar o status
    if (updates.currentAmount !== undefined || updates.targetAmount !== undefined) {
      const updatedGoal = await getGoal(userId, goalId);
      
      if (updatedGoal && updatedGoal.currentAmount >= updatedGoal.targetAmount && updatedGoal.status !== 'completed') {
        await update(goalRef, {
          status: 'completed',
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    throw error;
  }
}

/**
 * Exclui uma meta
 * @param userId ID do usuário
 * @param goalId ID da meta
 */
export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  try {
    // Verificar se a meta tem saldo
    const goal = await getGoal(userId, goalId);
    
    if (goal && goal.currentAmount > 0) {
      // Devolver o saldo para o usuário
      await updateUserBalance(userId, goal.currentAmount);
    }
    
    // Excluir a meta e suas alocações
    const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
    await remove(goalRef);
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    throw error;
  }
}

/**
 * Aloca um valor para uma meta
 * @param userId ID do usuário
 * @param goalId ID da meta
 * @param amount Valor a ser alocado
 * @param source ID da transação de origem (opcional)
 * @param notes Observações (opcional)
 * @returns ID da alocação criada
 */
export async function allocateAmountToGoal(userId: string, goalId: string, amount: number, source?: string, notes?: string): Promise<string> {
  try {
    console.log('allocateAmountToGoal: Iniciando alocação de valor para meta');
    console.log('allocateAmountToGoal: Usuário:', userId);
    console.log('allocateAmountToGoal: Meta:', goalId);
    console.log('allocateAmountToGoal: Valor:', amount);
    
    // Verificar se a meta existe
    const goal = await getGoal(userId, goalId);
    
    if (!goal) {
      throw new Error('Meta não encontrada');
    }
    
    // Se não veio de uma transação, subtrair do saldo do usuário primeiro
    if (!source) {
      console.log('allocateAmountToGoal: Atualizando saldo do usuário');
      const userRef = ref(rtdb, `users/${userId}/profile`);
      const userSnapshot = await get(userRef);
      const currentBalance = userSnapshot.val()?.totalBalance || 0;
      
      console.log('allocateAmountToGoal: Saldo atual:', currentBalance);
      console.log('allocateAmountToGoal: Novo saldo:', currentBalance - amount);
      
      // Atualizar saldo do usuário
      await update(userRef, {
        totalBalance: currentBalance - amount,
        updatedAt: new Date().toISOString()
      });
      
      console.log('allocateAmountToGoal: Saldo atualizado com sucesso');
      
      // Criar transação de transferência
      const transactionsRef = ref(rtdb, `users/${userId}/transactions`);
      const newTransactionRef = push(transactionsRef);
      const transactionId = newTransactionRef.key as string;
      
      const now = new Date().toISOString();
      const transferTransaction = {
        id: transactionId,
        type: 'expense',
        amount: amount,
        description: `Transferência para meta: ${goal.title}`,
        category: 'transferencia',
        date: now,
        goalAllocation: goalId,
        createdAt: now,
        updatedAt: now
      };
      
      console.log('allocateAmountToGoal: Criando transação de transferência:', transferTransaction);
      await set(newTransactionRef, transferTransaction);
      console.log('allocateAmountToGoal: Transação de transferência criada com sucesso');
    }
    
    // Criar a alocação
    const allocationsRef = ref(rtdb, `users/${userId}/goals/${goalId}/allocations`);
    const newAllocationRef = push(allocationsRef);
    const allocationId = newAllocationRef.key as string;
    
    // Criar objeto base da alocação
    const allocation: any = {
      id: allocationId,
      amount,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Adicionar campos opcionais apenas se existirem
    if (source) {
      allocation.source = source;
    }
    
    if (notes) {
      allocation.notes = notes;
    }
    
    // Atualizar o valor atual da meta
    await updateGoal(userId, goalId, {
      currentAmount: goal.currentAmount + amount,
      status: 'in_progress'
    });
    
    // Salvar a alocação por último
    await set(newAllocationRef, allocation);
    
    console.log('allocateAmountToGoal: Alocação concluída com sucesso');
    return allocationId;
  } catch (error) {
    console.error('Erro ao alocar valor para meta:', error);
    throw error;
  }
}

/**
 * Remove uma alocação de uma meta
 * @param userId ID do usuário
 * @param goalId ID da meta
 * @param allocationId ID da alocação
 * @param returnToBalance Se verdadeiro, devolve o valor ao saldo do usuário
 */
export async function removeAllocation(userId: string, goalId: string, allocationId: string, returnToBalance: boolean = true): Promise<void> {
  try {
    // Verificar se a meta e a alocação existem
    const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
    const allocationRef = ref(rtdb, `users/${userId}/goals/${goalId}/allocations/${allocationId}`);
    
    const [goalSnapshot, allocationSnapshot] = await Promise.all([
      get(goalRef),
      get(allocationRef)
    ]);
    
    if (!goalSnapshot.exists()) {
      throw new Error('Meta não encontrada');
    }
    
    if (!allocationSnapshot.exists()) {
      throw new Error('Alocação não encontrada');
    }
    
    const goal = goalSnapshot.val() as Goal;
    const allocation = allocationSnapshot.val() as GoalAllocation;
    
    // Remover a alocação
    await remove(allocationRef);
    
    // Atualizar o valor atual da meta
    const newAmount = Math.max(0, goal.currentAmount - allocation.amount);
    await updateGoal(userId, goalId, {
      currentAmount: newAmount,
      status: newAmount === 0 ? 'not_started' : 'in_progress'
    });
    
    // Se solicitado, devolver o valor ao saldo do usuário
    if (returnToBalance) {
      await updateUserBalance(userId, allocation.amount);
    }
  } catch (error) {
    console.error('Erro ao remover alocação:', error);
    throw error;
  }
}

/**
 * Obtém todas as alocações de uma meta
 * @param userId ID do usuário
 * @param goalId ID da meta
 * @returns Array de alocações
 */
export async function getGoalAllocations(userId: string, goalId: string): Promise<GoalAllocation[]> {
  try {
    const allocationsRef = ref(rtdb, `users/${userId}/goals/${goalId}/allocations`);
    const snapshot = await get(allocationsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const allocations: GoalAllocation[] = [];
    snapshot.forEach((childSnapshot) => {
      const allocation = childSnapshot.val() as GoalAllocation;
      allocations.push(allocation);
    });
    
    // Ordenar por data (mais recente primeiro)
    return allocations.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Erro ao buscar alocações da meta:', error);
    throw error;
  }
}

/**
 * Obtém metas por categoria
 * @param userId ID do usuário
 * @param category Categoria a ser filtrada
 * @returns Array de metas da categoria especificada
 */
export async function getGoalsByCategory(userId: string, category: string): Promise<Goal[]> {
  try {
    const goalsRef = ref(rtdb, `users/${userId}/goals`);
    const goalsQuery = query(goalsRef, orderByChild('category'), equalTo(category));
    const snapshot = await get(goalsQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const goals: Goal[] = [];
    snapshot.forEach((childSnapshot) => {
      const goal = childSnapshot.val() as Goal;
      goals.push(goal);
    });
    
    return goals;
  } catch (error) {
    console.error('Erro ao buscar metas por categoria:', error);
    throw error;
  }
}

/**
 * Obtém metas por status
 * @param userId ID do usuário
 * @param status Status a ser filtrado
 * @returns Array de metas com o status especificado
 */
export async function getGoalsByStatus(userId: string, status: Goal['status']): Promise<Goal[]> {
  try {
    const goalsRef = ref(rtdb, `users/${userId}/goals`);
    const goalsQuery = query(goalsRef, orderByChild('status'), equalTo(status));
    const snapshot = await get(goalsQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const goals: Goal[] = [];
    snapshot.forEach((childSnapshot) => {
      const goal = childSnapshot.val() as Goal;
      goals.push(goal);
    });
    
    return goals;
  } catch (error) {
    console.error('Erro ao buscar metas por status:', error);
    throw error;
  }
}
