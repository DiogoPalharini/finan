// app/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTheme, Searchbar, FAB, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componentes
import Title from '../src/components/Title';
import BalanceCard from '../components/BalanceCard';
import TransactionList from '../components/TransactionList';

import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import SettingsModal from '../components/settingsSaldo/SettingsModalImproved';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';

// Estilos e constantes
import { COLORS } from '../src/styles/colors';
import { TYPO } from '../src/styles/typography';
import { LAYOUT } from '../src/styles/layout';

// Serviços e hooks
import { 
  saveExpense, 
  saveIncome, 
  getExpenses, 
  getIncomes, 
  deleteExpense, 
  deleteIncome,
  Expense,
  Income,
  getTransactionsByPeriod,
  getTransactionsByCategory,
  getBalanceByMonth,
  getTransactions,
  clearTransactionsCache
} from '../services/transactionService';
import { processarRecorrencias } from '../services/recurringService';
import { useAuth } from '../hooks/useAuth';
import { getUserBalance } from '../services/userService';

// Tipos
export interface Transaction {
  id?: string;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  amount: number;
  date: string;
  category?: string;
  source?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

// Categorias de despesas
const expenseCategories: CategoryItem[] = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant-outline' },
  { id: 'transporte', name: 'Transporte', icon: 'car-outline' },
  { id: 'moradia', name: 'Moradia', icon: 'home-outline' },
  { id: 'saude', name: 'Saúde', icon: 'medical-outline' },
  { id: 'educacao', name: 'Educação', icon: 'school-outline' },
  { id: 'lazer', name: 'Lazer', icon: 'film-outline' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

// Fontes de receita
const incomeSources: CategoryItem[] = [
  { id: 'salario', name: 'Salário', icon: 'cash-outline' },
  { id: 'investimentos', name: 'Investimentos', icon: 'trending-up-outline' },
  { id: 'freelance', name: 'Freelance', icon: 'briefcase-outline' },
  { id: 'presente', name: 'Presente', icon: 'gift-outline' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

// Formatar valor para o padrão brasileiro
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Formatar data para o padrão brasileiro
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

type BalanceViewType = 'mes_atual' | 'periodo' | 'total';

const HomeScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Estados para dados
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [userBalance, setUserBalance] = useState<number>(0);
  
  // Estados para modais
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [balanceView, setBalanceView] = useState<BalanceViewType>('mes_atual');
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Carregar saldo primeiro
        await loadUserBalance();
        
        // Carregar transações iniciais
        await loadTransactions();
        
        console.log('HomeScreen: Dados carregados com sucesso');
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        Alert.alert('Erro', 'Não foi possível carregar seus dados.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Processar recorrências ao abrir o app
  useEffect(() => {
    if (user) {
      processarRecorrencias(user.uid).catch(error => {
        console.error('Erro ao processar recorrências:', error);
      });
    }
  }, [user]);
  
  // Filtrar transações quando a busca ou filtro mudar
  useEffect(() => {
    filterTransactions();
  }, [searchQuery, activeFilter, transactions]);

  // Carregar transações quando mudar a visualização
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [balanceView, periodStart, periodEnd]);

  // Função para carregar transações do banco
  const loadTransactions = async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let transactions: Transaction[] = [];
      
      if (balanceView === 'mes_atual') {
        // Para mês atual, usar getTransactionsByPeriod com as datas do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        transactions = await getTransactionsByPeriod(
          user.uid,
          startOfMonth.toISOString(),
          endOfMonth.toISOString()
        );
      } else if (balanceView === 'periodo' && periodStart && periodEnd) {
        // Para período personalizado, usar getTransactionsByPeriod com as datas selecionadas
        const start = new Date(periodStart);
        const end = new Date(periodEnd);
        end.setHours(23, 59, 59, 999);
        
        transactions = await getTransactionsByPeriod(
          user.uid,
          start.toISOString(),
          end.toISOString()
        );
      } else if (balanceView === 'total') {
        // Para total acumulado, usar getTransactions para pegar todas as transações
        transactions = await getTransactions(user.uid);
      }

      // Ordenar transações por data (mais recente primeiro)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Atualizar estados com as transações
      setTransactions(transactions);
      setFilteredTransactions(transactions);
      
      // Calcular totais para o período
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      // Atualizar o saldo
      setUserBalance(totalIncome - totalExpense);
      
      console.log('Visualização:', balanceView);
      console.log('Total de transações:', transactions.length);
      console.log('Receitas:', totalIncome);
      console.log('Despesas:', totalExpense);
      console.log('Saldo:', totalIncome - totalExpense);
      
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas transações.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar o saldo do usuário
  const loadUserBalance = async (): Promise<void> => {
    if (!user) {
      console.log('loadUserBalance: Nenhum usuário autenticado');
      return;
    }

    try {
      console.log('loadUserBalance: Iniciando carregamento do saldo');
      const balance = await getUserBalance(user.uid);
      console.log('loadUserBalance: Saldo carregado:', balance);
      setUserBalance(balance);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      Alert.alert('Erro', 'Não foi possível carregar seu saldo.');
    }
  };

  // Filtrar transações com base na busca e no filtro ativo
  const filterTransactions = (): void => {
    let filtered = [...transactions];
    
    // Aplicar filtro de tipo (receita/despesa/todos)
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }
    
    // Aplicar filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(query) || 
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.source && item.source.toLowerCase().includes(query))
      );
    }
    
    setFilteredTransactions(filtered);
  };

  // Confirmar exclusão de transação
  const confirmDelete = (item: Transaction): void => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  // Excluir transação
  const handleDelete = async (): Promise<void> => {
    if (!user || !itemToDelete || !itemToDelete.id) return;
    
    setIsLoading(true);
    try {
      if (itemToDelete.type === 'income') {
        await deleteIncome(user.uid, itemToDelete.id);
      } else {
        await deleteExpense(user.uid, itemToDelete.id);
      }
      
      // Fechar modal e recarregar transações
      setDeleteModalVisible(false);
      setItemToDelete(null);
      loadTransactions();
      
      Alert.alert('Sucesso', 'Item excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      Alert.alert('Erro', 'Não foi possível excluir o item.');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar valor para exibição no input
  const formatValueForInput = (text: string): string => {
    // Remove caracteres não numéricos
    const numericValue = text.replace(/\D/g, '');
    
    if (numericValue === '') return '';
    
    // Converte para número e formata
    const value = parseInt(numericValue, 10) / 100;
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Usar as transações filtradas para exibição
  let displayedTransactions = filteredTransactions;

  // Calcular totais para exibição (apenas para os itens filtrados)
  const totalIncome = displayedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = displayedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Atualizar quando mudar a visualização
  const handleChangeBalanceView = (view: BalanceViewType) => {
    setBalanceView(view);
    if (view === 'mes_atual') {
      setPeriodStart(null);
      setPeriodEnd(null);
    }
  };

  // Atualizar quando mudar o período
  const handleChangePeriod = (start: Date | null, end: Date | null) => {
    setPeriodStart(start);
    setPeriodEnd(end);
    if (start && end) {
      setBalanceView('periodo');
    }
  };

  // Função para atualizar os dados após uma operação
  const handleOperationSuccess = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Limpar o cache de transações
      await clearTransactionsCache(user.uid);
      
      // Recarregar saldo e transações
      await loadUserBalance();
      await loadTransactions();
      
      console.log('HomeScreen: Dados atualizados com sucesso após operação');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Olá, {user?.displayName || 'Usuário'}</Title>
      </View>

      {/* Cartão de Saldo */}
      <BalanceCard 
        balance={userBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        formatCurrency={formatCurrency}
        onSettingsPress={() => setSettingsVisible(true)}
      />

      {/* Barra de Busca */}
      <Searchbar
        placeholder="Buscar transações..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={COLORS.primary}
      />

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <Chip
          selected={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
          style={[
            styles.filterChip,
            activeFilter === 'all' && styles.activeFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            activeFilter === 'all' && styles.activeFilterChipText
          ]}
        >
          Todos
        </Chip>
        
        <Chip
          selected={activeFilter === 'income'}
          onPress={() => setActiveFilter('income')}
          style={[
            styles.filterChip,
            activeFilter === 'income' && styles.activeFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            activeFilter === 'income' && styles.activeFilterChipText
          ]}
        >
          Receitas
        </Chip>
        
        <Chip
          selected={activeFilter === 'expense'}
          onPress={() => setActiveFilter('expense')}
          style={[
            styles.filterChip,
            activeFilter === 'expense' && styles.activeFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            activeFilter === 'expense' && styles.activeFilterChipText
          ]}
        >
          Despesas
        </Chip>
      </View>

      {/* Lista de Transações */}
      <TransactionList 
        isLoading={isLoading}
        transactions={displayedTransactions}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onPressItem={(transaction) => {
          if (transaction.type !== 'transfer') {
            setEditingTransaction(transaction);
          }
        }}
        onPressDelete={confirmDelete}
        incomeSources={incomeSources}
        expenseCategories={expenseCategories}
      />

      {/* Botões de Ação Flutuantes */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setTransactionModalVisible(true)}
        color={COLORS.white}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal 
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={async () => {
          await handleDelete();
          handleOperationSuccess();
        }}
        isLoading={isLoading}
        itemType={itemToDelete?.type || 'expense'}
        itemDescription={itemToDelete?.description || ''}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        balanceView={balanceView}
        onChangeBalanceView={handleChangeBalanceView}
        periodStart={periodStart}
        periodEnd={periodEnd}
        onChangePeriod={handleChangePeriod}
      />

      <AddTransactionModal 
        visible={transactionModalVisible}
        onClose={() => setTransactionModalVisible(false)}
        onSuccess={() => {
          setTransactionModalVisible(false);
          handleOperationSuccess();
        }}
      />

      <EditTransactionModal
        visible={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onSuccess={handleOperationSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: LAYOUT.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: LAYOUT.spacing.xl,
    marginBottom: LAYOUT.spacing.md,
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  searchBar: {
    marginBottom: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.small,
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.spacing.md,
  },
  filterChip: {
    marginRight: LAYOUT.spacing.sm,
    backgroundColor: COLORS.surface,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.text,
    fontFamily: TYPO.family.medium,
  },
  activeFilterChipText: {
    color: COLORS.background,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default HomeScreen;
