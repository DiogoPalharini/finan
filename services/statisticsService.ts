// services/statisticsService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, set, get, update } from 'firebase/database';
import { getTransactionsByType } from './transactionService';
import { getGoals } from './goalService';
import { Transaction } from './transactionService';
import { calculateByField, getCategoryExpenses, getTotalExpensesByMonth, getTotalIncomesByMonth } from './utils/transactionUtils';

// Interface para estatísticas mensais
export interface MonthlyStatistics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  expensesByCategory: Record<string, number>;
  incomeBySource: Record<string, number>;
  goalContributions: number;
  updatedAt: string;
}

/**
 * Calcula e salva estatísticas para um mês específico
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 */
export async function calculateAndSaveMonthlyStatistics(userId: string, year: number, month: number): Promise<void> {
  try {
    // Obter transações do mês
    const expenses = await getTransactionsByType(userId, 'expense');
    const incomes = await getTransactionsByType(userId, 'income');
    
    // Calcular totais
    const totalIncome = getTotalIncomesByMonth(incomes, year, month);
    const totalExpense = getTotalExpensesByMonth(expenses, year, month);
    const balance = totalIncome - totalExpense;
    
    // Calcular taxa de economia
    const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
    
    // Calcular despesas por categoria e receitas por fonte
    const expensesByCategory = calculateByField(expenses, 'category', year, month);
    const incomeBySource = calculateByField(incomes, 'source', year, month);
    
    // Calcular contribuições para metas
    const goalContributions = await calculateGoalContributions(userId, year, month);
    
    // Criar objeto de estatísticas
    const statistics: MonthlyStatistics = {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      expensesByCategory,
      incomeBySource,
      goalContributions,
      updatedAt: new Date().toISOString()
    };
    
    // Salvar no banco de dados
    const statisticsRef = ref(rtdb, `users/${userId}/statistics/${year}/${month}`);
    await set(statisticsRef, statistics);
  } catch (error) {
    console.error('Erro ao calcular estatísticas mensais:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas de um mês específico
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Objeto com estatísticas ou null se não existir
 */
export async function getMonthlyStatistics(userId: string, year: number, month: number): Promise<MonthlyStatistics | null> {
  try {
    const statisticsRef = ref(rtdb, `users/${userId}/statistics/${year}/${month}`);
    const snapshot = await get(statisticsRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as MonthlyStatistics;
    }
    
    // Se não existir, calcular e salvar
    await calculateAndSaveMonthlyStatistics(userId, year, month);
    
    // Buscar novamente
    const updatedSnapshot = await get(statisticsRef);
    return updatedSnapshot.val() as MonthlyStatistics;
  } catch (error) {
    console.error('Erro ao obter estatísticas mensais:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas de vários meses
 * @param userId ID do usuário
 * @param year Ano
 * @returns Array de estatísticas mensais
 */
export async function getYearlyStatistics(userId: string, year: number): Promise<(MonthlyStatistics | null)[]> {
  try {
    const statistics: (MonthlyStatistics | null)[] = [];
    
    // Obter estatísticas de cada mês
    for (let month = 0; month < 12; month++) {
      const monthStats = await getMonthlyStatistics(userId, year, month);
      statistics.push(monthStats);
    }
    
    return statistics;
  } catch (error) {
    console.error('Erro ao obter estatísticas anuais:', error);
    throw error;
  }
}

/**
 * Calcula o total de contribuições para metas em um mês
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Total de contribuições
 */
async function calculateGoalContributions(userId: string, year: number, month: number): Promise<number> {
  try {
    const goals = await getGoals(userId);
    let totalContributions = 0;
    
    // Para cada meta, somar as alocações do mês
    for (const goal of goals) {
      const goalRef = ref(rtdb, `users/${userId}/goals/${goal.id}/allocations`);
      const snapshot = await get(goalRef);
      
      if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
          const allocation = childSnapshot.val();
          const allocationDate = new Date(allocation.date);
          
          if (allocationDate.getFullYear() === year && allocationDate.getMonth() === month) {
            totalContributions += allocation.amount;
          }
        });
      }
    }
    
    return totalContributions;
  } catch (error) {
    console.error('Erro ao calcular contribuições para metas:', error);
    return 0;
  }
}

/**
 * Gera um relatório mensal completo
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Objeto com relatório detalhado
 */
export async function generateMonthlyReport(userId: string, year: number, month: number): Promise<{
  statistics: MonthlyStatistics;
  topExpenses: Transaction[];
  topIncomes: Transaction[];
  budgetStatus: Record<string, { limit: number; spent: number; percentage: number }>;
  goalProgress: { title: string; progress: number; target: number; percentage: number }[];
}> {
  try {
    // Obter estatísticas
    const statistics = await getMonthlyStatistics(userId, year, month);
    
    if (!statistics) {
      throw new Error('Estatísticas não encontradas');
    }
    
    // Obter transações do mês
    const expenses = await getTransactionsByType(userId, 'expense');
    const incomes = await getTransactionsByType(userId, 'income');
    
    // Filtrar por mês e ano
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0).getTime();
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date).getTime();
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const monthIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date).getTime();
      return incomeDate >= monthStart && incomeDate <= monthEnd;
    });
    
    // Ordenar por valor (maior para menor)
    const topExpenses = monthExpenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const topIncomes = monthIncomes
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Obter status dos orçamentos
    const budgetsRef = ref(rtdb, `users/${userId}/budgets/${year}/${month}`);
    const budgetsSnapshot = await get(budgetsRef);
    
    const budgetStatus: Record<string, { limit: number; spent: number; percentage: number }> = {};
    
    if (budgetsSnapshot.exists()) {
      const budgets = budgetsSnapshot.val();
      
      for (const category in budgets) {
        const budget = budgets[category];
        budgetStatus[category] = {
          limit: budget.limit,
          spent: budget.spent,
          percentage: (budget.spent / budget.limit) * 100
        };
      }
    }
    
    // Obter progresso das metas
    const goals = await getGoals(userId);
    
    const goalProgress = goals.map(goal => ({
      title: goal.title,
      progress: goal.currentAmount,
      target: goal.targetAmount,
      percentage: (goal.currentAmount / goal.targetAmount) * 100
    }));
    
    return {
      statistics,
      topExpenses,
      topIncomes,
      budgetStatus,
      goalProgress
    };
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    throw error;
  }
}

/**
 * Atualiza estatísticas após uma nova transação
 * @param userId ID do usuário
 * @param transaction Transação adicionada
 */
export async function updateStatisticsAfterTransaction(userId: string, transaction: Transaction): Promise<void> {
  try {
    const transactionDate = new Date(transaction.date);
    const year = transactionDate.getFullYear();
    const month = transactionDate.getMonth();
    
    // Verificar se já existem estatísticas para este mês
    const statisticsRef = ref(rtdb, `users/${userId}/statistics/${year}/${month}`);
    const snapshot = await get(statisticsRef);
    
    if (snapshot.exists()) {
      // Atualizar estatísticas existentes
      const statistics = snapshot.val() as MonthlyStatistics;
      
      if (transaction.type === 'income') {
        statistics.totalIncome += transaction.amount;
        
        // Atualizar receitas por fonte
        const source = transaction.source || 'outros';
        if (!statistics.incomeBySource[source]) {
          statistics.incomeBySource[source] = 0;
        }
        statistics.incomeBySource[source] += transaction.amount;
      } else {
        statistics.totalExpense += transaction.amount;
        
        // Atualizar despesas por categoria
        const category = transaction.category || 'outros';
        if (!statistics.expensesByCategory[category]) {
          statistics.expensesByCategory[category] = 0;
        }
        statistics.expensesByCategory[category] += transaction.amount;
      }
      
      // Recalcular saldo e taxa de economia
      statistics.balance = statistics.totalIncome - statistics.totalExpense;
      statistics.savingsRate = statistics.totalIncome > 0 ? 
        Math.round((statistics.balance / statistics.totalIncome) * 100) : 0;
      
      // Atualizar data de atualização
      statistics.updatedAt = new Date().toISOString();
      
      await set(statisticsRef, statistics);
    } else {
      // Calcular estatísticas do zero
      await calculateAndSaveMonthlyStatistics(userId, year, month);
    }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas após transação:', error);
    throw error;
  }
}
