import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { COLORS } from '../src/styles';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { useAuth } from '../hooks/useAuth';
import { getRecorrencias, deleteRecorrencia, Recorrencia } from '../services/recurringService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RecurringScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [filter, setFilter] = useState<'todos' | 'despesa' | 'receita'>('todos');

  const loadRecorrencias = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const dados = await getRecorrencias(user.uid);
      setRecorrencias(dados);
    } catch (error) {
      console.error('Erro ao carregar recorrências:', error);
      Alert.alert('Erro', 'Não foi possível carregar as recorrências');
    } finally {
      setLoading(false);
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
              setLoading(true);
              await deleteRecorrencia(user!.uid, id);
              await loadRecorrencias();
            } catch (error) {
              console.error('Erro ao deletar recorrência:', error);
              Alert.alert('Erro', 'Não foi possível deletar a recorrência');
            } finally {
              setLoading(false);
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

  if (loading && recorrencias.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Recorrências' }} />
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Recorrências</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/recorrencia-form')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'todos'}
          onPress={() => setFilter('todos')}
          style={styles.filterChip}
          textStyle={styles.filterChipText}
        >
          Todos
        </Chip>
        <Chip
          selected={filter === 'despesa'}
          onPress={() => setFilter('despesa')}
          style={[styles.filterChip, { backgroundColor: COLORS.danger + '20' }]}
          textStyle={[styles.filterChipText, { color: COLORS.danger }]}
        >
          Despesas
        </Chip>
        <Chip
          selected={filter === 'receita'}
          onPress={() => setFilter('receita')}
          style={[styles.filterChip, { backgroundColor: COLORS.success + '20' }]}
          textStyle={[styles.filterChipText, { color: COLORS.success }]}
        >
          Receitas
        </Chip>
      </View>

      <ScrollView style={styles.content}>
        {filteredRecorrencias.map((recorrencia) => (
          <View key={recorrencia.id} style={styles.recorrenciaCard}>
            <View style={styles.recorrenciaHeader}>
              <View style={styles.recorrenciaInfo}>
                <Text style={styles.recorrenciaDescricao}>{recorrencia.descricao}</Text>
                <Text style={[
                  styles.recorrenciaValor,
                  { color: recorrencia.tipo === 'receita' ? COLORS.success : COLORS.danger }
                ]}>
                  {recorrencia.tipo === 'receita' ? '+' : '-'} R$ {recorrencia.valor.toFixed(2)}
                </Text>
              </View>
              <View style={styles.recorrenciaActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(recorrencia)}
                >
                  <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDelete(recorrencia.id!)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.recorrenciaDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  Dia {recorrencia.diaRecorrencia}
                </Text>
              </View>
              
              {recorrencia.categoria && (
                <View style={styles.detailItem}>
                  <Ionicons name="folder" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{recorrencia.categoria}</Text>
                </View>
              )}
            </View>

            <View style={styles.recorrenciaFooter}>
              <Chip
                style={[
                  styles.statusChip,
                  { 
                    backgroundColor: 
                      recorrencia.status === 'ativo' ? COLORS.success + '20' :
                      recorrencia.status === 'pausado' ? COLORS.warning + '20' :
                      COLORS.textSecondary + '20'
                  }
                ]}
                textStyle={[
                  styles.statusChipText,
                  { 
                    color: 
                      recorrencia.status === 'ativo' ? COLORS.success :
                      recorrencia.status === 'pausado' ? COLORS.warning :
                      COLORS.textSecondary
                  }
                ]}
              >
                {recorrencia.status === 'ativo' ? 'Ativo' :
                 recorrencia.status === 'pausado' ? 'Pausado' : 'Concluído'}
              </Chip>
              
              <Text style={styles.dateText}>
                Início: {format(new Date(recorrencia.dataInicio), 'dd/MM/yyyy')}
              </Text>
            </View>
          </View>
        ))}
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: LAYOUT.spacing.xl,
    paddingBottom: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    gap: LAYOUT.spacing.sm,
  },
  filterChip: {
    backgroundColor: COLORS.primary + '20',
  },
  filterChipText: {
    color: COLORS.primary,
    fontFamily: TYPO.family.medium,
  },
  content: {
    flex: 1,
    padding: LAYOUT.spacing.lg,
  },
  recorrenciaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recorrenciaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.spacing.sm,
  },
  recorrenciaInfo: {
    flex: 1,
  },
  recorrenciaDescricao: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  recorrenciaValor: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
  },
  recorrenciaActions: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recorrenciaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  recorrenciaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: LAYOUT.spacing.sm,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
  },
  dateText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
});

export default RecurringScreen; 