import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { saveGoal } from '../services/goalService';
import { auth } from '../config/firebaseConfig';

export default function CreateGoal() {
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const router = useRouter();
  const userId = auth.currentUser?.uid!;

  const handleSave = async () => {
    try {
      await saveGoal(userId, {
        description,
        targetAmount: parseFloat(targetAmount),
        savedAmount: 0,
      });
      Alert.alert('Meta adicionada!');
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Meta</Text>
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        placeholderTextColor="#ccc"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor da Meta (R$)"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={targetAmount}
        onChangeText={setTargetAmount}
      />
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Salvar Meta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#1D3D47' },
  title: { fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 24 },
  input: { height: 50, backgroundColor: '#ffffff22', color: '#fff', marginBottom: 16, borderRadius: 8, paddingHorizontal: 16 },
  button: { backgroundColor: '#fff', paddingVertical: 10, borderRadius: 8, marginTop: 12 },
});
