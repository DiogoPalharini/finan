// app/GoalsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, ProgressBar, IconButton, FAB } from 'react-native-paper';
import { Goal, subscribeGoals, deleteGoal } from '../services/goalService';
import { getTotalIncomeByCategory } from '../services/dbService';
import { auth } from '../config/firebaseConfig';
import { useRouter, useFocusEffect } from 'expo-router';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [incomeByCategory, setIncomeByCategory] = useState<Record<string, number>>({});
  const userId = auth.currentUser?.uid!;
  const router = useRouter();

  // Subscribe to goals
  useEffect(() => {
    const unsub = subscribeGoals(userId, setGoals);
    return () => unsub();
  }, [userId]);

  // Fetch incomes on focus to keep saved amounts up-to-date
  useFocusEffect(
    useCallback(() => {
      getTotalIncomeByCategory(userId)
        .then(data => setIncomeByCategory(data))
        .catch(console.error);
    }, [userId])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir Meta',
      'Deseja realmente excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(userId, id);
              setGoals(prev => prev.filter(g => g.id !== id));
            } catch (err) {
              console.error(err);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Goal }) => {
    const saved = incomeByCategory[item.category] || 0;
    const progress = Math.min(saved / item.targetAmount, 1);
    return (
      <Card style={styles.card}>
        <Card.Title
          title={item.description}
          titleStyle={styles.cardTitle}
          right={() => (
            <IconButton
              icon="trash-can-outline"
              onPress={() => handleDelete(item.id!)}
              color="#e74c3c"
            />
          )}
        />
        <Card.Content>
          <Text style={styles.amountText}>
            R$ {saved.toFixed(2)} de R$ {item.targetAmount.toFixed(2)}
          </Text>
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
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={item => item.id!}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma meta cadastrada.</Text>}
      />
      <FAB
        icon="plus"
        label="Nova Meta"
        onPress={() => router.push('/CreateGoal')}
        style={styles.fab}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f3f5', padding: 16 },
  list: { paddingBottom: 80 },
  card: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 12 },
  cardTitle: { color: '#333', fontWeight: '600' },
  amountText: { fontSize: 16, marginBottom: 8, color: '#333' },
  progress: { height: 8, borderRadius: 4, marginTop: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#333' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1D3D47' },
});