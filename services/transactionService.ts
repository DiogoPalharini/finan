// services/transactionService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, set, get, query, orderByChild, equalTo, update, remove } from 'firebase/database';
import { updateUserBalance } from './userService';
import { createRecurringTransactionNotification } from './notificationService';
import { calculateAndSaveMonthlyStatistics } from './statisticsService';
import { allocateAmountToGoal } from './goalService';
import { getTotalExpensesByMonth, getTotalIncomesByMonth } from './utils/transactionUtils';

// Interface para transações (unificando despesas e receitas)
export interface Transaction {
  id?: string;
  type: 'expense' | 'income';
  amount: number;
  description: string;
  category?: string;  // para despesas
  source?: string;    // para receitas
  date: string;
  paymentMethod?: string;
  installments?: {
    total: number;
    current: number;
  };
  tags?: string[];
  recurringId?: string;
  goalAllocation?: string;
  attachments?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Income {
  id?: string;
  amount: number;
  description: string;
  source: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Salva uma nova transação (despesa ou receita)
 * @param userId ID do usuário
 * @param transaction Dados da transação
 * @returns ID da transação criada
 */
export async function saveTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const transactionsRef = ref(rtdb, `users/${userId}/transactions`);
    const newTransactionRef = push(transactionsRef);
    const transactionId = newTransactionRef.key as string;
    
    const now = new Date().toISOString();
    
    const completeTransaction = {
      ...transaction,
      id: transactionId,
      createdAt: now,
      updatedAt: now
    };
    
    await set(newTransactionRef, completeTransaction);
    
    // Atualizar o saldo do usuário
    const amountChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    await updateUserBalance(userId, amountChange);
    
    // Se houver alocação para meta, atualizar a meta
    if (transaction.goalAllocation && transaction.type === 'income') {
      await allocateAmountToGoal(userId, transaction.goalAllocation, transaction.amount, transactionId);
    }
    
    return transactionId;
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    throw error;
  }
}

/**
 * Obtém todas as transações do usuário
 * @param userId ID do usuário
 * @returns Array de transações
 */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const transactionsRef = ref(rtdb, `users/${userId}/transactions`);
    const snapshot = await get(transactionsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const transactions: Transaction[] = [];
    snapshot.forEach((childSnapshot) => {
      const transaction = childSnapshot.val() as Transaction;
      transactions.push(transaction);
    });
    
    // Ordenar por data (mais recente primeiro)
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
}

/**
 * Obtém transações por tipo (despesa ou receita)
 * @param userId ID do usuário
 * @param type Tipo da transação ('expense' ou 'income')
 * @returns Array de transações do tipo especificado
 */
export async function getTransactionsByType(userId: string, type: 'expense' | 'income'): Promise<Transaction[]> {
  try {
    const transactionsRef = ref(rtdb, `users/${userId}/transactions`);
    const transactionsQuery = query(transactionsRef, orderByChild('type'), equalTo(type));
    const snapshot = await get(transactionsQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const transactions: Transaction[] = [];
    snapshot.forEach((childSnapshot) => {
      const transaction = childSnapshot.val() as Transaction;
      transactions.push(transaction);
    });
    
    // Ordenar por data (mais recente primeiro)
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error(`Erro ao buscar transações do tipo ${type}:`, error);
    throw error;
  }
}

/**
 * Obtém transações por período
 * @param userId ID do usuário
 * @param startDate Data inicial (formato ISO)
 * @param endDate Data final (formato ISO)
 * @returns Array de transações no período especificado
 */
export async function getTransactionsByPeriod(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
  try {
    const transactions = await getTransactions(userId);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      
      return transactionDate >= start && transactionDate <= end;
    });
  } catch (error) {
    console.error('Erro ao buscar transações por período:', error);
    throw error;
  }
}

/**
 * Obtém transações por categoria (para despesas) ou fonte (para receitas)
 * @param userId ID do usuário
 * @param type Tipo da transação ('expense' ou 'income')
 * @param value Categoria ou fonte a ser filtrada
 * @returns Array de transações filtradas
 */
export async function getTransactionsByCategory(userId: string, type: 'expense' | 'income', value: string): Promise<Transaction[]> {
  try {
    const field = type === 'expense' ? 'category' : 'source';
    const transactions = await getTransactionsByType(userId, type);
    
    return transactions.filter(transaction => transaction[field] === value);
  } catch (error) {
    console.error(`Erro ao buscar transações por ${type === 'expense' ? 'categoria' : 'fonte'}:`, error);
    throw error;
  }
}

/**
 * Atualiza uma transação existente
 * @param userId ID do usuário
 * @param transactionId ID da transação
 * @param updates Campos a serem atualizados
 */
export async function updateTransaction(userId: string, transactionId: string, updates: Partial<Transaction>): Promise<void> {
  try {
    const transactionRef = ref(rtdb, `users/${userId}/transactions/${transactionId}`);
    const snapshot = await get(transactionRef);
    
    if (!snapshot.exists()) {
      throw new Error('Transação não encontrada');
    }
    
    const oldTransaction = snapshot.val() as Transaction;
    
    // Se o valor ou tipo mudou, atualizar o saldo do usuário
    if (updates.amount !== undefined || updates.type !== undefined) {
      const oldAmount = oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount;
      const newAmount = (updates.type || oldTransaction.type) === 'income' ? 
        (updates.amount || oldTransaction.amount) : 
        -(updates.amount || oldTransaction.amount);
      
      const balanceChange = newAmount - oldAmount;
      if (balanceChange !== 0) {
        await updateUserBalance(userId, balanceChange);
      }
    }
    
    // Atualizar a transação
    await update(transactionRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
}

/**
 * Exclui uma transação
 * @param userId ID do usuário
 * @param transactionId ID da transação
 */
export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  try {
    const transactionRef = ref(rtdb, `users/${userId}/transactions/${transactionId}`);
    const snapshot = await get(transactionRef);
    
    if (!snapshot.exists()) {
      throw new Error('Transação não encontrada');
    }
    
    const transaction = snapshot.val() as Transaction;
    
    // Reverter o efeito no saldo do usuário
    const amountChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    await updateUserBalance(userId, amountChange);
    
    // Excluir a transação
    await remove(transactionRef);
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    throw error;
  }
}

/**
 * Busca transações por texto
 * @param userId ID do usuário
 * @param searchText Texto a ser buscado
 * @returns Array de transações que correspondem à busca
 */
export async function searchTransactions(userId: string, searchText: string): Promise<Transaction[]> {
  try {
    const transactions = await getTransactions(userId);
    const query = searchText.toLowerCase();
    
    return transactions.filter(transaction => 
      transaction.description.toLowerCase().includes(query) || 
      (transaction.category && transaction.category.toLowerCase().includes(query)) ||
      (transaction.source && transaction.source.toLowerCase().includes(query)) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(query))
    );
  } catch (error) {
    console.error('Erro ao buscar transações por texto:', error);
    throw error;
  }
}

/**
 * Obtém o saldo de um mês específico
 * @param userId ID do usuário
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Saldo do mês
 */
export async function getBalanceByMonth(userId: string, year: number, month: number): Promise<number> {
  try {
    const expenses = await getTransactionsByType(userId, 'expense');
    const incomes = await getTransactionsByType(userId, 'income');
    
    const totalExpense = getTotalExpensesByMonth(expenses, year, month);
    const totalIncome = getTotalIncomesByMonth(incomes, year, month);
    
    return totalIncome - totalExpense;
  } catch (error) {
    console.error('Erro ao calcular saldo do mês:', error);
    throw error;
  }
}

export async function saveExpense(userId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const expenseRef = ref(rtdb, `users/${userId}/expenses`);
    const newExpenseRef = push(expenseRef);
    const now = new Date().toISOString();

    const newExpense = {
      ...expense,
      id: newExpenseRef.key,
      createdAt: now,
      updatedAt: now
    };

    await set(newExpenseRef, newExpense);

    // Atualizar saldo do usuário
    const userRef = ref(rtdb, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const currentBalance = userSnapshot.val()?.balance || 0;
    await update(userRef, { balance: currentBalance - expense.amount });

    // Criar notificação
    await createRecurringTransactionNotification(
      userId,
      'expense',
      expense.amount,
      newExpenseRef.key!
    );

    // Atualizar estatísticas
    const expenseDate = new Date(expense.date);
    await calculateAndSaveMonthlyStatistics(userId, expenseDate.getFullYear(), expenseDate.getMonth());

    return newExpenseRef.key!;
  } catch (error) {
    console.error('Erro ao salvar despesa:', error);
    throw error;
  }
}

export async function saveIncome(userId: string, income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const incomeRef = ref(rtdb, `users/${userId}/incomes`);
    const newIncomeRef = push(incomeRef);
    const now = new Date().toISOString();

    const newIncome = {
      ...income,
      id: newIncomeRef.key,
      createdAt: now,
      updatedAt: now
    };

    await set(newIncomeRef, newIncome);

    // Atualizar saldo do usuário
    const userRef = ref(rtdb, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const currentBalance = userSnapshot.val()?.balance || 0;
    await update(userRef, { balance: currentBalance + income.amount });

    // Criar notificação
    await createRecurringTransactionNotification(
      userId,
      'income',
      income.amount,
      newIncomeRef.key!
    );

    // Atualizar estatísticas
    const incomeDate = new Date(income.date);
    await calculateAndSaveMonthlyStatistics(userId, incomeDate.getFullYear(), incomeDate.getMonth());

    return newIncomeRef.key!;
  } catch (error) {
    console.error('Erro ao salvar receita:', error);
    throw error;
  }
}

export async function getExpenses(userId: string): Promise<Expense[]> {
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
    
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    throw error;
  }
}

export async function getIncomes(userId: string): Promise<Income[]> {
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
    
    return incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    throw error;
  }
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  try {
    const expenseRef = ref(rtdb, `users/${userId}/expenses/${expenseId}`);
    const snapshot = await get(expenseRef);
    
    if (!snapshot.exists()) {
      throw new Error('Despesa não encontrada');
    }
    
    const expense = snapshot.val() as Expense;
    
    // Reverter o efeito no saldo do usuário
    await updateUserBalance(userId, expense.amount);
    
    // Excluir a despesa
    await remove(expenseRef);
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    throw error;
  }
}

export async function deleteIncome(userId: string, incomeId: string): Promise<void> {
  try {
    const incomeRef = ref(rtdb, `users/${userId}/incomes/${incomeId}`);
    const snapshot = await get(incomeRef);
    
    if (!snapshot.exists()) {
      throw new Error('Receita não encontrada');
    }
    
    const income = snapshot.val() as Income;
    
    // Reverter o efeito no saldo do usuário
    await updateUserBalance(userId, -income.amount);
    
    // Excluir a receita
    await remove(incomeRef);
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    throw error;
  }
}
