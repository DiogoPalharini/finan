// src/hooks/useTransactions.ts
import { useContext } from 'react';
import { TransactionContext } from '../contexts/TransactionContext';

export function useTransactions() {
  const context = useContext(TransactionContext);
  
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
  }
  
  return context;
}
