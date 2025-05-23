import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface IncomeExpenseBarChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  height?: number;
  width?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data = [],
  height = 220,
  width = screenWidth - 64,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  
  useEffect(() => {
    if (data && data.length > 0) {
      // Transformar dados para o formato esperado pelo BarChart
      const formattedData = {
        labels: data.map(item => item.month),
        datasets: [
          {
            data: data.map(item => item.income),
            color: (opacity = 1) => `rgba(0, 196, 154, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: data.map(item => item.expense),
            color: (opacity = 1) => `rgba(215, 38, 61, ${opacity})`,
            strokeWidth: 2
          }
        ],
        barColors: [COLORS.success, COLORS.danger]
      };
      
      setChartData(formattedData);
    } else {
      // Dados de exemplo quando não há dados reais
      setChartData({
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        datasets: [
          {
            data: [4500, 5200, 4800, 6000, 5500, 7000],
            color: (opacity = 1) => `rgba(0, 196, 154, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: [3000, 3800, 3500, 4200, 3900, 4500],
            color: (opacity = 1) => `rgba(215, 38, 61, ${opacity})`,
            strokeWidth: 2
          }
        ],
        barColors: [COLORS.success, COLORS.danger]
      });
    }
  }, [data]);

  const chartConfig = {
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 82, 204, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 37, 41, ${opacity})`,
    style: {
      borderRadius: 16
    },
    barPercentage: 0.7,
  };

  return (
    <View style={styles.container}>
      {chartData && (
        <BarChart
          data={chartData}
          width={width}
          height={height}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
          withInnerLines={false}
          yAxisLabel="R$"
          yAxisSuffix=""
        />
      )}
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>Receitas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.legendText}>Despesas</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: LAYOUT.radius.medium,
    paddingRight: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: LAYOUT.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: LAYOUT.spacing.md,
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
  }
});

export default IncomeExpenseBarChart;
