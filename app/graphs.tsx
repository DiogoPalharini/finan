// app/graphs.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { getExpenses } from '../services/dbService';
import { auth } from '../config/firebaseConfig';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
}

export default function GraphsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [pieData, setPieData] = React.useState<
    { name: string; amount: number; color: string; legendFontColor: string; legendFontSize: number }[]
  >([]);
  const [barData, setBarData] = React.useState<{ labels: string[]; datasets: { data: number[] }[] }>({
    labels: [],
    datasets: [{ data: [] }],
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchAndProcess();
    }, [])
  );

  async function fetchAndProcess() {
    setLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const expenses: Expense[] = await getExpenses(userId);

      // PieChart - por categoria
      const categoryMap: Record<string, number> = {};
      expenses.forEach(({ category, amount }) => {
        categoryMap[category] = (categoryMap[category] || 0) + amount;
      });

      const COLORS = ['#f39c12', '#27ae60', '#9b59b6', '#e74c3c', '#2980b9', '#8e44ad'];

      const pie = Object.entries(categoryMap).map(([category, amount], i) => ({
        name: category.length > 12 ? `${category.slice(0, 10)}...` : category,
        amount,
        color: COLORS[i % COLORS.length],
        legendFontColor: '#333',
        legendFontSize: 12,
      }));
      setPieData(pie);

      // BarChart - por mês/ano (últimos 12 meses)
      const now = new Date();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      type MonthYear = `${number}/${number}`;
      const monthlyMap: Record<MonthYear, number> = {};

      expenses.forEach(({ date, amount }) => {
        const d = new Date(date);
        const key: MonthYear = `${d.getMonth() + 1}/${d.getFullYear()}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + amount;
      });

      const labels: string[] = [];
      const data: number[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key: MonthYear = `${d.getMonth() + 1}/${d.getFullYear()}`;
        labels.push(`${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`);
        data.push(monthlyMap[key] || 0);
      }

      setBarData({ labels, datasets: [{ data }] });
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
    } finally {
      setLoading(false);
    }
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth, barData.labels.length * 60 + 60);

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#2980b9' },
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 Meus Gráficos</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Despesas por Categoria</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
          />
        ) : (
          <Text style={styles.noData}>Nenhuma despesa registrada.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimos 12 Meses</Text>
        {barData.datasets[0].data.some((v) => v > 0) ? (
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <BarChart
              data={barData}
              width={chartWidth}
              height={260}
              yAxisLabel="R$ "
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
              verticalLabelRotation={0}
              style={styles.barChart}
            />
          </ScrollView>
        ) : (
          <Text style={styles.noData}>Sem dados para exibir.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#EAF5F9',
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1D3D47',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1D3D47',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 20,
  },
  barChart: {
    marginRight: 20,
    paddingBottom: 10,
  },
});
