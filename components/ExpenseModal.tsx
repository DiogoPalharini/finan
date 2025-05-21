// components/ExpenseModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { COLORS } from '../src/styles/colors';
import { TYPO } from '../src/styles/typography';
import { LAYOUT } from '../src/styles/layout';

interface ExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (amount: number, description: string, category: string, date: Date) => void;
  isLoading: boolean;
  expenseCategories: Array<{ id: string; name: string; icon: string }>;
  formatValueForInput: (text: string) => string;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading,
  expenseCategories,
  formatValueForInput
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    // Validar valor positivo
    const numericAmount = parseFloat(amount.replace('.', '').replace(',', '.'));
    onSave(numericAmount, description, category, date);
    
    // Limpar formulário
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date());
  };

  const handleClose = () => {
    // Limpar formulário e fechar
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Despesa</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Valor */}
              <Text style={styles.inputLabel}>Valor (R$)</Text>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.currencyInput}
                  value={amount}
                  onChangeText={(text) => setAmount(formatValueForInput(text))}
                  placeholder="0,00"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              
              {/* Descrição */}
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Supermercado"
                placeholderTextColor={COLORS.textSecondary}
              />
              
              {/* Data */}
              <Text style={styles.inputLabel}>Data</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.datePickerButtonText}>
                  {format(date, 'dd/MM/yyyy', { locale: ptBR })}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}
              
              {/* Categoria */}
              <Text style={styles.inputLabel}>Categoria</Text>
              <View style={styles.categoryContainer}>
                {expenseCategories.map((expenseCategory) => (
                  <TouchableOpacity
                    key={expenseCategory.id}
                    style={[
                      styles.categoryButton,
                      category === expenseCategory.id && styles.selectedCategoryButton
                    ]}
                    onPress={() => setCategory(expenseCategory.id)}
                  >
                    <Ionicons 
                      name={expenseCategory.icon} 
                      size={24} 
                      color={category === expenseCategory.id ? COLORS.white : COLORS.primary} 
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      category === expenseCategory.id && styles.selectedCategoryButtonText
                    ]}>
                      {expenseCategory.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button 
                mode="outlined" 
                onPress={handleClose}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={styles.saveButton}
                loading={isLoading}
                disabled={isLoading || !amount || !description || !category}
              >
                Salvar
              </Button>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: LAYOUT.radius.large,
    borderTopRightRadius: LAYOUT.radius.large,
    paddingTop: LAYOUT.spacing.md,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  modalContent: {
    padding: LAYOUT.spacing.lg,
  },
  inputLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.sm,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  currencySymbol: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginRight: LAYOUT.spacing.xs,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.sm,
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  datePickerButtonText: {
    marginLeft: LAYOUT.spacing.xs,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: LAYOUT.spacing.md,
  },
  categoryButton: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: LAYOUT.spacing.sm,
    margin: '1.5%',
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginTop: LAYOUT.spacing.xs,
    textAlign: 'center',
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: LAYOUT.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: LAYOUT.spacing.sm,
    borderColor: COLORS.border,
  },
  saveButton: {
    flex: 1,
    marginLeft: LAYOUT.spacing.sm,
    backgroundColor: COLORS.primary,
  },
});

export default ExpenseModal;
