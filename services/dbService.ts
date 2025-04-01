import { rtdb } from '../config/firebaseConfig';
import { ref, push, get } from "firebase/database";

// Função para salvar uma despesa no Realtime Database
export async function saveExpense(userId: string, expense: { amount: number, description: string, category: string, date: string }) {
  const expenseRef = ref(rtdb, `users/${userId}/expenses`);
  await push(expenseRef, expense);
}

// Função para salvar uma receita no Realtime Database
export async function saveIncome(userId: string, income: { amount: number, description: string, source: string, date: string }) {
  const incomeRef = ref(rtdb, `users/${userId}/incomes`);
  await push(incomeRef, income);
}

// Função para recuperar as despesas do Realtime Database
export async function getExpenses(userId: string) {
  const expensesRef = ref(rtdb, `users/${userId}/expenses`);
  const snapshot = await get(expensesRef);
  if (snapshot.exists()) {
    const expensesObj = snapshot.val();
    return Object.entries(expensesObj).map(([id, expense]) => ({ id, ...expense }));
  }
  return [];
}

// Função para recuperar as receitas do Realtime Database
export async function getIncomes(userId: string) {
  const incomesRef = ref(rtdb, `users/${userId}/incomes`);
  const snapshot = await get(incomesRef);
  if (snapshot.exists()) {
    const incomesObj = snapshot.val();
    return Object.entries(incomesObj).map(([id, income]) => ({ id, ...income }));
  }
  return [];
}