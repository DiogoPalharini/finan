import { getTransactionsByType, Transaction } from '../transactionService';

/**
 * Calcula valores agrupados por um campo específico
 * @param transactions Lista de transações
 * @param field Campo para agrupar
 * @param year Ano para filtrar
 * @param month Mês para filtrar
 * @returns Objeto com valores agrupados
 */
export function calculateByField(transactions: Transaction[], field: string, year: number, month: number): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Filtrar transações pelo mês e ano
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
  });
  
  // Agrupar por campo
  filteredTransactions.forEach(transaction => {
    const value = transaction[field as keyof Transaction] as string || 'outros';
    
    if (!result[value]) {
      result[value] = 0;
    }
    
    result[value] += transaction.amount;
  });
  
  return result;
}

/**
 * Obtém o total de gastos em uma categoria em um mês específico
 * @param transactions Lista de transações
 * @param year Ano
 * @param month Mês (0-11)
 * @param category Categoria
 * @returns Total gasto na categoria
 */
export function getCategoryExpenses(transactions: Transaction[], year: number, month: number, category: string): number {
  // Filtrar despesas por categoria e período
  const filteredExpenses = transactions.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year && 
           expenseDate.getMonth() === month && 
           expense.category === category;
  });
  
  // Somar os valores
  return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calcula o total de despesas em um mês específico
 * @param transactions Lista de transações
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Total de despesas
 */
export function getTotalExpensesByMonth(transactions: Transaction[], year: number, month: number): number {
  return getCategoryExpenses(transactions, year, month, 'all');
}

/**
 * Calcula o total de receitas em um mês específico
 * @param transactions Lista de transações
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Total de receitas
 */
export function getTotalIncomesByMonth(transactions: Transaction[], year: number, month: number): number {
  // Filtrar receitas por período
  const filteredIncomes = transactions.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate.getFullYear() === year && 
           incomeDate.getMonth() === month && 
           income.type === 'income';
  });
  
  // Somar os valores
  return filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
} 