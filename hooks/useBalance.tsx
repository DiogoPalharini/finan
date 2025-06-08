import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { auth } from '../config/firebaseConfig';
import { getUserBalance } from '../services/userService';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../config/firebaseConfig';

interface BalanceContextData {
  balance: number;
  updateBalance: (amount: number) => Promise<void>;
  loadBalance: () => Promise<void>;
}

interface BalanceProviderProps {
  children: ReactNode;
}

const BalanceContext = createContext<BalanceContextData>({} as BalanceContextData);

export function BalanceProvider({ children }: BalanceProviderProps) {
  const [balance, setBalance] = useState(0);

  const loadBalance = useCallback(async () => {
    if (!auth.currentUser) return;
    
    try {
      console.log('loadBalance: Iniciando carregamento do saldo');
      const currentBalance = await getUserBalance(auth.currentUser.uid);
      console.log('loadBalance: Saldo carregado:', currentBalance);
      setBalance(currentBalance);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    }
  }, []);

  const updateBalance = useCallback(async (amount: number) => {
    if (!auth.currentUser) return;
    
    try {
      console.log('updateBalance: Iniciando atualização do saldo');
      console.log('updateBalance: Valor a ser alterado:', amount);
      
      // Atualizar o saldo no estado
      setBalance(prevBalance => {
        const newBalance = prevBalance + amount;
        console.log('updateBalance: Novo saldo no estado:', newBalance);
        return newBalance;
      });
      
      // Atualizar o saldo no banco de dados
      const userRef = ref(rtdb, `users/${auth.currentUser.uid}/profile`);
      const userSnapshot = await get(userRef);
      const currentBalance = userSnapshot.val()?.totalBalance || 0;
      
      console.log('updateBalance: Saldo atual no banco:', currentBalance);
      console.log('updateBalance: Novo saldo no banco:', currentBalance + amount);
      
      await update(userRef, {
        totalBalance: currentBalance + amount,
        updatedAt: new Date().toISOString()
      });
      
      console.log('updateBalance: Saldo atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw error;
    }
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, loadBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);

  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }

  return context;
} 