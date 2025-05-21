// components/BalanceCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { TYPO } from '../src/styles/typography';
import { LAYOUT } from '../src/styles/layout';

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  formatCurrency: (value: number) => string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  totalIncome, 
  totalExpense, 
  formatCurrency 
}) => {
  return (
    <Card style={styles.balanceCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.balanceCardGradient}
      >
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetailItem}>
            <Ionicons name="arrow-up-outline" size={16} color={COLORS.white} />
            <Text style={styles.balanceDetailLabel}>Receitas</Text>
            <Text style={styles.balanceDetailValue}>{formatCurrency(totalIncome)}</Text>
          </View>
          
          <View style={styles.balanceDetailDivider} />
          
          <View style={styles.balanceDetailItem}>
            <Ionicons name="arrow-down-outline" size={16} color={COLORS.white} />
            <Text style={styles.balanceDetailLabel}>Despesas</Text>
            <Text style={styles.balanceDetailValue}>{formatCurrency(totalExpense)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: LAYOUT.radius.large,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: LAYOUT.spacing.lg,
  },
  balanceCardGradient: {
    padding: LAYOUT.spacing.lg,
  },
  balanceLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.white,
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: TYPO.size.xxl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginVertical: LAYOUT.spacing.sm,
  },
  balanceDetails: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: LAYOUT.radius.small,
    padding: LAYOUT.spacing.sm,
  },
  balanceDetailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  balanceDetailDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: LAYOUT.spacing.sm,
  },
  balanceDetailLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 2,
  },
  balanceDetailValue: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.white,
    marginTop: 2,
  },
});

export default BalanceCard;
