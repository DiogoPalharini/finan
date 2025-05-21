// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { signUp, login, logout } from '../services/authService';

// Definindo o tipo para o contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

// Criando o contexto
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signUp: async () => null,
  login: async () => null,
  logout: async () => {},
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

  // Função para cadastro
  const handleSignUp = async (email: string, password: string) => {
    setError(null);
    try {
      const newUser = await signUp(email, password);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
      return null;
    }
  };

  // Função para login
  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      const loggedUser = await login(email, password);
      return loggedUser;
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      return null;
    }
  };

  // Função para logout
  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer logout');
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
