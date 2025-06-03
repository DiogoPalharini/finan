// services/budgetService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, set, get, update, remove, query, orderByChild, equalTo, push } from 'firebase/database';
import { getTotalExpensesByMonth, getTransactionsByType } from './transactionService';
import { createBudgetWarningNotification } from './notificationService';
import { calculateAndSaveMonthlyStatistics } from './statisticsService';
import { getCategoryExpenses } from './utils/transactionUtils';
import { Transaction } from './transactionService';

// Interface para orçamentos
export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  spent: number;
  remaining: number;
  status: 'on_track' | 'warning' | 'exceeded';
  warningThreshold: number;
  notifications: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cria ou atualiza um orçamento para uma categoria em um mês específico
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @param category Categoria
 * @param limit Valor limite
 * @param notifications Se deve enviar notificações
 * @param warningThreshold Percentual para alerta (padrão: 80)
 */
export async function setBudget(
  userId: string, 
  year: number, 
  month: number, 
  category: string, 
  limit: number,
  notifications: boolean = true,
  warningThreshold: number = 80
): Promise<void> {
  try {
    // Obter transações do mês
    const expenses = await getTransactionsByType(userId, 'expense');
    
    // Calcular gastos atuais na categoria
    const spent = getCategoryExpenses(expenses, year, month, category);
    const remaining = Math.max(0, limit - spent);
    const status = getStatus(spent, limit, warningThreshold);
    
    const budgetRef = ref(rtdb, `users/${userId}/budgets/${year}/${month}/${category}`);
    
    const budget: Budget = {
      id: category,
      category,
      limit,
      period: 'monthly',
      startDate: new Date(year, month, 1).toISOString(),
      spent,
      remaining,
      status,
      notifications,
      warningThreshold,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await set(budgetRef, budget);
  } catch (error) {
    console.error('Erro ao definir orçamento:', error);
    throw error;
  }
}

/**
 * Obtém todos os orçamentos de um mês específico
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Objeto com orçamentos por categoria
 */
export async function getBudgets(userId: string, year: number, month: number): Promise<Record<string, Budget>> {
  try {
    const budgetsRef = ref(rtdb, `users/${userId}/budgets/${year}/${month}`);
    const snapshot = await get(budgetsRef);
    
    if (!snapshot.exists()) {
      return {};
    }
    
    return snapshot.val() as Record<string, Budget>;
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    throw error;
  }
}

/**
 * Obtém um orçamento específico
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @param category Categoria
 * @returns Objeto do orçamento ou null se não existir
 */
export async function getBudget(userId: string, year: number, month: number, category: string): Promise<Budget | null> {
  try {
    const budgetRef = ref(rtdb, `users/${userId}/budgets/${year}/${month}/${category}`);
    const snapshot = await get(budgetRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Budget;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    throw error;
  }
}

/**
 * Exclui um orçamento
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @param category Categoria
 */
export async function deleteBudget(userId: string, year: number, month: number, category: string): Promise<void> {
  try {
    const budgetRef = ref(rtdb, `users/${userId}/budgets/${year}/${month}/${category}`);
    await remove(budgetRef);
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    throw error;
  }
}

/**
 * Atualiza os valores gastos em todos os orçamentos de um mês
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 */
export async function updateBudgetsSpent(userId: string, year: number, month: number): Promise<void> {
  try {
    const budgets = await getBudgets(userId, year, month);
    const expenses = await getTransactionsByType(userId, 'expense');
    
    for (const category in budgets) {
      const budget = budgets[category];
      const spent = getCategoryExpenses(expenses, year, month, category);
      const remaining = Math.max(0, budget.limit - spent);
      const status = getStatus(spent, budget.limit, budget.warningThreshold);
      
      const budgetRef = ref(rtdb, `users/${userId}/budgets/${year}/${month}/${category}`);
      await update(budgetRef, {
        spent,
        remaining,
        status,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar gastos dos orçamentos:', error);
    throw error;
  }
}

/**
 * Determina o status do orçamento com base nos gastos
 * @param spent Valor gasto
 * @param limit Limite do orçamento
 * @param warningThreshold Percentual para alerta
 * @returns Status do orçamento
 */
function getStatus(spent: number, limit: number, warningThreshold: number): Budget['status'] {
  const percentage = (spent / limit) * 100;
  
  if (percentage >= 100) {
    return 'exceeded';
  } else if (percentage >= warningThreshold) {
    return 'warning';
  } else {
    return 'on_track';
  }
}

/**
 * Verifica se algum orçamento precisa de notificação
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Array de orçamentos que precisam de notificação
 */
export async function checkBudgetsForNotifications(userId: string, year: number, month: number): Promise<Budget[]> {
  try {
    const budgets = await getBudgets(userId, year, month);
    const needNotification: Budget[] = [];
    
    for (const category in budgets) {
      const budget = budgets[category];
      
      if (budget.notifications && (budget.status === 'warning' || budget.status === 'exceeded')) {
        needNotification.push(budget);
      }
    }
    
    return needNotification;
  } catch (error) {
    console.error('Erro ao verificar notificações de orçamentos:', error);
    throw error;
  }
}

/**
 * Inicializa orçamentos para um novo mês com base no mês anterior
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 */
export async function initializeMonthBudgets(userId: string, year: number, month: number): Promise<void> {
  try {
    // Calcular mês anterior
    let previousYear = year;
    let previousMonth = month - 1;
    
    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear--;
    }
    
    // Obter orçamentos do mês anterior
    const previousBudgets = await getBudgets(userId, previousYear, previousMonth);
    
    // Criar orçamentos para o novo mês com os mesmos limites
    for (const category in previousBudgets) {
      const previousBudget = previousBudgets[category];
      
      await setBudget(
        userId,
        year,
        month,
        category,
        previousBudget.limit,
        previousBudget.notifications,
        previousBudget.warningThreshold
      );
    }
  } catch (error) {
    console.error('Erro ao inicializar orçamentos do mês:', error);
    throw error;
  }
}

export async function createBudget(userId: string, budget: Omit<Budget, 'id' | 'spent' | 'remaining' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Validações
    if (budget.limit <= 0) {
      throw new Error('O limite do orçamento deve ser maior que zero');
    }
    if (budget.warningThreshold < 0 || budget.warningThreshold > 100) {
      throw new Error('O limiar de alerta deve estar entre 0 e 100');
    }

    const now = new Date().toISOString();
    const budgetRef = ref(rtdb, `users/${userId}/budgets`);
    const newBudgetRef = push(budgetRef);
    
    const newBudget: Budget = {
      ...budget,
      id: newBudgetRef.key!,
      spent: 0,
      remaining: budget.limit,
      status: 'on_track',
      createdAt: now,
      updatedAt: now
    };
    
    await set(newBudgetRef, newBudget);
    return newBudget.id;
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    throw error;
  }
}

export async function updateBudget(userId: string, budgetId: string, updates: Partial<Budget>): Promise<void> {
  try {
    // Validações
    if (updates.limit !== undefined && updates.limit <= 0) {
      throw new Error('O limite do orçamento deve ser maior que zero');
    }
    if (updates.warningThreshold !== undefined && (updates.warningThreshold < 0 || updates.warningThreshold > 100)) {
      throw new Error('O limiar de alerta deve estar entre 0 e 100');
    }
    if (updates.spent !== undefined && updates.spent < 0) {
      throw new Error('O valor gasto não pode ser negativo');
    }

    const budgetRef = ref(rtdb, `users/${userId}/budgets/${budgetId}`);
    const budgetSnapshot = await get(budgetRef);
    
    if (!budgetSnapshot.exists()) {
      throw new Error('Orçamento não encontrado');
    }

    const currentBudget = budgetSnapshot.val() as Budget;
    const now = new Date().toISOString();

    // Atualizar valores calculados
    if (updates.limit !== undefined) {
      updates.remaining = updates.limit - (updates.spent ?? currentBudget.spent);
    }
    if (updates.spent !== undefined) {
      updates.remaining = (updates.limit ?? currentBudget.limit) - updates.spent;
    }

    // Atualizar status
    if (updates.remaining !== undefined) {
      const limit = updates.limit ?? currentBudget.limit;
      const warningThreshold = updates.warningThreshold ?? currentBudget.warningThreshold;
      const warningAmount = limit * (warningThreshold / 100);

      if (updates.remaining <= 0) {
        updates.status = 'exceeded';
      } else if (updates.remaining <= warningAmount) {
        updates.status = 'warning';
      } else {
        updates.status = 'on_track';
      }

      // Criar notificação se necessário
      const spent = updates.spent ?? currentBudget.spent;
      const percentage = (spent / limit) * 100;
      
      if (percentage >= warningThreshold) {
        await createBudgetWarningNotification(
          userId,
          currentBudget.category,
          Math.round(percentage),
          budgetId
        );
      }
    }

    await update(budgetRef, {
      ...updates,
      updatedAt: now
    });

    // Atualizar estatísticas
    const currentDate = new Date();
    await calculateAndSaveMonthlyStatistics(userId, currentDate.getFullYear(), currentDate.getMonth());
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    throw error;
  }
}

export async function updateBudgetSpent(userId: string, budgetId: string): Promise<void> {
  try {
    const budgetRef = ref(rtdb, `users/${userId}/budgets/${budgetId}`);
    const budgetSnapshot = await get(budgetRef);
    
    if (!budgetSnapshot.exists()) {
      throw new Error('Orçamento não encontrado');
    }

    const budget = budgetSnapshot.val() as Budget;
    const now = new Date();
    // Buscar todas as despesas do usuário
    const expenses = await getTransactionsByType(userId, 'expense');
    // Calcular o gasto na categoria correta
    const spent = getCategoryExpenses(
      expenses,
      now.getFullYear(),
      now.getMonth(),
      budget.category
    );

    await updateBudget(userId, budgetId, { spent });
  } catch (error) {
    console.error('Erro ao atualizar gastos do orçamento:', error);
    throw error;
  }
}
