import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert
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
  
  // Validar campos do formulário
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      if (!name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      }
      
      if (phone && !/^\(\d{2}\) \d{5}-\d{4}$/.test(phone)) {
        newErrors.phone = 'Telefone inválido';
      }
      
      if (birthDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
        newErrors.birthDate = 'Data inválida';
      }
    }
    
    if (currentStep === 1) {
      if (!profession.trim()) {
        newErrors.profession = 'Profissão é obrigatória';
      }
      
      if (!employmentStatus) {
        newErrors.employmentStatus = 'Situação de emprego é obrigatória';
      }
      
      if (!monthlyIncome) {
        newErrors.monthlyIncome = 'Renda mensal é obrigatória';
      }
    }
    
    if (currentStep === 2) {
      if (!password) {
        newErrors.password = 'Senha é obrigatória';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Formatar telefone
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return text;
  };
  
  // Formatar data
  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
    
    if (match) {
      return `${match[1]}/${match[2]}/${match[3]}`;
    }
    
    return text;
  };
  
  // Formatar CPF
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    
    return text;
  };
  
  // Avançar para próxima etapa
  const handleNextStep = () => {
    if (validateFields()) {
      if (currentStep === 1) {
        // Na última etapa, pedir senha para confirmar alterações
        setCurrentStep(2);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  // Voltar para etapa anterior
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
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
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
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
            <Text style={styles.stepTitle}>Informações básicas</Text>
            <Text style={styles.stepDescription}>
              Atualize suas informações básicas
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
            
            <Text style={styles.labelText}>Gênero</Text>
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
            
            <Text style={styles.labelText}>Objetivo financeiro</Text>
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
          </>
        );
      
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Confirmação</Text>
            <Text style={styles.stepDescription}>
              Digite sua senha para confirmar as alterações
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={!!errors.password}
                disabled={isLoading}
              />
            </View>
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}
            {errors.general && <HelperText type="error">{errors.general}</HelperText>}
          </>
        );
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
            {currentStep > 0 && (
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                disabled={isLoading}
                style={styles.footerButton}
                labelStyle={styles.footerButtonLabel}
              >
                Voltar
              </Button>
            )}
            
            <Button
              mode="contained"
              onPress={currentStep === 2 ? handleSaveProfile : handleNextStep}
              loading={isLoading}
              disabled={isLoading}
              style={styles.footerButton}
              labelStyle={styles.footerButtonLabel}
            >
              {currentStep === 2 ? 'Salvar' : 'Próximo'}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  title: {
    color: COLORS.white,
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    textAlign: 'center',
    marginBottom: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: COLORS.white,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.spacing.lg,
  },
  stepTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: 8,
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  inputIcon: {
    marginLeft: LAYOUT.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
  },
  labelText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginTop: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -LAYOUT.spacing.xs,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    margin: LAYOUT.spacing.xs,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  selectedOption: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  optionText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: LAYOUT.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.white,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: LAYOUT.spacing.xs,
  },
  footerButtonLabel: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
  },
});

export default EditProfileModal;
