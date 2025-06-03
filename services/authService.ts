// services/authService.ts
import { auth } from '../config/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  sendEmailVerification as firebaseSendEmailVerification,
  setPersistence as setFirebasePersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile
} from "firebase/auth";

// Erros personalizados
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Cria uma nova conta de usuário com email e senha
 * @param email Email do usuário
 * @param password Senha do usuário
 * @param displayName Nome do usuário
 * @returns Objeto User do Firebase Auth
 */
export async function signUp(email: string, password: string, displayName?: string) {
  try {
    // Validar email
    if (!isValidEmail(email)) {
      throw new AuthError('Email inválido', 'invalid-email');
    }

    // Validar senha
    if (!validatePassword(password)) {
      throw new AuthError('A senha não atende aos requisitos mínimos de segurança', 'weak-password');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar perfil se o nome for fornecido
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Enviar email de verificação
    await firebaseSendEmailVerification(userCredential.user);

    return userCredential.user;
  } catch (error: any) {
    console.error('Erro ao criar conta:', error);
    throw handleAuthError(error);
  }
}

/**
 * Realiza login com email e senha
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Objeto User do Firebase Auth
 */
export async function login(email: string, password: string) {
  try {
    // Validar email
    if (!isValidEmail(email)) {
      throw new AuthError('Email inválido', 'invalid-email');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Se o email não estiver verificado, enviar novo email de verificação
    if (!userCredential.user.emailVerified) {
      await firebaseSendEmailVerification(userCredential.user);
      await signOut(auth);
      throw new AuthError('Email não verificado. Um novo email de verificação foi enviado.', 'email-not-verified');
    }

    return userCredential.user;
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    throw handleAuthError(error);
  }
}

/**
 * Realiza login com Google
 * @returns Objeto User do Firebase Auth
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erro ao fazer login com Google:', error);
    throw handleAuthError(error);
  }
}

/**
 * Realiza logout do usuário atual
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error);
    throw handleAuthError(error);
  }
}

/**
 * Envia email para redefinição de senha
 * @param email Email do usuário
 */
export async function resetPassword(email: string) {
  try {
    if (!isValidEmail(email)) {
      throw new AuthError('Email inválido', 'invalid-email');
    }

    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Erro ao enviar email de redefinição de senha:', error);
    throw handleAuthError(error);
  }
}

/**
 * Atualiza a senha do usuário atual
 * @param currentPassword Senha atual
 * @param newPassword Nova senha
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new AuthError('Usuário não autenticado', 'user-not-authenticated');
    }

    // Validar nova senha
    if (!validatePassword(newPassword)) {
      throw new AuthError('A nova senha não atende aos requisitos mínimos de segurança', 'weak-password');
    }

    // Reautenticar o usuário antes de alterar a senha
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Atualizar a senha
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    throw handleAuthError(error);
  }
}

/**
 * Obtém o usuário atual autenticado
 * @returns Objeto User do Firebase Auth ou null se não estiver autenticado
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Verifica se o usuário está autenticado
 * @returns Boolean indicando se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

/**
 * Obtém o ID do usuário atual
 * @returns ID do usuário ou null se não estiver autenticado
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

/**
 * Valida se a senha atende aos requisitos mínimos de segurança
 * @param password Senha a ser validada
 * @returns Boolean indicando se a senha é válida
 */
export function validatePassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
}

/**
 * Envia email de verificação para o usuário atual
 */
export async function sendEmailVerification() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new AuthError('Usuário não autenticado', 'user-not-authenticated');
    }
    await firebaseSendEmailVerification(user);
  } catch (error: any) {
    console.error('Erro ao enviar verificação de email:', error);
    throw handleAuthError(error);
  }
}

/**
 * Define o tipo de persistência da sessão do usuário
 * @param persistence Tipo de persistência ('local', 'session' ou 'none')
 */
export async function setPersistence(persistence: 'local' | 'session' | 'none') {
  try {
    const persistenceType = persistence === 'local' ? 
      browserLocalPersistence : 
      persistence === 'session' ? 
        browserSessionPersistence : 
        inMemoryPersistence;
    
    await setFirebasePersistence(auth, persistenceType);
  } catch (error: any) {
    console.error('Erro ao definir persistência:', error);
    throw handleAuthError(error);
  }
}

/**
 * Verifica se o email do usuário está verificado
 * @returns Boolean indicando se o email está verificado
 */
export function isEmailVerified(): boolean {
  const user = auth.currentUser;
  return user?.emailVerified || false;
}

/**
 * Obtém o email do usuário atual
 * @returns Email do usuário ou null se não estiver autenticado
 */
export function getCurrentUserEmail(): string | null {
  return auth.currentUser?.email || null;
}

/**
 * Valida se um email é válido
 * @param email Email a ser validado
 * @returns Boolean indicando se o email é válido
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Trata erros de autenticação e retorna mensagens amigáveis
 * @param error Erro original
 * @returns Erro tratado com mensagem amigável
 */
function handleAuthError(error: any): AuthError {
  const errorCode = error.code || 'unknown-error';
  let message = 'Ocorreu um erro na autenticação';

  switch (errorCode) {
    case 'auth/invalid-email':
      message = 'Email inválido';
      break;
    case 'auth/user-disabled':
      message = 'Esta conta foi desativada';
      break;
    case 'auth/user-not-found':
      message = 'Usuário não encontrado';
      break;
    case 'auth/wrong-password':
      message = 'Senha incorreta';
      break;
    case 'auth/email-already-in-use':
      message = 'Este email já está em uso';
      break;
    case 'auth/weak-password':
      message = 'A senha é muito fraca';
      break;
    case 'auth/operation-not-allowed':
      message = 'Operação não permitida';
      break;
    case 'auth/too-many-requests':
      message = 'Muitas tentativas. Tente novamente mais tarde';
      break;
    case 'auth/network-request-failed':
      message = 'Erro de conexão. Verifique sua internet';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Login cancelado';
      break;
    case 'auth/cancelled-popup-request':
      message = 'Login cancelado';
      break;
    case 'auth/popup-blocked':
      message = 'Popup bloqueado pelo navegador';
      break;
    case 'auth/account-exists-with-different-credential':
      message = 'Já existe uma conta com este email usando outro método de login';
      break;
    case 'auth/credential-already-in-use':
      message = 'Esta credencial já está em uso';
      break;
    case 'auth/requires-recent-login':
      message = 'Por favor, faça login novamente para realizar esta operação';
      break;
    case 'auth/email-not-verified':
      message = 'Email não verificado. Por favor, verifique seu email antes de fazer login.';
      break;
  }

  return new AuthError(message, errorCode);
}
