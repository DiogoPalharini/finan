// services/dbService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, set, get, remove, update, query, orderByChild, equalTo } from 'firebase/database';

// Tipos para TypeScript
export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface Income {
  id?: string;
  amount: number;
  description: string;
  source: string;
  date: string;
}

// Funções para despesas
export const saveExpense = async (userId: string, expense: Expense): Promise<string> => {
  try {
    const expensesRef = ref(rtdb, `users/${userId}/expenses`);
    const newExpenseRef = push(expensesRef);
    const expenseId = newExpenseRef.key as string;
    
    await set(newExpenseRef, {
      ...expense,
      id: expenseId
    });
    
    return expenseId;
  } catch (error) {
    console.error('Erro ao salvar despesa:', error);
    throw error;
  }
};

export const getExpenses = async (userId: string): Promise<Expense[]> => {
  try {
    const expensesRef = ref(rtdb, `users/${userId}/expenses`);
    const snapshot = await get(expensesRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const expenses: Expense[] = [];
    snapshot.forEach((childSnapshot) => {
      const expense = childSnapshot.val() as Expense;
      expenses.push(expense);
    });
    
    return expenses;
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    throw error;
  }
};

export const getExpensesByCategory = async (userId: string, category: string): Promise<Expense[]> => {
  try {
    const expensesRef = ref(rtdb, `users/${userId}/expenses`);
    const expensesQuery = query(expensesRef, orderByChild('category'), equalTo(category));
    const snapshot = await get(expensesQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const expenses: Expense[] = [];
    snapshot.forEach((childSnapshot) => {
      const expense = childSnapshot.val() as Expense;
      expenses.push(expense);
    });
    
    return expenses;
  } catch (error) {
    console.error('Erro ao buscar despesas por categoria:', error);
    throw error;
  }
};

export const updateExpense = async (userId: string, expenseId: string, updates: Partial<Expense>): Promise<void> => {
  try {
    const expenseRef = ref(rtdb, `users/${userId}/expenses/${expenseId}`);
    await update(expenseRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
};

export const deleteExpense = async (userId: string, expenseId: string): Promise<void> => {
  try {
    const expenseRef = ref(rtdb, `users/${userId}/expenses/${expenseId}`);
    await remove(expenseRef);
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    throw error;
  }
};

// Funções para receitas
export const saveIncome = async (userId: string, income: Income): Promise<string> => {
  try {
    const incomesRef = ref(rtdb, `users/${userId}/incomes`);
    const newIncomeRef = push(incomesRef);
    const incomeId = newIncomeRef.key as string;
    
    await set(newIncomeRef, {
      ...income,
      id: incomeId
    });
    
    return incomeId;
  } catch (error) {
    console.error('Erro ao salvar receita:', error);
    throw error;
  }
};

export const getIncomes = async (userId: string): Promise<Income[]> => {
  try {
    const incomesRef = ref(rtdb, `users/${userId}/incomes`);
    const snapshot = await get(incomesRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const incomes: Income[] = [];
    snapshot.forEach((childSnapshot) => {
      const income = childSnapshot.val() as Income;
      incomes.push(income);
    });
    
    return incomes;
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    throw error;
  }
};

export const getIncomesBySource = async (userId: string, source: string): Promise<Income[]> => {
  try {
    const incomesRef = ref(rtdb, `users/${userId}/incomes`);
    const incomesQuery = query(incomesRef, orderByChild('source'), equalTo(source));
    const snapshot = await get(incomesQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const incomes: Income[] = [];
    snapshot.forEach((childSnapshot) => {
      const income = childSnapshot.val() as Income;
      incomes.push(income);
    });
    
    return incomes;
  } catch (error) {
    console.error('Erro ao buscar receitas por fonte:', error);
    throw error;
  }
};

export const updateIncome = async (userId: string, incomeId: string, updates: Partial<Income>): Promise<void> => {
  try {
    const incomeRef = ref(rtdb, `users/${userId}/incomes/${incomeId}`);
    await update(incomeRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    throw error;
  }
};

export const deleteIncome = async (userId: string, incomeId: string): Promise<void> => {
  try {
    const incomeRef = ref(rtdb, `users/${userId}/incomes/${incomeId}`);
    await remove(incomeRef);
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    throw error;
  }
};

// Funções para estatísticas
export const getTotalExpensesByMonth = async (userId: string, year: number, month: number): Promise<number> => {
  try {
    const expenses = await getExpenses(userId);
    
    // Filtrar despesas pelo mês e ano
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
    
    // Somar os valores
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return total;
  } catch (error) {
    console.error('Erro ao calcular total de despesas por mês:', error);
    throw error;
  }
};

export const getTotalIncomesByMonth = async (userId: string, year: number, month: number): Promise<number> => {
  try {
    const incomes = await getIncomes(userId);
    
    // Filtrar receitas pelo mês e ano
    const filteredIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getFullYear() === year && incomeDate.getMonth() === month;
    });
    
    // Somar os valores
    const total = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
    
    return total;
  } catch (error) {
    console.error('Erro ao calcular total de receitas por mês:', error);
    throw error;
  }
};

export const getBalanceByMonth = async (userId: string, year: number, month: number): Promise<number> => {
  try {
    const totalIncomes = await getTotalIncomesByMonth(userId, year, month);
    const totalExpenses = await getTotalExpensesByMonth(userId, year, month);
    
    return totalIncomes - totalExpenses;
  } catch (error) {
    console.error('Erro ao calcular saldo por mês:', error);
    throw error;
  }
};

// Função para buscar transações por texto
export const searchTransactions = async (userId: string, searchText: string): Promise<{expenses: Expense[], incomes: Income[]}> => {
  try {
    const expenses = await getExpenses(userId);
    const incomes = await getIncomes(userId);
    
    const query = searchText.toLowerCase();
    
    const filteredExpenses = expenses.filter(expense => 
      expense.description.toLowerCase().includes(query) || 
      expense.category.toLowerCase().includes(query)
    );
    
    const filteredIncomes = incomes.filter(income => 
      income.description.toLowerCase().includes(query) || 
      income.source.toLowerCase().includes(query)
    );
    
    return {
      expenses: filteredExpenses,
      incomes: filteredIncomes
    };
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};
