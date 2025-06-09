// components/TransactionItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { TYPO } from '../src/styles/typography';
import { LAYOUT } from '../src/styles/layout';
import { Transaction, CategoryItem } from '../app/HomeScreen';

interface TransactionItemProps {
  item: Transaction;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  onPress: () => void;
  onPressDelete: () => void;
  incomeSources: CategoryItem[];
  expenseCategories: CategoryItem[];
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  formatCurrency,
  formatDate,
  onPress,
  onPressDelete,
  incomeSources,
  expenseCategories
}) => {
  const categoryName = item.type === 'income'
    ? incomeSources.find(s => s.id === item.source)?.name || 'Outros'
    : item.type === 'expense'
      ? expenseCategories.find(c => c.id === item.category)?.name || 'Outros'
      : 'Transferência';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.transactionItem}
    >
      <View style={styles.transactionIconContainer}>
        <Ionicons
          name={
            item.type === 'income' 
              ? 'arrow-up-circle' 
              : item.type === 'expense'
                ? 'arrow-down-circle'
                : 'swap-horizontal'
          }
          size={32}
          color={
            item.type === 'income' 
              ? COLORS.success 
              : item.type === 'expense'
                ? COLORS.danger
                : COLORS.primary
          }
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>
          {item.description || 'Sem descrição'}
        </Text>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionCategory}>
            {categoryName}
          </Text>
          
          <Text style={styles.transactionDate}>
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionAmountContainer}>
        <Text style={[
          styles.transactionAmount,
          { 
            color: item.type === 'income' 
              ? COLORS.success 
              : item.type === 'expense'
                ? COLORS.danger
                : COLORS.primary
          }
        ]}>
          {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : '↔'} {formatCurrency(item.amount || 0)}
        </Text>
        
        <TouchableOpacity
          onPress={() => onPressDelete(item)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default TransactionItem;
