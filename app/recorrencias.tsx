import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  SafeAreaView,
  Animated,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { useAuth } from '../hooks/useAuth';
import { getRecorrencias, deleteRecorrencia, Recorrencia } from '../services/recurringService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MenuButton from '../components/Menu/MenuButton';
import { useDrawerNavigation } from '../hooks/useDrawerNavigation';
import RecurringFormModal from '../components/Recurring/RecurringFormModal';

const { width } = Dimensions.get('window');

const RecurringScreen = () => {
  const { user } = useAuth();
  const { openDrawer } = useDrawerNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [filter, setFilter] = useState<'todos' | 'despesa' | 'receita'>('todos');
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedRecorrenciaId, setSelectedRecorrenciaId] = useState<string | undefined>();

  const loadRecorrencias = useCallback(async (isRefresh = false) => {
    if (!user) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const dados = await getRecorrencias(user.uid);
      setRecorrencias(dados);
    } catch (error) {
      console.error('Erro ao carregar recorrências:', error);
      Alert.alert('Erro', 'Não foi possível carregar as recorrências');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecorrencias();
  }, [loadRecorrencias]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta recorrência?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecorrencia(user!.uid, id);
              await loadRecorrencias();
            } catch (error) {
              console.error('Erro ao deletar recorrência:', error);
              Alert.alert('Erro', 'Não foi possível deletar a recorrência');
            }
          }
        }
      ]
    );
  };

  const handleAddRecorrencia = () => {
    setSelectedRecorrenciaId(undefined);
    setIsFormModalVisible(true);
  };

  const handleEditRecorrencia = (id: string) => {
    setSelectedRecorrenciaId(id);
    setIsFormModalVisible(true);
  };

  const handleFormSuccess = () => {
    loadRecorrencias();
  };

  const filteredRecorrencias = recorrencias.filter(rec => 
    filter === 'todos' ? true : rec.tipo === filter
  );

  // Estatísticas
  const stats = {
    total: recorrencias.length,
    receitas: recorrencias.filter(r => r.tipo === 'receita').length,
    despesas: recorrencias.filter(r => r.tipo === 'despesa').length,
    ativas: recorrencias.filter(r => r.status === 'ativo').length,
    valorTotalReceitas: recorrencias
      .filter(r => r.tipo === 'receita' && r.status === 'ativo')
      .reduce((sum, r) => sum + r.valor, 0),
    valorTotalDespesas: recorrencias
      .filter(r => r.tipo === 'despesa' && r.status === 'ativo')
      .reduce((sum, r) => sum + r.valor, 0)
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={[COLORS.primary + '20', COLORS.primary + '10']}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="repeat-outline" size={64} color={COLORS.primary} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>
        {filter === 'todos' 
          ? 'Nenhuma recorrência encontrada'
          : `Nenhuma ${filter} recorrente`
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'todos' 
          ? 'Comece criando sua primeira recorrência financeira'
          : `Você não possui ${filter === 'receita' ? 'receitas' : 'despesas'} recorrentes`
        }
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={handleAddRecorrencia}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Criar Recorrência</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading && recorrencias.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando recorrências...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header melhorado */}
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

        <MenuButton onPress={openDrawer} color={COLORS.white} />
        
        <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Recorrências</Text>
            <Text style={styles.headerSubtitle}>
            Gerencie suas transações recorrentes
            </Text>
        </View>
      </LinearGradient>

        {/* Resumo financeiro */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.success}20` }]}>
            <Ionicons name="trending-up" size={20} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>
                R$ {stats.valorTotalReceitas.toFixed(2)}
              </Text>
          <Text style={styles.statLabel}>Receitas</Text>
            </View>
            
        <View style={styles.statDivider} />
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.danger}20` }]}>
            <Ionicons name="trending-down" size={20} color={COLORS.danger} />
          </View>
          <Text style={styles.statValue}>
                R$ {stats.valorTotalDespesas.toFixed(2)}
              </Text>
          <Text style={styles.statLabel}>Despesas</Text>
            </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.primary}20` }]}>
            <Ionicons name="repeat" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{stats.ativas}</Text>
          <Text style={styles.statLabel}>Ativas</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
              styles.filterButton,
              filter === 'todos' && styles.activeFilterButton
              ]}
              onPress={() => setFilter('todos')}
            >
              <Ionicons 
                name="apps" 
                size={16} 
                color={filter === 'todos' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[
              styles.filterText,
              filter === 'todos' && styles.activeFilterText
              ]}>
                Todos ({stats.total})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
              styles.filterButton,
              filter === 'receita' && styles.activeFilterButton,
                filter === 'receita' && { backgroundColor: COLORS.success }
              ]}
              onPress={() => setFilter('receita')}
            >
              <Ionicons 
                name="trending-up" 
                size={16} 
                color={filter === 'receita' ? COLORS.white : COLORS.success} 
              />
              <Text style={[
              styles.filterText,
              filter === 'receita' && styles.activeFilterText
              ]}>
                Receitas ({stats.receitas})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
              styles.filterButton,
              filter === 'despesa' && styles.activeFilterButton,
                filter === 'despesa' && { backgroundColor: COLORS.danger }
              ]}
              onPress={() => setFilter('despesa')}
            >
              <Ionicons 
                name="trending-down" 
                size={16} 
                color={filter === 'despesa' ? COLORS.white : COLORS.danger} 
              />
              <Text style={[
              styles.filterText,
              filter === 'despesa' && styles.activeFilterText
              ]}>
                Despesas ({stats.despesas})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Lista de recorrências */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRecorrencias(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
          {filteredRecorrencias.length === 0 ? (
            renderEmptyState()
          ) : (
          <View style={styles.listContainer}>
            {filteredRecorrencias.map((recorrencia) => (
                      <TouchableOpacity 
                key={recorrencia.id}
                style={styles.recorrenciaCard}
                        onPress={() => handleEditRecorrencia(recorrencia.id)}
                      >
                <View style={styles.recorrenciaInfo}>
                  <View style={styles.recorrenciaHeader}>
                    <Text style={styles.recorrenciaTitle}>{recorrencia.descricao}</Text>
                    <Chip
                      mode="flat"
                      style={[
                        styles.statusChip,
                        recorrencia.status === 'ativo' 
                          ? styles.statusChipActive 
                          : styles.statusChipInactive
                      ]}
                    >
                      {recorrencia.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Chip>
                  </View>

                  <View style={styles.recorrenciaDetails}>
                    <View style={styles.recorrenciaDetail}>
                      <Ionicons 
                        name={recorrencia.tipo === 'receita' ? 'trending-up' : 'trending-down'} 
                        size={16} 
                        color={recorrencia.tipo === 'receita' ? COLORS.success : COLORS.danger} 
                      />
                    <Text style={[
                        styles.recorrenciaValue,
                      { color: recorrencia.tipo === 'receita' ? COLORS.success : COLORS.danger }
                    ]}>
                        R$ {recorrencia.valor.toFixed(2)}
                    </Text>
                  </View>
                    
                    <View style={styles.recorrenciaDetail}>
                      <Ionicons name="calendar" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.recorrenciaDate}>
                        {format(new Date(recorrencia.dataInicio), "dd 'de' MMMM", { locale: ptBR })}
                      </Text>
                    </View>
                  </View>
        </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(recorrencia.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Botão de adicionar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddRecorrencia}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal do formulário */}
      <RecurringFormModal
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        recorrenciaId={selectedRecorrenciaId}
        onSuccess={handleFormSuccess}
      />
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  recorrenciaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recorrenciaInfo: {
    flex: 1,
    marginRight: 12,
  },
  recorrenciaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  recorrenciaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    alignSelf: 'flex-start',
  },
  statusChipActive: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  statusChipInactive: {
    backgroundColor: COLORS.danger + '20',
    borderColor: COLORS.danger,
  },
  recorrenciaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  recorrenciaDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recorrenciaValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  recorrenciaDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    position: 'absolute',
    right: LAYOUT.spacing.lg,
    bottom: LAYOUT.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: LAYOUT.spacing.lg,
    overflow: 'hidden',
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  emptySubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.xl,
  },
  emptyButton: {
    width: '100%',
    height: 48,
    borderRadius: LAYOUT.radius.lg,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.white,
    marginLeft: LAYOUT.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: LAYOUT.spacing.md,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
});

export default RecurringScreen;

