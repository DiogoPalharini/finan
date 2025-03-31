import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, ProgressBar, IconButton, FAB } from 'react-native-paper';
import { Goal, subscribeGoals, deleteGoal } from '../services/goalService';
import { auth } from '../config/firebaseConfig';
import { useRouter } from 'expo-router';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const userId = auth.currentUser?.uid!;
  const router = useRouter();

  useEffect(() => {
    const unsub = subscribeGoals(userId, setGoals);
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const progress = Math.min(item.savedAmount / item.targetAmount, 1);
          return (
            <Card style={styles.card}>
              <Card.Title title={item.description} />
              <Card.Content>
                <Text>{`R$ ${item.savedAmount.toFixed(2)} de R$ ${item.targetAmount.toFixed(2)}`}</Text>
                <ProgressBar progress={progress} style={styles.progress} />
              </Card.Content>
              <IconButton
                icon="trash-can-outline"
                onPress={() => deleteGoal(userId, item.id!)}
              />
            </Card>
          );
        }}
      />
      <FAB
        icon="plus"
        label="Nova Meta"
        onPress={() => router.push('/CreateGoal')}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f3f5', padding: 16 },
  list: { paddingBottom: 80 },
  card: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 12 },
  progress: { height: 8, borderRadius: 4, marginTop: 8 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1D3D47',
  },
});
