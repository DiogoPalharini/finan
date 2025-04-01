import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { saveExpense } from '../services/dbService';
import { auth } from '../config/firebaseConfig';

export default function ExpenseForm() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await saveExpense(userId, {
          amount: parseFloat(amount),
          description,
          category,
          date: new Date().toISOString(),
        });
        Alert.alert('Sucesso', 'Despesa registrada!', [
          { text: 'OK', onPress: () => router.push('/HomeScreen') }
        ]);
      } catch (error: any) {
        Alert.alert('Erro', error.message);
      }
    }
  };

  return (
    <LinearGradient colors={['#1D3D47', '#A1CEDC']} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Registrar Despesa</Text>
        <TextInput
          style={styles.input}
          placeholder="Valor (R$)"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          placeholderTextColor="#ccc"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Categoria"
          placeholderTextColor="#ccc"
          value={category}
          onChangeText={setCategory}
        />
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 24 },
  input: { height: 50, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 16, color: '#fff', marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#1D3D47', fontSize: 18, fontWeight: '600' },
});