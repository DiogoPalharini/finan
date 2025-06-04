import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  Animated
} from 'react-native';
import { Text, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useBottomModalAnimation } from './useBottomModalAnimation';
import InlineCalendar from './InlineCalendar';
import FeedbackToast from './FeedbackToast';

const { width, height } = Dimensions.get('window');

type BalanceViewType = 'mes_atual' | 'periodo' | 'total';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  balanceView: BalanceViewType;
  onChangeBalanceView: (view: BalanceViewType) => void;
  periodStart: Date | null;
  periodEnd: Date | null;
  onChangePeriod: (start: Date | null, end: Date | null) => void;
}

interface BalanceOption {
  id: BalanceViewType;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
}

const balanceOptions: BalanceOption[] = [
  {
    id: 'mes_atual',
    title: 'Mês Atual',
    description: 'Visualize apenas o saldo do mês corrente',
    icon: 'calendar-outline',
    color: COLORS.primary,
    gradient: [COLORS.primary, COLORS.primary + 'CC']
  },
  {
    id: 'periodo',
    title: 'Período Personalizado',
    description: 'Defina um intervalo específico de datas',
    icon: 'calendar-number-outline',
    color: COLORS.secondary,
    gradient: [COLORS.secondary, COLORS.secondary + 'CC']
  },
  {
    id: 'total',
    title: 'Total Acumulado',
    description: 'Veja todo o histórico financeiro',
    icon: 'trending-up-outline',
    color: COLORS.success,
    gradient: [COLORS.success, COLORS.success + 'CC']
  }
];

const SettingsModalAdvanced: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  balanceView,
  onChangeBalanceView,
  periodStart,
  periodEnd,
  onChangePeriod
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { slideAnim, backdropOpacity, panResponder } = useBottomModalAnimation({
    visible,
    onClose,
    animationDuration: 300,
    closeThreshold: 100
  });

  const showFeedback = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleOptionSelect = (option: BalanceViewType) => {
    onChangeBalanceView(option);
    
    const selectedOption = balanceOptions.find(opt => opt.id === option);
    showFeedback(`${selectedOption?.title} selecionado`);
    
    if (option !== 'periodo') {
      setShowCalendar(false);
    }
  };

  const handleDateSelection = (type: 'start' | 'end') => {
    setCalendarMode(type);
    setShowCalendar(true);
  };

  const handleCalendarDateSelect = (date: Date) => {
    if (calendarMode === 'start') {
      onChangePeriod(date, periodEnd);
      showFeedback(`Data de início: ${date.toLocaleDateString('pt-BR')}`);
    } else {
      onChangePeriod(periodStart, date);
      showFeedback(`Data de fim: ${date.toLocaleDateString('pt-BR')}`);
    }
    setShowCalendar(false);
  };

  const handleRangeSelect = (start: Date, end: Date | null) => {
    onChangePeriod(start, end);
    if (end) {
      showFeedback(`Período selecionado: ${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`);
      setShowCalendar(false);
    }
  };

  const formatarData = (date: Date | null): string => {
    if (!date) return 'Selecionar data';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarDataCompleta = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysDifference = () => {
    if (!periodStart || !periodEnd) return 0;
    return Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  };

  const renderBalanceOption = (option: BalanceOption) => {
    const isSelected = balanceView === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected
        ]}
        onPress={() => handleOptionSelect(option.id)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
            <Ionicons 
              name={option.icon as any} 
              size={24} 
              color={isSelected ? COLORS.white : option.color} 
            />
          </View>
          <View style={styles.optionText}>
            <Text style={[
              styles.optionTitle,
              isSelected && styles.optionTitleSelected
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.optionDescription,
              isSelected && styles.optionDescriptionSelected
            ]}>
              {option.description}
            </Text>
          </View>
          <View style={styles.optionCheck}>
            {isSelected && (
              <Animated.View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              </Animated.View>
            )}
          </View>
        </View>
        {isSelected && (
          <LinearGradient
            colors={option.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.selectedOverlay}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Portal>
      <Modal visible={visible} animationType="none" transparent>
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: backdropOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle para arrastar */}
          <View style={styles.dragHandle} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="settings-outline" size={24} color={COLORS.secondary} />
              </View>
              <View>
                <Text style={styles.title}>Configurações de Saldo</Text>
                <Text style={styles.subtitle}>Personalize como visualizar seus dados</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Seção de opções */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Modo de visualização</Text>
              <View style={styles.optionsContainer}>
                {balanceOptions.map(renderBalanceOption)}
              </View>
            </View>

            {/* Seção de período personalizado */}
            {balanceView === 'periodo' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Período personalizado</Text>
                
                {!showCalendar ? (
                  <View style={styles.periodContainer}>
                    {/* Data de início */}
                    <TouchableOpacity 
                      style={styles.dateCard}
                      onPress={() => handleDateSelection('start')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dateCardHeader}>
                        <View style={[styles.dateCardIcon, { backgroundColor: COLORS.success + '15' }]}>
                          <Ionicons 
                            name="play-outline" 
                            size={16} 
                            color={COLORS.success} 
                          />
                        </View>
                        <Text style={styles.dateCardLabel}>Data de início</Text>
                      </View>
                      <Text style={styles.dateCardValue}>
                        {formatarData(periodStart)}
                      </Text>
                      {periodStart && (
                        <Text style={styles.dateCardSubtext}>
                          {formatarDataCompleta(periodStart)}
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Data de fim */}
                    <TouchableOpacity 
                      style={styles.dateCard}
                      onPress={() => handleDateSelection('end')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dateCardHeader}>
                        <View style={[styles.dateCardIcon, { backgroundColor: COLORS.danger + '15' }]}>
                          <Ionicons 
                            name="stop-outline" 
                            size={16} 
                            color={COLORS.danger} 
                          />
                        </View>
                        <Text style={styles.dateCardLabel}>Data de fim</Text>
                      </View>
                      <Text style={styles.dateCardValue}>
                        {formatarData(periodEnd)}
                      </Text>
                      {periodEnd && (
                        <Text style={styles.dateCardSubtext}>
                          {formatarDataCompleta(periodEnd)}
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Resumo do período */}
                    {periodStart && periodEnd && (
                      <View style={styles.periodSummary}>
                        <LinearGradient
                          colors={[COLORS.secondary + '10', COLORS.secondary + '05']}
                          style={styles.periodSummaryGradient}
                        >
                          <Ionicons 
                            name="time-outline" 
                            size={16} 
                            color={COLORS.secondary} 
                          />
                          <Text style={styles.periodSummaryText}>
                            Período de {getDaysDifference()} dias selecionado
                          </Text>
                        </LinearGradient>
                      </View>
                    )}

                    {/* Botão para abrir calendário */}
                    <TouchableOpacity 
                      style={styles.calendarButton}
                      onPress={() => setShowCalendar(true)}
                    >
                      <Ionicons name="calendar" size={20} color={COLORS.secondary} />
                      <Text style={styles.calendarButtonText}>
                        Usar calendário visual
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => setShowCalendar(false)}
                      >
                        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                      </TouchableOpacity>
                      <Text style={styles.calendarTitle}>
                        Selecionar {calendarMode === 'start' ? 'data de início' : 'data de fim'}
                      </Text>
                    </View>
                    
                    <InlineCalendar
                      selectedDate={calendarMode === 'start' ? periodStart : periodEnd}
                      onDateSelect={handleCalendarDateSelect}
                      mode="range"
                      startDate={periodStart}
                      endDate={periodEnd}
                      onRangeSelect={handleRangeSelect}
                      minimumDate={calendarMode === 'end' ? periodStart || undefined : undefined}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Espaço extra para scroll */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>

        {/* Toast de feedback */}
        <FeedbackToast
          visible={showToast}
          message={toastMessage}
          type="success"
          onHide={() => setShowToast(false)}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: LAYOUT.spacing.sm,
  },
  title: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  section: {
    marginTop: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  optionsContainer: {
    gap: LAYOUT.spacing.sm,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: LAYOUT.spacing.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  optionCardSelected: {
    borderColor: COLORS.secondary,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  optionDescriptionSelected: {
    color: COLORS.textSecondary,
  },
  optionCheck: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodContainer: {
    gap: LAYOUT.spacing.md,
  },
  dateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateCardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateCardLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  dateCardValue: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  dateCardSubtext: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  periodSummary: {
    marginTop: LAYOUT.spacing.sm,
  },
  periodSummaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.sm,
    borderRadius: 12,
  },
  periodSummaryText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary + '10',
    padding: LAYOUT.spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  calendarButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  calendarContainer: {
    gap: LAYOUT.spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    marginRight: LAYOUT.spacing.sm,
  },
  calendarTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
});

export default SettingsModalAdvanced;

