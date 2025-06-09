// services/transactionService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, set, get, query, orderByChild, equalTo, update, remove } from 'firebase/database';
import { updateUserBalance } from './userService';
import { createRecurringTransactionNotification } from './notificationService';
import { calculateAndSaveMonthlyStatistics } from './statisticsService';
import { allocateAmountToGoal } from './goalService';
import { getTotalExpensesByMonth, getTotalIncomesByMonth } from './utils/transactionUtils';
import { updateBudgetsOnNewExpense } from './budgetService';

// Interface para transações (unificando despesas e receitas)
export interface Transaction {
  id?: string;
  type: 'expense' | 'income' | 'transfer';
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

// Cache para transações
let transactionsCache: { [userId: string]: { transactions: Transaction[], timestamp: number } } = {};
const CACHE_DURATION = 30000; // 30 segundos

/**
 * Salva uma nova transação (despesa ou receita)
 * @param userId ID do usuário
 * @param transaction Dados da transação
 * @returns ID da transação criada
 */
export async function saveTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    console.log('saveTransaction: Iniciando salvamento de transação');
    console.log('saveTransaction: Dados da transação:', JSON.stringify(transaction, null, 2));
    
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
    
    console.log('saveTransaction: Transação completa:', JSON.stringify(completeTransaction, null, 2));
    
    // Atualizar saldo e salvar transação em paralelo
    let amountChange = 0;
    
    if (transaction.type === 'income') {
      amountChange = transaction.amount;
    } else if (transaction.type === 'expense') {
      amountChange = -transaction.amount;
    }
    // Transferências não afetam o saldo total
    
    console.log('saveTransaction: Atualizando saldo');
    console.log('saveTransaction: Valor a ser alterado:', amountChange);
    
    // Atualizar o saldo primeiro (apenas se não for transferência)
    if (transaction.type !== 'transfer') {
      const userRef = ref(rtdb, `users/${userId}/profile`);
      const userSnapshot = await get(userRef);
      const currentBalance = userSnapshot.val()?.totalBalance || 0;
      const newBalance = currentBalance + amountChange;
      
      console.log('saveTransaction: Saldo atual:', currentBalance);
      console.log('saveTransaction: Novo saldo:', newBalance);
      
      await Promise.all([
        set(newTransactionRef, completeTransaction),
        update(userRef, {
          totalBalance: newBalance,
          updatedAt: now
        })
      ]);
    } else {
      // Se for transferência, apenas salvar a transação
      await set(newTransactionRef, completeTransaction);
    }

    console.log('saveTransaction: Transação salva no banco de dados');

    // Limpar o cache para forçar uma nova busca
    delete transactionsCache[userId];
    console.log('saveTransaction: Cache limpo para forçar atualização');

    // Operações secundárias em background sem esperar
    setTimeout(() => {
      Promise.all([
        createRecurringTransactionNotification(
          userId,
          transaction.type,
          transaction.amount,
          transactionId
        ).catch(() => {}),
        
        calculateAndSaveMonthlyStatistics(
          userId,
          new Date(transaction.date).getFullYear(),
          new Date(transaction.date).getMonth()
        ).catch(() => {})
      ]).catch(() => {});
    }, 0);
    
    console.log('saveTransaction: Transação salva com sucesso, ID:', transactionId);
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
export async function getTransactions(userId: string, forceRefresh = false): Promise<Transaction[]> {
  try {
    console.log('getTransactions: Iniciando busca de transações');
    console.log('getTransactions: Forçar atualização:', forceRefresh);
    
    // Verificar cache
    const cached = transactionsCache[userId];
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('getTransactions: Retornando dados do cache');
      return cached.transactions;
    }

    console.log('getTransactions: Buscando transações no banco de dados');
    const transactionsRef = ref(rtdb, `users/${userId}/transactions`);
    const snapshot = await get(transactionsRef);
    
    if (!snapshot.exists()) {
      console.log('getTransactions: Nenhuma transação encontrada');
      transactionsCache[userId] = { transactions: [], timestamp: now };
      return [];
    }
    
    const transactions: Transaction[] = [];
    snapshot.forEach((childSnapshot) => {
      const transaction = childSnapshot.val() as Transaction;
      transaction.id = childSnapshot.key;
      transactions.push(transaction);
    });
    
    // Ordenar por data em ordem decrescente (mais recente primeiro)
    const sortedTransactions = transactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    console.log('getTransactions: Total de transações encontradas:', sortedTransactions.length);
    if (sortedTransactions.length > 0) {
      console.log('getTransactions: Primeira transação:', {
        id: sortedTransactions[0].id,
        description: sortedTransactions[0].description,
        date: sortedTransactions[0].date,
        type: sortedTransactions[0].type
      });
    }
    
    transactionsCache[userId] = { 
      transactions: sortedTransactions, 
      timestamp: now 
    };
    
    return sortedTransactions;
  } catch (error) {
    console.error('getTransactions: Erro ao buscar transações:', error);
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
    const transactions = await getTransactions(userId);
    return transactions.filter(transaction => transaction.type === type);
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ajustar o horário do final do dia para incluir todo o dia
    end.setHours(23, 59, 59, 999);
    
    // Ajustar o horário do início do dia
    start.setHours(0, 0, 0, 0);
    
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      // Ajustar o horário da transação para comparação
      transactionDate.setHours(12, 0, 0, 0);
      return transactionDate >= start && transactionDate <= end;
    });

    // Ordenar por data em ordem decrescente (mais recente primeiro)
    return filteredTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  } catch (error) {
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

export async function updateExpense(userId: string, expenseId: string, expenseData: Partial<Expense>): Promise<void> {
  try {
    console.log('updateExpense: Iniciando atualização de despesa');
    
    const transaction: Partial<Transaction> = {
      type: 'expense',
      amount: expenseData.amount,
      description: expenseData.description,
      category: expenseData.category,
      date: expenseData.date,
      updatedAt: new Date().toISOString()
    };

    console.log('updateExpense: Convertendo para transação:', transaction);
    await updateTransaction(userId, expenseId, transaction);
    console.log('updateExpense: Transação atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
}

export async function updateIncome(userId: string, incomeId: string, incomeData: Partial<Income>): Promise<void> {
  try {
    console.log('updateIncome: Iniciando atualização de receita');
    
    const transaction: Partial<Transaction> = {
      type: 'income',
      amount: incomeData.amount,
      description: incomeData.description,
      source: incomeData.source,
      date: incomeData.date,
      updatedAt: new Date().toISOString()
    };

    console.log('updateIncome: Convertendo para transação:', transaction);
    await updateTransaction(userId, incomeId, transaction);
    console.log('updateIncome: Transação atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
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
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const transactions = await getTransactionsByPeriod(userId, startDate.toISOString(), endDate.toISOString());
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return totalIncome - totalExpense;
  } catch (error) {
    console.error('Erro ao calcular saldo do mês:', error);
    throw error;
  }
}

export async function saveExpense(userId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    console.log('saveExpense: Iniciando salvamento de despesa');
    
    const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'expense',
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date
    };

    console.log('saveExpense: Convertendo para transação:', transaction);
    const transactionId = await saveTransaction(userId, transaction);
    console.log('saveExpense: Transação salva com sucesso, ID:', transactionId);
    
    return transactionId;
  } catch (error) {
    console.error('Erro ao salvar despesa:', error);
    throw error;
  }
}

export async function saveIncome(userId: string, income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    console.log('saveIncome: Iniciando salvamento de receita');
    
    const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'income',
      amount: income.amount,
      description: income.description,
      source: income.source,
      date: income.date
    };

    console.log('saveIncome: Convertendo para transação:', transaction);
    const transactionId = await saveTransaction(userId, transaction);
    console.log('saveIncome: Transação salva com sucesso, ID:', transactionId);
    
    return transactionId;
  } catch (error) {
    console.error('Erro ao salvar receita:', error);
    throw error;
  }
}

/**
 * Obtém despesas do usuário
 * @param userId ID do usuário
 * @returns Array de despesas
 */
export async function getExpenses(userId: string): Promise<Expense[]> {
  try {
    console.log('getExpenses: Buscando despesas do usuário:', userId);
    const transactions = await getTransactions(userId);
    
    const expenses = transactions
      .filter(transaction => transaction.type === 'expense')
      .map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category || '',
        date: transaction.date,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }));
    
    console.log('getExpenses: Total de despesas encontradas:', expenses.length);
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    throw error;
  }
}

/**
 * Obtém receitas do usuário
 * @param userId ID do usuário
 * @returns Array de receitas
 */
export async function getIncomes(userId: string): Promise<Income[]> {
  try {
    console.log('getIncomes: Buscando receitas do usuário:', userId);
    const transactionsRef = ref(rtdb, `users/${userId}/transactions`);
    const transactionsQuery = query(transactionsRef, orderByChild('type'), equalTo('income'));
    const snapshot = await get(transactionsQuery);
    
    if (!snapshot.exists()) {
      console.log('getIncomes: Nenhuma receita encontrada');
      return [];
    }
    
    const incomes: Income[] = [];
    snapshot.forEach((childSnapshot) => {
      const transaction = childSnapshot.val() as Transaction;
      incomes.push({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        source: transaction.source || '',
        date: transaction.date,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      });
    });
    
    console.log('getIncomes: Total de receitas encontradas:', incomes.length);
    return incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    throw error;
  }
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  try {
    const expenseRef = ref(rtdb, `users/${userId}/transactions/${expenseId}`);
    const snapshot = await get(expenseRef);
    
    if (!snapshot.exists()) {
      throw new Error('Despesa não encontrada');
    }
    
    const expense = snapshot.val() as Transaction;
    
    // Reverter o efeito no saldo do usuário
    const amountChange = expense.type === 'income' ? -expense.amount : expense.amount;
    await updateUserBalance(userId, amountChange);
    
    // Excluir a despesa
    await remove(expenseRef);
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    throw error;
  }
}

export async function deleteIncome(userId: string, incomeId: string): Promise<void> {
  try {
    const incomeRef = ref(rtdb, `users/${userId}/transactions/${incomeId}`);
    const snapshot = await get(incomeRef);
    
    if (!snapshot.exists()) {
      throw new Error('Receita não encontrada');
    }
    
    const income = snapshot.val() as Transaction;
    
    // Reverter o efeito no saldo do usuário
    const amountChange = income.type === 'income' ? -income.amount : income.amount;
    await updateUserBalance(userId, amountChange);
    
    // Excluir a receita
    await remove(incomeRef);
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    throw error;
  }
}

// Função para limpar o cache
export function clearTransactionsCache(userId?: string) {
  if (userId) {
    delete transactionsCache[userId];
  } else {
    transactionsCache = {};
  }
}

export async function addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
  try {
    const now = new Date();
    const transactionRef = ref(rtdb, `users/${userId}/transactions`);
    const newTransactionRef = push(transactionRef);
    
    const newTransaction: Transaction = {
      ...transaction,
      id: newTransactionRef.key!,
      createdAt: now.toISOString()
    };
    
    await set(newTransactionRef, newTransaction);
    
    // Se for uma despesa, atualizar os orçamentos
    if (transaction.type === 'expense') {
      await updateBudgetsOnNewExpense(userId, transaction.category, transaction.amount);
    }
    
    return newTransaction.id;
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
}
