// screens/BudgetsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ProgressBar, Button } from 'react-native-paper';
import { subscribeBudgets, Budget } from '../services/budgetService';
import { auth } from '../config/firebaseConfig';
import { useRouter } from 'expo-router';

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const userId = auth.currentUser?.uid!;
  const router = useRouter();

  useEffect(() => {
    subscribeBudgets(userId, setBudgets); // ✅ Não precisa atribuir retorno
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={budgets}
        keyExtractor={b => b.category}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const spent = 0; // futuramente substitua com cálculo real
          const progress = Math.min(spent / item.limit, 1);
          return (
            <Card style={styles.card}>
              <Card.Title title={item.category} />
              <Card.Content>
                <Text style={styles.textValue}>
                  {`R$ ${spent.toFixed(2)} de R$ ${item.limit.toFixed(2)}`}
                </Text>
                <ProgressBar progress={progress} style={styles.progress} />
              </Card.Content>
            </Card>
          );
        }}
      />
      <Button
        mode="contained"
        onPress={() => router.push('/CreateBudget')} 
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        + Orçamento
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f5',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
  },
  textValue: {
    fontSize: 16,
    marginBottom: 8,
  },
  progress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  button: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    borderRadius: 50,
    elevation: 4,
    backgroundColor: '#1D3D47',
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
});
