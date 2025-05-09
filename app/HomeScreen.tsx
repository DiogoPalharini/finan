import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const transactions = [
  { id: '1', type: 'income', description: 'Salário', amount: 5000, date: '10/05/2025' },
  { id: '2', type: 'expense', description: 'Aluguel', amount: 1500, date: '09/05/2025' },
  { id: '3', type: 'expense', description: 'Supermercado', amount: 250, date: '08/05/2025' },
  // ... outros itens
];

export default function HomeScreen() {
  const router = useRouter();
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, Usuário</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <Text style={styles.balanceAmount}>R$ {balance},00</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Receitas</Text>
          <Text style={styles.summaryAmount}>R$ {totalIncome},00</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Despesas</Text>
          <Text style={styles.summaryAmount}>R$ {totalExpense},00</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          onPress={() => router.push('/IncomeForm')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#66FCF1', '#45A29E']}
            style={styles.actionButton}
          >
            <Ionicons name="add-circle-outline" size={24} color="#0D1117" />
            <Text style={styles.actionText}>Nova Receita</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/ExpenseForm')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#66FCF1', '#45A29E']}
            style={styles.actionButton}
          >
            <Ionicons name="remove-circle-outline" size={24} color="#0D1117" />
            <Text style={styles.actionText}>Nova Despesa</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Últimas Transações</Text>

      <ScrollView style={styles.transactionList}>
        {transactions.map(item => (
          <View key={item.id} style={styles.transactionItem}>
            <Ionicons
              name={item.type === 'income' ? "arrow-up-circle" : "arrow-down-circle"}
              size={24}
              color={item.type === 'income' ? '#00FFAB' : '#FF5484'}
              style={styles.transactionIcon}
            />
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === 'income' ? '#00FFAB' : '#FF5484' }
              ]}
            >
              {item.type === 'income' ? '+' : '-'} R$ {item.amount},00
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#66FCF1',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: '#1F2833',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#66FCF1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#C5C6C7',
    fontFamily: 'Poppins_400Regular',
  },
  balanceAmount: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#1F2833',
    borderRadius: 12,
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#C5C6C7',
    fontFamily: 'Poppins_400Regular',
  },
  summaryAmount: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#66FCF1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    color: '#0D1117',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#66FCF1',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2833',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
  },
  transactionDate: {
    fontSize: 12,
    color: '#C5C6C7',
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
