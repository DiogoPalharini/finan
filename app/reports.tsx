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
import MonthlyReportModal from '../components/Reports/MonthlyReportModal';

// Serviços
import { generateMonthlyReport } from '../services/dbService';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  
  // Carregar dados
  useEffect(() => {
    loadReports();
  }, []);
  
  const loadReports = async () => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Gerar lista de meses para relatórios (últimos 12 meses)
      const today = new Date();
      const reportMonths = [];
      
      for (let i = 0; i < 12; i++) {
        const reportDate = new Date(today);
        reportDate.setMonth(today.getMonth() - i);
        
        reportMonths.push({
          year: reportDate.getFullYear(),
          month: reportDate.getMonth(),
          label: `${reportDate.toLocaleString('pt-BR', { month: 'long' })} de ${reportDate.getFullYear()}`,
          date: reportDate.toISOString()
        });
      }
      
      setReports(reportMonths);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewReport = async (year: number, month: number) => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Gerar relatório
      const userId = auth.currentUser.uid;
      const report = await generateMonthlyReport(userId, year, month);
      
      setSelectedReport({
        month: new Date(year, month).toLocaleString('pt-BR', { month: 'long' }),
        year: year.toString(),
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
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportReport = async (year: number, month: number, format: 'pdf' | 'xlsx' | 'csv') => {
    if (!auth.currentUser) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Gerar relatório
      const userId = auth.currentUser.uid;
      const report = await generateMonthlyReport(userId, year, month);
      
      // Aqui você implementaria a lógica real de exportação
      console.log(`Exportando relatório de ${month}/${year} em formato ${format}`);
      
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Feedback de sucesso
      alert(`Relatório exportado com sucesso em formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
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
          <Text style={styles.headerTitle}>Relatórios</Text>
          <Text style={styles.headerSubtitle}>
            Visualize e exporte seus relatórios mensais
          </Text>
        </View>
      </LinearGradient>
      
      {/* Conteúdo principal */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Carregando relatórios...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Relatórios Mensais</Text>
          
          {reports.map((report, index) => (
            <View key={report.date} style={styles.reportCard}>
              <View style={styles.reportInfo}>
                <View style={[styles.reportIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
                </View>
                
                <View style={styles.reportDetails}>
                  <Text style={styles.reportTitle}>{report.label}</Text>
                  <Text style={styles.reportSubtitle}>
                    {index === 0 ? 'Mês atual' : index === 1 ? 'Mês anterior' : `${index} meses atrás`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.reportActions}>
                <TouchableOpacity
                  style={styles.reportActionButton}
                  onPress={() => handleViewReport(report.year, report.month)}
                >
                  <Ionicons name="eye-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                
                <View style={styles.actionDivider} />
                
                <TouchableOpacity
                  style={styles.reportActionButton}
                  onPress={() => handleExportReport(report.year, report.month, 'pdf')}
                >
                  <Ionicons name="download-outline" size={22} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <View style={styles.exportInfoContainer}>
            <View style={styles.exportInfoHeader}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
              <Text style={styles.exportInfoTitle}>Formatos de Exportação</Text>
            </View>
            
            <View style={styles.exportFormatContainer}>
              <View style={styles.exportFormat}>
                <View style={[styles.formatIconContainer, { backgroundColor: `${COLORS.danger}15` }]}>
                  <Ionicons name="document-outline" size={20} color={COLORS.danger} />
                </View>
                <Text style={styles.formatName}>PDF</Text>
                <Text style={styles.formatDescription}>Relatório completo com gráficos e tabelas</Text>
              </View>
              
              <View style={styles.exportFormat}>
                <View style={[styles.formatIconContainer, { backgroundColor: `${COLORS.success}15` }]}>
                  <Ionicons name="grid-outline" size={20} color={COLORS.success} />
                </View>
                <Text style={styles.formatName}>Excel</Text>
                <Text style={styles.formatDescription}>Planilha detalhada para análises personalizadas</Text>
              </View>
              
              <View style={styles.exportFormat}>
                <View style={[styles.formatIconContainer, { backgroundColor: `${COLORS.warning}15` }]}>
                  <Ionicons name="code-outline" size={20} color={COLORS.warning} />
                </View>
                <Text style={styles.formatName}>CSV</Text>
                <Text style={styles.formatDescription}>Dados brutos para importação em outros sistemas</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      
      {/* Modal de relatório mensal */}
      <MonthlyReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        data={selectedReport}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  reportDetails: {
    flex: 1,
  },
  reportTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  reportSubtitle: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.divider,
    marginHorizontal: LAYOUT.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: LAYOUT.spacing.xl,
  },
  loadingText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.sm,
  },
  exportInfoContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.md,
    marginTop: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.xl,
  },
  exportInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  exportInfoTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginLeft: LAYOUT.spacing.sm,
  },
  exportFormatContainer: {
    marginTop: LAYOUT.spacing.xs,
  },
  exportFormat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  formatIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  formatName: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    width: 50,
  },
  formatDescription: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
});

export default ReportsScreen;
