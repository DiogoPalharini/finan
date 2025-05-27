import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { COLORS } from '../../src/styles/colors';
import { TYPO } from '../../src/styles/typography';
import { LAYOUT } from '../../src/styles/layout';
import { getCategoryColor, getChartDimensions, formatCurrency, isSmallScreen } from './styles';

interface ExpensePieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const { chartWidth, pieChartHeight } = getChartDimensions();
  
  useEffect(() => {
    if (data && data.length > 0) {
      // Calcular valor total
      const total = data.reduce((sum, item) => sum + item.value, 0);
      setTotalValue(total);
      
      // Preparar dados para o gráfico com cores da nova paleta
      const formattedData = data.map((item, index) => ({
        name: item.name,
        population: item.value,
        color: getCategoryColor(item.name, index),
        legendFontColor: COLORS.text,
        legendFontSize: 12,
      }));
      
      setChartData(formattedData);
    } else {
      // Dados vazios ou nulos
      setChartData([
        {
          name: 'Sem dados',
          population: 1,
          color: COLORS.divider,
          legendFontColor: COLORS.textSecondary,
          legendFontSize: 12,
        },
      ]);
      setTotalValue(0);
    }
  }, [data]);

  return (
    <View style={styles.container}>
      {chartData.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={pieChartHeight}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontSize: isSmallScreen ? 10 : 12,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft={isSmallScreen ? "10" : "15"}
              absolute
              hasLegend={false}
              avoidFalseZero
            />
            
            <View style={styles.centerLabel}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
            </View>
          </View>
          
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.legendScrollContainer}
          >
            <View style={styles.legendContainer}>
              {data.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendColor, 
                      { backgroundColor: getCategoryColor(item.name, index) }
                    ]} 
                  />
                  <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.legendValue}>{formatCurrency(item.value)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma despesa registrada neste período</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    width: '100%',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
  legendScrollContainer: {
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingBottom: LAYOUT.spacing.xs,
  },
  legendContainer: {
    width: '100%',
    marginTop: LAYOUT.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
    marginRight: LAYOUT.spacing.md,
    minWidth: 150,
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
