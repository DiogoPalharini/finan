import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { COLORS } from '../src/styles/colors';
import { TYPO } from '../src/styles/typography';
import { LAYOUT } from '../src/styles/layout';
import TransactionList from './TransactionList';
import { Transaction, CategoryItem } from '../app/HomeScreen';

const TransactionListWithPhotos: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'expense',
      amount: 50.00,
      description: 'Almoço no restaurante',
      category: 'alimentacao',
      date: '2024-01-15',
      receiptImageUri: 'file:///path/to/receipt1.jpg',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      type: 'income',
      amount: 2000.00,
      description: 'Salário',
      source: 'salario',
      date: '2024-01-10',
      receiptImageUri: 'file:///path/to/receipt2.jpg',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-10T08:00:00Z',
    },
    {
      id: '3',
      type: 'expense',
      amount: 30.00,
      description: 'Combustível',
      category: 'transporte',
      date: '2024-01-12',
      // Sem imagem
      createdAt: '2024-01-12T14:30:00Z',
      updatedAt: '2024-01-12T14:30:00Z',
    },
  ]);

  const incomeSources: CategoryItem[] = [
    { id: 'salario', name: 'Salário', icon: 'cash-outline' },
    { id: 'investimentos', name: 'Investimentos', icon: 'trending-up-outline' },
    { id: 'freelance', name: 'Freelance', icon: 'briefcase-outline' },
  ];

  const expenseCategories: CategoryItem[] = [
    { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant-outline' },
    { id: 'transporte', name: 'Transporte', icon: 'car-outline' },
    { id: 'moradia', name: 'Moradia', icon: 'home-outline' },
  ];

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para atualizar imagem de uma transação
  const handleImageUpdate = (transactionId: string, newImageUri: string) => {
    console.log('Atualizando imagem da transação:', transactionId, 'para:', newImageUri);
    
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, receiptImageUri: newImageUri }
          : transaction
      )
    );
    
    Alert.alert('Sucesso', 'Imagem atualizada com sucesso!');
  };

  // Função para remover imagem de uma transação
  const handleImageRemove = (transactionId: string) => {
    console.log('Removendo imagem da transação:', transactionId);
    
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, receiptImageUri: undefined }
          : transaction
      )
    );
    
    Alert.alert('Sucesso', 'Imagem removida com sucesso!');
  };

  // Função para deletar uma transação
  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir "${transaction.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setTransactions(prevTransactions => 
              prevTransactions.filter(t => t.id !== transaction.id)
            );
            Alert.alert('Sucesso', 'Transação excluída com sucesso!');
          }
        }
      ]
    );
  };

  // Função para editar uma transação
  const handleEditTransaction = (transaction: Transaction) => {
    Alert.alert('Editar Transação', `Editando: ${transaction.description}`);
    // Aqui você implementaria a lógica para abrir o modal de edição
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Transações com Fotos</Text>
      <Text style={styles.subtitle}>
        Toque no ícone da câmera para ver, editar, compartilhar ou remover fotos
      </Text>
      
      <TransactionList
        isLoading={false}
        transactions={transactions}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onPressItem={handleEditTransaction}
        onPressDelete={handleDeleteTransaction}
        onImageUpdate={handleImageUpdate}
        onImageRemove={handleImageRemove}
        incomeSources={incomeSources}
        expenseCategories={expenseCategories}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • Transações com ícone de câmera têm fotos de recibo
        </Text>
        <Text style={styles.infoText}>
          • Toque no ícone para visualizar em tela cheia
        </Text>
        <Text style={styles.infoText}>
          • Use os botões para compartilhar, salvar, editar ou remover
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: LAYOUT.spacing.md,
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  subtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.lg,
  },
  infoContainer: {
    backgroundColor: COLORS.surface,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.medium,
    marginTop: LAYOUT.spacing.md,
  },
  infoText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.xs,
  },
});

export default TransactionListWithPhotos; 