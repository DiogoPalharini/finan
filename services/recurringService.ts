import { saveExpense, saveIncome } from './dbService';
import { db } from '../config/firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

// Serviço para recorrências mensais (despesas/receitas)
export interface Recorrencia {
  id: string;
  tipo: 'despesa' | 'receita';
  valor: number;
  descricao: string;
  dataInicio: string; // formato YYYY-MM-DD
  dataFim?: string; // formato YYYY-MM-DD, opcional
  ultimaExecucao?: string; // formato YYYY-MM-DD, controle interno
}

export const saveRecorrencia = async (userId: string, recorrencia: Omit<Recorrencia, 'id'>): Promise<string> => {
  try {
    const recorrenciasRef = collection(db, 'usuarios', userId, 'recorrencias');
    const docRef = await addDoc(recorrenciasRef, {
      ...recorrencia,
      criadoEm: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar recorrência:', error);
    throw new Error('Falha ao salvar recorrência');
  }
};

export const getRecorrencias = async (userId: string): Promise<Recorrencia[]> => {
  try {
    const recorrenciasRef = collection(db, 'usuarios', userId, 'recorrencias');
    const q = query(recorrenciasRef);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Recorrencia));
  } catch (error) {
    console.error('Erro ao buscar recorrências:', error);
    throw new Error('Falha ao buscar recorrências');
  }
};

export const deleteRecorrencia = async (userId: string, recorrenciaId: string): Promise<void> => {
  try {
    const recorrenciaRef = doc(db, 'usuarios', userId, 'recorrencias', recorrenciaId);
    await deleteDoc(recorrenciaRef);
  } catch (error) {
    console.error('Erro ao excluir recorrência:', error);
    throw new Error('Falha ao excluir recorrência');
  }
};

export const processarRecorrencias = async (userId: string): Promise<void> => {
  try {
    const recorrencias = await getRecorrencias(userId);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (const recorrencia of recorrencias) {
      const dataInicio = new Date(recorrencia.dataInicio);
      const dataFim = recorrencia.dataFim ? new Date(recorrencia.dataFim) : null;
      const ultimaExecucao = recorrencia.ultimaExecucao ? new Date(recorrencia.ultimaExecucao) : null;

      // Se tem data fim e já passou, ignora
      if (dataFim && dataFim < hoje) continue;

      // Se a data de início ainda não chegou, ignora
      if (dataInicio > hoje) continue;

      // Verifica se já executou este mês
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      const diaRecorrencia = dataInicio.getDate();
      const diaAtual = hoje.getDate();

      // Se ainda não chegou o dia no mês atual, ignora
      if (diaAtual < diaRecorrencia) continue;

      // Se já executou este mês, ignora
      if (ultimaExecucao) {
        const mesUltimaExecucao = ultimaExecucao.getMonth();
        const anoUltimaExecucao = ultimaExecucao.getFullYear();
        if (mesUltimaExecucao === mesAtual && anoUltimaExecucao === anoAtual) continue;
      }

      // Cria a transação
      const dataTransacao = new Date(anoAtual, mesAtual, diaRecorrencia);
      
      if (recorrencia.tipo === 'despesa') {
        await saveExpense(userId, {
          amount: recorrencia.valor,
          description: `[Recorrente] ${recorrencia.descricao}`,
          category: 'outros', // TODO: Adicionar categoria na recorrência
          date: dataTransacao.toISOString()
        });
      } else {
        await saveIncome(userId, {
          amount: recorrencia.valor,
          description: `[Recorrente] ${recorrencia.descricao}`,
          source: 'outros', // TODO: Adicionar fonte na recorrência
          date: dataTransacao.toISOString()
        });
      }

      // Atualiza a última execução
      await atualizarUltimaExecucao(userId, recorrencia.id, dataTransacao.toISOString());
    }
  } catch (error) {
    console.error('Erro ao processar recorrências:', error);
    throw error;
  }
};

const atualizarUltimaExecucao = async (userId: string, recorrenciaId: string, data: string): Promise<void> => {
  try {
    const recorrenciaRef = doc(db, 'usuarios', userId, 'recorrencias', recorrenciaId);
    await updateDoc(recorrenciaRef, {
      ultimaExecucao: data
    });
  } catch (error) {
    console.error('Erro ao atualizar última execução:', error);
    throw new Error('Falha ao atualizar última execução');
  }
}; 