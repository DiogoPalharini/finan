import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
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
import MonthlyReportModal from '../components/Reports/MonthlyReportModal';
import StickySummaryHeader from '../components/Charts/StickySummaryHeader';

// Importar os componentes de gráficos corrigidos
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import IncomeExpenseBarChart from '../components/Charts/IncomeExpenseBarChart';

// Serviços
import { 
  getTransactionsByPeriod,
  getTransactionsByCategory,
  getTotalExpensesByMonth,
  getTotalIncomesByMonth,
  getBalanceByMonth
} from '../services/transactionService';

// Estilos e utilitários
const { width } = Dimensions.get('window');

const ChartsScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
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
        const expenseCategoriesData = await getTransactionsByCategory(userId, selectedYear, selectedMonth);
        setExpenseData(expenseCategoriesData.map((item, index) => ({
          name: item.category,
          value: item.amount,
          color: getCategoryColor(item.category, index)
        })));
        
        // Buscar todas as despesas e receitas do mês
        const allExpenses = await getTransactionsByPeriod(userId, selectedYear, selectedMonth);
        const allIncomes = await getTransactionsByPeriod(userId, selectedYear, selectedMonth, 'income');
        
        // Filtrar apenas para o mês selecionado
        const monthExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === selectedYear && 
                 expenseDate.getMonth() === selectedMonth;
        });
        
        const monthIncomes = allIncomes.filter(income => {
          const incomeDate = new Date(income.date);
          return incomeDate.getFullYear() === selectedYear && 
                 incomeDate.getMonth() === selectedMonth;
        });
        
        // Agrupar por dia do mês
        const dailyData: Record<number, {income: number, expense: number}> = {};
        
        // Inicializar todos os dias do mês
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          dailyData[day] = { income: 0, expense: 0 };
        }
        
        // Somar despesas por dia
        monthExpenses.forEach(expense => {
          const day = new Date(expense.date).getDate();
          if (dailyData[day]) {
            dailyData[day].expense += expense.amount;
          }
        });
        
        // Somar receitas por dia
        monthIncomes.forEach(income => {
          const day = new Date(income.date).getDate();
          if (dailyData[day]) {
            dailyData[day].income += income.amount;
          }
        });
        
        // Dados para o gráfico de barras de receitas e despesas (apenas para o mês selecionado)
        const dailyIncomeExpenseData = Object.entries(dailyData).map(([day, data]) => ({
          month: `${day}/${selectedMonth + 1}`,
          income: data.income,
          expense: data.expense
        }));
        
        // Ordenar por dia
        dailyIncomeExpenseData.sort((a, b) => {
          const dayA = parseInt(a.month.split('/')[0]);
          const dayB = parseInt(b.month.split('/')[0]);
          return dayA - dayB;
        });
        
        setIncomeExpenseData(dailyIncomeExpenseData);
        
        // Totais para o mês selecionado
        const income = await getTotalIncomesByMonth(userId, selectedYear, selectedMonth);
        const expense = await getTotalExpensesByMonth(userId, selectedYear, selectedMonth);
        const monthBalance = await getBalanceByMonth(userId, selectedYear, selectedMonth);
        
        setTotalIncome(income);
        setTotalExpense(expense);
        setBalance(monthBalance);
        
      } else if (selectedPeriod === 'year') {
        // Dados para o ano inteiro
        const monthlyData = [];
        
        // Preparar dados mensais para o ano
        for (let month = 0; month < 12; month++) {
          const income = await getTotalIncomesByMonth(userId, selectedYear, month);
          const expense = await getTotalExpensesByMonth(userId, selectedYear, month);
          
          monthlyData.push({
            month: getMonthAbbreviation(month),
            income,
            expense
          });
        }
        
        setIncomeExpenseData(monthlyData);
        
        // Calcular totais para o ano
        const yearIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
        const yearExpense = monthlyData.reduce((sum, item) => sum + item.expense, 0);
        const yearBalance = yearIncome - yearExpense;
        
        setTotalIncome(yearIncome);
        setTotalExpense(yearExpense);
        setBalance(yearBalance);
        
        // Dados para o gráfico de pizza de despesas (categorias do ano)
        let yearExpenses: {category: string, amount: number}[] = [];
        
        for (let month = 0; month < 12; month++) {
          const monthExpenses = await getTransactionsByCategory(userId, selectedYear, month);
          
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
  
  const getMonthAbbreviation = (month: number): string => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return monthNames[month];
  };
  
  const getCategoryColor = (category: string, index: number = 0): string => {
    // Paleta de cores para categorias
    const categoryColors: Record<string, string> = {
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
    
    if (categoryColors[category]) {
      return categoryColors[category];
    }
    
    // Cores de fallback para categorias não mapeadas
    const fallbackColors = [
      '#FF6B6B', '#FF9E7A', '#FFD166', '#6A0572', '#1A936F', 
      '#3D5A80', '#F18F01', '#8A817C', '#5E60CE', '#48BFE3'
    ];
    
    return fallbackColors[index % fallbackColors.length];
  };

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
          {/* ScrollView com conteúdo principal */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Blocos de resumo */}
            <StickySummaryHeader
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
            />
            
            {/* Gráfico de barras de receitas e despesas */}
            <ChartCard
              title="Receitas vs Despesas"
              subtitle={selectedPeriod === 'month' 
                ? `${getMonthName(selectedMonth)} de ${selectedYear}` 
                : `Ano de ${selectedYear}`}
            >
              <IncomeExpenseBarChart 
                data={incomeExpenseData}
                showMonthlyData={selectedPeriod === 'month'}
              />
            </ChartCard>
            
            {/* Gráfico de pizza de despesas por categoria */}
            <ChartCard
              title="Despesas por Categoria"
              subtitle={selectedPeriod === 'month' 
                ? `${getMonthName(selectedMonth)} de ${selectedYear}` 
                : `Ano de ${selectedYear}`}
            >
              <ExpensePieChart data={expenseData} />
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
          </ScrollView>
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
