// services/budgetService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, set, get, onValue } from 'firebase/database';

export interface Budget {
  category: string;
  limit: number;
}

export async function setBudget(userId: string, budget: Budget) {
  await set(ref(rtdb, `users/${userId}/budgets/${budget.category}`), budget);
}

export function subscribeBudgets(userId: string, callback: (budgets: Budget[]) => void) {
  const budgetsRef = ref(rtdb, `users/${userId}/budgets`);
  onValue(budgetsRef, snapshot => {
    const data = snapshot.val() || {};
    const list = Object.values(data) as Budget[];
    callback(list);
  });
}

export async function getBudgets(userId: string): Promise<Budget[]> {
  const snapshot = await get(ref(rtdb, `users/${userId}/budgets`));
  const data = snapshot.val() || {};
  return Object.values(data) as Budget[];
}
