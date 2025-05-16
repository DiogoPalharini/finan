// services/dbService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, get, remove } from 'firebase/database';

export async function saveExpense(
  userId: string,
  expense: { amount: number; description: string; category: string; date: string }
) {
  const expenseRef = ref(rtdb, `users/${userId}/expenses`);
  await push(expenseRef, expense);
}

export async function saveIncome(
  userId: string,
  income: { amount: number; description: string; source: string; date: string }
) {
  const incomeRef = ref(rtdb, `users/${userId}/incomes`);
  await push(incomeRef, income);
}

export async function getExpenses(userId: string) {
  const expensesRef = ref(rtdb, `users/${userId}/expenses`);
  const snapshot = await get(expensesRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data).map(([id, exp]: any) => ({ id, ...exp }));
  }
  return [];
}

export async function getIncomes(userId: string) {
  const incomesRef = ref(rtdb, `users/${userId}/incomes`);
  const snapshot = await get(incomesRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data).map(([id, inc]: any) => ({ id, ...inc }));
  }
  return [];
}

export async function deleteExpense(userId: string, expenseId: string) {
  const itemRef = ref(rtdb, `users/${userId}/expenses/${expenseId}`);
  await remove(itemRef);
}

export async function deleteIncome(userId: string, incomeId: string) {
  const itemRef = ref(rtdb, `users/${userId}/incomes/${incomeId}`);
  await remove(itemRef);
}

export async function getTotalIncomeByCategory(
  userId: string
): Promise<Record<string, number>> {
  const incomes = await getIncomes(userId);
  const totals: Record<string, number> = {};
  incomes.forEach(({ source, amount }) => {
    totals[source] = (totals[source] || 0) + amount;
  });
  return totals;
}

/**
 * Retorna o total de despesas por categoria do usuário
 */
export async function getTotalExpensesByCategory(
  userId: string
): Promise<Record<string, number>> {
  const expenses = await getExpenses(userId);
  const totals: Record<string, number> = {};
  expenses.forEach(({ category, amount }) => {
    totals[category] = (totals[category] || 0) + amount;
  });
  return totals;
}