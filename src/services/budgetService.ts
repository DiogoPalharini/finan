// services/budgetService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, onValue, remove, get } from 'firebase/database';

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

/**
 * Cria um novo orçamento e gera um ID único
 */
export async function createBudget(userId: string, budget: Omit<Budget, 'id'>) {
  const budgetsRef = ref(rtdb, `users/${userId}/budgets`);
  const newRef = await push(budgetsRef, budget);
  return newRef.key!;
}

/**
 * Inscreve para receber a lista de orçamentos com IDs
 */
export function subscribeBudgets(
  userId: string,
  callback: (budgets: Budget[]) => void
) {
  const budgetsRef = ref(rtdb, `users/${userId}/budgets`);
  const unsubscribe = onValue(budgetsRef, snapshot => {
    const data = snapshot.val() || {};
    const list: Budget[] = Object.entries(data).map(
      ([id, val]: [string, any]) => ({ id, category: val.category, limit: val.limit })
    );
    callback(list);
  });
  return unsubscribe;
}

/**
 * Remove orçamento pelo ID
 */
export async function deleteBudget(userId: string, budgetId: string) {
  const budgetRef = ref(rtdb, `users/${userId}/budgets/${budgetId}`);
  await remove(budgetRef);
}

/**
 * Obtém todos os orçamentos
 */
export async function getBudgets(userId: string): Promise<Budget[]> {
  const snapshot = await get(ref(rtdb, `users/${userId}/budgets`));
  const data = snapshot.val() || {};
  return Object.entries(data).map(
    ([id, val]: [string, any]) => ({ id, category: val.category, limit: val.limit })
  );
}
