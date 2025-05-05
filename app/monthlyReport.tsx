// app/monthlyReport.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { getExpenses, getIncomes } from '../services/dbService';
import { auth } from '../config/firebaseConfig';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2)}`;
}

export default function MonthlyReport() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [totalExp, setTotalExp] = useState(0);
  const [totalInc, setTotalInc] = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid!;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    getExpenses(uid).then(data => {
      const filtered = data.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      setExpenses(filtered);
      setTotalExp(filtered.reduce((sum, e) => sum + e.amount, 0));
    });

    getIncomes(uid).then(data => {
      const filtered = data.filter(i => {
        const d = new Date(i.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      setIncomes(filtered);
      setTotalInc(filtered.reduce((sum, i) => sum + i.amount, 0));
    });
  }, []);

  const generatePdf = async () => {
    const now = new Date();
    const title = `Relatório ${now.toLocaleString('pt-BR', { month: 'long' })}/${now.getFullYear()}`;
    let html = `<h1 style="text-align:center">${title}</h1><h2>Receitas</h2><ul>`;
    incomes.forEach(i => {
      html += `<li>${i.source}: ${formatCurrency(i.amount)}</li>`;
    });
    html += `</ul><h2>Despesas</h2><ul>`;
    expenses.forEach(e => {
      html += `<li>${e.category}: ${formatCurrency(e.amount)}</li>`;
    });
    html += `</ul><h3>Total Receitas: ${formatCurrency(totalInc)}</h3>`;
    html += `<h3>Total Despesas: ${formatCurrency(totalExp)}</h3>`;
    html += `<h2>Saldo: ${formatCurrency(totalInc - totalExp)}</h2>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: title });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
      console.error(err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Relatório Mensal</Text>
      <Card style={styles.section}>
      <Card.Title title="Receitas" titleStyle={{ color: '#000000' }} />
        <Divider />
        {incomes.map(i => (
          <Text key={i.id} style={styles.item}>{i.source}: {formatCurrency(i.amount)}</Text>
        ))}
        <Text style={styles.total}>Total Receitas: {formatCurrency(totalInc)}</Text>
      </Card>
      <Card style={styles.section}>
      <Card.Title title="Despesas" titleStyle={{ color: '#000000' }} />
        <Divider />
        {expenses.map(e => (
          <Text key={e.id} style={styles.item}>{e.category}: {formatCurrency(e.amount)}</Text>
        ))}
        <Text style={styles.total}>Total Despesas: {formatCurrency(totalExp)}</Text>
      </Card>
      <Text style={styles.balance}>Saldo: {formatCurrency(totalInc - totalExp)}</Text>
      <Button title="Exportar PDF" onPress={generatePdf} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: '#ffffff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: '#2c3e50',
    },
    section: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: '#ecf0f1',
      borderRadius: 10,
      elevation: 2,
    },
    item: {
      fontSize: 16,
      marginVertical: 4,
      color: '#34495e',
    },
    total: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 8,
      color: '#27ae60',
    },
    balance: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 20,
      color: '#2980b9',
    },
  });
  
