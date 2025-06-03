import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { Text, TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { signUp, validatePassword } from '../services/authService';
import { saveUserProfile } from '../services/userService';

const { width } = Dimensions.get('window');

// Componente de etapa do cadastro
interface StepProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepProps> = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.stepContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.stepDot, 
            index === currentStep && styles.activeStepDot
          ]} 
        />
      ))}
    </View>
  );
};

// Componente principal de cadastro
export default function RegisterScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para os campos do formulário
  // Etapa 1: Informações básicas
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Etapa 2: Informações pessoais
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('');
  
  // Etapa 3: Informações financeiras
  const [profession, setProfession] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [financialGoal, setFinancialGoal] = useState('');
  
  // Estados para validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; message: string }>({ isValid: false, message: '' });

  // Validar campos da etapa atual
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      // Validar etapa 1
      if (!name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!email.trim()) newErrors.email = 'Email é obrigatório';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
      
      if (!password) newErrors.password = 'Senha é obrigatória';
      else if (password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      
      if (password !== confirmPassword) newErrors.confirmPassword = 'Senhas não conferem';
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    } 
    else if (currentStep === 1) {
      // Validar etapa 2
      if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório';
      if (!birthDate.trim()) newErrors.birthDate = 'Data de nascimento é obrigatória';
      // CPF e gênero são opcionais
    } 
    else if (currentStep === 2) {
      // Validar etapa 3
      if (!profession.trim()) newErrors.profession = 'Profissão é obrigatória';
      if (!monthlyIncome.trim()) newErrors.monthlyIncome = 'Renda mensal é obrigatória';
      if (!financialGoal.trim()) newErrors.financialGoal = 'Objetivo financeiro é obrigatório';
      // Status de emprego é opcional
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avançar para a próxima etapa
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleRegister();
      }
    }
  };

  // Voltar para a etapa anterior
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  // Formatar telefone
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 0) {
      if (cleaned.length <= 2) {
        formatted = `(${cleaned}`;
      } else if (cleaned.length <= 6) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      } else if (cleaned.length <= 10) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      } else {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
      }
    }
    
    return formatted;
  };

  // Formatar data de nascimento
  const formatBirthDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 0) {
      if (cleaned.length <= 2) {
        formatted = cleaned;
      } else if (cleaned.length <= 4) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      } else {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
      }
    }
    
    return formatted;
  };

  // Formatar CPF
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        formatted = cleaned;
      } else if (cleaned.length <= 6) {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
      } else if (cleaned.length <= 9) {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
      } else {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
      }
    }
    
    return formatted;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const validation = validatePassword(text);
    setPasswordStrength(validation);
  };

  // Registrar usuário
  const handleRegister = async () => {
    if (!validateCurrentStep()) return;
    
    setIsLoading(true);
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await signUp(email, password);
      const userId = userCredential.uid;
      
      // Salvar dados adicionais no perfil
      await saveUserProfile(userId, {
        displayName: name,
        phoneNumber: phone,
        birthDate: birthDate,
        cpf: cpf,
        gender: gender as any,
        profession: profession,
        employmentStatus: employmentStatus as any,
        monthlyIncome: monthlyIncome,
        financialGoal: financialGoal as any,
        preferredCurrency: 'BRL',
        notificationPreference: 'diaria',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Redirecionar para a tela inicial
      router.replace('/HomeScreen');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setErrors({
        ...errors,
        general: 'Erro ao criar conta. Verifique seus dados e tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar etapa atual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Text style={styles.stepTitle}>Informações básicas</Text>
            <Text style={styles.stepDescription}>
              Vamos começar com suas informações principais
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
                error={!!errors.name}
                disabled={isLoading}
              />
            </View>
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                disabled={isLoading}
              />
            </View>
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                error={!!errors.password}
                disabled={isLoading}
              />
            </View>
            {password && (
              <HelperText type={passwordStrength.isValid ? "info" : "error"}>
                {passwordStrength.message}
              </HelperText>
            )}
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={!!errors.confirmPassword}
                disabled={isLoading}
              />
            </View>
            {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
          </>
        );
      
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Informações pessoais</Text>
            <Text style={styles.stepDescription}>
              Estas informações nos ajudam a personalizar sua experiência
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                placeholderTextColor={COLORS.textSecondary}
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                keyboardType="phone-pad"
                error={!!errors.phone}
                disabled={isLoading}
              />
            </View>
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}
            
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Data de nascimento (DD/MM/AAAA)"
                placeholderTextColor={COLORS.textSecondary}
                value={birthDate}
                onChangeText={(text) => setBirthDate(formatBirthDate(text))}
                keyboardType="numeric"
                error={!!errors.birthDate}
                disabled={isLoading}
              />
            </View>
            {errors.birthDate && <HelperText type="error">{errors.birthDate}</HelperText>}
            
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="CPF (opcional)"
                placeholderTextColor={COLORS.textSecondary}
                value={cpf}
                onChangeText={(text) => setCpf(formatCPF(text))}
                keyboardType="numeric"
                error={!!errors.cpf}
                disabled={isLoading}
              />
            </View>
            {errors.cpf && <HelperText type="error">{errors.cpf}</HelperText>}
            
            <Text style={styles.labelText}>Gênero (opcional)</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, gender === 'masculino' && styles.selectedOption]}
                onPress={() => setGender('masculino')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, gender === 'masculino' && styles.selectedOptionText]}>
                  Masculino
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, gender === 'feminino' && styles.selectedOption]}
                onPress={() => setGender('feminino')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, gender === 'feminino' && styles.selectedOptionText]}>
                  Feminino
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, gender === 'outro' && styles.selectedOption]}
                onPress={() => setGender('outro')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, gender === 'outro' && styles.selectedOptionText]}>
                  Outro
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, gender === 'prefiro_nao_informar' && styles.selectedOption]}
                onPress={() => setGender('prefiro_nao_informar')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, gender === 'prefiro_nao_informar' && styles.selectedOptionText]}>
                  Prefiro não informar
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );
      
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Informações financeiras</Text>
            <Text style={styles.stepDescription}>
              Estas informações nos ajudam a personalizar suas metas financeiras
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Profissão"
                placeholderTextColor={COLORS.textSecondary}
                value={profession}
                onChangeText={setProfession}
                error={!!errors.profession}
                disabled={isLoading}
              />
            </View>
            {errors.profession && <HelperText type="error">{errors.profession}</HelperText>}
            
            <Text style={styles.labelText}>Situação de emprego</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, employmentStatus === 'clt' && styles.selectedOption]}
                onPress={() => setEmploymentStatus('clt')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, employmentStatus === 'clt' && styles.selectedOptionText]}>
                  CLT
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, employmentStatus === 'autonomo' && styles.selectedOption]}
                onPress={() => setEmploymentStatus('autonomo')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, employmentStatus === 'autonomo' && styles.selectedOptionText]}>
                  Autônomo
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, employmentStatus === 'empresario' && styles.selectedOption]}
                onPress={() => setEmploymentStatus('empresario')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, employmentStatus === 'empresario' && styles.selectedOptionText]}>
                  Empresário
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, employmentStatus === 'estudante' && styles.selectedOption]}
                onPress={() => setEmploymentStatus('estudante')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, employmentStatus === 'estudante' && styles.selectedOptionText]}>
                  Estudante
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, employmentStatus === 'aposentado' && styles.selectedOption]}
                onPress={() => setEmploymentStatus('aposentado')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, employmentStatus === 'aposentado' && styles.selectedOptionText]}>
                  Aposentado
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.labelText}>Renda mensal</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, monthlyIncome === 'ate_2000' && styles.selectedOption]}
                onPress={() => setMonthlyIncome('ate_2000')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, monthlyIncome === 'ate_2000' && styles.selectedOptionText]}>
                  Até R$ 2.000
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, monthlyIncome === '2000_5000' && styles.selectedOption]}
                onPress={() => setMonthlyIncome('2000_5000')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, monthlyIncome === '2000_5000' && styles.selectedOptionText]}>
                  R$ 2.000 a R$ 5.000
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, monthlyIncome === '5000_10000' && styles.selectedOption]}
                onPress={() => setMonthlyIncome('5000_10000')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, monthlyIncome === '5000_10000' && styles.selectedOptionText]}>
                  R$ 5.000 a R$ 10.000
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, monthlyIncome === 'acima_10000' && styles.selectedOption]}
                onPress={() => setMonthlyIncome('acima_10000')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, monthlyIncome === 'acima_10000' && styles.selectedOptionText]}>
                  Acima de R$ 10.000
                </Text>
              </TouchableOpacity>
            </View>
            {errors.monthlyIncome && <HelperText type="error">{errors.monthlyIncome}</HelperText>}
            
            <Text style={styles.labelText}>Objetivo financeiro principal</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, financialGoal === 'economizar' && styles.selectedOption]}
                onPress={() => setFinancialGoal('economizar')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, financialGoal === 'economizar' && styles.selectedOptionText]}>
                  Economizar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, financialGoal === 'investir' && styles.selectedOption]}
                onPress={() => setFinancialGoal('investir')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, financialGoal === 'investir' && styles.selectedOptionText]}>
                  Investir
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, financialGoal === 'controlar_gastos' && styles.selectedOption]}
                onPress={() => setFinancialGoal('controlar_gastos')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, financialGoal === 'controlar_gastos' && styles.selectedOptionText]}>
                  Controlar gastos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, financialGoal === 'quitar_dividas' && styles.selectedOption]}
                onPress={() => setFinancialGoal('quitar_dividas')}
                disabled={isLoading}
              >
                <Text style={[styles.optionText, financialGoal === 'quitar_dividas' && styles.selectedOptionText]}>
                  Quitar dívidas
                </Text>
              </TouchableOpacity>
            </View>
            {errors.financialGoal && <HelperText type="error">{errors.financialGoal}</HelperText>}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Crie sua conta</Text>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}
        
        {renderStep()}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            activeOpacity={0.8}
            style={styles.nextButton}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {currentStep === totalSteps - 1 ? 'Cadastrar' : 'Próximo'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          {currentStep < totalSteps - 1 && (
            <TouchableOpacity
              onPress={() => {
                if (currentStep === totalSteps - 1) {
                  handleRegister();
                } else {
                  setCurrentStep(totalSteps - 1);
                }
              }}
              disabled={isLoading}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Pular para o final</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={styles.linkContainer}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>
            Já tem conta? <Text style={styles.linkHighlight}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.md,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: LAYOUT.spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.xl * 2,
  },
  stepTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  stepDescription: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.lg,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  inputIcon: {
    marginRight: LAYOUT.spacing.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: TYPO.family.regular,
    paddingVertical: LAYOUT.spacing.md,
    fontSize: TYPO.size.md,
    backgroundColor: 'transparent',
  },
  labelText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginTop: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.xs,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: LAYOUT.spacing.md,
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    marginRight: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOption: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderColor: COLORS.secondary,
  },
  optionText: {
    color: COLORS.text,
    fontFamily: TYPO.family.regular,
    fontSize: TYPO.size.sm,
  },
  selectedOptionText: {
    color: COLORS.secondary,
    fontFamily: TYPO.family.medium,
  },
  errorContainer: {
    backgroundColor: 'rgba(215, 38, 61, 0.1)',
    borderRadius: 8,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.md,
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: TYPO.family.medium,
    fontSize: TYPO.size.sm,
  },
  buttonContainer: {
    marginTop: LAYOUT.spacing.lg,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  skipButton: {
    alignItems: 'center',
    padding: LAYOUT.spacing.md,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
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
