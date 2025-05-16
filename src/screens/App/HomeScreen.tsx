// src/screens/App/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { TYPO } from '../../constants/typography';
import { LAYOUT } from '../../constants/layout';
import { formatCurrency } from '../../utils/formatters';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { transactions, addTransaction } = useTransactions();
  
  // Calcular saldo
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type === 'income' 
      ? acc + transaction.amount 
      : acc - transaction.amount;
  }, 0);
  
  // Obter as últimas 5 transações
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleAddTransaction = () => {
    // Aqui você pode navegar para uma tela de adicionar transação
    // ou abrir um modal para isso
    navigation.navigate('AddTransaction' as never);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.displayName || 'Usuário'}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Card de Saldo */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo atual</Text>
        <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            onPress={() => handleAddTransaction()}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.error }]}
            onPress={() => handleAddTransaction()}
          >
            <Ionicons name="remove-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Despesa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transações Recentes */}
      <View style={styles.recentTransactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transações Recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions' as never)}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length > 0 ? (
          <ScrollView style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Ionicons 
                    name={transaction.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                    size={24} 
                    color={transaction.type === 'income' ? COLORS.success : COLORS.error} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text 
                  style={[
                    styles.transactionAmount, 
                    { color: transaction.type === 'income' ? COLORS.success : COLORS.error }
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma transação registrada</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => handleAddTransaction()}
            >
              <Text style={styles.emptyStateButtonText}>Adicionar transação</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
    padding: LAYOUT.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: LAYOUT.spacing.xl,
    marginBottom: LAYOUT.spacing.md,
  },
  greeting: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  date: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.radius.large,
    padding: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.lg,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: TYPO.size.md,
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
  balanceActions: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.small,
    marginRight: LAYOUT.spacing.sm,
  },
  actionButtonText: {
    color: COLORS.white,
    fontFamily: TYPO.family.medium,
    fontSize: TYPO.size.sm,
    marginLeft: 4,
  },
  recentTransactionsContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  sectionTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.primary,
  },
  transactionsList: {
    flex: 1,
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
  transactionDate: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.bold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.xl,
  },
  emptyStateText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.md,
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
