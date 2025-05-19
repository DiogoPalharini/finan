// app/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  Modal, 
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import { Card, useTheme, Searchbar, FAB, Button, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Title from '../src/components/Title';
import { COLORS, TYPO, LAYOUT } from '../src/styles';
import { 
  saveExpense, 
  saveIncome, 
  getExpenses, 
  getIncomes, 
  deleteExpense, 
  deleteIncome 
} from '../src/services/dbService';
import { useAuth } from '../src/hooks/useAuth';

// Categorias de despesas
const expenseCategories = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant-outline' },
  { id: 'transporte', name: 'Transporte', icon: 'car-outline' },
  { id: 'moradia', name: 'Moradia', icon: 'home-outline' },
  { id: 'saude', name: 'Saúde', icon: 'medical-outline' },
  { id: 'educacao', name: 'Educação', icon: 'school-outline' },
  { id: 'lazer', name: 'Lazer', icon: 'film-outline' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

// Fontes de receita
const incomeSources = [
  { id: 'salario', name: 'Salário', icon: 'cash-outline' },
  { id: 'investimentos', name: 'Investimentos', icon: 'trending-up-outline' },
  { id: 'freelance', name: 'Freelance', icon: 'briefcase-outline' },
  { id: 'presente', name: 'Presente', icon: 'gift-outline' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

// Formatar valor para o padrão brasileiro
const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Formatar data para o padrão brasileiro
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Estados para dados
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'income', 'expense'
  
  // Estados para modais
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Estados para formulários
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date());
  const [showIncomeDatePicker, setShowIncomeDatePicker] = useState(false);
  
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showExpenseDatePicker, setShowExpenseDatePicker] = useState(false);

  // Carregar transações
  useEffect(() => {
    loadTransactions();
  }, []);
  
  // Filtrar transações quando a busca ou filtro mudar
  useEffect(() => {
    filterTransactions();
  }, [searchQuery, activeFilter, transactions]);

  // Função para carregar transações do banco
  const loadTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const expenses = await getExpenses(user.uid);
      const incomes = await getIncomes(user.uid);
      
      // Formatar dados para exibição
      const formattedExpenses = expenses.map(expense => ({
        id: expense.id,
        type: 'expense',
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category: expense.category
      }));
      
      const formattedIncomes = incomes.map(income => ({
        id: income.id,
        type: 'income',
        description: income.description,
        amount: income.amount,
        date: income.date,
        source: income.source
      }));
      
      // Combinar e ordenar por data (mais recente primeiro)
      const allTransactions = [...formattedExpenses, ...formattedIncomes]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
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
  const filterTransactions = () => {
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
  const handleSaveIncome = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar uma receita.');
      return;
    }
    
    // Validar campos
    if (!incomeAmount || !incomeDescription || !incomeSource) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para continuar.');
      return;
    }
    
    // Validar valor positivo
    const amount = parseFloat(incomeAmount.replace('.', '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Valor inválido', 'O valor deve ser maior que zero.');
      return;
    }
    
    setIsLoading(true);
    try {
      await saveIncome(user.uid, {
        amount,
        description: incomeDescription,
        source: incomeSource,
        date: incomeDate.toISOString()
      });
      
      // Limpar formulário e fechar modal
      setIncomeAmount('');
      setIncomeDescription('');
      setIncomeSource('');
      setIncomeDate(new Date());
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
  const handleSaveExpense = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar uma despesa.');
      return;
    }
    
    // Validar campos
    if (!expenseAmount || !expenseDescription || !expenseCategory) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para continuar.');
      return;
    }
    
    // Validar valor positivo
    const amount = parseFloat(expenseAmount.replace('.', '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Valor inválido', 'O valor deve ser maior que zero.');
      return;
    }
    
    setIsLoading(true);
    try {
      await saveExpense(user.uid, {
        amount,
        description: expenseDescription,
        category: expenseCategory,
        date: expenseDate.toISOString()
      });
      
      // Limpar formulário e fechar modal
      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseCategory('');
      setExpenseDate(new Date());
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
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  // Excluir transação
  const handleDelete = async () => {
    if (!user || !itemToDelete) return;
    
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
  const formatValueForInput = (text) => {
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

  // Renderizar item da lista de transações
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => confirmDelete(item)}
      activeOpacity={0.7}
      style={styles.transactionItem}
    >
      <View style={styles.transactionIconContainer}>
        <Ionicons
          name={item.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={32}
          color={item.type === 'income' ? COLORS.success : COLORS.danger}
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>
          {item.description}
        </Text>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionCategory}>
            {item.type === 'income' 
              ? incomeSources.find(s => s.id === item.source)?.name || item.source
              : expenseCategories.find(c => c.id === item.category)?.name || item.category
            }
          </Text>
          
          <Text style={styles.transactionDate}>
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionAmountContainer}>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? COLORS.success : COLORS.danger }
        ]}>
          {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
        
        <TouchableOpacity
          onPress={() => confirmDelete(item)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
      <Card style={styles.balanceCard}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.balanceCardGradient}
        >
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Ionicons name="arrow-up-outline" size={16} color={COLORS.white} />
              <Text style={styles.balanceDetailLabel}>Receitas</Text>
              <Text style={styles.balanceDetailValue}>{formatCurrency(totalIncome)}</Text>
            </View>
            
            <View style={styles.balanceDetailDivider} />
            
            <View style={styles.balanceDetailItem}>
              <Ionicons name="arrow-down-outline" size={16} color={COLORS.white} />
              <Text style={styles.balanceDetailLabel}>Despesas</Text>
              <Text style={styles.balanceDetailValue}>{formatCurrency(totalExpense)}</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>

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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando transações...</Text>
        </View>
      ) : filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => `${item.type}-${item.id}`}
          contentContainerStyle={styles.transactionList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? 'Tente uma busca diferente ou limpe o filtro'
              : 'Adicione receitas e despesas para começar a controlar suas finanças'
            }
          </Text>
        </View>
      )}

      {/* Botões de Ação Flutuantes */}
      <FAB.Group
        open={false}
        icon="plus"
        color={COLORS.white}
        fabStyle={styles.fab}
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
      <Modal
        visible={incomeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIncomeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova Receita</Text>
                <TouchableOpacity onPress={() => setIncomeModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {/* Valor */}
                <Text style={styles.inputLabel}>Valor (R$)</Text>
                <View style={styles.currencyInputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    value={incomeAmount}
                    onChangeText={(text) => setIncomeAmount(formatValueForInput(text))}
                    placeholder="0,00"
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                
                {/* Descrição */}
                <Text style={styles.inputLabel}>Descrição</Text>
                <TextInput
                  style={styles.textInput}
                  value={incomeDescription}
                  onChangeText={setIncomeDescription}
                  placeholder="Ex: Salário mensal"
                  placeholderTextColor={COLORS.textSecondary}
                />
                
                {/* Data */}
                <Text style={styles.inputLabel}>Data</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowIncomeDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.datePickerButtonText}>
                    {format(incomeDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </Text>
                </TouchableOpacity>
                
                {showIncomeDatePicker && (
                  <DateTimePicker
                    value={incomeDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowIncomeDatePicker(false);
                      if (selectedDate) {
                        setIncomeDate(selectedDate);
                      }
                    }}
                  />
                )}
                
                {/* Fonte */}
                <Text style={styles.inputLabel}>Fonte</Text>
                <View style={styles.categoryContainer}>
                  {incomeSources.map((source) => (
                    <TouchableOpacity
                      key={source.id}
                      style={[
                        styles.categoryButton,
                        incomeSource === source.id && styles.selectedCategoryButton
                      ]}
                      onPress={() => setIncomeSource(source.id)}
                    >
                      <Ionicons 
                        name={source.icon} 
                        size={24} 
                        color={incomeSource === source.id ? COLORS.white : COLORS.primary} 
                      />
                      <Text style={[
                        styles.categoryButtonText,
                        incomeSource === source.id && styles.selectedCategoryButtonText
                      ]}>
                        {source.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <Button 
                  mode="outlined" 
                  onPress={() => setIncomeModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancelar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveIncome}
                  style={styles.saveButton}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Salvar
                </Button>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Nova Despesa */}
      <Modal
        visible={expenseModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova Despesa</Text>
                <TouchableOpacity onPress={() => setExpenseModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {/* Valor */}
                <Text style={styles.inputLabel}>Valor (R$)</Text>
                <View style={styles.currencyInputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    value={expenseAmount}
                    onChangeText={(text) => setExpenseAmount(formatValueForInput(text))}
                    placeholder="0,00"
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                
                {/* Descrição */}
                <Text style={styles.inputLabel}>Descrição</Text>
                <TextInput
                  style={styles.textInput}
                  value={expenseDescription}
                  onChangeText={setExpenseDescription}
                  placeholder="Ex: Supermercado"
                  placeholderTextColor={COLORS.textSecondary}
                />
                
                {/* Data */}
                <Text style={styles.inputLabel}>Data</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowExpenseDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.datePickerButtonText}>
                    {format(expenseDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </Text>
                </TouchableOpacity>
                
                {showExpenseDatePicker && (
                  <DateTimePicker
                    value={expenseDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowExpenseDatePicker(false);
                      if (selectedDate) {
                        setExpenseDate(selectedDate);
                      }
                    }}
                  />
                )}
                
                {/* Categoria */}
                <Text style={styles.inputLabel}>Categoria</Text>
                <View style={styles.categoryContainer}>
                  {expenseCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        expenseCategory === category.id && styles.selectedCategoryButton
                      ]}
                      onPress={() => setExpenseCategory(category.id)}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={24} 
                        color={expenseCategory === category.id ? COLORS.white : COLORS.primary} 
                      />
                      <Text style={[
                        styles.categoryButtonText,
                        expenseCategory === category.id && styles.selectedCategoryButtonText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <Button 
                  mode="outlined" 
                  onPress={() => setExpenseModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancelar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveExpense}
                  style={styles.saveButton}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Salvar
                </Button>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContainer}>
            <Ionicons 
              name="alert-circle-outline" 
              size={48} 
              color={COLORS.danger} 
              style={styles.confirmModalIcon}
            />
            
            <Text style={styles.confirmModalTitle}>Confirmar Exclusão</Text>
            
            <Text style={styles.confirmModalText}>
              Tem certeza que deseja excluir {itemToDelete?.type === 'income' ? 'a receita' : 'a despesa'}{' '}
              <Text style={styles.confirmModalHighlight}>
                {itemToDelete?.description}
              </Text>?
            </Text>
            
            <Text style={styles.confirmModalSubtext}>
              Esta ação não pode ser desfeita.
            </Text>
            
            <View style={styles.confirmModalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setDeleteModalVisible(false)}
                style={styles.confirmCancelButton}
              >
                Cancelar
              </Button>
              
              <Button 
                mode="contained" 
                onPress={handleDelete}
                style={styles.confirmDeleteButton}
                loading={isLoading}
                disabled={isLoading}
              >
                Excluir
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  balanceCard: {
    borderRadius: LAYOUT.radius.large,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: LAYOUT.spacing.lg,
  },
  balanceCardGradient: {
    padding: LAYOUT.spacing.lg,
  },
  balanceLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.white,
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: TYPO.size.xxl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginVertical: LAYOUT.spacing.sm,
  },
  balanceDetails: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: LAYOUT.radius.small,
    padding: LAYOUT.spacing.sm,
  },
  balanceDetailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  balanceDetailDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: LAYOUT.spacing.sm,
  },
  balanceDetailLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 2,
  },
  balanceDetailValue: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.white,
    marginTop: 2,
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
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: LAYOUT.spacing.sm,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  transactionList: {
    paddingBottom: LAYOUT.spacing.xl * 2, // Espaço para o FAB
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.sm,
    elevation: 1,
  },
  transactionIconContainer: {
    marginRight: LAYOUT.spacing.sm,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCategory: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: LAYOUT.spacing.xs,
  },
  transactionDate: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  emptyTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginTop: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.xs,
  },
  emptySubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: LAYOUT.radius.large,
    borderTopRightRadius: LAYOUT.radius.large,
    paddingTop: LAYOUT.spacing.md,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  modalContent: {
    padding: LAYOUT.spacing.lg,
  },
  inputLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.sm,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  currencySymbol: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginRight: LAYOUT.spacing.xs,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.sm,
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  datePickerButtonText: {
    marginLeft: LAYOUT.spacing.xs,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: LAYOUT.spacing.md,
  },
  categoryButton: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: LAYOUT.spacing.sm,
    margin: '1.5%',
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginTop: LAYOUT.spacing.xs,
    textAlign: 'center',
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: LAYOUT.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: LAYOUT.spacing.sm,
    borderColor: COLORS.border,
  },
  saveButton: {
    flex: 1,
    marginLeft: LAYOUT.spacing.sm,
    backgroundColor: COLORS.primary,
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.radius.large,
    padding: LAYOUT.spacing.lg,
    width: '80%',
    alignItems: 'center',
  },
  confirmModalIcon: {
    marginBottom: LAYOUT.spacing.md,
  },
  confirmModalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  confirmModalText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  confirmModalHighlight: {
    fontFamily: TYPO.family.semibold,
  },
  confirmModalSubtext: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    marginRight: LAYOUT.spacing.sm,
    borderColor: COLORS.border,
  },
  confirmDeleteButton: {
    flex: 1,
    marginLeft: LAYOUT.spacing.sm,
    backgroundColor: COLORS.danger,
  },
});
