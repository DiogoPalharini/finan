import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
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
  
  // Preparar dados para o gráfico com meses abreviados
  const chartData = {
    labels: data.map(item => item.month.substring(0, 3)), // Abreviação de 3 letras
    datasets: [
      {
        data: data.map(item => item.balance),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 3,
      }
    ],
    legend: ['Saldo']
  };
  
  // Configuração do gráfico
  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 37, 41, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
    propsForLabels: {
      fontSize: isSmallScreen ? 8 : 10,
      fontWeight: '500',
      rotation: isSmallScreen ? 45 : 0, // Rotacionar labels em telas pequenas para evitar sobreposição
    },
    formatYLabel: (value: string) => formatCurrency(Number(value)).replace('R$', ''),
  };

  // Encontrar valores mínimo e máximo para legenda
  const balanceValues = data.map(item => item.balance);
  const minBalance = balanceValues.length > 0 ? Math.min(...balanceValues) : 0;
  const maxBalance = balanceValues.length > 0 ? Math.max(...balanceValues) : 0;

  return (
    <View style={styles.container}>
      {data.length > 0 ? (
        <>
          <LineChart
            data={chartData}
            width={finalWidth}
            height={finalHeight}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines
            withVerticalLines={false}
            withHorizontalLines
            yAxisLabel="R$"
            yAxisInterval={1}
            fromZero={minBalance >= 0}
            segments={5}
            horizontalLabelRotation={isSmallScreen ? 45 : 0} // Rotacionar labels em telas pequenas
          />
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Saldo</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                Mín: <Text style={[styles.statsValue, minBalance < 0 && styles.negativeValue]}>
                  {formatCurrency(minBalance)}
                </Text>
              </Text>
              <Text style={styles.statsText}>
                Máx: <Text style={[styles.statsValue, maxBalance < 0 && styles.negativeValue]}>
                  {formatCurrency(maxBalance)}
                </Text>
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Carregando dados...</Text>
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
  chart: {
    borderRadius: LAYOUT.radius.medium,
    marginVertical: LAYOUT.spacing.sm,
  },
  legendContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: LAYOUT.spacing.xs,
  },
  legendText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statsText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.spacing.md,
  },
  statsValue: {
    fontFamily: TYPO.family.medium,
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
