// app/createGoal.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { Text, Button, Menu, Provider as PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { saveGoal } from '../services/goalService';
import { auth } from '../config/firebaseConfig';

export default function CreateGoal() {
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();
  const userId = auth.currentUser?.uid!;

  // Categorias padrão de receita para metas
  const incomeCategories = [
    'Salário',
    'Freelancer',
    'Investimentos',
    'Presentes',
    'Reembolsos',
    'Aluguéis',
    'Pensão',
    'Outros',
  ];

  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert('Erro', 'Selecione uma categoria de receita para a meta.');
      return;
    }
    const parsedGoal = parseFloat(targetAmount);
    if (isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert('Erro', 'Informe um valor válido para a meta.');
      return;
    }
    try {
      await saveGoal(userId, {
        description,
        category: selectedCategory,
        targetAmount: parsedGoal,
        savedAmount: 0,
      });
      Alert.alert('Meta adicionada!', '', [
        { text: 'OK', onPress: () => router.replace('/goals') }
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <PaperProvider>
      <LinearGradient colors={['#1D3D47', '#A1CEDC']} style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Nova Meta</Text>

          <View style={styles.menuWrapper}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  textColor="#fff"
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                >
                  {selectedCategory || 'Selecione categoria de receita'}
                </Button>
              }
            >
              {incomeCategories.map(cat => (
                <Menu.Item
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setMenuVisible(false); }}
                  title={cat}
                />
              ))}
            </Menu>
          </View>

          <TextInput
            placeholder="Descrição da meta"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />

          <TextInput
            placeholder="Valor da Meta (R$)"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            style={styles.input}
            value={targetAmount}
            onChangeText={setTargetAmount}
          />

          <Button mode="contained" onPress={handleSave} style={styles.button} labelStyle={styles.buttonLabel}>
            Salvar Meta
          </Button>
        </View>
      </LinearGradient>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 24 },
  menuWrapper: { marginBottom: 16 },
  menuButton: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' },
  input: { height: 50, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 16, color: '#fff', marginBottom: 16 },
  button: { backgroundColor: '#fff', paddingVertical: 12, borderRadius: 8 },
  buttonLabel: { color: '#1D3D47', fontSize: 18, fontWeight: '600' },
});