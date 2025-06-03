// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  signUp, 
  login, 
  logout, 
  signInWithGoogle,
  resetPassword,
  changePassword,
  sendEmailVerification,
  setPersistence,
  AuthError
} from '../services/authService';

// Definindo o tipo para o contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  setPersistence: (persistence: 'local' | 'session' | 'none') => Promise<void>;
  clearError: () => void;
}

// Criando o contexto
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signUp: async () => null,
  login: async () => null,
  logout: async () => {},
  signInWithGoogle: async () => null,
  resetPassword: async () => {},
  changePassword: async () => {},
  sendEmailVerification: async () => {},
  setPersistence: async () => {},
  clearError: () => {}
});

// Props para o provedor do contexto
interface AuthProviderProps {
  children: ReactNode;
}

// Componente provedor do contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpar o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Limpar erro
  const clearError = () => setError(null);

  // Função para cadastro
  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    setError(null);
    try {
      const newUser = await signUp(email, password, displayName);
      return newUser;
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao criar conta');
      }
      return null;
    }
  };

  // Função para login
  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      const loggedUser = await login(email, password);
      return loggedUser;
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login');
      }
      return null;
    }
  };

  // Função para login com Google
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const loggedUser = await signInWithGoogle();
      return loggedUser;
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login com Google');
      }
      return null;
    }
  };

  // Função para logout
  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao fazer logout');
      }
    }
  };

  // Função para resetar senha
  const handleResetPassword = async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao enviar email de recuperação');
      }
    }
  };

  // Função para alterar senha
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao alterar senha');
      }
    }
  };

  // Função para enviar verificação de email
  const handleSendEmailVerification = async () => {
    setError(null);
    try {
      await sendEmailVerification();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao enviar verificação de email');
      }
    }
  };

  // Função para definir persistência
  const handleSetPersistence = async (persistence: 'local' | 'session' | 'none') => {
    setError(null);
    try {
      await setPersistence(persistence);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Erro ao definir persistência');
      }
    }
  };

  // Valor do contexto
  const value = {
    user,
    loading,
    error,
    signUp: handleSignUp,
    login: handleLogin,
    logout: handleLogout,
    signInWithGoogle: handleGoogleLogin,
    resetPassword: handleResetPassword,
    changePassword: handleChangePassword,
    sendEmailVerification: handleSendEmailVerification,
    setPersistence: handleSetPersistence,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
