// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { TYPO } from '../../constants/typography';
import { LAYOUT } from '../../constants/layout';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      await register(name, email, password);
      // Navegação é gerenciada pelo RootNavigator baseado no estado de autenticação
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao criar conta');
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
        <Text style={{ 
          fontSize: TYPO.size.xxl, 
          marginBottom: LAYOUT.spacing.sm,
          fontFamily: TYPO.family.bold,
          color: COLORS.text
        }}>
          Criar Conta
        </Text>
        <View style={{ marginBottom: LAYOUT.spacing.lg }}>
          <Text style={{ 
            fontSize: TYPO.size.md, 
            color: COLORS.textSecondary, 
            fontFamily: TYPO.family.regular 
          }}>
            Preencha os dados para se cadastrar
          </Text>
        </View>

        {/* Nome */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: LAYOUT.radius.small,
          marginBottom: LAYOUT.spacing.md,
          paddingHorizontal: LAYOUT.spacing.sm,
        }}>
          <Ionicons name="person-outline" size={TYPO.size.lg} color={COLORS.primary} />
          <TextInput
            style={{
              flex: 1,
              color: COLORS.text,
              fontFamily: TYPO.family.regular,
              fontSize: TYPO.size.md,
              paddingVertical: LAYOUT.spacing.sm,
              marginLeft: LAYOUT.spacing.xs,
            }}
            placeholder="Nome completo"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
          />
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

        {/* Confirmar Senha */}
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
            placeholder="Confirmar senha"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Botão Cadastrar */}
        <TouchableOpacity
          onPress={handleRegister}
          activeOpacity={0.8}
          style={{ 
            marginBottom: LAYOUT.spacing.lg,
            backgroundColor: COLORS.primary,
            borderRadius: LAYOUT.radius.large,
            paddingVertical: LAYOUT.spacing.md,
            alignItems: 'center',
            elevation: 3,
          }}
        >
          <Text style={{
            fontSize: TYPO.size.lg,
            color: COLORS.background,
            fontFamily: TYPO.family.bold,
          }}>
            Cadastrar
          </Text>
        </TouchableOpacity>

        {/* Link para login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={{
            fontSize: TYPO.size.sm,
            color: COLORS.textSecondary,
            fontFamily: TYPO.family.regular,
            textAlign: 'center',
          }}>
            Já tem uma conta?{' '}
            <Text style={{
              color: COLORS.primary,
              fontFamily: TYPO.family.semibold,
            }}>
              Faça login
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
