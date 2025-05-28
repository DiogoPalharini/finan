// app/LoginScreen.tsx - Versão Melhorada
import React, { useState } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import Title from '../src/components/Title';
import { COLORS, TYPO, LAYOUT } from '../src/styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.title}>Acesse sua conta</Text>
          </LinearGradient>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require('../assets/images/login.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Informe seu e‑mail e senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E‑mail"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textColor={COLORS.inputText}
                underlineColor="transparent"
                dense={true}
                theme={{
                  colors: {
                    primary: COLORS.primary,
                    background: COLORS.surface,
                    text: COLORS.inputText,
                    placeholder: COLORS.textSecondary,
                  },
                }}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textColor={COLORS.inputText}
                underlineColor="transparent"
                dense={true}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? 'eye-off' : 'eye'} 
                    color={COLORS.textSecondary} 
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeIcon}
                  />
                }
                theme={{
                  colors: {
                    primary: COLORS.primary,
                    background: COLORS.surface,
                    text: COLORS.inputText,
                    placeholder: COLORS.textSecondary,
                  },
                }}
              />
            </View>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.loginButton}
            >
              <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/SignUpScreen')}
              style={styles.linkContainer}
              disabled={loading}
            >
              <Text style={styles.linkText}>
                Ainda não tem conta? <Text style={styles.linkHighlight}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.lg,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  illustration: {
    width: 180,
    height: 180,
    marginBottom: LAYOUT.spacing.lg,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: TYPO.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
    maxWidth: 360,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    height: 48, // Altura reduzida do input
  },
  inputIcon: {
    marginRight: LAYOUT.spacing.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: TYPO.family.regular,
    fontSize: TYPO.size.md,
    backgroundColor: 'transparent',
    height: 40, // Altura reduzida do input
    paddingVertical: 0, // Remove o padding vertical
  },
  eyeIcon: {
    marginTop: 0, // Centraliza o ícone verticalmente
    alignSelf: 'center',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: LAYOUT.spacing.lg,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  gradientButton: {
    paddingVertical: LAYOUT.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
  },
  linkContainer: {
    marginTop: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
  },
  linkHighlight: {
    color: COLORS.secondary,
    fontFamily: TYPO.family.medium,
  },
});
