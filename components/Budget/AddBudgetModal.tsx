import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, Platform } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budgetData: {
    category: string;
    limit: number;
    period: string;
    startDate: string;
  }) => void;
  isLoading?: boolean;
}

const { width } = Dimensions.get('window');

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado para o DatePicker
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
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
  
  const periods = [
    { id: 'monthly', label: 'Mensal' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'yearly', label: 'Anual' },
  ];
  
  const resetForm = () => {
    setSelectedCategory('');
    setLimit('');
    setSelectedPeriod('monthly');
    setStartDate('');
    setDate(new Date());
    setErrors({});
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
    
    if (!selectedPeriod) {
      newErrors.period = 'Selecione um período';
    }
    
    if (!startDate) {
      newErrors.startDate = 'A data de início é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (!validateForm()) return;
    
    const formattedLimit = Number(limit.replace(/\./g, '').replace(',', '.'));
    
    onSave({
      category: selectedCategory,
      limit: formattedLimit,
      period: selectedPeriod,
      startDate
    });
  };
  
  // Formatar valor monetário
  const formatCurrency = (text: string) => {
    // Remover tudo que não é número
    const numericValue = text.replace(/\D/g, '');
    
    if (numericValue === '') {
      return '';
    }
    
    // Converter para número e formatar
    const value = Number(numericValue) / 100;
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Manipulador para o DatePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    // Formatar a data como DD/MM/AAAA
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    setStartDate(`${day}/${month}/${year}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Novo Orçamento</Text>
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
              <Text style={styles.inputLabel}>Período</Text>
              <View style={styles.periodsContainer}>
                {periods.map((period) => (
                  <TouchableOpacity
                    key={period.id}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period.id && styles.selectedPeriodButton
                    ]}
                    onPress={() => setSelectedPeriod(period.id)}
                    disabled={isLoading}
                  >
                    <Text 
                      style={[
                        styles.periodButtonText,
                        selectedPeriod === period.id && styles.selectedPeriodButtonText
                      ]}
                    >
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.period && <Text style={styles.errorText}>{errors.period}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Data de início</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isLoading}
              >
                <View style={styles.datePickerContent}>
                  <Ionicons name="calendar-outline" size={22} color={COLORS.textSecondary} />
                  <Text style={[
                    styles.datePickerText,
                    !startDate && styles.datePickerPlaceholder
                  ]}>
                    {startDate || 'Selecione uma data'}
                  </Text>
                </View>
                <Ionicons name="chevron-down-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>
                O orçamento será renovado automaticamente a cada {selectedPeriod === 'monthly' ? 'mês' : selectedPeriod === 'weekly' ? 'semana' : 'ano'} a partir da data de início.
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={handleClose}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              labelStyle={styles.saveButtonLabel}
              loading={isLoading}
              disabled={isLoading}
            >
              Salvar
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    padding: LAYOUT.spacing.md,
    alignItems: 'center',
    position: 'relative',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.white,
  },
  closeButton: {
    position: 'absolute',
    top: LAYOUT.spacing.md,
    right: LAYOUT.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: LAYOUT.spacing.md,
    maxHeight: '60%',
  },
  scrollContent: {
    paddingBottom: LAYOUT.spacing.md,
  },
  inputContainer: {
    marginBottom: LAYOUT.spacing.lg,
  },
  inputLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    fontSize: TYPO.size.md,
    height: 56,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginLeft: LAYOUT.spacing.sm,
  },
  datePickerPlaceholder: {
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: LAYOUT.spacing.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    marginRight: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCategoryButton: {
    borderColor: 'transparent',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginLeft: LAYOUT.spacing.xs,
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
    fontFamily: TYPO.family.medium,
  },
  periodsContainer: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.xs,
  },
  periodButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    marginRight: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  periodButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  selectedPeriodButtonText: {
    color: COLORS.white,
    fontFamily: TYPO.family.medium,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 16,
    padding: LAYOUT.spacing.md,
    marginTop: LAYOUT.spacing.sm,
  },
  infoText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginLeft: LAYOUT.spacing.sm,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: LAYOUT.spacing.sm,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cancelButtonLabel: {
    color: COLORS.textSecondary,
    fontFamily: TYPO.family.medium,
  },
  saveButton: {
    flex: 1,
    marginLeft: LAYOUT.spacing.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonLabel: {
    color: COLORS.white,
    fontFamily: TYPO.family.medium,
  },
});

export default AddBudgetModal;
