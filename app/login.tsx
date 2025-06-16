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
import { auth } from '../config/firebaseConfig';
import Title from '../src/components/Title';
import { COLORS, TYPO, LAYOUT } from '../src/styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { login, signInWithGoogle, resetPassword, sendEmailVerification } from '../services/authService';
import { ErrorMessage } from '../src/components/ErrorMessage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/HomeScreen');
    } catch (error: any) {
      setError(error.message);
      if (error.code === 'email-not-verified') {
        // Mostrar botão para reenviar verificação
        setResetEmailSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert('Por favor, insira seu email para recuperar a senha');
      return;
    }

    try {
      await resetPassword(email);
      setResetEmailSent(true);
      alert('Email de recuperação enviado com sucesso!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/HomeScreen');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendEmailVerification();
      setResetEmailSent(true);
      setError('Um novo email de verificação foi enviado. Por favor, verifique sua caixa de entrada.');
    } catch (error: any) {
      setError(error.message);
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <TouchableOpacity onPress={handleResetPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
            {error && (
              <>
                <ErrorMessage
                  message={error}
                  type={error.includes('não verificado') ? 'warning' : 'error'}
                />
                {error.includes('não verificado') && !resetEmailSent && (
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendVerification}
                    disabled={loading}
                  >
                    <Text style={styles.resendButtonText}>Reenviar Email de Verificação</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
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
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              style={styles.googleButton}
            >
              <Ionicons name="logo-google" size={24} color={COLORS.text} />
              <Text style={styles.googleButtonText}>Entrar com Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/SignUpScreen')}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpText}>
                Não tem uma conta? <Text style={styles.signUpTextBold}>Cadastre-se</Text>
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
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: LAYOUT.spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: COLORS.primary,
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
    padding: LAYOUT.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.textSecondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleButtonText: {
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  signUpButton: {
    marginTop: 16,
  },
  signUpText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  signUpTextBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  resendButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  resendButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
