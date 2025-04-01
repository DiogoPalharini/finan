import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useFocusEffect } from 'expo-router';
import { getExpenses, getIncomes } from '../services/dbService';
import { auth } from '../config/firebaseConfig';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
}

export default function HomeScreen() {
  const [balance, setBalance] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  const fetchData = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const expenses = await getExpenses(userId);
        const incomes = await getIncomes(userId);

        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpensesCalc = expenses.reduce((sum, item) => sum + item.amount, 0);
        setBalance(totalIncome - totalExpensesCalc);
        setTotalExpenses(totalExpensesCalc);

        const allTransactions = [
          ...incomes.map(item => ({ ...item, type: 'Receita' })),
          ...expenses.map(item => ({ ...item, type: 'Despesa' }))
        ].slice(0, 5); // Últimas 5 transações
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Erro ao buscar dados: ', error);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <LinearGradient colors={['#1D3D47', '#A1CEDC']} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Saldo do Mês</Text>
        <Text style={[styles.balance, { color: balance >= 0 ? '#4caf50' : '#f44336' }]}>
          R$ {balance.toFixed(2)}
        </Text>
        <Text style={styles.expensesText}>Total de Despesas: R$ {totalExpenses.toFixed(2)}</Text>
        <Text style={styles.subtitle}>Últimas Transações</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id} // Chave única
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionText}>{item.type}: {item.description}</Text>
              <Text style={[styles.transactionAmount, { color: item.type === 'Receita' ? '#4caf50' : '#f44336' }]}>
                R$ {item.amount.toFixed(2)}
              </Text>
            </View>
          )}
        />
        <View style={styles.buttonContainer}>
          <Link href="/ExpenseForm" style={styles.navigationButton}>
            <Text style={styles.navigationButtonText}>Adicionar Despesa</Text>
          </Link>
          <Link href="/IncomeForm" style={styles.navigationButton}>
            <Text style={styles.navigationButtonText}>Adicionar Receita</Text>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  balance: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  expensesText: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 20 },
  subtitle: { fontSize: 18, color: '#fff', marginBottom: 10 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  transactionText: { color: '#fff', fontSize: 16 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', marginTop: 20 },
  navigationButton: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    paddingVertical: 14, 
    alignItems: 'center', 
    flex: 1, 
    marginHorizontal: 5 
  },
  navigationButtonText: { color: '#1D3D47', fontSize: 18, fontWeight: '600' },
});