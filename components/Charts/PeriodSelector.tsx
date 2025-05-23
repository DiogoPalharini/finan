import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (change: number) => void;
  onYearChange: (change: number) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange
}) => {
  const periods = [
    { id: 'month', label: 'Mês atual' },
    { id: 'year', label: 'Ano inteiro' }
  ];
  
  const getMonthName = (month: number): string => {
    const date = new Date();
    date.setMonth(month);
    return date.toLocaleString('pt-BR', { month: 'long' });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.periodTypeContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.selectedPeriodButton
            ]}
            onPress={() => onPeriodChange(period.id)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.periodText,
                selectedPeriod === period.id && styles.selectedPeriodText
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.dateSelector}>
        {selectedPeriod === 'month' ? (
          <View style={styles.monthYearSelector}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => onMonthChange(-1)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.dateText}>
              {getMonthName(selectedMonth)} de {selectedYear}
            </Text>
            
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => onMonthChange(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.monthYearSelector}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => onYearChange(-1)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.dateText}>
              {selectedYear}
            </Text>
            
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => onYearChange(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  periodTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  periodButton: {
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.medium,
    marginHorizontal: LAYOUT.spacing.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  periodText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  selectedPeriodText: {
    color: COLORS.white,
  },
  dateSelector: {
    alignItems: 'center',
    marginTop: LAYOUT.spacing.xs,
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButton: {
    padding: LAYOUT.spacing.xs,
  },
  dateText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginHorizontal: LAYOUT.spacing.md,
    minWidth: 120,
    textAlign: 'center',
  },
});

export default PeriodSelector;
