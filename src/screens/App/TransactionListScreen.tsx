// src/screens/App/TransactionListScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../../hooks/useTransactions';
import { COLORS } from '../../constants/colors';
import { TYPO } from '../../constants/typography';
import { LAYOUT } from '../../constants/layout';
import { formatCurrency } from '../../utils/formatters';

export default function TransactionListScreen() {
  const navigation = useNavigation();
  const { transactions, deleteTransaction } = useTransactions();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction' as never);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Meus Lançamentos</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterType === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filterType === 'all' && styles.filterButtonTextActive
          ]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterType === 'income' && styles.filterButtonActive
          ]}
          onPress={() => setFilterType('income')}
        >
          <Text style={[
            styles.filterButtonText,
            filterType === 'income' && styles.filterButtonTextActive
          ]}>Receitas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterType === 'expense' && styles.filterButtonActive
          ]}
          onPress={() => setFilterType('expense')}
        >
          <Text style={[
            styles.filterButtonText,
            filterType === 'expense' && styles.filterButtonTextActive
          ]}>Despesas</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Transações */}
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons 
                  name={item.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                  size={24} 
                  color={item.type === 'income' ? COLORS.success : COLORS.error} 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>{item.category}</Text>
                <Text style={styles.transactionDescription}>{item.description || 'Sem descrição'}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.transactionRight}>
                <Text 
                  style={[
                    styles.transactionAmount, 
                    { color: item.type === 'income' ? COLORS.success : COLORS.error }
                  ]}
                >
                  {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTransaction(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Nenhuma transação {filterType === 'income' ? 'de receita' : filterType === 'expense' ? 'de despesa' : ''} encontrada
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => handleAddTransaction()}
          >
            <Text style={styles.emptyStateButtonText}>Adicionar transação</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botão flutuante para adicionar transação */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => handleAddTransaction()}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: LAYOUT.spacing.xl,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.sm,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.md,
  },
  filterButton: {
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.small,
    marginRight: LAYOUT.spacing.sm,
    backgroundColor: COLORS.surface,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: LAYOUT.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    padding: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
  },
  transactionIcon: {
    marginRight: LAYOUT.spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  transactionDescription: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.bold,
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.md,
  },
  emptyStateText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.md,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.small,
  },
  emptyStateButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.white,
  },
  fab: {
    position: 'absolute',
    right: LAYOUT.spacing.lg,
    bottom: LAYOUT.spacing.lg,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
