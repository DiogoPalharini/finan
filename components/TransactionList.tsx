// components/TransactionList.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { TYPO } from '../src/styles/typography';
import { LAYOUT } from '../src/styles/layout';
import TransactionItem from './TransactionItem';
import { Transaction, CategoryItem } from '../app/HomeScreen';

interface TransactionListProps {
  isLoading: boolean;
  transactions: Transaction[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  onLongPressItem: (item: Transaction) => void;
  onPressDelete: (item: Transaction) => void;
  incomeSources: CategoryItem[];
  expenseCategories: CategoryItem[];
}

const TransactionList: React.FC<TransactionListProps> = ({
  isLoading,
  transactions,
  formatCurrency,
  formatDate,
  onLongPressItem,
  onPressDelete,
  incomeSources,
  expenseCategories
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando transações...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
        <Text style={styles.emptySubtitle}>
          Adicione receitas e despesas para começar a controlar suas finanças
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={({ item }) => (
        <TransactionItem
          item={item}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onLongPress={onLongPressItem}
          onPressDelete={onPressDelete}
          incomeSources={incomeSources}
          expenseCategories={expenseCategories}
        />
      )}
      keyExtractor={item => `${item.type}-${item.id}`}
      contentContainerStyle={styles.transactionList}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
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
  transactionList: {
    paddingBottom: LAYOUT.spacing.xl * 2, // Espaço para o FAB
  },
});

export default TransactionList;
