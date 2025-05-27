// Arquivo de estilos e constantes para os gráficos
import { Dimensions, Platform } from 'react-native';
import { COLORS } from '../../src/styles/colors';

// Cores para categorias de despesas - paleta diversificada
export const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': '#FF6B6B',
  'Moradia': '#FF9E7A',
  'Transporte': '#FFD166',
  'Lazer': '#6A0572',
  'Saúde': '#1A936F',
  'Educação': '#3D5A80',
  'Vestuário': '#F18F01',
  'Outros': '#8A817C',
  'Serviços': '#5E60CE',
  'Tecnologia': '#48BFE3',
  'Investimentos': '#7209B7',
  'Viagem': '#FB8500'
};

// Cores principais
export const CHART_COLORS = {
  income: '#2ecc71', // Verde para receitas
  expense: '#e74c3c', // Vermelho para despesas
  balance: '#3498db', // Azul para saldo
  balanceNegative: '#e74c3c', // Vermelho para saldo negativo
  background: '#f8f9fa',
  grid: '#e9ecef',
  text: '#343a40',
  textLight: '#6c757d'
};

// Função para obter cor baseada na categoria
export const getCategoryColor = (category: string, index: number = 0): string => {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  
  // Cores de fallback para categorias não mapeadas
  const fallbackColors = [
    '#FF6B6B', '#FF9E7A', '#FFD166', '#6A0572', '#1A936F', 
    '#3D5A80', '#F18F01', '#8A817C', '#5E60CE', '#48BFE3'
  ];
  
  return fallbackColors[index % fallbackColors.length];
};

// Configurações responsivas
const { width, height } = Dimensions.get('window');
export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 768;
export const isLargeScreen = width >= 768;
export const isAndroid = Platform.OS === 'android';

// Dimensões responsivas para gráficos
export const getChartDimensions = () => {
  const padding = isSmallScreen ? 16 : 32;
  const chartWidth = width - (padding * 2);
  
  return {
    chartWidth,
    pieChartHeight: isSmallScreen ? 200 : 240,
    barChartHeight: isSmallScreen ? 220 : 280,
    lineChartHeight: isSmallScreen ? 220 : 280,
  };
};

// Abreviações de meses
export const getMonthAbbreviation = (month: number): string => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return monthNames[month];
};

// Formatação de moeda
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Formatação de dia do mês para exibição em gráficos
export const formatDayLabel = (day: number): string => {
  // Para evitar sobreposição, mostrar apenas alguns dias
  if (day === 1 || day % 5 === 0 || day === 31) {
    return day.toString();
  }
  return '';
};

// Tema para Victory Charts
export const victoryTheme = {
  axis: {
    style: {
      axis: {
        stroke: CHART_COLORS.text,
        strokeWidth: 1
      },
      axisLabel: {
        fontSize: 12,
        padding: 30,
        fill: CHART_COLORS.text
      },
      grid: {
        stroke: CHART_COLORS.grid,
        strokeWidth: 1
      },
      ticks: {
        stroke: CHART_COLORS.text,
        size: 5
      },
      tickLabels: {
        fontSize: isSmallScreen ? 8 : 10,
        padding: 5,
        fill: CHART_COLORS.text
      }
    }
  },
  bar: {
    style: {
      data: {
        fill: CHART_COLORS.income,
        padding: 8,
        strokeWidth: 0
      },
      labels: {
        fontSize: 10,
        fill: CHART_COLORS.text
      }
    }
  },
  line: {
    style: {
      data: {
        stroke: CHART_COLORS.balance,
        strokeWidth: 2
      },
      labels: {
        fontSize: 10,
        fill: CHART_COLORS.text
      }
    }
  },
  scatter: {
    style: {
      data: {
        fill: CHART_COLORS.balance,
        stroke: CHART_COLORS.balance,
        strokeWidth: 2
      },
      labels: {
        fontSize: 10,
        fill: CHART_COLORS.text,
        padding: 5
      }
    }
  },
  pie: {
    colorScale: Object.values(CATEGORY_COLORS),
    style: {
      data: {
        stroke: "white",
        strokeWidth: 1
      },
      labels: {
        fontSize: 10,
        fill: CHART_COLORS.text
      }
    }
  }
};
