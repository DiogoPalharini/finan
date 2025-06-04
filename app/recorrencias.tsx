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

const { width } = Dimensions.get('window');

const RecurringScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [filter, setFilter] = useState<'todos' | 'despesa' | 'receita'>('todos');

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

  const handleEdit = (recorrencia: Recorrencia) => {
    router.push({
      pathname: '/recorrencia-form',
      params: { id: recorrencia.id }
    });
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
        onPress={() => router.push('/recorrencia-form')}
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
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Recorrências</Text>
            <Text style={styles.headerSubtitle}>
              {stats.ativas} ativas • {stats.total} total
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/recorrencia-form')}
          >
            <View style={styles.addButtonContent}>
              <Ionicons name="add" size={24} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumo financeiro */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up" size={16} color={COLORS.success} />
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                R$ {stats.valorTotalReceitas.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Ionicons name="trending-down" size={16} color={COLORS.danger} />
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
                R$ {stats.valorTotalDespesas.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

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
        {/* Filtros melhorados */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === 'todos' && styles.filterChipActive
              ]}
              onPress={() => setFilter('todos')}
            >
              <Ionicons 
                name="apps" 
                size={16} 
                color={filter === 'todos' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[
                styles.filterChipText,
                filter === 'todos' && styles.filterChipTextActive
              ]}>
                Todos ({stats.total})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === 'receita' && styles.filterChipActive,
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
                styles.filterChipText,
                { color: filter === 'receita' ? COLORS.white : COLORS.success }
              ]}>
                Receitas ({stats.receitas})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === 'despesa' && styles.filterChipActive,
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
                styles.filterChipText,
                { color: filter === 'despesa' ? COLORS.white : COLORS.danger }
              ]}>
                Despesas ({stats.despesas})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Lista de recorrências */}
        <View style={styles.listContainer}>
          {filteredRecorrencias.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredRecorrencias.map((recorrencia) => (
              <View key={recorrencia.id} style={styles.recorrenciaCard}>
                <LinearGradient
                  colors={[
                    recorrencia.tipo === 'receita' ? COLORS.success + '08' : COLORS.danger + '08',
                    COLORS.surface
                  ]}
                  style={styles.cardGradient}
                >
                  {/* Header do card */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardMainInfo}>
                      <View style={[
                        styles.cardIcon,
                        { backgroundColor: recorrencia.tipo === 'receita' ? COLORS.success + '20' : COLORS.danger + '20' }
                      ]}>
                        <Ionicons 
                          name={recorrencia.tipo === 'receita' ? 'trending-up' : 'trending-down'} 
                          size={20} 
                          color={recorrencia.tipo === 'receita' ? COLORS.success : COLORS.danger} 
                        />
                      </View>
                      
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{recorrencia.descricao}</Text>
                        <Text style={styles.cardSubtitle}>
                          Todo dia {recorrencia.diaRecorrencia}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: COLORS.primary + '15' }]}
                        onPress={() => handleEdit(recorrencia)}
                      >
                        <Ionicons name="pencil" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: COLORS.danger + '15' }]}
                        onPress={() => handleDelete(recorrencia.id!)}
                      >
                        <Ionicons name="trash" size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Valor */}
                  <View style={styles.cardValue}>
                    <Text style={[
                      styles.valueText,
                      { color: recorrencia.tipo === 'receita' ? COLORS.success : COLORS.danger }
                    ]}>
                      {recorrencia.tipo === 'receita' ? '+' : '-'} R$ {recorrencia.valor.toFixed(2)}
                    </Text>
                  </View>

                  {/* Detalhes */}
                  <View style={styles.cardDetails}>
                    {recorrencia.categoria && (
                      <View style={styles.categoryChip}>
                        <Ionicons name="folder-outline" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.categoryText}>{recorrencia.categoria}</Text>
                      </View>
                    )}
                    
                    <View style={[
                      styles.statusChip,
                      { 
                        backgroundColor: 
                          recorrencia.status === 'ativo' ? COLORS.success + '20' :
                          recorrencia.status === 'pausado' ? COLORS.warning + '20' :
                          COLORS.textSecondary + '20'
                      }
                    ]}>
                      <View style={[
                        styles.statusDot,
                        { 
                          backgroundColor: 
                            recorrencia.status === 'ativo' ? COLORS.success :
                            recorrencia.status === 'pausado' ? COLORS.warning :
                            COLORS.textSecondary
                        }
                      ]} />
                      <Text style={[
                        styles.statusText,
                        { 
                          color: 
                            recorrencia.status === 'ativo' ? COLORS.success :
                            recorrencia.status === 'pausado' ? COLORS.warning :
                            COLORS.textSecondary
                        }
                      ]}>
                        {recorrencia.status === 'ativo' ? 'Ativo' :
                         recorrencia.status === 'pausado' ? 'Pausado' : 'Concluído'}
                      </Text>
                    </View>
                  </View>

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                      Início: {format(new Date(recorrencia.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))
          )}
        </View>

        {/* Espaço extra */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: LAYOUT.spacing.md,
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  header: {
    paddingTop: LAYOUT.spacing.xl,
    paddingBottom: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.white + 'CC',
  },
  addButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  addButtonContent: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    marginTop: LAYOUT.spacing.sm,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: LAYOUT.spacing.md,
    backdropFilter: 'blur(10px)',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.white + 'CC',
    marginTop: 4,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.bold,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: LAYOUT.spacing.md,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: LAYOUT.spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.primary,
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  recorrenciaCard: {
    marginBottom: LAYOUT.spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: LAYOUT.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  cardMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardValue: {
    marginBottom: LAYOUT.spacing.md,
  },
  valueText: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: LAYOUT.spacing.sm,
  },
  dateText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.xl * 2,
  },
  emptyIconContainer: {
    marginBottom: LAYOUT.spacing.lg,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.sm,
  },
  emptyButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default RecurringScreen;

