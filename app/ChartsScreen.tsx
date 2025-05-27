import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { auth } from '../config/firebaseConfig';

// Componentes
import ChartCard from '../components/Charts/ChartCard';
import PeriodSelector from '../components/Charts/PeriodSelector';
import ExportModal from '../components/Charts/ExportModal';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import BalanceLineChart from '../components/Charts/BalanceLineChart';
import IncomeExpenseBarChart from '../components/Charts/IncomeExpenseBarChart';
import MonthlyReportModal from '../components/Reports/MonthlyReportModal';
import StickySummaryHeader from '../components/Charts/StickySummaryHeader';

// Serviços
import { 
  getExpensesByCategoryAnalysis, 
  getMonthlyBalances, 
  getExpenseTrend,
  getTotalExpensesByMonth,
  getTotalIncomesByMonth,
  getBalanceByMonth,
  generateMonthlyReport
} from '../services/dbService';

// Estilos e utilitários
import { 
  formatCurrency, 
  getMonthAbbreviation 
} from '../components/Charts/styles';

const { width } = Dimensions.get('window');

const ChartsScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Referência para o ScrollView e valor de scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Carregar dados
  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedMonth, selectedYear]);
  
  const loadData = async () => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userId = auth.currentUser.uid;
      
      // Carregar dados de acordo com o período selecionado
      if (selectedPeriod === 'month') {
        // Dados para o gráfico de pizza de despesas
        const expenseCategoriesData = await getExpensesByCategoryAnalysis(userId, selectedYear, selectedMonth);
        setExpenseData(expenseCategoriesData.map((item, index) => ({
          name: item.category,
          value: item.amount,
          color: getCategoryColor(item.category, index)
        })));
        
        // Dados para o gráfico de linha de saldo (últimos 6 meses)
        const today = new Date(selectedYear, selectedMonth);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        
        const startYear = sixMonthsAgo.getFullYear();
        const startMonth = sixMonthsAgo.getMonth();
        
        const monthlyBalances = await getMonthlyBalances(userId, startYear);
        
        // Filtrar apenas os últimos 6 meses
        const filteredBalances = monthlyBalances.filter(item => {
          const itemDate = new Date(startYear, item.month);
          return itemDate >= sixMonthsAgo && itemDate <= today;
        });
        
        setBalanceData(filteredBalances.map(item => ({
          month: getMonthAbbreviation(item.month),
          balance: item.balance
        })));
        
        // Dados para o gráfico de barras de receitas e despesas
        setIncomeExpenseData(filteredBalances.map(item => ({
          month: getMonthAbbreviation(item.month),
          income: item.income,
          expense: item.expense
        })));
        
        // Totais para o mês selecionado
        const income = await getTotalIncomesByMonth(userId, selectedYear, selectedMonth);
        const expense = await getTotalExpensesByMonth(userId, selectedYear, selectedMonth);
        const monthBalance = await getBalanceByMonth(userId, selectedYear, selectedMonth);
        
        setTotalIncome(income);
        setTotalExpense(expense);
        setBalance(monthBalance);
        
      } else if (selectedPeriod === 'year') {
        // Dados para o ano inteiro
        const yearlyBalances = await getMonthlyBalances(userId, selectedYear);
        
        // Dados para o gráfico de linha de saldo (ano inteiro)
        setBalanceData(yearlyBalances.map(item => ({
          month: getMonthAbbreviation(item.month),
          balance: item.balance
        })));
        
        // Dados para o gráfico de barras de receitas e despesas
        setIncomeExpenseData(yearlyBalances.map(item => ({
          month: getMonthAbbreviation(item.month),
          income: item.income,
          expense: item.expense
        })));
        
        // Calcular totais para o ano
        const yearIncome = yearlyBalances.reduce((sum, item) => sum + item.income, 0);
        const yearExpense = yearlyBalances.reduce((sum, item) => sum + item.expense, 0);
        const yearBalance = yearIncome - yearExpense;
        
        setTotalIncome(yearIncome);
        setTotalExpense(yearExpense);
        setBalance(yearBalance);
        
        // Dados para o gráfico de pizza de despesas (categorias do ano)
        let yearExpenses: {category: string, amount: number}[] = [];
        
        for (let month = 0; month < 12; month++) {
          const monthExpenses = await getExpensesByCategoryAnalysis(userId, selectedYear, month);
          
          // Agrupar por categoria
          monthExpenses.forEach(item => {
            const existingCategory = yearExpenses.find(exp => exp.category === item.category);
            if (existingCategory) {
              existingCategory.amount += item.amount;
            } else {
              yearExpenses.push({
                category: item.category,
                amount: item.amount
              });
            }
          });
        }
        
        // Ordenar por valor
        yearExpenses = yearExpenses.sort((a, b) => b.amount - a.amount);
        
        setExpenseData(yearExpenses.map((item, index) => ({
          name: item.category,
          value: item.amount,
          color: getCategoryColor(item.category, index)
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };
  
  const handleMonthChange = (change: number) => {
    let newMonth = selectedMonth + change;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };
  
  const handleYearChange = (change: number) => {
    setSelectedYear(selectedYear + change);
  };
  
  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    setExportLoading(true);
    
    try {
      // Gerar relatório
      const userId = auth.currentUser.uid;
      const report = await generateMonthlyReport(userId, selectedYear, selectedMonth);
      
      // Aqui você implementaria a lógica real de exportação
      console.log(`Exportando relatório em formato ${format}`);
      
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fechar modal após exportação
      setIsExportModalVisible(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleViewReport = async () => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      // Gerar relatório
      const userId = auth.currentUser.uid;
      const report = await generateMonthlyReport(userId, selectedYear, selectedMonth);
      
      setReportData({
        month: getMonthName(selectedMonth),
        year: selectedYear.toString(),
        income: report.income,
        expenses: report.expenses,
        balance: report.balance,
        topExpenseCategories: report.topExpenseCategories,
        goals: report.goals,
        budgets: report.budgets
      });
      
      setIsReportModalVisible(true);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };
  
  // Funções auxiliares
  const getMonthName = (month: number): string => {
    const date = new Date();
    date.setMonth(month);
    return date.toLocaleString('pt-BR', { month: 'long' });
  };
  
  const getCategoryColor = (category: string, index: number = 0): string => {
    const colors: Record<string, string> = {
      'Alimentação': '#FF6B6B',
      'Moradia': '#4ECDC4',
      'Transporte': '#FFD166',
      'Lazer': '#6A0572',
      'Saúde': '#1A936F',
      'Educação': '#3D5A80',
      'Vestuário': '#F18F01',
      'Outros': '#8A817C'
    };
    
    if (colors[category]) {
      return colors[category];
    }
    
    // Cores de fallback para categorias não mapeadas
    const fallbackColors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#1A936F', 
      '#3D5A80', '#F18F01', '#8A817C', '#5E60CE', '#48BFE3'
    ];
    
    return fallbackColors[index % fallbackColors.length];
  };

  // Função para lidar com o evento de scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com gradiente */}
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Análise Financeira</Text>
          <Text style={styles.headerSubtitle}>
            Visualize e exporte seus dados financeiros
          </Text>
        </View>
      </LinearGradient>
      
      {/* Seletor de período */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />
      
      {/* Conteúdo principal */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : (
        <>
          {/* ScrollView com evento de scroll para o sticky header */}
          <Animated.ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Blocos de resumo (inicialmente visíveis, depois ficam sticky) */}
            <StickySummaryHeader
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
            />
            
            {/* Gráfico de pizza de despesas por categoria */}
            <ChartCard
              title="Despesas por Categoria"
              subtitle={selectedPeriod === 'month' 
                ? `${getMonthName(selectedMonth)} de ${selectedYear}` 
                : `Ano de ${selectedYear}`}
            >
              <ExpensePieChart data={expenseData} />
            </ChartCard>
            
            {/* Gráfico de linha de saldo */}
            <ChartCard
              title="Evolução do Saldo"
              subtitle={selectedPeriod === 'month' 
                ? 'Últimos 6 meses' 
                : `Ano de ${selectedYear}`}
            >
              <BalanceLineChart data={balanceData} />
            </ChartCard>
            
            {/* Gráfico de barras de receitas e despesas */}
            <ChartCard
              title="Receitas vs Despesas"
              subtitle={selectedPeriod === 'month' 
                ? 'Últimos 6 meses' 
                : `Ano de ${selectedYear}`}
            >
              <IncomeExpenseBarChart data={incomeExpenseData} />
            </ChartCard>
            
            {/* Botões de ação */}
            <View style={styles.actionsContainer}>
              <Button
                mode="outlined"
                onPress={() => setIsExportModalVisible(true)}
                style={styles.actionButton}
                labelStyle={styles.actionButtonLabel}
                icon="download"
              >
                Exportar Dados
              </Button>
              
              <Button
                mode="contained"
                onPress={handleViewReport}
                style={styles.actionButton}
                labelStyle={styles.actionButtonLabel}
                icon="file-document"
              >
                Ver Relatório
              </Button>
            </View>
            
            {/* Espaço extra no final para garantir que o último item seja visível */}
            <View style={styles.bottomPadding} />
          </Animated.ScrollView>
        </>
      )}
      
      {/* Modal de exportação */}
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        onExport={handleExport}
        isLoading={exportLoading}
      />
      
      {/* Modal de relatório mensal */}
      <MonthlyReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        data={reportData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.xs,
  },
  headerSubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: LAYOUT.spacing.md,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.xl,
    marginTop: LAYOUT.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: LAYOUT.spacing.xs,
  },
  actionButtonLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
  },
  bottomPadding: {
    height: 40, // Espaço extra no final do ScrollView
  },
});

export default ChartsScreen;
