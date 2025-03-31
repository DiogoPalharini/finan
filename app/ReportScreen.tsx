// screens/ReportScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { auth } from '../config/firebaseConfig';
import { getExpenses, getIncomes } from '../services/dbService';
import { getBudgets } from '../services/budgetService';
import { subscribeGoals } from '../services/goalService';

export default function ReportScreen() {
  const userId = auth.currentUser?.uid!;
  const [loading, setLoading] = useState(true);
  // states for report data...

  useEffect(() => {
    async function loadData() {
      // fetch and process data
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineLarge">Relatório Mensal</Text>
      {/* Render summary, charts, export button */}
      <Button mode="outlined" onPress={() => {/* export PDF */}} style={styles.button}>Exportar PDF</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginVertical: 8 },
  fab: { position: 'absolute', bottom: 24, right: 24 },
  button: { marginTop: 16 },
});