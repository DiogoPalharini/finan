import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Surface, Switch, Portal, Dialog } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import { Budget } from '../../services/budgetService';
import ErrorDialog from './ErrorDialog';

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budgetData: {
    category: string;
    limit: number;
    warningThreshold: number;
    notifications: boolean;
  }) => void;
  isLoading?: boolean;
  budget?: Budget | null;
}

const { width } = Dimensions.get('window');

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading = false,
  budget
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [warningThreshold, setWarningThreshold] = useState('80');
  const [notifications, setNotifications] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const categories = [
    { id: 'alimentacao', label: 'Alimentação', icon: 'restaurant-outline', color: COLORS.primary },
    { id: 'moradia', label: 'Moradia', icon: 'home-outline', color: COLORS.secondary },
    { id: 'transporte', label: 'Transporte', icon: 'car-outline', color: COLORS.success },
    { id: 'lazer', label: 'Lazer', icon: 'film-outline', color: COLORS.warning },
    { id: 'saude', label: 'Saúde', icon: 'medical-outline', color: COLORS.danger },
    { id: 'educacao', label: 'Educação', icon: 'school-outline', color: '#9C27B0' },
    { id: 'vestuario', label: 'Vestuário', icon: 'shirt-outline', color: '#FF9800' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal-outline', color: COLORS.textSecondary },
  ];
  
  useEffect(() => {
    if (budget) {
      setSelectedCategory(budget.category);
      setLimit(budget.limit.toString());
      setWarningThreshold(budget.warningThreshold.toString());
      setNotifications(budget.notifications);
    } else {
      resetForm();
    }
  }, [budget]);
  
  useEffect(() => {
    if (budget?.error) {
      setError(budget.error);
      setShowErrorDialog(true);
    }
  }, [budget?.error]);
  
  const resetForm = () => {
    setSelectedCategory('');
    setLimit('');
    setWarningThreshold('80');
    setNotifications(true);
    setErrors({});
    setErrorMessage(null);
    setError(null);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedCategory) {
      newErrors.category = 'Selecione uma categoria';
    }
    
    if (!limit) {
      newErrors.limit = 'O valor limite é obrigatório';
    } else if (isNaN(Number(limit.replace(/\./g, '').replace(',', '.')))) {
      newErrors.limit = 'Valor inválido';
    }
    
    if (!warningThreshold) {
      newErrors.warningThreshold = 'O percentual de alerta é obrigatório';
    } else {
      const threshold = Number(warningThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        newErrors.warningThreshold = 'Percentual inválido (0-100)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (!validateForm()) return;
    
    const formattedLimit = Number(limit.replace(/\./g, '').replace(',', '.'));
    const formattedThreshold = Number(warningThreshold);
    
    if (formattedLimit <= 0) {
      setErrorMessage('Por favor, insira um valor válido');
      setShowErrorDialog(true);
      return;
    }
    
    onSave({
      category: selectedCategory,
      limit: formattedLimit,
      warningThreshold: formattedThreshold,
      notifications
    });
  };
  
  // Formatar valor monetário
  const formatCurrency = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    
    if (numericValue === '') {
      return '';
    }
    
    const value = Number(numericValue) / 100;
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  const handleErrorClose = () => {
    setShowErrorDialog(false);
    setError(null);
  };

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>
                {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Categoria</Text>
                <View style={styles.categoriesContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category.id && styles.selectedCategoryButton,
                        selectedCategory === category.id && { backgroundColor: category.color }
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                      disabled={isLoading}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={selectedCategory === category.id ? COLORS.white : category.color} 
                      />
                      <Text 
                        style={[
                          styles.categoryButtonText,
                          selectedCategory === category.id && styles.selectedCategoryButtonText
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Valor limite</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  value={limit}
                  onChangeText={(text) => setLimit(formatCurrency(text))}
                  keyboardType="numeric"
                  error={!!errors.limit}
                  disabled={isLoading}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.secondary}
                  theme={{ roundness: 16 }}
                  left={<TextInput.Icon icon="cash-outline" color={COLORS.textSecondary} />}
                />
                {errors.limit && <Text style={styles.errorText}>{errors.limit}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Percentual de alerta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="80"
                  value={warningThreshold}
                  onChangeText={setWarningThreshold}
                  keyboardType="numeric"
                  error={!!errors.warningThreshold}
                  disabled={isLoading}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.secondary}
                  theme={{ roundness: 16 }}
                  left={<TextInput.Icon icon="alert-circle-outline" color={COLORS.textSecondary} />}
                />
                <Text style={styles.helperText}>
                  Alerta será disparado quando atingir este percentual do limite
                </Text>
                {errors.warningThreshold && <Text style={styles.errorText}>{errors.warningThreshold}</Text>}
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Receber notificações</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  disabled={isLoading}
                  color={COLORS.secondary}
                />
              </View>
            </ScrollView>
            
            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={handleClose}
                disabled={isLoading}
                style={styles.footerButton}
                contentStyle={styles.footerButtonContent}
              >
                Cancelar
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={isLoading}
                loading={isLoading}
                style={styles.footerButton}
                contentStyle={styles.footerButtonContent}
              >
                {budget ? 'Salvar' : 'Criar'}
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ErrorDialog
        visible={showErrorDialog}
        message={error || ''}
        onClose={handleErrorClose}
      />
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: LAYOUT.radius.large,
    borderTopRightRadius: LAYOUT.radius.large,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: LAYOUT.spacing.lg - 1,
    borderTopLeftRadius: LAYOUT.radius.large,
    borderTopRightRadius: LAYOUT.radius.large,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
  },
  closeButton: {
    padding: LAYOUT.spacing.xs,
  },
  scrollContent: {
    gap: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.md - 1,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    gap: LAYOUT.spacing.xs,
  },
  inputLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
  },
  helperText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.xs,
  },
  errorText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.danger,
    marginTop: LAYOUT.spacing.xs,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.default,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: LAYOUT.spacing.xs,
  },
  selectedCategoryButton: {
    borderColor: 'transparent',
  },
  categoryButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: LAYOUT.spacing.sm,
  },
  switchLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    padding: LAYOUT.spacing.lg - 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  footerButton: {
    flex: 1,
  },
  footerButtonContent: {
    height: 48,
  },
});

export default AddBudgetModal;
