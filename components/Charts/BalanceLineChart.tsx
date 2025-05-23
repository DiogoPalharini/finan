import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface BalanceLineChartProps {
  data?: {
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }[];
  };
  height?: number;
  width?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const BalanceLineChart: React.FC<BalanceLineChartProps> = ({
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
            data: [2500, 3200, 2800, 5000, 4200, 6000],
            color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
            strokeWidth: 2
          }
        ]
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
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: COLORS.secondary
    }
  };

  return (
    <View style={styles.container}>
      {chartData && (
        <LineChart
          data={chartData}
          width={width}
          height={height}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          fromZero
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

export default BalanceLineChart;
