import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface BudgetCardProps {
  category: string;
  categoryIcon: string;
  categoryColor: string;
  limit: number;
  spent: number;
  remainingDays: number;
  onPress?: () => void;
  onDelete?: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  category,
  categoryIcon,
  categoryColor,
  limit,
  spent,
  remainingDays,
  onPress,
  onDelete
}) => {
  // Calcular progresso
  const progress = Math.min(spent / limit, 1);
  const progressPercentage = Math.round(progress * 100);
  const remaining = limit - spent;
  
  // Determinar status
  const isOverBudget = spent > limit;
  const isNearLimit = progress >= 0.8 && progress < 1;
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Determinar cor do progresso
  const getProgressColor = () => {
    if (isOverBudget) return COLORS.danger;
    if (isNearLimit) return COLORS.warning;
    return categoryColor;
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
            <Ionicons name={categoryIcon as any} size={20} color={categoryColor} />
          </View>
          <Text style={styles.category}>{category}</Text>
        </View>
        
        <View style={styles.headerActions}>
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          )}
          
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: isOverBudget 
                ? `${COLORS.danger}20` 
                : isNearLimit 
                  ? `${COLORS.warning}20` 
                  : `${COLORS.success}20` 
            }
          ]}>
            <Text style={[
              styles.statusText, 
              { 
                color: isOverBudget 
                  ? COLORS.danger 
                  : isNearLimit 
                    ? COLORS.warning 
                    : COLORS.success 
              }
            ]}>
              {isOverBudget 
                ? 'Excedido' 
                : isNearLimit 
                  ? 'Atenção' 
                  : 'Dentro do limite'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.amountsContainer}>
        <Text style={styles.spentAmount}>{formatCurrency(spent)}</Text>
        <Text style={styles.limitAmount}>de {formatCurrency(limit)}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={progress} 
          color={getProgressColor()} 
          style={styles.progressBar} 
        />
        <Text style={styles.progressText}>{progressPercentage}%</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Ionicons 
            name={isOverBudget ? "alert-circle-outline" : "wallet-outline"} 
            size={14} 
            color={isOverBudget ? COLORS.danger : COLORS.textSecondary} 
          />
          <Text style={[
            styles.footerText,
            isOverBudget && { color: COLORS.danger }
          ]}>
            {isOverBudget 
              ? `${formatCurrency(Math.abs(remaining))} acima do limite` 
              : `${formatCurrency(remaining)} disponíveis`}
          </Text>
        </View>
        
        <View style={styles.footerInfo}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>
            {remainingDays} {remainingDays === 1 ? 'dia' : 'dias'} restantes
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: LAYOUT.spacing.xs,
    marginRight: LAYOUT.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.sm,
  },
  category: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  statusBadge: {
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.default,
  },
  statusText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
  },
  amountsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: LAYOUT.spacing.sm,
  },
  spentAmount: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.secondary,
  },
  limitAmount: {
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
    marginLeft: LAYOUT.spacing.xs,
  },
});

export default BudgetCard;
