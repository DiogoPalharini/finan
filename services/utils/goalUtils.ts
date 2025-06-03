import { rtdb } from '../../config/firebaseConfig';
import { ref, push, set, get, update } from 'firebase/database';
import { updateUserBalance } from '../userService';
import { Goal } from '../goalService';

/**
 * Aloca um valor para uma meta
 * @param userId ID do usuário
 * @param goalId ID da meta
 * @param amount Valor a ser alocado
 * @param source ID da transação de origem (opcional)
 * @param notes Observações (opcional)
 * @returns ID da alocação criada
 */
export async function allocateToGoal(
  userId: string, 
  goalId: string, 
  amount: number, 
  source?: string, 
  notes?: string
): Promise<string> {
  try {
    // Verificar se a meta existe
    const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
    const snapshot = await get(goalRef);
    
    if (!snapshot.exists()) {
      throw new Error('Meta não encontrada');
    }
    
    const goal = snapshot.val() as Goal;
    
    // Validar se o valor não excede o valor alvo
    const newAmount = goal.currentAmount + amount;
    if (newAmount > goal.targetAmount) {
      throw new Error('Valor alocado excede o valor alvo da meta');
    }
    
    // Criar a alocação
    const allocationsRef = ref(rtdb, `users/${userId}/goals/${goalId}/allocations`);
    const newAllocationRef = push(allocationsRef);
    const allocationId = newAllocationRef.key as string;
    
    const allocation = {
      id: allocationId,
      amount,
      date: new Date().toISOString(),
      source,
      notes,
      createdAt: new Date().toISOString()
    };
    
    await set(newAllocationRef, allocation);
    
    // Atualizar o valor atual da meta
    await update(goalRef, {
      currentAmount: newAmount,
      status: newAmount >= goal.targetAmount ? 'completed' : 'in_progress',
      updatedAt: new Date().toISOString()
    });
    
    // Se não veio de uma transação, subtrair do saldo do usuário
    if (!source) {
      await updateUserBalance(userId, -amount);
    }
    
    return allocationId;
  } catch (error) {
    console.error('Erro ao alocar valor para meta:', error);
    throw error;
  }
} 