import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { updateUserProfile, UserProfile } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentProfile: Partial<UserProfile> | null;
}

const { width } = Dimensions.get('window');

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSuccess,
  currentProfile
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para os campos do formulário
  const [name, setName] = useState(currentProfile?.displayName || '');
  const [phone, setPhone] = useState(currentProfile?.phoneNumber || '');
  const [birthDate, setBirthDate] = useState(currentProfile?.birthDate || '');
  const [cpf, setCpf] = useState(currentProfile?.cpf || '');
  const [gender, setGender] = useState(currentProfile?.gender || '');
  const [profession, setProfession] = useState(currentProfile?.profession || '');
  const [employmentStatus, setEmploymentStatus] = useState(currentProfile?.employmentStatus || '');
  const [monthlyIncome, setMonthlyIncome] = useState(currentProfile?.monthlyIncome || '');
  const [financialGoal, setFinancialGoal] = useState(currentProfile?.financialGoal || '');
  
  // Atualizar estados quando o perfil atual mudar
  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.displayName || '');
      setPhone(currentProfile.phoneNumber || '');
      setBirthDate(currentProfile.birthDate || '');
      setCpf(currentProfile.cpf || '');
      setGender(currentProfile.gender || '');
      setProfession(currentProfile.profession || '');
      setEmploymentStatus(currentProfile.employmentStatus || '');
      setMonthlyIncome(currentProfile.monthlyIncome || '');
      setFinancialGoal(currentProfile.financialGoal || '');
    }
  }, [currentProfile]);
  
  // Resetar modal ao fechar
  const handleClose = () => {
    setCurrentStep(0);
    setPassword('');
    setErrors({});
    onClose();
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
  
  // Validar campos
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      if (!name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório';
      if (!birthDate.trim()) newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (currentStep === 1) {
      if (!profession.trim()) newErrors.profession = 'Profissão é obrigatória';
      if (!monthlyIncome) newErrors.monthlyIncome = 'Renda mensal é obrigatória';
      if (!financialGoal) newErrors.financialGoal = 'Objetivo financeiro é obrigatório';
    } else if (currentStep === 2) {
      if (!password) newErrors.password = 'Senha é obrigatória para confirmar alterações';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Avançar para a próxima etapa
  const handleNext = () => {
    if (validateFields()) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSaveProfile();
      }
    }
  };
  
  // Voltar para a etapa anterior
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
    }
  };
  
  // Salvar perfil
  const handleSaveProfile = async () => {
    if (!validateFields() || !user) return;
    
    setIsLoading(true);
    try {
      // Preparar dados do perfil
      const profileData: Partial<UserProfile> = {
        displayName: name,
        phoneNumber: phone,
        birthDate: birthDate,
        cpf: cpf,
        gender: gender as any,
        profession: profession,
        employmentStatus: employmentStatus as any,
        monthlyIncome: monthlyIncome,
        financialGoal: financialGoal as any,
        updatedAt: new Date().toISOString()
      };
      
      // Atualizar perfil com verificação de senha
      await updateUserProfile(user.uid, profileData, password);
      
      // Fechar modal e notificar sucesso
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrors({
        ...errors,
        general: 'Erro ao atualizar perfil. Verifique sua senha e tente novamente.'
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
            <Text style={styles.stepTitle}>Informações pessoais</Text>
            <Text style={styles.stepDescription}>
              Atualize suas informações pessoais
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
      
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Informações financeiras</Text>
            <Text style={styles.stepDescription}>
              Atualize suas informações financeiras
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
      
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Confirmar alterações</Text>
            <Text style={styles.stepDescription}>
              Digite sua senha para confirmar as alterações
            </Text>
            
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Resumo das alterações:</Text>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Nome:</Text>
                <Text style={styles.summaryValue}>{name}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Telefone:</Text>
                <Text style={styles.summaryValue}>{phone}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Profissão:</Text>
                <Text style={styles.summaryValue}>{profession}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Renda mensal:</Text>
                <Text style={styles.summaryValue}>
                  {monthlyIncome === 'ate_2000' && 'Até R$ 2.000'}
                  {monthlyIncome === '2000_5000' && 'R$ 2.000 a R$ 5.000'}
                  {monthlyIncome === '5000_10000' && 'R$ 5.000 a R$ 10.000'}
                  {monthlyIncome === 'acima_10000' && 'Acima de R$ 10.000'}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Objetivo:</Text>
                <Text style={styles.summaryValue}>
                  {financialGoal === 'economizar' && 'Economizar'}
                  {financialGoal === 'investir' && 'Investir'}
                  {financialGoal === 'controlar_gastos' && 'Controlar gastos'}
                  {financialGoal === 'quitar_dividas' && 'Quitar dívidas'}
                </Text>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha para confirmar"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={!!errors.password}
                disabled={isLoading}
              />
            </View>
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}
            
            {errors.general && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <Text style={styles.title}>Editar Perfil</Text>
            
            <View style={styles.stepContainer}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.stepDot, 
                    index === currentStep && styles.activeStepDot
                  ]} 
                />
              ))}
            </View>
          </LinearGradient>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderStep()}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>
                {currentStep === 0 ? 'Cancelar' : 'Voltar'}
              </Text>
            </TouchableOpacity>
            
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
                    {currentStep === 2 ? 'Salvar' : 'Próximo'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '90%',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: LAYOUT.spacing.xs,
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
    maxHeight: '70%',
  },
  scrollContent: {
    padding: LAYOUT.spacing.lg,
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
  summaryContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: LAYOUT.spacing.sm,
  },
  summaryLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    width: 100,
  },
  summaryValue: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(215, 38, 61, 0.1)',
    borderRadius: 8,
    padding: LAYOUT.spacing.md,
    marginTop: LAYOUT.spacing.md,
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: TYPO.family.medium,
    fontSize: TYPO.size.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontFamily: TYPO.family.medium,
    fontSize: TYPO.size.md,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
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
});

export default EditProfileModal;
