import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';

interface InlineCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'single' | 'range';
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeSelect?: (start: Date, end: Date | null) => void;
}

const InlineCalendar: React.FC<InlineCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minimumDate,
  maximumDate,
  mode = 'single',
  startDate,
  endDate,
  onRangeSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(startDate || null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(endDate || null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isInRange: false,
        isRangeStart: false,
        isRangeEnd: false,
        isDisabled: true
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
      const isDisabled = (minimumDate && date < minimumDate) || (maximumDate && date > maximumDate);
      
      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;

      if (mode === 'range' && rangeStart) {
        isRangeStart = isSameDay(date, rangeStart);
        if (rangeEnd) {
          isRangeEnd = isSameDay(date, rangeEnd);
          isInRange = date >= rangeStart && date <= rangeEnd;
        }
      }

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
        isDisabled
      });
    }

    // Completar com dias do próximo mês se necessário
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isInRange: false,
        isRangeStart: false,
        isRangeEnd: false,
        isDisabled: true
      });
    }

    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const handleDatePress = (date: Date, isDisabled: boolean) => {
    if (isDisabled) return;

    if (mode === 'single') {
      onDateSelect(date);
    } else if (mode === 'range') {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Iniciar nova seleção
        setRangeStart(date);
        setRangeEnd(null);
        onRangeSelect?.(date, null);
      } else if (rangeStart && !rangeEnd) {
        // Completar a seleção
        if (date >= rangeStart) {
          setRangeEnd(date);
          onRangeSelect?.(rangeStart, date);
        } else {
          setRangeStart(date);
          setRangeEnd(rangeStart);
          onRangeSelect?.(date, rangeStart);
        }
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      {/* Header do calendário */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Dias da semana */}
      <View style={styles.weekDays}>
        {dayNames.map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grade de dias */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          const dayStyle = [
            styles.dayButton,
            day.isToday && styles.todayButton,
            day.isSelected && styles.selectedButton,
            day.isRangeStart && styles.rangeStartButton,
            day.isRangeEnd && styles.rangeEndButton,
            day.isInRange && !day.isRangeStart && !day.isRangeEnd && styles.inRangeButton,
            day.isDisabled && styles.disabledButton,
            !day.isCurrentMonth && styles.otherMonthButton
          ];

          const textStyle = [
            styles.dayText,
            day.isToday && styles.todayText,
            day.isSelected && styles.selectedText,
            (day.isRangeStart || day.isRangeEnd) && styles.rangeText,
            day.isDisabled && styles.disabledText,
            !day.isCurrentMonth && styles.otherMonthText
          ];

          return (
            <TouchableOpacity
              key={index}
              style={dayStyle}
              onPress={() => handleDatePress(day.date, day.isDisabled)}
              disabled={day.isDisabled}
              activeOpacity={0.7}
            >
              <Text style={textStyle}>
                {day.date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.md,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  monthYear: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: LAYOUT.spacing.sm,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%', // 100% / 7 dias
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  todayButton: {
    backgroundColor: COLORS.primary + '20',
  },
  todayText: {
    color: COLORS.primary,
    fontFamily: TYPO.family.semibold,
  },
  selectedButton: {
    backgroundColor: COLORS.secondary,
  },
  selectedText: {
    color: COLORS.white,
    fontFamily: TYPO.family.semibold,
  },
  rangeStartButton: {
    backgroundColor: COLORS.secondary,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rangeEndButton: {
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rangeText: {
    color: COLORS.white,
    fontFamily: TYPO.family.semibold,
  },
  inRangeButton: {
    backgroundColor: COLORS.secondary + '30',
    borderRadius: 0,
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  otherMonthButton: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: COLORS.textSecondary,
  },
});

export default InlineCalendar;

