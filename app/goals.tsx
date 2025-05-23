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
import GoalCard from '../components/Goals/GoalCard';
import AddGoalModal from '../components/Goals/AddGoalModal';

// Serviços
import { Goal, getGoals, saveGoal, updateGoal, deleteGoal } from '../services/dbService';

const { width } = Dimensions.get('window');

const GoalsScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Carregar dados
  useEffect(() => {
    loadGoals();
  }, []);
  
  const loadGoals = async () => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userId = auth.currentUser.uid;
      const goalsData = await getGoals(userId);
      setGoals(goalsData);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddGoal = async (goalData: any) => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const userId = auth.currentUser.uid;
      
      // Preparar dados da meta
      const newGoal = {
        title: goalData.title,
        targetAmount: goalData.targetAmount,
        currentAmount: 0,
        deadline: goalData.deadline,
        category: goalData.category
      };
      
      // Salvar no Firebase
      await saveGoal(userId, newGoal);
      
      // Recarregar metas
      await loadGoals();
      
      // Fechar modal
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleUpdateGoalProgress = async (goalId: string, amount: number) => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      const userId = auth.currentUser.uid;
      
      // Encontrar meta atual
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      
      // Calcular novo valor
      const newAmount = goal.currentAmount + amount;
      
      // Atualizar no Firebase
      await updateGoal(userId, goalId, { currentAmount: newAmount });
      
      // Atualizar localmente
      setGoals(goals.map(g => 
        g.id === goalId ? { ...g, currentAmount: newAmount } : g
      ));
    } catch (error) {
      console.error('Erro ao atualizar progresso da meta:', error);
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      const userId = auth.currentUser.uid;
      
      // Excluir do Firebase
      await deleteGoal(userId, goalId);
      
      // Atualizar localmente
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
    }
  };
  
  const getFilteredGoals = () => {
    if (filter === 'all') {
      return goals;
    }
    
    if (filter === 'completed') {
      return goals.filter(goal => goal.currentAmount >= goal.targetAmount);
    }
    
    if (filter === 'in-progress') {
      return goals.filter(goal => goal.currentAmount < goal.targetAmount);
    }
    
    return goals;
  };
  
  const getCompletionStats = () => {
    const completed = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
    const inProgress = goals.length - completed;
    const totalAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    
    return {
      completed,
      inProgress,
      totalAmount,
    };
  };
  
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      casa: 'home-outline',
      carro: 'car-outline',
      viagem: 'airplane-outline',
      educacao: 'school-outline',
      saude: 'medical-outline',
      outro: 'ellipsis-horizontal-outline',
    };
    
    return icons[category] || 'ellipsis-horizontal-outline';
  };
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      casa: COLORS.primary,
      carro: COLORS.secondary,
      viagem: COLORS.success,
      educacao: COLORS.warning,
      saude: COLORS.danger,
      outro: COLORS.textSecondary,
    };
    
    return colors[category] || COLORS.textSecondary;
  };
  
  const stats = getCompletionStats();
  const filteredGoals = getFilteredGoals();

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
          <Text style={styles.headerTitle}>Minhas Metas</Text>
          <Text style={styles.headerSubtitle}>
            Acompanhe e gerencie seus objetivos financeiros
          </Text>
        </View>
      </LinearGradient>
      
      {/* Resumo de metas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.success}20` }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.secondary}20` }]}>
            <Ionicons name="time-outline" size={20} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Em andamento</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.primary}20` }]}>
            <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>
            {stats.totalAmount.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            })}
          </Text>
          <Text style={styles.statLabel}>Economizado</Text>
        </View>
      </View>
      
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'in-progress' && styles.activeFilterButton]}
          onPress={() => setFilter('in-progress')}
        >
          <Text style={[styles.filterText, filter === 'in-progress' && styles.activeFilterText]}>
            Em andamento
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilterButton]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Concluídas
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Lista de metas */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Carregando metas...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.goalsContainer}
          contentContainerStyle={styles.goalsContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredGoals.length > 0 ? (
            filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                title={goal.title}
                targetAmount={goal.targetAmount}
                currentAmount={goal.currentAmount}
                deadline={goal.deadline}
                category={goal.category}
                categoryIcon={getCategoryIcon(goal.category)}
                categoryColor={getCategoryColor(goal.category)}
                onPress={() => console.log('Meta selecionada:', goal.id)}
                onAddProgress={(amount) => goal.id && handleUpdateGoalProgress(goal.id, amount)}
                onDelete={() => goal.id && handleDeleteGoal(goal.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="flag-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhuma meta encontrada</Text>
              <Text style={styles.emptyText}>
                Crie sua primeira meta financeira para começar a acompanhar seu progresso.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Botão flutuante para adicionar meta */}
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
      
      {/* Modal para adicionar meta */}
      <AddGoalModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleAddGoal}
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
  statsContainer: {
    flexDirection: 'row',
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
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  statValue: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
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
  goalsContainer: {
    flex: 1,
    marginTop: LAYOUT.spacing.md,
  },
  goalsContent: {
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

export default GoalsScreen;
