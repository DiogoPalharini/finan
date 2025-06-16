import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
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
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    
    try {
      const userId = auth.currentUser.uid;
      
      if (selectedPeriod === 'month') {
        // Dados para o mês selecionado
        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
        const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString();
        
        // Buscar todas as transações do mês
        const transactions = await getTransactionsByPeriod(userId, startDate, endDate);
        
        // Separar receitas e despesas
        const expenses = transactions.filter(t => t.type === 'expense');
        const incomes = transactions.filter(t => t.type === 'income');
        
        // Agrupar despesas por categoria
        const expenseByCategory = expenses.reduce((acc, expense) => {
          const category = expense.category || 'Outros';
          acc[category] = (acc[category] || 0) + expense.amount;
          return acc;
        }, {} as Record<string, number>);
        
        // Preparar dados para o gráfico de pizza
        const expenseData = Object.entries(expenseByCategory).map(([category, amount], index) => ({
          name: category,
          value: amount,
          color: getCategoryColor(category, index)
        }));
        
        setExpenseData(expenseData);
        
        // Agrupar por dia
        const dailyData: Record<number, {income: number, expense: number}> = {};
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        
        // Inicializar todos os dias
        for (let day = 1; day <= daysInMonth; day++) {
          dailyData[day] = { income: 0, expense: 0 };
        }
        
        // Somar valores por dia
        transactions.forEach(transaction => {
          const day = new Date(transaction.date).getDate();
          if (transaction.type === 'income') {
            dailyData[day].income += transaction.amount;
          } else {
            dailyData[day].expense += transaction.amount;
          }
        });
        
        // Preparar dados para o gráfico de barras
        const incomeExpenseData = Object.entries(dailyData).map(([day, data]) => ({
          month: `${day}/${selectedMonth + 1}`,
          income: data.income,
          expense: data.expense
        }));
        
        setIncomeExpenseData(incomeExpenseData);
        
        // Calcular totais
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
        
        setTotalIncome(totalIncome);
        setTotalExpense(totalExpense);
        setBalance(totalIncome - totalExpense);
        
      } else {
        // Dados para o ano inteiro
        const monthlyData = [];
        const yearExpenses: Record<string, number> = {};
        
        // Preparar dados mensais
        for (let month = 0; month < 12; month++) {
          const startDate = new Date(selectedYear, month, 1).toISOString();
          const endDate = new Date(selectedYear, month + 1, 0).toISOString();
          
          const monthTransactions = await getTransactionsByPeriod(userId, startDate, endDate);
          
          // Agrupar despesas por categoria para o ano
          monthTransactions
            .filter(t => t.type === 'expense')
            .forEach(expense => {
              const category = expense.category || 'Outros';
              yearExpenses[category] = (yearExpenses[category] || 0) + expense.amount;
            });
          
          const monthIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const monthExpense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          monthlyData.push({
            month: getMonthAbbreviation(month),
            income: monthIncome,
            expense: monthExpense
          });
        }
        
        setIncomeExpenseData(monthlyData);
        
        // Calcular totais do ano
        const yearIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
        const yearExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
        
        setTotalIncome(yearIncome);
        setTotalExpense(yearExpense);
        setBalance(yearIncome - yearExpense);
        
        // Preparar dados do gráfico de pizza para o ano
        const yearExpenseData = Object.entries(yearExpenses)
          .sort((a, b) => b[1] - a[1]) // Ordenar por valor decrescente
          .map(([category, amount], index) => ({
            name: category,
            value: amount,
            color: getCategoryColor(category, index)
          }));
        
        setExpenseData(yearExpenseData);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
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
