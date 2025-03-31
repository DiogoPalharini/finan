import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { Text, Button, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ref, push } from 'firebase/database';
import { auth, rtdb } from '../config/firebaseConfig';

const predefinedCategories = [
  'Alimentação', 'Transporte', 'Moradia', 'Educação', 'Lazer',
  'Saúde', 'Compras', 'Investimentos', 'Outros'
];

export default function CreateBudget() {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const router = useRouter();
  const userId = auth.currentUser?.uid!;

  const handleSave = async () => {
    if (!category || !limit) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      Alert.alert('Erro', 'Informe um valor válido para o limite.');
      return;
    }

    try {
      const budgetRef = ref(rtdb, `users/${userId}/budgets`);
      await push(budgetRef, {
        category,
        limit: parsedLimit,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Sucesso', 'Orçamento criado com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/BudgetsScreen') }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <LinearGradient colors={['#1D3D47', '#A1CEDC']} style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Novo Orçamento</Text>
        <TextInput
          placeholder="Categoria (ex: Alimentação)"
          placeholderTextColor="#ccc"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />
        <HelperText type="info">
          Dica: use uma categoria como {predefinedCategories.join(', ')}.
        </HelperText>

        <TextInput
          placeholder="Limite (R$)"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
          value={limit}
          onChangeText={setLimit}
          style={styles.input}
        />

        <Button mode="contained" onPress={handleSave} style={styles.button} labelStyle={styles.buttonLabel}>
          Salvar
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#fff',
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
  },
  buttonLabel: {
    color: '#1D3D47',
    fontSize: 18,
    fontWeight: '600',
  },
});
