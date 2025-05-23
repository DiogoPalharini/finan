import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface GoalCardProps {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  onPress?: () => void;
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
  onPress
}) => {
  // Calcular progresso
  const progress = Math.min(currentAmount / targetAmount, 1);
  const progressPercentage = Math.round(progress * 100);
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  return (
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
        
        <Text style={styles.deadline}>Prazo: {deadline}</Text>
      </View>
      
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      
      <View style={styles.amountsContainer}>
        <Text style={styles.currentAmount}>{formatCurrency(currentAmount)}</Text>
        <Text style={styles.targetAmount}>de {formatCurrency(targetAmount)}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={progress} 
          color={categoryColor} 
          style={styles.progressBar} 
        />
        <Text style={styles.progressText}>{progressPercentage}%</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>
            {progressPercentage < 100 ? 'Em andamento' : 'Concluído'}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
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
    borderRadius: LAYOUT.radius.full,
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
});

export default GoalCard;
