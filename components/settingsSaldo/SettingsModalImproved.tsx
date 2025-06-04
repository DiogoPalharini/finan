import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  Animated,
  PanResponder,
  ScrollView
} from 'react-native';
import { Text, Portal, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import { LinearGradient } from 'expo-linear-gradient';

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
}

const balanceOptions: BalanceOption[] = [
  {
    id: 'mes_atual',
    title: 'Mês Atual',
    description: 'Visualize apenas o saldo do mês corrente',
    icon: 'calendar-outline',
    color: COLORS.primary
  },
  {
    id: 'periodo',
    title: 'Período Personalizado',
    description: 'Defina um intervalo específico de datas',
    icon: 'calendar-number-outline',
    color: COLORS.secondary
  },
  {
    id: 'total',
    title: 'Total Acumulado',
    description: 'Veja todo o histórico financeiro',
    icon: 'trending-up-outline',
    color: COLORS.success
  }
];

const SettingsModalImproved: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  balanceView,
  onChangeBalanceView,
  periodStart,
  periodEnd,
  onChangePeriod
}) => {
  const [slideAnim] = useState(new Animated.Value(height));
  const [backdropOpacity] = useState(new Animated.Value(0));
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<'start' | 'end' | null>(null);

  // Animação de entrada e saída
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  // PanResponder para arrastar para baixo e fechar
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dy > 0 && gestureState.dy > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDate(Platform.OS === 'ios');
    setSelectedDateType(null);
    if (selectedDate) {
      onChangePeriod(selectedDate, periodEnd);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDate(Platform.OS === 'ios');
    setSelectedDateType(null);
    if (selectedDate) {
      onChangePeriod(periodStart, selectedDate);
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

  const handleOptionSelect = (option: BalanceViewType) => {
    onChangeBalanceView(option);
    // Haptic feedback seria ideal aqui
  };

  const handleDateSelection = (type: 'start' | 'end') => {
    setSelectedDateType(type);
    if (type === 'start') {
      setShowStartDate(true);
    } else {
      setShowEndDate(true);
    }
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
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              </View>
            )}
          </View>
        </View>
        {isSelected && (
          <LinearGradient
            colors={[option.color, option.color + 'CC']}
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
            <Text style={styles.title}>Configurações de Saldo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Seção de opções */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Como deseja visualizar o saldo?</Text>
              <View style={styles.optionsContainer}>
                {balanceOptions.map(renderBalanceOption)}
              </View>
            </View>

            {/* Seção de período personalizado */}
            {balanceView === 'periodo' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selecione o período</Text>
                
                <View style={styles.periodContainer}>
                  {/* Data de início */}
                  <TouchableOpacity 
                    style={[
                      styles.dateCard,
                      selectedDateType === 'start' && styles.dateCardActive
                    ]}
                    onPress={() => handleDateSelection('start')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateCardHeader}>
                      <Ionicons 
                        name="play-outline" 
                        size={20} 
                        color={COLORS.success} 
                      />
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
                    style={[
                      styles.dateCard,
                      selectedDateType === 'end' && styles.dateCardActive
                    ]}
                    onPress={() => handleDateSelection('end')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateCardHeader}>
                      <Ionicons 
                        name="stop-outline" 
                        size={20} 
                        color={COLORS.danger} 
                      />
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
                </View>

                {/* Resumo do período */}
                {periodStart && periodEnd && (
                  <View style={styles.periodSummary}>
                    <Ionicons 
                      name="time-outline" 
                      size={16} 
                      color={COLORS.secondary} 
                    />
                    <Text style={styles.periodSummaryText}>
                      Período de {Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))} dias
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Espaço extra para scroll */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Date Pickers */}
          {showStartDate && (
            <DateTimePicker
              value={periodStart || new Date()}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}

          {showEndDate && (
            <DateTimePicker
              value={periodEnd || new Date()}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={periodStart || undefined}
            />
          )}
        </Animated.View>
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
    maxHeight: height * 0.85,
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
  title: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
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
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  dateCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '08',
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateCardLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '10',
    padding: LAYOUT.spacing.sm,
    borderRadius: 12,
    marginTop: LAYOUT.spacing.sm,
  },
  periodSummaryText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.secondary,
    marginLeft: 8,
  },
});

export default SettingsModalImproved;

