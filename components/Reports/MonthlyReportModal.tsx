import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, AccessibilityInfo } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

// Importar o ExportModal de forma centralizada
import ExportModal from '../Charts/ExportModal';

// Definir tipos explícitos para dados do relatório
type ExpenseCategory = {
  category: string;
  amount: number;
  percentage: number;
};

type Goal = {
  title: string;
  progress: number;
  currentAmount: number;
  targetAmount: number;
};

type Budget = {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
};

type ReportData = {
  month: string;
  year: string;
  income: number;
  expenses: number;
  balance: number;
  topExpenseCategories: ExpenseCategory[];
  goals: Goal[];
  budgets: Budget[];
};

interface MonthlyReportModalProps {
  visible: boolean;
  onClose: () => void;
  isLoading?: boolean;
  data?: ReportData;
}

const { width } = Dimensions.get('window');

// Dados de exemplo para fallback
const DEFAULT_REPORT_DATA: ReportData = {
  month: 'Maio',
  year: '2025',
  income: 6500,
  expenses: 4200,
  balance: 2300,
  topExpenseCategories: [
    { category: 'Alimentação', amount: 1200, percentage: 28.57 },
    { category: 'Moradia', amount: 1500, percentage: 35.71 },
    { category: 'Transporte', amount: 800, percentage: 19.05 },
    { category: 'Lazer', amount: 500, percentage: 11.90 },
    { category: 'Outros', amount: 200, percentage: 4.77 },
  ],
  goals: [
    { title: 'Comprar um carro', progress: 0.7, currentAmount: 35000, targetAmount: 50000 },
    { title: 'Viagem para Europa', progress: 0.4, currentAmount: 8000, targetAmount: 20000 },
  ],
  budgets: [
    { category: 'Alimentação', limit: 1200, spent: 850, percentage: 70.83 },
    { category: 'Moradia', limit: 2000, spent: 2000, percentage: 100 },
    { category: 'Transporte', limit: 600, spent: 720, percentage: 120 },
  ],
};

const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  visible,
  onClose,
  isLoading = false,
  data
}) => {
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Usar dados fornecidos ou fallback para dados padrão
  const reportData: ReportData = data || DEFAULT_REPORT_DATA;
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    setExportLoading(true);
    
    try {
      // Simulação de exportação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui você implementaria a lógica real de exportação
      console.log(`Exportando relatório mensal em formato ${format}`);
      
      // Fechar modal após exportação
      setIsExportModalVisible(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Anunciar para leitores de tela quando o modal abrir
  React.useEffect(() => {
    if (visible) {
      AccessibilityInfo.announceForAccessibility('Relatório mensal aberto');
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Relatório Mensal</Text>
            <Text style={styles.modalSubtitle}>
              {reportData.month} de {reportData.year}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isLoading}
              accessibilityLabel="Fechar relatório mensal"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.loadingText}>Gerando relatório...</Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <ScrollView 
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Resumo financeiro */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                      <View style={[styles.iconContainer, { backgroundColor: `${COLORS.success}20` }]}>
                        <Ionicons name="arrow-up-outline" size={20} color={COLORS.success} />
                      </View>
                      <Text style={styles.summaryLabel}>Receitas</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(reportData.income)}</Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <View style={[styles.iconContainer, { backgroundColor: `${COLORS.danger}20` }]}>
                        <Ionicons name="arrow-down-outline" size={20} color={COLORS.danger} />
                      </View>
                      <Text style={styles.summaryLabel}>Despesas</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(reportData.expenses)}</Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}20` }]}>
                        <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
                      </View>
                      <Text style={styles.summaryLabel}>Saldo</Text>
                      <Text style={[
                        styles.summaryValue,
                        reportData.balance < 0 && styles.negativeValue
                      ]}>
                        {formatCurrency(reportData.balance)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Principais categorias de despesas */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Principais Despesas</Text>
                  <View style={styles.categoriesContainer}>
                    {reportData.topExpenseCategories.map((category, index) => (
                      <View 
                        key={index} 
                        style={styles.categoryItem}
                        accessibilityLabel={`${category.category}: ${formatCurrency(category.amount)}, ${category.percentage.toFixed(1)}% das despesas`}
                      >
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>{category.category}</Text>
                          <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                        </View>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View 
                              style={[
                                styles.progressFill, 
                                { width: `${category.percentage}%` }
                              ]} 
                            />
                          </View>
                          <Text style={styles.progressText}>{category.percentage.toFixed(1)}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Progresso das metas */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Progresso das Metas</Text>
                  {reportData.goals.length > 0 ? (
                    <View style={styles.goalsContainer}>
                      {reportData.goals.map((goal, index) => (
                        <View 
                          key={index} 
                          style={styles.goalItem}
                          accessibilityLabel={`Meta: ${goal.title}, progresso: ${Math.round(goal.progress * 100)}%, ${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}`}
                        >
                          <View style={styles.goalHeader}>
                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text style={styles.goalProgress}>{Math.round(goal.progress * 100)}%</Text>
                          </View>
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { 
                                    width: `${goal.progress * 100}%`,
                                    backgroundColor: COLORS.secondary
                                  }
                                ]} 
                              />
                            </View>
                          </View>
                          <View style={styles.goalAmounts}>
                            <Text style={styles.goalCurrentAmount}>
                              {formatCurrency(goal.currentAmount)}
                            </Text>
                            <Text style={styles.goalTargetAmount}>
                              de {formatCurrency(goal.targetAmount)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>Nenhuma meta cadastrada</Text>
                  )}
                </View>
                
                {/* Status dos orçamentos */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Status dos Orçamentos</Text>
                  {reportData.budgets.length > 0 ? (
                    <View style={styles.budgetsContainer}>
                      {reportData.budgets.map((budget, index) => (
                        <View 
                          key={index} 
                          style={styles.budgetItem}
                          accessibilityLabel={`Orçamento de ${budget.category}: ${formatCurrency(budget.spent)} de ${formatCurrency(budget.limit)}, ${budget.percentage.toFixed(1)}% utilizado`}
                        >
                          <View style={styles.budgetHeader}>
                            <Text style={styles.budgetCategory}>{budget.category}</Text>
                            <Text style={[
                              styles.budgetStatus,
                              budget.percentage > 100 
                                ? styles.budgetExceeded 
                                : budget.percentage >= 80 
                                  ? styles.budgetWarning 
                                  : styles.budgetGood
                            ]}>
                              {budget.percentage > 100 
                                ? 'Excedido' 
                                : budget.percentage >= 80 
                                  ? 'Atenção' 
                                  : 'Dentro do limite'}
                            </Text>
                          </View>
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { 
                                    width: `${Math.min(budget.percentage, 100)}%`,
                                    backgroundColor: budget.percentage > 100 
                                      ? COLORS.danger 
                                      : budget.percentage >= 80 
                                        ? COLORS.warning 
                                        : COLORS.success
                                  }
                                ]} 
                              />
                            </View>
                            <Text style={styles.progressText}>{budget.percentage.toFixed(1)}%</Text>
                          </View>
                          <View style={styles.budgetAmounts}>
                            <Text style={styles.budgetSpent}>
                              {formatCurrency(budget.spent)}
                            </Text>
                            <Text style={styles.budgetLimit}>
                              de {formatCurrency(budget.limit)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>Nenhum orçamento cadastrado</Text>
                  )}
                </View>
                
                {/* Observações */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Observações</Text>
                  <View style={styles.notesContainer}>
                    <Text style={styles.noteText}>
                      {reportData.balance >= 0 
                        ? 'Parabéns! Você manteve suas finanças positivas neste mês.' 
                        : 'Atenção! Suas despesas superaram suas receitas neste mês.'}
                    </Text>
                    
                    {reportData.budgets.some(budget => budget.percentage > 100) && (
                      <Text style={styles.noteText}>
                        Você excedeu o orçamento em algumas categorias. Considere revisar seus gastos.
                      </Text>
                    )}
                    
                    {reportData.goals.some(goal => goal.progress < 0.1) && (
                      <Text style={styles.noteText}>
                        Algumas metas tiveram pouco progresso. Considere revisar suas prioridades.
                      </Text>
                    )}
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <Button
                  mode="outlined"
                  onPress={onClose}
                  style={styles.cancelButton}
                  labelStyle={styles.cancelButtonLabel}
                  disabled={isLoading || exportLoading}
                  accessibilityLabel="Fechar relatório"
                  accessibilityRole="button"
                >
                  Fechar
                </Button>
                
                <Button
                  mode="contained"
                  onPress={() => setIsExportModalVisible(true)}
                  style={styles.exportButton}
                  labelStyle={styles.exportButtonLabel}
                  icon="download-outline"
                  disabled={isLoading || exportLoading}
                  accessibilityLabel="Exportar relatório"
                  accessibilityRole="button"
                >
                  Exportar
                </Button>
              </View>
            </View>
          )}
        </View>
      </View>
      
      {/* Modal de exportação */}
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        onExport={handleExport}
        isLoading={exportLoading}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.radius.large,
    overflow: 'hidden',
    ...LAYOUT.shadow.large,
  },
  modalHeader: {
    padding: LAYOUT.spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.white,
  },
  modalSubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    position: 'absolute',
    top: LAYOUT.spacing.md,
    right: LAYOUT.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: LAYOUT.spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.md,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.spacing.md,
  },
  section: {
    marginBottom: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.sm,
    marginHorizontal: LAYOUT.spacing.xs,
    alignItems: 'center',
    ...LAYOUT.shadow.small,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  summaryLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  negativeValue: {
    color: COLORS.danger,
  },
  categoriesContainer: {
    marginTop: LAYOUT.spacing.xs,
  },
  categoryItem: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
    ...LAYOUT.shadow.small,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  categoryName: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  categoryAmount: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: LAYOUT.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  progressText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    width: 45,
    textAlign: 'right',
  },
  goalsContainer: {
    marginTop: LAYOUT.spacing.xs,
  },
  goalItem: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
    ...LAYOUT.shadow.small,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  goalTitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  goalProgress: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    color: COLORS.secondary,
  },
  goalAmounts: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.xs,
  },
  goalCurrentAmount: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  goalTargetAmount: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  budgetsContainer: {
    marginTop: LAYOUT.spacing.xs,
  },
  budgetItem: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.sm,
    ...LAYOUT.shadow.small,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  budgetCategory: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  budgetStatus: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.small,
  },
  budgetGood: {
    backgroundColor: `${COLORS.success}20`,
    color: COLORS.success,
  },
  budgetWarning: {
    backgroundColor: `${COLORS.warning}20`,
    color: COLORS.warning,
  },
  budgetExceeded: {
    backgroundColor: `${COLORS.danger}20`,
    color: COLORS.danger,
  },
  budgetAmounts: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.xs,
  },
  budgetSpent: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  budgetLimit: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.md,
    ...LAYOUT.shadow.small,
  },
  noteText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  emptyText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: LAYOUT.spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: LAYOUT.spacing.sm,
    borderColor: COLORS.border,
  },
  cancelButtonLabel: {
    color: COLORS.textSecondary,
    fontFamily: TYPO.family.medium,
  },
  exportButton: {
    flex: 1,
    marginLeft: LAYOUT.spacing.sm,
    backgroundColor: COLORS.secondary,
  },
  exportButtonLabel: {
    color: COLORS.white,
    fontFamily: TYPO.family.medium,
  },
});

export default MonthlyReportModal;
