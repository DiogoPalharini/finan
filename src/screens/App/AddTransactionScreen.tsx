// src/screens/App/AddTransactionScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../../hooks/useTransactions';
import { COLORS } from '../../constants/colors';
import { TYPO } from '../../constants/typography';
import { LAYOUT } from '../../constants/layout';

const categories = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant-outline' },
  { id: 'transporte', name: 'Transporte', icon: 'car-outline' },
  { id: 'moradia', name: 'Moradia', icon: 'home-outline' },
  { id: 'saude', name: 'Saúde', icon: 'medical-outline' },
  { id: 'educacao', name: 'Educação', icon: 'school-outline' },
  { id: 'lazer', name: 'Lazer', icon: 'film-outline' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline' },
  { id: 'salario', name: 'Salário', icon: 'cash-outline' },
  { id: 'investimentos', name: 'Investimentos', icon: 'trending-up-outline' },
  { id: 'presente', name: 'Presente', icon: 'gift-outline' },
];

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const { addTransaction } = useTransactions();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    
    if (!category) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }
    
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount.replace(',', '.')),
        category,
        description,
        date: new Date().toISOString(),
      });
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar transação');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nova Transação</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Tipo de Transação */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonActive,
              { borderTopLeftRadius: LAYOUT.radius.small, borderBottomLeftRadius: LAYOUT.radius.small }
            ]}
            onPress={() => setType('expense')}
          >
            <Ionicons 
              name="arrow-down-outline" 
              size={18} 
              color={type === 'expense' ? COLORS.white : COLORS.text} 
            />
            <Text 
              style={[
                styles.typeButtonText, 
                type === 'expense' && styles.typeButtonTextActive
              ]}
            >
              Despesa
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonActive,
              { borderTopRightRadius: LAYOUT.radius.small, borderBottomRightRadius: LAYOUT.radius.small }
            ]}
            onPress={() => setType('income')}
          >
            <Ionicons 
              name="arrow-up-outline" 
              size={18} 
              color={type === 'income' ? COLORS.white : COLORS.text} 
            />
            <Text 
              style={[
                styles.typeButtonText, 
                type === 'income' && styles.typeButtonTextActive
              ]}
            >
              Receita
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Valor */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Valor</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0,00"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>
        
        {/* Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Categoria</Text>
          <View style={styles.categoriesContainer}>
            {categories
              .filter(cat => type === 'income' ? 
                ['salario', 'investimentos', 'presente', 'outros'].includes(cat.id) : 
                !['salario', 'investimentos', 'presente'].includes(cat.id))
              .map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={24} 
                    color={category === cat.id ? COLORS.primary : COLORS.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.categoryButtonText,
                      category === cat.id && styles.categoryButtonTextActive
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
        
        {/* Descrição */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Descrição (opcional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Ex: Almoço com amigos"
            placeholderTextColor={COLORS.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>
      </ScrollView>
      
      {/* Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: LAYOUT.spacing.xl,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.sm,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: LAYOUT.spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.small,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: type === 'income' ? COLORS.success : COLORS.error,
    borderColor: type === 'income' ? COLORS.success : COLORS.error,
  },
  typeButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginLeft: LAYOUT.spacing.xs,
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  inputContainer: {
    marginBottom: LAYOUT.spacing.md,
  },
  inputLabel: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
  },
  currencySymbol: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginRight: LAYOUT.spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    paddingVertical: LAYOUT.spacing.sm,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -LAYOUT.spacing.xs,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    marginHorizontal: '1.5%',
    marginBottom: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  categoryButtonText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.xs,
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: COLORS.primary,
  },
  descriptionInput: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.sm,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: LAYOUT.spacing.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.radius.small,
    paddingVertical: LAYOUT.spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
  },
});
