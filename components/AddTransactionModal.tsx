import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../src/styles/colors';
import { useAuth } from '../hooks/useAuth';
import { saveExpense, saveIncome } from '../services/transactionService';
import ImagePickerComponent from './ImagePicker';

// Categorias de despesas
const expenseCategories = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant-outline' },
  { id: 'transporte', name: 'Transporte', icon: 'car-outline' },
  { id: 'moradia', name: 'Moradia', icon: 'home-outline' },
  { id: 'saude', name: 'Saúde', icon: 'medical-outline' },
  { id: 'educacao', name: 'Educação', icon: 'school-outline' },
  { id: 'lazer', name: 'Lazer', icon: 'film-outline' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

// Fontes de receita
const incomeSources = [
  { id: 'salario', name: 'Salário', icon: 'cash-outline' },
  { id: 'investimentos', name: 'Investimentos', icon: 'trending-up-outline' },
  { id: 'freelance', name: 'Freelance', icon: 'briefcase-outline' },
  { id: 'presente', name: 'Presente', icon: 'gift-outline' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormErrors {
  valor?: string;
  descricao?: string;
  categoria?: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState(new Date());
  const [receiptImageUri, setReceiptImageUri] = useState<string | undefined>();
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'valor':
        if (!value || parseFloat(value.replace(/\./g, '').replace(',', '.')) <= 0) {
          newErrors.valor = 'Valor deve ser maior que zero';
        } else {
          delete newErrors.valor;
        }
        break;
      case 'descricao':
        if (!value || value.trim().length < 3) {
          newErrors.descricao = 'Descrição deve ter pelo menos 3 caracteres';
        } else {
          delete newErrors.descricao;
        }
        break;
      case 'categoria':
        if (!value) {
          newErrors.categoria = 'Selecione uma categoria';
        } else {
          delete newErrors.categoria;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setData(selectedDate);
    }
  };

  const formatarValor = (text: string) => {
    const numeros = text.replace(/[^0-9]/g, '');
    if (numeros.length === 0) return '';
    
    const valor = parseInt(numeros) / 100;
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleValorChange = (text: string) => {
    const valorFormatado = formatarValor(text);
    setValor(valorFormatado);
    validateField('valor', valorFormatado);
  };

  const handleDescricaoChange = (text: string) => {
    setDescricao(text);
    validateField('descricao', text);
  };

  const handleCategoriaChange = (cat: string) => {
    setCategoria(cat);
    validateField('categoria', cat);
  };

  const handleImageSelected = (imageUri: string) => {
    console.log('AddTransactionModal - handleImageSelected chamado com:', imageUri);
    setReceiptImageUri(imageUri);
  };

  const handleImageRemoved = () => {
    console.log('AddTransactionModal - handleImageRemoved chamado');
    setReceiptImageUri(undefined);
  };

  const handleSubmit = async () => {
    if (!user) return;

    validateField('valor', valor);
    validateField('descricao', descricao);
    validateField('categoria', categoria);

    if (Object.keys(errors).length > 0) {
      Alert.alert('Erro', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      setLoading(true);

      // Formata o valor corretamente
      const valorLimpo = valor.replace(/[^\d,]/g, '').replace(',', '.');
      const valorNumerico = parseFloat(valorLimpo);
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error('Valor inválido');
      }

      const transactionData: any = {
        amount: valorNumerico,
        description: descricao.trim(),
        date: data.toISOString(),
      };

      // Só incluir receiptImageUri se não for undefined
      if (receiptImageUri) {
        transactionData.receiptImageUri = receiptImageUri;
      }

      if (tipo === 'despesa') {
        await saveExpense(user.uid, {
          ...transactionData,
          category: categoria,
        });
      } else {
        await saveIncome(user.uid, {
          ...transactionData,
          source: categoria,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a transação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Nova Transação</Text>
              <Text style={styles.headerSubtitle}>
                Adicione uma nova transação ao seu controle financeiro
              </Text>
            </View>
          </LinearGradient>

          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Tipo Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Tipo</Text>
                <View style={styles.tipoContainer}>
                  <TouchableOpacity
                    style={[styles.tipoButton, tipo === 'despesa' && styles.tipoButtonActive]}
                    onPress={() => setTipo('despesa')}
                  >
                    <Ionicons 
                      name="arrow-down-circle" 
                      size={24} 
                      color={tipo === 'despesa' ? COLORS.white : COLORS.textSecondary} 
                    />
                    <Text style={[styles.tipoButtonText, tipo === 'despesa' && styles.tipoButtonTextActive]}>
                      Despesa
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tipoButton, tipo === 'receita' && styles.tipoButtonActive]}
                    onPress={() => setTipo('receita')}
                  >
                    <Ionicons 
                      name="arrow-up-circle" 
                      size={24} 
                      color={tipo === 'receita' ? COLORS.white : COLORS.textSecondary} 
                    />
                    <Text style={[styles.tipoButtonText, tipo === 'receita' && styles.tipoButtonTextActive]}>
                      Receita
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Valor Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Valor</Text>
                <TextInput
                  style={[styles.input, errors.valor && styles.inputError]}
                  value={valor}
                  onChangeText={handleValorChange}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textSecondary}
                />
                {errors.valor && <Text style={styles.errorText}>{errors.valor}</Text>}
              </View>

              {/* Descrição Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Descrição</Text>
                <TextInput
                  style={[styles.input, errors.descricao && styles.inputError]}
                  value={descricao}
                  onChangeText={handleDescricaoChange}
                  placeholder="Digite a descrição"
                  placeholderTextColor={COLORS.textSecondary}
                />
                {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
              </View>

              {/* Categoria Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Categoria</Text>
                <View style={styles.categoriesContainer}>
                  {(tipo === 'despesa' ? expenseCategories : incomeSources).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        categoria === cat.id && styles.selectedCategoryButton
                      ]}
                      onPress={() => handleCategoriaChange(cat.id)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={categoria === cat.id ? COLORS.white : COLORS.text}
                      />
                      <Text style={[
                        styles.categoryButtonText,
                        categoria === cat.id && styles.selectedCategoryButtonText
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
              </View>

              {/* Data Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Data</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputText}>
                    {data.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Foto do Recibo Card */}
              <View style={styles.card}>
                <ImagePickerComponent
                  onImageSelected={handleImageSelected}
                  onImageRemoved={handleImageRemoved}
                  currentImage={receiptImageUri}
                  disabled={loading}
                  label="Foto do recibo (opcional)"
                />
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={data}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* Botões de ação */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={loading ? [COLORS.textSecondary, COLORS.textSecondary] : [COLORS.primary, COLORS.secondary]}
                    style={styles.saveButtonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={styles.saveButtonText}>
                      Adicionar Transação
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={{ height: 50 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    minHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    fontWeight: '400',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginRight: 8,
  },
  tipoButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  tipoButtonTextActive: {
    color: COLORS.white,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
  },
  inputText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default AddTransactionModal; 