import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { StackedBarChart } from 'react-native-chart-kit';
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
  
  // Filtrar dados vazios para melhorar a visualização
  const filteredData = data.filter(item => item.income > 0 || item.expense > 0);
  
  // Preparar dados para o gráfico de barras empilhadas
  const chartData = {
    labels: filteredData.map(item => item.month.substring(0, 3)), // Abreviação de 3 letras
    legend: ['Receitas', 'Despesas'],
    data: filteredData.map(item => [item.income, item.expense]),
    barColors: [COLORS.success, COLORS.danger]
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
      rotation: isSmallScreen ? -45 : 0,
      originY: isSmallScreen ? 20 : 0,
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
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContainer}
          >
            <StackedBarChart
              data={chartData}
              width={Math.max(finalWidth, filteredData.length * 60)} // Garantir espaço suficiente para barras
              height={finalHeight}
              chartConfig={chartConfig}
              style={styles.chart}
              withHorizontalLabels
              showValuesOnTopOfBars={false}
              withInnerLines={false}
              segments={5}
              yAxisLabel="R$"
              hideLegend={true}
            />
          </ScrollView>
          
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
  legendContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
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
