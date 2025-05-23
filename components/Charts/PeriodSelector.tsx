import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface PeriodSelectorProps {
  onPeriodChange: (period: string) => void;
  initialPeriod?: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  onPeriodChange,
  initialPeriod = 'month'
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  
  const periods = [
    { id: 'month', label: 'Mês atual', icon: 'calendar-outline' },
    { id: 'quarter', label: '3 meses', icon: 'calendar-outline' },
    { id: 'halfyear', label: '6 meses', icon: 'calendar-outline' },
    { id: 'year', label: '12 meses', icon: 'calendar-outline' },
    { id: 'custom', label: 'Personalizado', icon: 'options-outline' },
  ];
  
  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange(period);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Período:</Text>
      <View style={styles.periodContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.selectedPeriodButton
            ]}
            onPress={() => handlePeriodSelect(period.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={period.icon as any} 
              size={16} 
              color={selectedPeriod === period.id ? COLORS.white : COLORS.textSecondary} 
              style={styles.periodIcon}
            />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: LAYOUT.spacing.md,
  },
  label: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  periodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    marginRight: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  periodIcon: {
    marginRight: 4,
  },
  periodText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  selectedPeriodText: {
    color: COLORS.white,
    fontFamily: TYPO.family.medium,
  },
});

export default PeriodSelector;
