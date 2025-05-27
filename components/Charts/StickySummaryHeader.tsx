import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import { formatCurrency } from './styles';

interface SummaryBlockProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const SummaryBlock: React.FC<SummaryBlockProps> = ({
  totalIncome,
  totalExpense,
  balance
}) => {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  
  return (
    <View style={[styles.summaryContainer, isSmallScreen && styles.summaryContainerSmall]}>
      <View style={styles.summaryCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${COLORS.success}20` }]}>
          <Ionicons name="arrow-up" size={20} color={COLORS.success} />
        </View>
        <Text style={styles.summaryLabel}>Receitas</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalIncome)}</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${COLORS.danger}20` }]}>
          <Ionicons name="arrow-down" size={20} color={COLORS.danger} />
        </View>
        <Text style={styles.summaryLabel}>Despesas</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalExpense)}</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}20` }]}>
          <Ionicons name="wallet" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.summaryLabel}>Saldo</Text>
        <Text style={[
          styles.summaryValue,
          balance < 0 && styles.negativeValue
        ]}>
          {formatCurrency(balance)}
        </Text>
      </View>
    </View>
  );
};

// Componente de cabeçalho sticky
const StickySummaryHeader: React.FC<SummaryBlockProps> = (props) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  
  // Threshold para quando o cabeçalho deve ficar sticky
  const stickyThreshold = 150; // Ajuste conforme necessário
  
  // Animação para opacidade do cabeçalho sticky
  const headerOpacity = scrollY.interpolate({
    inputRange: [stickyThreshold - 50, stickyThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // Animação para transformação do cabeçalho sticky
  const headerTranslate = scrollY.interpolate({
    inputRange: [stickyThreshold - 50, stickyThreshold],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });
  
  // Função para lidar com o evento de scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
  
  // Efeito para atualizar o estado de sticky
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      setIsSticky(value >= stickyThreshold);
    });
    
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, []);
  
  return (
    <View style={styles.container} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
      {/* Cabeçalho normal (visível inicialmente) */}
      <SummaryBlock {...props} />
      
      {/* Cabeçalho sticky (aparece ao rolar) */}
      <Animated.View 
        style={[
          styles.stickyHeader,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            display: isSticky ? 'flex' : 'none',
          }
        ]}
      >
        <SummaryBlock {...props} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: LAYOUT.spacing.md,
    marginVertical: LAYOUT.spacing.md,
    flexWrap: 'nowrap',
  },
  summaryContainerSmall: {
    flexDirection: 'column',
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 8,
    marginRight: 8,
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  summaryLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  negativeValue: {
    color: COLORS.danger,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.divider}50`,
  },
});

export default StickySummaryHeader;
