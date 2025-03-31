// app/HomeScreen.tsx
import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { getExpenses, getIncomes, deleteExpense, deleteIncome } from '../services/dbService';
import { auth } from '../config/firebaseConfig';
import {
  Card,
  Paragraph,
  IconButton,
  Text,
  Divider,
  Surface,
} from 'react-native-paper';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category?: string;
  source?: string;
  type: 'income' | 'expense';
  date: string;
}

export default function HomeScreen() {
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(0);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const exps = await getExpenses(uid);
      const incs = await getIncomes(uid);
      const processed: Transaction[] = [
        ...incs.map(i => ({ ...i, type: 'income' as const })),
        ...exps.map(e => ({ ...e, type: 'expense' as const })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const totalIn = incs.reduce((sum, i) => sum + i.amount, 0);
      const totalEx = exps.reduce((sum, e) => sum + e.amount, 0);
      setBalance(totalIn - totalEx);
      setTransactions(processed);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const handleDelete = async (item: Transaction) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (item.type === 'income') await deleteIncome(uid, item.id);
    else await deleteExpense(uid, item.id);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: '#1D3D47' },
          headerTitle: 'Finanças',
          headerLeft: () => null,
        }}
      />
      <LinearGradient colors={['#1D3D47', '#A1CEDC']} style={styles.container}>
        <Surface style={styles.balanceCard} elevation={4}>
          <Text variant="headlineLarge" style={{ color: '#fff' }}>Saldo atual</Text>
          <Text
            variant="headlineSmall"
            style={{ color: balance >= 0 ? '#2ECC71' : '#E74C3C', fontWeight: 'bold' }}
          >
            R$ {balance.toFixed(2)}
          </Text>
        </Surface>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Transações recentes
        </Text>

        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.card} mode="outlined">
              <Card.Content style={styles.cardContent}>
                <View>
                  <Paragraph style={styles.description}>
                    {item.type === 'income' ? item.source : item.category}
                  </Paragraph>
                  <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.amountDelete}>
                  <Text
                    variant="titleMedium"
                    style={{ color: item.type === 'income' ? '#2ECC71' : '#E74C3C' }}
                  >
                    {item.type === 'income' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                  </Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(item)}
                    accessibilityLabel="Excluir transação"
                  />
                </View>
              </Card.Content>
            </Card>
          )}
        />

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <IconButton
            icon="plus"
            size={28}
            onPress={() => router.push('/IncomeForm')}
            style={[styles.fab, styles.incomeFab]}
            accessibilityLabel="Adicionar receita"
          />
          <IconButton
            icon="minus"
            size={28}
            onPress={() => router.push('/ExpenseForm')}
            style={[styles.fab, styles.expenseFab]}
            accessibilityLabel="Adicionar despesa"
          />
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: '#1D3D47' },
  balanceCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#174E61', // alterado de branco para azul escuro
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', marginHorizontal: 16, marginTop: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { marginVertical: 6 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  description: { fontSize: 16, fontWeight: '600' },
  dateText: { fontSize: 12, color: '#555' },
  amountDelete: { flexDirection: 'row', alignItems: 'center' },
  fabContainer: { position: 'absolute', bottom: 24, right: 24, alignItems: 'flex-end' },
  fab: {
    backgroundColor: '#fff',
    elevation: 4,
    marginVertical: 6,
  },
  incomeFab: {
    borderColor: '#2ECC71',
    borderWidth: 2,
  },
  expenseFab: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
});
