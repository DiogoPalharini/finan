// app/createBudget.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, HelperText, Text, Button, Menu, Provider as PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ref, push } from 'firebase/database';
import { auth, rtdb } from '../config/firebaseConfig';

const expenseCategories = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Educação',
  'Lazer',
  'Saúde',
  'Roupas',
  'Contas e Serviços',
  'Viagens',
  'Outros',
];

export default function CreateBudget() {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const userId = auth.currentUser?.uid!;

  const handleSave = async () => {
    if (!category || !limit) {
      Alert.alert('Erro', 'Selecione a categoria e preencha o limite.');
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
    <PaperProvider>
      <LinearGradient colors={['#1D3D47', '#A1CEDC']} style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Novo Orçamento</Text>

          <View style={styles.menuWrapper}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                  labelStyle={styles.menuLabel}
                >
                  {category || 'Selecione Categoria'}
                </Button>
              }
            >
              {expenseCategories.map((cat) => (
                <Menu.Item
                  key={cat}
                  onPress={() => { setCategory(cat); setMenuVisible(false); }}
                  title={cat}
                />
              ))}
            </Menu>
            <HelperText type="info">
              Escolha uma das categorias padrões.
            </HelperText>
          </View>

          <TextInput
            label="Limite (R$)"
            mode="outlined"
            placeholder="0.00"
            keyboardType="numeric"
            value={limit}
            onChangeText={setLimit}
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSave} style={styles.button} labelStyle={styles.buttonLabel}>
            Salvar Orçamento
          </Button>
        </View>
      </LinearGradient>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },
  menuWrapper: { marginBottom: 16 },
  menuButton: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' },
  menuLabel: { color: '#fff' },
  input: { backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 24 },
  button: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8 },
  buttonLabel: { color: '#1D3D47', fontSize: 18, fontWeight: '600' },
});

