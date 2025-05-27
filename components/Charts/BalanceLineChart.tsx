import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { BalanceLineChart } from 'react-native-chart-kit';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import { getChartDimensions, formatCurrency, isSmallScreen } from './styles';

interface BalanceLineChartProps {
  data: Array<{
    month: string;
    balance: number;
  }>;
  height?: number;
  width?: number;
}

const BalanceLineChart: React.FC<BalanceLineChartProps> = ({
  data = [],
  height,
  width,
}) => {
  const { chartWidth, lineChartHeight } = getChartDimensions();
  const finalWidth = width || chartWidth;
  const finalHeight = height || lineChartHeight;
  
  // Filtrar dados vazios para melhorar a visualização
  const filteredData = data.filter(item => item.balance !== undefined);
  
  // Encontrar valores mínimo e máximo
  const balanceValues = filteredData.map(item => item.balance);
  const minBalance = Math.min(...balanceValues);
  const maxBalance = Math.max(...balanceValues);
  
  // Preparar dados para o gráfico de linha
  const chartData = {
    labels: filteredData.map(item => item.month),
    datasets: [
      {
        data: filteredData.map(item => item.balance),
        color: (opacity = 1) => COLORS.primary,
        strokeWidth: 2,
      },
    ],
  };
  
  // Configuração do gráfico
  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 37, 41, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
    propsForLabels: {
      fontSize: isSmallScreen ? 8 : 10,
      fontWeight: '500',
      rotation: isSmallScreen ? -45 : 0,
      originY: isSmallScreen ? 20 : 0,
    },
    formatYLabel: (value: string) => formatCurrency(Number(value)).replace('R$', ''),
  };

  return (
    <View style={styles.container}>
      {filteredData.length > 0 ? (
        <>
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContainer}
          >
            <LineChart
              data={chartData}
              width={Math.max(finalWidth, filteredData.length * 60)} // Garantir espaço suficiente
              height={finalHeight}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
              withInnerLines={false}
              withOuterLines
              withVerticalLines={false}
              withHorizontalLabels
              withVerticalLabels
              withDots
              segments={5}
              yAxisLabel="R$"
            />
          </ScrollView>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mínimo:</Text>
              <Text style={[
                styles.statValue,
                minBalance < 0 && styles.negativeValue
              ]}>
                {formatCurrency(minBalance)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Máximo:</Text>
              <Text style={[
                styles.statValue,
                maxBalance < 0 && styles.negativeValue
              ]}>
                {formatCurrency(maxBalance)}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum dado disponível para este período</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartScrollContainer: {
    paddingBottom: LAYOUT.spacing.sm,
  },
  chart: {
    borderRadius: LAYOUT.radius.medium,
    marginVertical: LAYOUT.spacing.sm,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginRight: LAYOUT.spacing.xs,
  },
  statValue: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  negativeValue: {
    color: COLORS.danger,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
});

export default BalanceLineChart;
