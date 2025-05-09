import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback,
  Keyboard, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function IncomeForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    // Lógica de submissão (placeholder)
    Alert.alert('Receita', 'Receita adicionada com sucesso!');
    router.back
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.title}>Nova Receita</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Título"
            placeholderTextColor="#AAAAAA"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Valor"
            placeholderTextColor="#AAAAAA"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Categoria"
            placeholderTextColor="#AAAAAA"
            value={category}
            onChangeText={setCategory}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.8}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#00FFAB', '#009975']}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Adicionar Receita</Text>
          </LinearGradient>
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
    fontSize: 28,
    color: '#00FFAB',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#1F2833',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    color: '#F1F1F1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    paddingVertical: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#00FFAB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#0D1117',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
});
