// app/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, Text
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

import Title from '../src/components/Title';
import { COLORS, TYPO, LAYOUT } from '../src/styles';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/HomeScreen');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          padding: LAYOUT.spacing.md,
          justifyContent: 'center',
        }}
      >
        {/* Título */}
        <Title style={{ fontSize: TYPO.size.xxl, marginBottom: LAYOUT.spacing.sm }}>
          Bem-vindo de volta
        </Title>
        <View style={{ marginBottom: LAYOUT.spacing.lg }}>
          <Title 
            style={{ 
              fontSize: TYPO.size.md, 
              color: COLORS.textSecondary, 
              fontFamily: TYPO.family.regular 
            }}
          >
            Faça login para continuar
          </Title>
        </View>

        {/* E-mail */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: LAYOUT.radius.small,
          marginBottom: LAYOUT.spacing.md,
          paddingHorizontal: LAYOUT.spacing.sm,
        }}>
          <Ionicons name="mail-outline" size={TYPO.size.lg} color={COLORS.primary} />
          <TextInput
            style={{
              flex: 1,
              color: COLORS.text,
              fontFamily: TYPO.family.regular,
              fontSize: TYPO.size.md,
              paddingVertical: LAYOUT.spacing.sm,
              marginLeft: LAYOUT.spacing.xs,
            }}
            placeholder="E-mail"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Senha */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: LAYOUT.radius.small,
          marginBottom: LAYOUT.spacing.md,
          paddingHorizontal: LAYOUT.spacing.sm,
        }}>
          <Ionicons name="lock-closed-outline" size={TYPO.size.lg} color={COLORS.primary} />
          <TextInput
            style={{
              flex: 1,
              color: COLORS.text,
              fontFamily: TYPO.family.regular,
              fontSize: TYPO.size.md,
              paddingVertical: LAYOUT.spacing.sm,
              marginLeft: LAYOUT.spacing.xs,
            }}
            placeholder="Senha"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Botão Entrar */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.8}
          style={{ marginBottom: LAYOUT.spacing.lg }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={{
              borderRadius: LAYOUT.radius.large,
              paddingVertical: LAYOUT.spacing.md,
              alignItems: 'center',
              elevation: LAYOUT.shadow.elevation,
            }}
          >
            <Title 
              style={{
                fontSize: TYPO.size.lg,
                color: COLORS.background,
                fontFamily: TYPO.family.bold,
              }}
            >
              Entrar
            </Title>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link para cadastro */}
        <TouchableOpacity onPress={() => router.push('/SignUpScreen')}>
          <Title 
            style={{
              fontSize: TYPO.size.sm,
              color: COLORS.textSecondary,
              fontFamily: TYPO.family.regular,
              textAlign: 'center',
            }}
          >
            Ainda não tem conta?{' '}
            <Text 
              style={{
                color: COLORS.primary,
                fontFamily: TYPO.family.semibold,
              }}
            >
              Cadastre-se
            </Text>
          </Title>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
