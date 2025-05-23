import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { COLORS } from '../../src/styles/colors';
import { TYPO } from '../../src/styles/typography';
import { LAYOUT } from '../../src/styles/layout';

interface ExpensePieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const { width } = Dimensions.get('window');
const chartWidth = width - 60;

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  
  useEffect(() => {
    if (data && data.length > 0) {
      // Calcular valor total
      const total = data.reduce((sum, item) => sum + item.value, 0);
      setTotalValue(total);
      
      // Preparar dados para o gráfico
      const formattedData = data.map(item => ({
        name: item.name,
        population: item.value, // Alterado de 'value' para 'population' para compatibilidade
        color: item.color,
        legendFontColor: COLORS.text,
        legendFontSize: 12,
      }));
      
      setChartData(formattedData);
    } else {
      // Dados vazios ou nulos
      setChartData([
        {
          name: 'Sem dados',
          population: 1, // Alterado de 'value' para 'population' para compatibilidade
          color: COLORS.divider,
          legendFontColor: COLORS.textSecondary,
          legendFontSize: 12,
        },
      ]);
      setTotalValue(0);
    }
  }, [data]);

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <View style={styles.container}>
      {chartData.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={220}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="population" // Alterado de 'value' para 'population' para compatibilidade
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend={false}
            />
            
            <View style={styles.centerLabel}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
            </View>
          </View>
          
          <View style={styles.legendContainer}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.legendValue}>{formatCurrency(item.value)}</Text>
              </View>
            ))}
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
    paddingVertical: LAYOUT.spacing.md,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  legendContainer: {
    width: '100%',
    marginTop: LAYOUT.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: LAYOUT.spacing.sm,
  },
  legendName: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    flex: 1,
  },
  legendValue: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.spacing.sm,
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

export default ExpensePieChart;
