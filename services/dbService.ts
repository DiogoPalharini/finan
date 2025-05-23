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

export interface Goal {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  createdAt: string;
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
  period: string;
  startDate: string;
  createdAt: string;
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

// Funções para metas
export const saveGoal = async (userId: string, goal: Omit<Goal, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const goalsRef = ref(rtdb, `users/${userId}/goals`);
    const newGoalRef = push(goalsRef);
    const goalId = newGoalRef.key as string;
    
    await set(newGoalRef, {
      ...goal,
      id: goalId,
      createdAt: new Date().toISOString(),
      currentAmount: goal.currentAmount || 0
    });
    
    return goalId;
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    throw error;
  }
};

export const getGoals = async (userId: string): Promise<Goal[]> => {
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
    
    return goals;
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    throw error;
  }
};

export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>): Promise<void> => {
  try {
    const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
    await update(goalRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    throw error;
  }
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
  try {
    const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
    await remove(goalRef);
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    throw error;
  }
};

// Funções para orçamentos
export const saveBudget = async (userId: string, budget: Omit<Budget, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const budgetsRef = ref(rtdb, `users/${userId}/budgets`);
    const newBudgetRef = push(budgetsRef);
    const budgetId = newBudgetRef.key as string;
    
    await set(newBudgetRef, {
      ...budget,
      id: budgetId,
      createdAt: new Date().toISOString()
    });
    
    return budgetId;
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    throw error;
  }
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  try {
    const budgetsRef = ref(rtdb, `users/${userId}/budgets`);
    const snapshot = await get(budgetsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const budgets: Budget[] = [];
    snapshot.forEach((childSnapshot) => {
      const budget = childSnapshot.val() as Budget;
      budgets.push(budget);
    });
    
    return budgets;
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    throw error;
  }
};

export const updateBudget = async (userId: string, budgetId: string, updates: Partial<Budget>): Promise<void> => {
  try {
    const budgetRef = ref(rtdb, `users/${userId}/budgets/${budgetId}`);
    await update(budgetRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    throw error;
  }
};

export const deleteBudget = async (userId: string, budgetId: string): Promise<void> => {
  try {
    const budgetRef = ref(rtdb, `users/${userId}/budgets/${budgetId}`);
    await remove(budgetRef);
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
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

// Funções para análise de dados e gráficos
export const getExpensesByCategoryAnalysis = async (userId: string, year: number, month: number): Promise<{category: string, amount: number}[]> => {
  try {
    const expenses = await getExpenses(userId);
    
    // Filtrar despesas pelo mês e ano
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
    
    // Agrupar por categoria
    const categoryMap: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    
    // Converter para array
    const result = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount
    }));
    
    // Ordenar por valor (maior para menor)
    return result.sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error('Erro ao buscar despesas por categoria:', error);
    throw error;
  }
};

export const getMonthlyBalances = async (userId: string, year: number): Promise<{month: number, income: number, expense: number, balance: number}[]> => {
  try {
    const expenses = await getExpenses(userId);
    const incomes = await getIncomes(userId);
    
    // Filtrar por ano
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year;
    });
    
    const filteredIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getFullYear() === year;
    });
    
    // Inicializar array de resultados para todos os meses
    const results: {month: number, income: number, expense: number, balance: number}[] = [];
    
    for (let month = 0; month < 12; month++) {
      // Calcular receitas do mês
      const monthlyIncomes = filteredIncomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === month;
      });
      
      const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0);
      
      // Calcular despesas do mês
      const monthlyExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month;
      });
      
      const totalExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calcular saldo
      const balance = totalIncome - totalExpense;
      
      results.push({
        month,
        income: totalIncome,
        expense: totalExpense,
        balance
      });
    }
    
    return results;
  } catch (error) {
    console.error('Erro ao buscar saldos mensais:', error);
    throw error;
  }
};

export const getExpenseTrend = async (userId: string, category: string, months: number = 6): Promise<{month: string, amount: number}[]> => {
  try {
    const expenses = await getExpenses(userId);
    const today = new Date();
    const result: {month: string, amount: number}[] = [];
    
    // Calcular os últimos X meses
    for (let i = 0; i < months; i++) {
      const targetMonth = new Date(today);
      targetMonth.setMonth(today.getMonth() - i);
      
      const year = targetMonth.getFullYear();
      const month = targetMonth.getMonth();
      
      // Filtrar despesas pelo mês, ano e categoria
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === year && 
               expenseDate.getMonth() === month &&
               (category === 'all' || expense.category === category);
      });
      
      // Somar os valores
      const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Formatar nome do mês
      const monthName = targetMonth.toLocaleString('pt-BR', { month: 'short' });
      
      result.unshift({
        month: monthName,
        amount: total
      });
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao buscar tendência de despesas:', error);
    throw error;
  }
};

// Funções para relatórios
export const generateMonthlyReport = async (userId: string, year: number, month: number): Promise<{
  income: number;
  expenses: number;
  balance: number;
  topExpenseCategories: {category: string, amount: number, percentage: number}[];
  goals: {title: string, progress: number, currentAmount: number, targetAmount: number}[];
  budgets: {category: string, limit: number, spent: number, percentage: number}[];
}> => {
  try {
    // Buscar receitas e despesas
    const totalIncome = await getTotalIncomesByMonth(userId, year, month);
    const totalExpenses = await getTotalExpensesByMonth(userId, year, month);
    const balance = totalIncome - totalExpenses;
    
    // Buscar categorias de despesas
    const expenseCategories = await getExpensesByCategoryAnalysis(userId, year, month);
    
    // Calcular percentuais
    const topExpenseCategories = expenseCategories.map(item => ({
      category: item.category,
      amount: item.amount,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
    }));
    
    // Buscar metas
    const goals = await getGoals(userId);
    const goalsData = goals.map(goal => ({
      title: goal.title,
      progress: goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount
    }));
    
    // Buscar orçamentos
    const budgets = await getBudgets(userId);
    const budgetsData = await Promise.all(budgets.map(async budget => {
      // Buscar despesas da categoria no mês
      const categoryExpenses = await getExpensesByCategory(userId, budget.category);
      const filteredExpenses = categoryExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
      });
      
      const spent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        category: budget.category,
        limit: budget.limit,
        spent,
        percentage: budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      };
    }));
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      topExpenseCategories,
      goals: goalsData,
      budgets: budgetsData
    };
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    throw error;
  }
};
