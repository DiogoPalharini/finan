import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, ProgressBar, Button, Portal, Modal, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Goal } from '../../services/goalService';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onAddProgress: (amount: number) => void;
  onDelete: () => void;
  userBalance: number;
}

const { width } = Dimensions.get('window');

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  onAddProgress,
  onDelete,
  userBalance
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calcular progresso
  const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);
  const progressPercentage = Math.round(progress * 100);
  
  // Verificar status
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const isOverdue = !isCompleted && goal.deadline && isAfter(new Date(), new Date(goal.deadline));
  
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

    if (goal.currentAmount + numericAmount > goal.targetAmount) {
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

  const handleDelete = () => {
    Alert.alert(
      'Excluir Meta',
      'Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };
  
  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: `${goal.color || COLORS.primary}20` }]}>
            <Ionicons name={goal.icon as any || 'flag-outline'} size={16} color={goal.color || COLORS.primary} />
            <Text style={[styles.categoryText, { color: goal.color || COLORS.primary }]}>{goal.category}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={[
              styles.deadline,
              isOverdue && styles.overdueText
            ]}>
              {isOverdue ? 'Atrasada' : goal.deadline ? `Prazo: ${formatDate(goal.deadline)}` : 'Sem prazo'}
            </Text>
            
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{goal.title}</Text>
        
        <View style={styles.amountsContainer}>
          <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
          <Text style={styles.targetAmount}>de {formatCurrency(goal.targetAmount)}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={isOverdue ? COLORS.danger : goal.color || COLORS.primary} 
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
            <Text style={styles.modalLabel}>Valor restante: {formatCurrency(goal.targetAmount - goal.currentAmount)}</Text>
            
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: LAYOUT.spacing.sm,
  },
  overdueText: {
    color: COLORS.danger,
  },
  deleteButton: {
    padding: 4,
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
