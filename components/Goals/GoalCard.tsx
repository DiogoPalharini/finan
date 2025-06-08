import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, ProgressBar, Button, Portal, Modal, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalCardProps {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  onPress?: () => void;
  onAddProgress: (amount: number) => void;
  onDelete: () => void;
  userBalance: number;
}

const { width } = Dimensions.get('window');

const GoalCard: React.FC<GoalCardProps> = ({
  title,
  targetAmount,
  currentAmount,
  deadline,
  category,
  categoryIcon,
  categoryColor,
  onPress,
  onAddProgress,
  onDelete,
  userBalance
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calcular progresso
  const progress = Math.min(currentAmount / targetAmount, 1);
  const progressPercentage = Math.round(progress * 100);
  
  // Verificar status
  const isCompleted = currentAmount >= targetAmount;
  const isOverdue = !isCompleted && deadline && isAfter(new Date(), new Date(deadline));
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  // Formatar valor para input
  const formatValueForInput = (text: string) => {
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

  const handleAddAmount = async () => {
    if (!amount) {
      Alert.alert('Erro', 'Digite um valor para adicionar');
      return;
    }

    const numericAmount = Number(amount.replace(/\./g, '').replace(',', '.'));
    
    if (numericAmount <= 0) {
      Alert.alert('Erro', 'O valor deve ser maior que zero');
      return;
    }

    if (numericAmount > userBalance) {
      Alert.alert('Erro', 'O valor não pode ser maior que seu saldo disponível');
      return;
    }

    if (currentAmount + numericAmount > targetAmount) {
      Alert.alert('Erro', 'O valor não pode exceder o valor alvo da meta');
      return;
    }

    setIsLoading(true);
    try {
      await onAddProgress(numericAmount);
      setAmount('');
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Erro ao adicionar valor:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o valor à meta');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
            <Ionicons name={categoryIcon as any} size={16} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>{category}</Text>
          </View>
          
          <Text style={[
            styles.deadline,
            isOverdue && styles.overdueText
          ]}>
            {isOverdue ? 'Atrasada' : deadline ? `Prazo: ${formatDate(deadline)}` : 'Sem prazo'}
          </Text>
        </View>
        
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        
        <View style={styles.amountsContainer}>
          <Text style={styles.currentAmount}>{formatCurrency(currentAmount)}</Text>
          <Text style={styles.targetAmount}>de {formatCurrency(targetAmount)}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={isOverdue ? COLORS.danger : categoryColor} 
            style={styles.progressBar} 
          />
          <Text style={styles.progressText}>{progressPercentage}%</Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Ionicons 
              name={isCompleted ? "checkmark-circle" : isOverdue ? "alert-circle" : "time-outline"} 
              size={14} 
              color={isCompleted ? COLORS.success : isOverdue ? COLORS.danger : COLORS.textSecondary} 
            />
            <Text style={[
              styles.footerText,
              isCompleted && styles.completedText,
              isOverdue && styles.overdueText
            ]}>
              {isCompleted ? 'Concluído' : isOverdue ? 'Atrasado' : 'Em andamento'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)}
            disabled={isCompleted}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={20} 
              color={isCompleted ? COLORS.textSecondary : COLORS.primary} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Modal para adicionar valor */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Adicionar valor</Text>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Valor disponível: {formatCurrency(userBalance)}</Text>
            <Text style={styles.modalLabel}>Valor restante: {formatCurrency(targetAmount - currentAmount)}</Text>
            
            <TextInput
              style={styles.input}
              label="Valor a adicionar"
              value={amount}
              onChangeText={(text) => setAmount(formatValueForInput(text))}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="cash" />}
            />
          </View>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setIsAddModalVisible(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            
            <Button
              mode="contained"
              onPress={handleAddAmount}
              style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
              loading={isLoading}
              disabled={isLoading}
            >
              Adicionar
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.large,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.md,
    ...LAYOUT.shadow.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: LAYOUT.radius.medium,
  },
  categoryText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    marginLeft: 4,
  },
  deadline: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  overdueText: {
    color: COLORS.danger,
  },
  title: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  amountsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: LAYOUT.spacing.sm,
  },
  currentAmount: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.secondary,
  },
  targetAmount: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.divider,
  },
  progressText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.spacing.sm,
    width: 36,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  completedText: {
    color: COLORS.success,
  },
  addButton: {
    padding: 4,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    margin: 20,
    borderRadius: LAYOUT.radius.large,
    padding: LAYOUT.spacing.lg,
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.lg,
  },
  modalContent: {
    marginBottom: LAYOUT.spacing.lg,
  },
  modalLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginTop: LAYOUT.spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: LAYOUT.spacing.xs,
  },
});

export default GoalCard;
