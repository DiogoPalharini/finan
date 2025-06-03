import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { auth } from '../config/firebaseConfig';

// Componentes
import BudgetCard from '../components/Budget/BudgetCard';
import AddBudgetModal from '../components/Budget/AddBudgetModal';

// Serviços
import { Budget, getBudgets, saveBudget, updateBudget, deleteBudget } from '../services/budgetService';
import { getTransactionsByCategory } from '../services/transactionService';

const { width } = Dimensions.get('window');

const BudgetScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Carregar dados
  useEffect(() => {
    loadBudgets();
  }, []);
  
  const loadBudgets = async () => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userId = auth.currentUser.uid;
      const budgetsData = await getBudgets(userId);
      
      // Calcular gastos atuais para cada orçamento
      const budgetsWithSpent = await Promise.all(
        budgetsData.map(async (budget) => {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth();
          
          // Buscar despesas da categoria no mês atual
          const expenses = await getTransactionsByCategory(userId, 'expense', budget.category);
          const categoryExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
          });
          
          // Calcular total gasto
          const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          
          // Calcular dias restantes no período
          const startDate = new Date(budget.startDate.split('/').reverse().join('-'));
          let endDate;
          
          if (budget.period === 'monthly') {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (budget.period === 'weekly') {
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
          } else {
            endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
          }
          
          const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          
          return {
            ...budget,
            spent,
            remainingDays
          };
        })
      );
      
      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddBudget = async (budgetData: any) => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const userId = auth.currentUser.uid;
      
      // Preparar dados do orçamento
      const newBudget = {
        category: budgetData.category,
        limit: budgetData.limit,
        period: budgetData.period,
        startDate: budgetData.startDate
      };
      
      // Salvar no Firebase
      await saveBudget(userId, newBudget);
      
      // Recarregar orçamentos
      await loadBudgets();
      
      // Fechar modal
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteBudget = async (budgetId: string) => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      const userId = auth.currentUser.uid;
      
      // Excluir do Firebase
      await deleteBudget(userId, budgetId);
      
      // Atualizar localmente
      setBudgets(budgets.filter(b => b.id !== budgetId));
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
    }
  };
  
  const getFilteredBudgets = () => {
    if (filter === 'all') {
      return budgets;
    }
    
    if (filter === 'warning') {
      return budgets.filter(budget => {
        const progress = budget.spent / budget.limit;
        return progress >= 0.8 && progress < 1;
      });
    }
    
    if (filter === 'exceeded') {
      return budgets.filter(budget => budget.spent > budget.limit);
    }
    
    return budgets;
  };
  
  const getBudgetStats = () => {
    const total = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const exceeded = budgets.filter(budget => budget.spent > budget.limit).length;
    
    return {
      total,
      spent,
      remaining: total - spent,
      progress: spent / total,
      exceeded,
    };
  };
  
  const getCategoryInfo = (categoryId: string) => {
    const categories: Record<string, { label: string, icon: string, color: string }> = {
      alimentacao: { label: 'Alimentação', icon: 'restaurant', color: COLORS.primary },
      moradia: { label: 'Moradia', icon: 'home', color: COLORS.secondary },
      transporte: { label: 'Transporte', icon: 'car', color: COLORS.success },
      lazer: { label: 'Lazer', icon: 'film', color: COLORS.warning },
      saude: { label: 'Saúde', icon: 'medical', color: COLORS.danger },
      educacao: { label: 'Educação', icon: 'school', color: '#9C27B0' },
      vestuario: { label: 'Vestuário', icon: 'shirt', color: '#FF9800' },
      outros: { label: 'Outros', icon: 'ellipsis-horizontal', color: COLORS.textSecondary },
    };
    
    return categories[categoryId] || { label: 'Outros', icon: 'ellipsis-horizontal', color: COLORS.textSecondary };
  };
  
  const stats = getBudgetStats();
  const filteredBudgets = getFilteredBudgets();

  return (
    <View style={styles.container}>
      {/* Cabeçalho com gradiente */}
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Meu Planejamento</Text>
          <Text style={styles.headerSubtitle}>
            Controle seus gastos e mantenha-se dentro do orçamento
          </Text>
        </View>
      </LinearGradient>
      
      {/* Resumo do orçamento */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Orçamento Mensal</Text>
          <Text style={styles.summarySubtitle}>
            {stats.progress < 1 ? 'Dentro do limite' : 'Limite excedido'}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(stats.progress * 100, 100)}%`,
                  backgroundColor: stats.progress < 0.8 
                    ? COLORS.success 
                    : stats.progress < 1 
                      ? COLORS.warning 
                      : COLORS.danger
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(stats.progress * 100)}%
          </Text>
        </View>
        
        <View style={styles.amountsContainer}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValue}>
              {stats.total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Gasto</Text>
            <Text style={styles.amountValue}>
              {stats.spent.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Restante</Text>
            <Text style={[
              styles.amountValue,
              stats.remaining < 0 && styles.negativeAmount
            ]}>
              {stats.remaining.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Todos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'warning' && styles.activeFilterButton]}
          onPress={() => setFilter('warning')}
        >
          <Text style={[styles.filterText, filter === 'warning' && styles.activeFilterText]}>
            Atenção
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'exceeded' && styles.activeFilterButton]}
          onPress={() => setFilter('exceeded')}
        >
          <Text style={[styles.filterText, filter === 'exceeded' && styles.activeFilterText]}>
            Excedidos
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Lista de orçamentos */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Carregando orçamentos...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.budgetsContainer}
          contentContainerStyle={styles.budgetsContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredBudgets.length > 0 ? (
            filteredBudgets.map((budget) => {
              const categoryInfo = getCategoryInfo(budget.category);
              
              return (
                <BudgetCard
                  key={budget.id}
                  category={categoryInfo.label}
                  categoryIcon={categoryInfo.icon}
                  categoryColor={categoryInfo.color}
                  limit={budget.limit}
                  spent={budget.spent}
                  remainingDays={budget.remainingDays}
                  onPress={() => console.log('Orçamento selecionado:', budget.id)}
                  onDelete={() => budget.id && handleDeleteBudget(budget.id)}
                />
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhum orçamento encontrado</Text>
              <Text style={styles.emptyText}>
                Crie seu primeiro orçamento para começar a controlar seus gastos.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Botão flutuante para adicionar orçamento */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.secondary, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Modal para adicionar orçamento */}
      <AddBudgetModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleAddBudget}
        isLoading={isUpdating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.xs,
  },
  headerSubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    marginHorizontal: LAYOUT.spacing.lg,
    marginTop: -25,
    padding: LAYOUT.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  summaryTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  summarySubtitle: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.divider,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.spacing.sm,
    width: 40,
    textAlign: 'right',
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  negativeAmount: {
    color: COLORS.danger,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginHorizontal: LAYOUT.spacing.lg,
    marginTop: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.md,
  },
  filterButton: {
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.full,
    marginRight: LAYOUT.spacing.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  budgetsContainer: {
    flex: 1,
    marginTop: LAYOUT.spacing.md,
  },
  budgetsContent: {
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.xl + 60, // Espaço extra para o botão flutuante
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: LAYOUT.spacing.xl,
  },
  loadingText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: LAYOUT.spacing.xl * 2,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  emptyTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginTop: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.sm,
  },
  emptyText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: LAYOUT.spacing.lg,
    right: LAYOUT.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BudgetScreen;
