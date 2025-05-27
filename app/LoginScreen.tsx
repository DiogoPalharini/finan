// app/LoginScreen.tsx - Alternativa 2
import React, { useState } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import Title from '../src/components/Title';
import { COLORS, TYPO, LAYOUT } from '../src/styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/HomeScreen');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.logoContainer}>
            <Title style={styles.appTitle}>Finan</Title>
          </View>
          
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Acesse sua Conta</Title>
              <Text style={styles.subtitle}>Informe seu e‑mail e senha</Text>

              <TextInput
                mode="flat"
                label="E‑mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email-outline" color={COLORS.primary} />}
                style={styles.input}
                textColor={COLORS.inputText}
                theme={{
                  colors: {
                    primary: COLORS.primary,
                    background: COLORS.surface,
                    text: COLORS.inputText,
                    placeholder: COLORS.textSecondary,
                  },
                }}
              />

              <TextInput
                mode="flat"
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                left={<TextInput.Icon icon="lock-outline" color={COLORS.primary} />}
                style={styles.input}
                textColor={COLORS.inputText}
                theme={{
                  colors: {
                    primary: COLORS.primary,
                    background: COLORS.surface,
                    text: COLORS.inputText,
                    placeholder: COLORS.textSecondary,
                  },
                }}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                style={styles.button}
              >
                Entrar
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.registerContainer}>
            <Text style={styles.linkText}>
              Ainda não tem conta?{' '}
              <Text style={styles.link} onPress={() => router.push('/SignUpScreen')}>
                Cadastre‑se
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: LAYOUT.spacing.md,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: LAYOUT.spacing.xl,
  },
  appTitle: {
    fontSize: TYPO.size.xxl,
    fontFamily: TYPO.family.bold,
    color: COLORS.primary,
  },
  card: {
    width: '100%',
    borderRadius: LAYOUT.radius.large,
    elevation: 4,
    backgroundColor: COLORS.surface,
  },
  cardContent: {
    padding: LAYOUT.spacing.md,
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.semibold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  subtitle: {
    fontSize: TYPO.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.default,
    marginBottom: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.sm,
  },
  button: {
    borderRadius: LAYOUT.radius.large,
    marginTop: LAYOUT.spacing.md,
    width: '100%',
    alignSelf: 'center',
  },
  buttonContent: {
    height: 56,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.medium,
    color: COLORS.surface,
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  linkText: {
    fontSize: TYPO.size.sm,
    color: COLORS.text,
  },
  link: {
    color: COLORS.warning,
    fontFamily: TYPO.family.semibold,
  },
});
