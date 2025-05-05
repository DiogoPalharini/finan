
// app/budgets.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Card, ProgressBar, Button, Text as PaperText, IconButton } from 'react-native-paper';
import { subscribeBudgets, Budget, deleteBudget } from '../services/budgetService';
import { getTotalExpensesByCategory } from '../services/dbService';
import { auth } from '../config/firebaseConfig';
import { useRouter } from 'expo-router';

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});
  const userId = auth.currentUser?.uid!;
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeBudgets(userId, setBudgets);
    getTotalExpensesByCategory(userId).then(setSpentByCategory);
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleDelete = (id: string, category: string) => {
    Alert.alert(
      'Excluir Orçamento',
      `Deseja realmente excluir o orçamento de ${category}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteBudget(userId, id);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Budget }) => {
    const spent = spentByCategory[item.category] || 0;
    const progress = Math.min(spent / item.limit, 1);
    return (
      <Card style={styles.card} elevation={3}>
        <Card.Title
          title={item.category}
          right={() => (
            <IconButton
              icon="delete"
              onPress={() => handleDelete(item.id, item.category)}
            />
          )}
        />
        <Card.Content>
          <PaperText style={styles.textValue}>
            R$ {spent.toFixed(2)} de R$ {item.limit.toFixed(2)}
          </PaperText>
          <ProgressBar
            progress={progress}
            style={styles.progress}
            color={progress < 0.8 ? '#27ae60' : '#e74c3c'}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PaperText style={styles.headerTitle}>Meus Orçamentos</PaperText>
        <PaperText style={styles.headerSubtitle}>
          Acompanhe seus limites para cada categoria
        </PaperText>
      </View>

      {budgets.length > 0 ? (
        <FlatList
          data={budgets}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <PaperText style={styles.emptyText}>
            Nenhum orçamento criado ainda.
          </PaperText>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => router.push('/CreateBudget')}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          + Novo Orçamento
        </Button>
        <PaperText style={styles.footerNote}>
          Você pode criar até 10 orçamentos simultâneos.
        </PaperText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f3f5' },
  header: { padding: 16, backgroundColor: '#1D3D47' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#A1CEDC', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 80 },
  card: { marginBottom: 12, borderRadius: 12 },
  textValue: { fontSize: 16, marginBottom: 8 },
  progress: { height: 8, borderRadius: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    borderRadius: 50,
    backgroundColor: '#1D3D47',
  },
  buttonContent: { paddingHorizontal: 24, paddingVertical: 8 },
  buttonLabel: { fontSize: 16, color: '#fff' },
  footerNote: { marginTop: 8, fontSize: 12, color: '#666' },
});
