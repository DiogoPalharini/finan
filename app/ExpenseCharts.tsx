import React, { useEffect, useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig'; // Ajuste o caminho conforme sua estrutura

const screenWidth = Dimensions.get('window').width;

const fetchExpenses = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');
  const q = query(
    collection(db, `users/${userId}/transactions`),
    where('type', '==', 'expense'),
    where('date', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

const processPieData = (expenses: any[]) => {
  const categories: { [key: string]: number } = {};
  expenses.forEach(expense => {
    const { category, amount } = expense;
    categories[category] = (categories[category] || 0) + amount;
  });
  return Object.keys(categories).map((key, index) => ({
    name: key,
    amount: categories[key],
    color: `hsl(${index * 60}, 70%, 50%)`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));
};

const processBarData = (expenses: any[]) => {
  const days: { [key: string]: number } = {};
  expenses.forEach(expense => {
    const day = new Date(expense.date).getDate().toString();
    days[day] = (days[day] || 0) + expense.amount;
  });
  return {
    labels: Object.keys(days),
    datasets: [{ data: Object.values(days) }],
  };
};

const ExpenseCharts = () => {
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const expenses = await fetchExpenses();
        setPieData(processPieData(expenses));
        setBarData(processBarData(expenses));
      } catch (error) {
        console.error('Erro ao carregar despesas:', error);
      }
    };
    loadExpenses();
  }, []);

  if (pieData.length === 0) {
    return <Text>Sem despesas para exibir.</Text>;
  }

  return (
    <View>
      <PieChart
        data={pieData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#1c2526',
          backgroundGradientFrom: '#1c2526',
          backgroundGradientTo: '#2d3839',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
      />
      <BarChart
        data={barData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#1c2526',
          backgroundGradientFrom: '#1c2526',
          backgroundGradientTo: '#2d3839',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
      />
    </View>
  );
};

export default ExpenseCharts;