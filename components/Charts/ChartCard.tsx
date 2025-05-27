import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
}) => {
  return (
    <Card
      style={styles.card}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          
          {onPress && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.moreButtonText}>Ver mais</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.chartContainer}>
          {children}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.large,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  content: {
    padding: LAYOUT.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.spacing.md,
  },
  title: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: LAYOUT.radius.small,
    backgroundColor: `${COLORS.primary}10`,
  },
  moreButtonText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.primary,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default ChartCard;
