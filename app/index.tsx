// app/index.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebaseConfig';
import { COLORS } from '../src/styles/colors';
import { useBalance } from '../hooks/useBalance';

export default function IndexScreen() {
  const router = useRouter();
  const { balance, loadBalance } = useBalance();

  useEffect(() => {
    // Verificar estado de autenticação e redirecionar
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Usuário autenticado, redirecionar para HomeScreen
        router.replace('/HomeScreen');
      } else {
        // Usuário não autenticado, redirecionar para login
        router.replace('/login');
      }
    });

    // Limpar listener ao desmontar
    return () => unsubscribe();
  }, []);

  // Tela de carregamento enquanto verifica autenticação
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
