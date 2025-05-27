// Arquivo de estilos e constantes para os gráficos
import { Dimensions, Platform } from 'react-native';
import { COLORS } from '../../src/styles/colors';

// Cores para categorias de despesas - paleta diversificada
export const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': '#FF6B6B',
  'Moradia': '#4ECDC4',
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

// Função para obter cor baseada na categoria
export const getCategoryColor = (category: string, index: number = 0): string => {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  
  // Cores de fallback para categorias não mapeadas
  const fallbackColors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#1A936F', 
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
    pieChartHeight: isSmallScreen ? 180 : 220,
    barChartHeight: isSmallScreen ? 200 : 250,
    lineChartHeight: isSmallScreen ? 200 : 250,
  };
};

// Configurações de gráficos
export const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
  },
  propsForLabels: {
    fontSize: isSmallScreen ? 10 : 12,
  },
  barPercentage: 0.8,
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
