import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Lógica de cadastro (placeholder)
    Alert.alert('Cadastro', 'Conta criada com sucesso!');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Insira seus dados para começar</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#66FCF1" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#66FCF1" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#AAAAAA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#66FCF1" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#AAAAAA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleSignUp}
          activeOpacity={0.8}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#66FCF1', '#45A29E']}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Já tem conta? <Text style={styles.linkHighlight}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#66FCF1',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#C5C6C7',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2833',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#F1F1F1',
    fontFamily: 'Poppins_400Regular',
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#66FCF1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#0D1117',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: '#C5C6C7',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  linkHighlight: {
    color: '#66FCF1',
    fontWeight: 'bold',
  },
});
