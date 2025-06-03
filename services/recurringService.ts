// services/recurringService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { saveTransaction } from './transactionService';
import { updateBudgetSpent } from './budgetService';
import { createRecurringTransactionNotification } from './notificationService';
import { calculateAndSaveMonthlyStatistics } from './statisticsService';

// Interface para recorrências
export interface Recorrencia {
  id?: string;
  tipo: 'despesa' | 'receita';
  valor: number;
  descricao: string;
  categoria?: string;
  diaRecorrencia: number;
  dataInicio: string;
  dataFim?: string;
  status: 'ativo' | 'pausado' | 'concluido';
  createdAt: string;
  updatedAt: string;
}

/**
 * Salva uma nova recorrência
 * @param userId ID do usuário
 * @param recorrencia Dados da recorrência
 * @returns ID da recorrência criada
 */
export async function saveRecorrencia(userId: string, recorrencia: Omit<Recorrencia, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const recorrenciaRef = ref(rtdb, `users/${userId}/recorrencias`);
    const newRecorrenciaRef = push(recorrenciaRef);
    const now = new Date().toISOString();

    const newRecorrencia = {
      ...recorrencia,
      id: newRecorrenciaRef.key,
      status: 'ativo',
      createdAt: now,
      updatedAt: now
    };

    await set(newRecorrenciaRef, newRecorrencia);
    return newRecorrenciaRef.key!;
  } catch (error) {
    console.error('Erro ao salvar recorrência:', error);
    throw error;
  }
}

/**
 * Obtém todas as recorrências do usuário
 * @param userId ID do usuário
 * @returns Array de recorrências
 */
export async function getRecorrencias(userId: string): Promise<Recorrencia[]> {
  try {
    const recorrenciaRef = ref(rtdb, `users/${userId}/recorrencias`);
    const snapshot = await get(recorrenciaRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const recorrencias: Recorrencia[] = [];
    snapshot.forEach((childSnapshot) => {
      const recorrencia = childSnapshot.val() as Recorrencia;
      recorrencias.push(recorrencia);
    });
    
    return recorrencias;
  } catch (error) {
    console.error('Erro ao buscar recorrências:', error);
    throw error;
  }
}

/**
 * Obtém uma recorrência específica
 * @param userId ID do usuário
 * @param recorrenciaId ID da recorrência
 * @returns Dados da recorrência
 */
export async function getRecorrencia(userId: string, recorrenciaId: string): Promise<Recorrencia | null> {
  try {
    const recorrenciaRef = ref(rtdb, `users/${userId}/recorrencias/${recorrenciaId}`);
    const snapshot = await get(recorrenciaRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.val() as Recorrencia;
  } catch (error) {
    console.error('Erro ao buscar recorrência:', error);
    throw error;
  }
}

/**
 * Atualiza uma recorrência existente
 * @param userId ID do usuário
 * @param recorrenciaId ID da recorrência
 * @param updates Campos a serem atualizados
 */
export async function updateRecorrencia(userId: string, recorrenciaId: string, updates: Partial<Recorrencia>): Promise<void> {
  try {
    const recorrenciaRef = ref(rtdb, `users/${userId}/recorrencias/${recorrenciaId}`);
    await update(recorrenciaRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao atualizar recorrência:', error);
    throw error;
  }
}

/**
 * Exclui uma recorrência
 * @param userId ID do usuário
 * @param recorrenciaId ID da recorrência
 */
export async function deleteRecorrencia(userId: string, recorrenciaId: string): Promise<void> {
  try {
    const recorrenciaRef = ref(rtdb, `users/${userId}/recorrencias/${recorrenciaId}`);
    await remove(recorrenciaRef);
  } catch (error) {
    console.error('Erro ao excluir recorrência:', error);
    throw error;
  }
}

/**
 * Processa todas as recorrências ativas do usuário
 * @param userId ID do usuário
 * @returns Número de recorrências processadas
 */
export async function processarRecorrencias(userId: string): Promise<number> {
  try {
    const recorrencias = await getRecorrencias(userId);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let processadas = 0;
    
    for (const recorrencia of recorrencias) {
      if (recorrencia.status !== 'ativo') continue;
      
      // Verificar se já passou da data de término
      if (recorrencia.dataFim && new Date(recorrencia.dataFim) < hoje) {
        await updateRecorrencia(userId, recorrencia.id!, { status: 'concluido' });
        continue;
      }
      
      // Verificar se já começou
      const dataInicio = new Date(recorrencia.dataInicio);
      if (dataInicio > hoje) continue;
      
      // Verificar se é o dia da recorrência
      if (hoje.getDate() === recorrencia.diaRecorrencia) {
        // Criar a transação
        const transaction = {
          type: recorrencia.tipo === 'despesa' ? 'expense' : 'income',
          amount: recorrencia.valor,
          description: recorrencia.descricao,
          category: recorrencia.categoria,
          date: hoje.toISOString(),
          recurringId: recorrencia.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await saveTransaction(userId, transaction);
        processadas++;
      }
    }
    
    return processadas;
  } catch (error) {
    console.error('Erro ao processar recorrências:', error);
    throw error;
  }
}
