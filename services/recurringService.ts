// Serviço para recorrências mensais (despesas/receitas)
export interface Recorrencia {
  id: string;
  tipo: 'despesa' | 'receita';
  valor: number;
  descricao: string;
  data: string; // formato YYYY-MM-DD
}

export const saveRecorrencia = async (userId: string, recorrencia: Omit<Recorrencia, 'id'>): Promise<string> => {
  // TODO: Implementar integração com Firebase
  return 'mock-id';
};

export const getRecorrencias = async (userId: string): Promise<Recorrencia[]> => {
  // TODO: Implementar integração com Firebase
  return [];
};

export const deleteRecorrencia = async (userId: string, recorrenciaId: string): Promise<void> => {
  // TODO: Implementar integração com Firebase
}; 