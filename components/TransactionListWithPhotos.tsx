import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import TransactionItem from './TransactionItem';
import { Transaction, CategoryItem } from '../app/HomeScreen';

const TransactionListWithPhotos: React.FC = () => {
  // Dados de exemplo
  const incomeSources: CategoryItem[] = [
    { id: '1', name: 'Salário', icon: 'cash-outline' },
    { id: '2', name: 'Freelance', icon: 'briefcase-outline' },
    { id: '3', name: 'Investimentos', icon: 'trending-up-outline' },
  ];

  const expenseCategories: CategoryItem[] = [
    { id: '1', name: 'Alimentação', icon: 'restaurant-outline' },
    { id: '2', name: 'Transporte', icon: 'car-outline' },
    { id: '3', name: 'Lazer', icon: 'film-outline' },
  ];

  const exampleTransactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: 45.50,
      description: 'Almoço no restaurante',
      category: '1',
      date: '2024-01-15',
      receiptImageUri: 'https://via.placeholder.com/400x600/FF5722/FFFFFF?text=Recibo+Almoço',
    },
    {
      id: '2',
      type: 'income',
      amount: 2500.00,
      description: 'Salário mensal',
      source: '1',
      date: '2024-01-10',
      receiptImageUri: 'https://via.placeholder.com/400x600/4CAF50/FFFFFF?text=Comprovante+Salário',
    },
    {
      id: '3',
      type: 'expense',
      amount: 120.00,
      description: 'Combustível',
      category: '2',
      date: '2024-01-12',
      // Sem foto
    },
    {
      id: '4',
      type: 'expense',
      amount: 89.90,
      description: 'Cinema e pipoca',
      category: '3',
      date: '2024-01-14',
      receiptImageUri: 'https://via.placeholder.com/400x600/FF9800/FFFFFF?text=Ingresso+Cinema',
    },
    {
      id: '5',
      type: 'income',
      amount: 500.00,
      description: 'Freelance design',
      source: '2',
      date: '2024-01-08',
      receiptImageUri: 'https://via.placeholder.com/400x600/2196F3/FFFFFF?text=Comprovante+Freelance',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handlePressItem = (transaction: Transaction) => {
    console.log('Transação selecionada:', transaction);
  };

  const handlePressDelete = (transaction: Transaction) => {
    console.log('Deletar transação:', transaction);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Transações com Fotos</Text>
        <Text style={styles.subtitle}>
          Toque no ícone da câmera para visualizar a foto do recibo
        </Text>
      </View>

      {exampleTransactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          item={transaction}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onPress={() => handlePressItem(transaction)}
          onPressDelete={() => handlePressDelete(transaction)}
          incomeSources={incomeSources}
          expenseCategories={expenseCategories}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: LAYOUT.spacing.lg,
    backgroundColor: COLORS.surface,
    marginBottom: LAYOUT.spacing.md,
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  subtitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default TransactionListWithPhotos; 