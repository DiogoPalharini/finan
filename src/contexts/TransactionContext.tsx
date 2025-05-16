// src/contexts/TransactionContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../hooks/useAuth';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface TransactionContextData {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionContext = createContext<TransactionContextData>({} as TransactionContextData);

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Carregar transações do usuário
  useEffect(() => {
    if (user) {
      refreshTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [user]);

  async function refreshTransactions() {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const loadedTransactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        loadedTransactions.push({
          id: doc.id,
          ...doc.data() as Omit<Transaction, 'id'>
        });
      });
      
      setTransactions(loadedTransactions);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar transações');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addTransaction(data: Omit<Transaction, 'id' | 'userId'>) {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar uma transação');
      return;
    }
    
    try {
      setIsLoading(true);
      const transactionsRef = collection(db, 'transactions');
      const newTransaction = {
        ...data,
        userId: user.uid,
        date: data.date || new Date().toISOString()
      };
      
      const docRef = await addDoc(transactionsRef, newTransaction);
      
      setTransactions(prev => [...prev, { id: docRef.id, ...newTransaction }]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar transação');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteTransaction(id: string) {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await deleteDoc(doc(db, 'transactions', id));
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir transação');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      isLoading, 
      addTransaction, 
      deleteTransaction,
      refreshTransactions
    }}>
      {children}
    </TransactionContext.Provider>
  );
}
