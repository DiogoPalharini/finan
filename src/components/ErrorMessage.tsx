import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  onDismiss,
}) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getFormattedMessage = (msg: string) => {
    // Tratamento específico para erros do Firebase Auth
    if (msg.includes('Email inválido')) {
      return 'Por favor, insira um endereço de e-mail válido';
    }
    if (msg.includes('signInWithPopup is not a function')) {
      return 'Não foi possível fazer login com o Google. Por favor, tente novamente ou use seu e-mail e senha';
    }
    if (msg.includes('wrong-password')) {
      return 'Senha incorreta. Por favor, verifique sua senha e tente novamente';
    }
    if (msg.includes('user-not-found')) {
      return 'Não encontramos uma conta com este e-mail. Verifique o e-mail ou crie uma nova conta';
    }
    if (msg.includes('too-many-requests')) {
      return 'Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente';
    }
    if (msg.includes('network-request-failed')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente';
    }
    if (msg.includes('email-already-in-use')) {
      return 'Este e-mail já está em uso. Tente fazer login ou use outro e-mail';
    }
    if (msg.includes('weak-password')) {
      return 'A senha é muito fraca. Use pelo menos 6 caracteres, incluindo letras e números';
    }
    if (msg.includes('popup-closed-by-user')) {
      return 'Login com Google cancelado. Tente novamente ou use seu e-mail e senha';
    }
    if (msg.includes('popup-blocked')) {
      return 'O navegador bloqueou a janela de login. Por favor, permita pop-ups e tente novamente';
    }
    if (msg.includes('account-exists-with-different-credential')) {
      return 'Já existe uma conta com este e-mail usando outro método de login';
    }
    if (msg.includes('requires-recent-login')) {
      return 'Por favor, faça login novamente para realizar esta operação';
    }
    if (msg.includes('email-not-verified')) {
      return 'Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada';
    }

    return msg;
  };

  const getIconName = () => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'alert-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#ffebee';
      case 'warning':
        return '#fff3e0';
      case 'info':
        return '#e3f2fd';
      default:
        return '#ffebee';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return '#c62828';
      case 'warning':
        return '#ef6c00';
      case 'info':
        return '#1565c0';
      default:
        return '#c62828';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={getIconName()}
          size={20}
          color={getTextColor()}
          style={styles.icon}
        />
        <Text style={[styles.message, { color: getTextColor() }]}>
          {getFormattedMessage(message)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    textAlign: 'left',
  },
}); 