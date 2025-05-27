import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import { getChartDimensions, formatCurrency, isSmallScreen } from './styles';

interface IncomeExpenseBarChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  height?: number;
  width?: number;
}

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data = [],
  height,
  width,
}) => {
  const { chartWidth, barChartHeight } = getChartDimensions();
  const finalWidth = width || chartWidth;
  const finalHeight = height || barChartHeight;
  
  // Preparar dados para o gráfico com meses abreviados
  const chartData = {
    labels: data.map(item => item.month.substring(0, 3)), // Abreviação de 3 letras
    datasets: [
      {
        data: data.map(item => item.income),
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`, // Verde para receitas
        strokeWidth: 2,
      },
      {
        data: data.map(item => item.expense),
        color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`, // Vermelho para despesas
        strokeWidth: 2,
      }
    ],
    legend: ['Receitas', 'Despesas']
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
    barPercentage: 0.7,
    propsForLabels: {
      fontSize: isSmallScreen ? 8 : 10,
      fontWeight: '500',
      rotation: isSmallScreen ? 45 : 0, // Rotacionar labels em telas pequenas para evitar sobreposição
    },
    formatYLabel: (value: string) => formatCurrency(Number(value)).replace('R$', ''),
  };

  // Calcular totais para legenda
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);

  return (
    <View style={styles.container}>
      {data.length > 0 ? (
        <>
          <BarChart
            data={chartData}
            width={finalWidth}
            height={finalHeight}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={false}
            showBarTops={false}
            fromZero
            segments={5}
            yAxisLabel="R$"
            yAxisInterval={1}
            horizontalLabelRotation={isSmallScreen ? 45 : 0} // Rotacionar labels em telas pequenas
            verticalLabelRotation={0}
            withHorizontalLabels
            showValuesOnTopOfBars={false}
            withCustomBarColorFromData={false}
            flatColor={true}
            // Configuração para barras empilhadas
            withHorizontalLines
            stacked
          />
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Receitas</Text>
              <Text style={styles.legendValue}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.legendText}>Despesas</Text>
              <Text style={styles.legendValue}>{formatCurrency(totalExpense)}</Text>
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
    justifyContent: 'space-around',
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
    marginRight: LAYOUT.spacing.xs,
  },
  legendValue: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
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

export default IncomeExpenseBarChart;
