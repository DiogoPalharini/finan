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
import IncomeModal from '../components/IncomeModal';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

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
  Income
} from '../services/dbService';
import { useAuth } from '../hooks/useAuth';

// Tipos
export interface Transaction {
  id: string | undefined;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category?: string;
  source?: string;
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

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Estados para dados
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // Estados para modais
  const [incomeModalVisible, setIncomeModalVisible] = useState<boolean>(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);
  const [fabOpen, setFabOpen] = useState<boolean>(false);

  // Carregar transações
  useEffect(() => {
    loadTransactions();
  }, []);
  
  // Filtrar transações quando a busca ou filtro mudar
  useEffect(() => {
    filterTransactions();
  }, [searchQuery, activeFilter, transactions]);

  // Função para carregar transações do banco
  const loadTransactions = async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const expenses = await getExpenses(user.uid);
      const incomes = await getIncomes(user.uid);
      
      // Formatar dados para exibição
      const formattedExpenses: Transaction[] = expenses.map(expense => ({
        id: expense.id,
        type: 'expense',
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category: expense.category
      }));
      
      const formattedIncomes: Transaction[] = incomes.map(income => ({
        id: income.id,
        type: 'income',
        description: income.description,
        amount: income.amount,
        date: income.date,
        source: income.source
      }));
      
      // Combinar e ordenar por data (mais recente primeiro)
      const allTransactions: Transaction[] = [...formattedExpenses, ...formattedIncomes]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas transações.');
    } finally {
      setIsLoading(false);
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

  // Salvar nova receita
  const handleSaveIncome = async (
    amount: number, 
    description: string, 
    source: string, 
    date: Date
  ): Promise<void> => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar uma receita.');
      return;
    }
    
    setIsLoading(true);
    try {
      await saveIncome(user.uid, {
        amount,
        description,
        source,
        date: date.toISOString()
      });
      
      // Fechar modal
      setIncomeModalVisible(false);
      
      // Recarregar transações
      loadTransactions();
      
      Alert.alert('Sucesso', 'Receita adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      Alert.alert('Erro', 'Não foi possível salvar a receita.');
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar nova despesa
  const handleSaveExpense = async (
    amount: number, 
    description: string, 
    category: string, 
    date: Date
  ): Promise<void> => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar uma despesa.');
      return;
    }
    
    setIsLoading(true);
    try {
      await saveExpense(user.uid, {
        amount,
        description,
        category,
        date: date.toISOString()
      });
      
      // Fechar modal
      setExpenseModalVisible(false);
      
      // Recarregar transações
      loadTransactions();
      
      Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      Alert.alert('Erro', 'Não foi possível salvar a despesa.');
    } finally {
      setIsLoading(false);
    }
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

  // Calcular totais
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Olá, {user?.displayName || 'Usuário'}</Title>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Cartão de Saldo */}
      <BalanceCard 
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        formatCurrency={formatCurrency}
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
        transactions={filteredTransactions}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onLongPressItem={confirmDelete}
        onPressDelete={confirmDelete}
        incomeSources={incomeSources}
        expenseCategories={expenseCategories}
      />

      {/* Botões de Ação Flutuantes */}
      <FAB.Group
        visible={true}
        open={fabOpen}
        icon={fabOpen ? 'close' : 'plus'}
        color={COLORS.white}
        fabStyle={styles.fab}
        onStateChange={({ open }) => setFabOpen(open)}
        actions={[
          {
            icon: 'arrow-up',
            label: 'Nova Receita',
            color: COLORS.success,
            onPress: () => setIncomeModalVisible(true),
          },
          {
            icon: 'arrow-down',
            label: 'Nova Despesa',
            color: COLORS.danger,
            onPress: () => setExpenseModalVisible(true),
          },
        ]}
      />

      {/* Modal de Nova Receita */}
      <IncomeModal 
        visible={incomeModalVisible}
        onClose={() => setIncomeModalVisible(false)}
        onSave={handleSaveIncome}
        isLoading={isLoading}
        incomeSources={incomeSources}
        formatValueForInput={formatValueForInput}
      />

      {/* Modal de Nova Despesa */}
      <ExpenseModal 
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
        onSave={handleSaveExpense}
        isLoading={isLoading}
        expenseCategories={expenseCategories}
        formatValueForInput={formatValueForInput}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal 
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
        itemType={itemToDelete?.type || 'expense'}
        itemDescription={itemToDelete?.description || ''}
      />
    </View>
  );
}

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
  settingsButton: {
    padding: LAYOUT.spacing.xs,
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
    backgroundColor: COLORS.primary,
  },
});
