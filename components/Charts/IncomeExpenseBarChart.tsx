import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface IncomeExpenseBarChartProps {
  data?: {
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }[];
    barColors?: string[];
  };
  height?: number;
  width?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data,
  height = 220,
  width = screenWidth - 64,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  
  useEffect(() => {
    if (data) {
      setChartData(data);
    } else {
      // Dados de exemplo quando não há dados reais
      setChartData({
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        datasets: [
          {
            data: [
              [4500, 3000], // Receitas, Despesas para Jan
              [5200, 3800], // Fev
              [4800, 3500], // Mar
              [6000, 4200], // Abr
              [5500, 3900], // Mai
              [7000, 4500]  // Jun
            ],
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: LAYOUT.radius.md,
    paddingRight: 16,
  }
});

export default IncomeExpenseBarChart;
