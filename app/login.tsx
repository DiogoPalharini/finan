import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/HomeScreen');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <LinearGradient colors={['#1D3D47', '#A1CEDC']} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Acesse sua conta</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Logar</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta?</Text>
          <TouchableOpacity onPress={() => router.push('/SignUpScreen')}>
            <Text style={styles.footerLinkText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 30 },
  input: { height: 50, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8, paddingHorizontal: 16, color: '#fff', marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#1D3D47', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 16 },
  footerLinkText: { color: '#fff', fontSize: 16, textDecorationLine: 'underline', marginLeft: 5 },
});