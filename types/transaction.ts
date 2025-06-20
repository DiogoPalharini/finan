export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  /**
   * URI local da imagem do recibo ou URL do Firebase Storage
   */
  receiptImageUri?: string;
} 