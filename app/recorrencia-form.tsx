import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Alert } from 'react-native';
import { Text, Button, RadioButton, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { COLORS } from '../src/styles';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { useAuth } from '../hooks/useAuth';
import { saveRecorrencia, getRecorrencia, updateRecorrencia, Recorrencia } from '../services/recurringService';

// Categorias fixas
const CATEGORIAS = {
  despesas: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Outros'
  ],
  receitas: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Outros'
  ]
};

const RecurringFormScreen = () => {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [diaRecorrencia, setDiaRecorrencia] = useState<number>(1);
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'inicio' | 'fim'>('inicio');
  const [temDataFim, setTemDataFim] = useState(false);

  useEffect(() => {
    if (id) {
      loadRecorrencia();
    }
  }, [id]);

  const loadRecorrencia = async () => {
    try {
      setLoading(true);
      const recorrencia = await getRecorrencia(id);
      if (recorrencia) {
        setTipo(recorrencia.tipo);
        setValor(recorrencia.valor.toString());
        setDescricao(recorrencia.descricao);
        setCategoria(recorrencia.categoria || '');
        setDiaRecorrencia(recorrencia.diaRecorrencia);
        setDataInicio(new Date(recorrencia.dataInicio));
        setDataFim(recorrencia.dataFim ? new Date(recorrencia.dataFim) : null);
        setTemDataFim(!!recorrencia.dataFim);
      }
    } catch (error) {
      console.error('Erro ao carregar recorrência:', error);
      Alert.alert('Erro', 'Não foi possível carregar a recorrência');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerMode === 'inicio') {
        setDataInicio(selectedDate);
      } else {
        setDataFim(selectedDate);
      }
    }
  };

  const formatarData = (date: Date | null): string => {
    if (!date) return 'Sem data final';
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!valor || !descricao || !categoria) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const valorNumerico = parseFloat(valor.replace(',', '.'));
      if (isNaN(valorNumerico)) {
        throw new Error('Valor inválido');
      }

      const recorrenciaData = {
        tipo,
        valor: valorNumerico,
        descricao,
        categoria,
        diaRecorrencia,
        dataInicio: dataInicio.toISOString(),
        dataFim: temDataFim ? dataFim?.toISOString() : null
      };

      if (id) {
        await updateRecorrencia(user.uid, id, recorrenciaData);
      } else {
        await saveRecorrencia(user.uid, recorrenciaData);
      }

      router.back();
    } catch (error) {
      console.error('Erro ao salvar recorrência:', error);
      Alert.alert('Erro', 'Não foi possível salvar a recorrência. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: id ? 'Editar Recorrência' : 'Nova Recorrência',
        headerShown: false
      }} />
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {id ? 'Editar Recorrência' : 'Nova Recorrência'}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo</Text>
          <RadioButton.Group onValueChange={value => setTipo(value as 'despesa' | 'receita')} value={tipo}>
            <View style={styles.radioGroup}>
              <RadioButton.Item 
                label="Despesa" 
                value="despesa" 
                color={COLORS.danger}
                labelStyle={styles.radioLabel}
              />
              <RadioButton.Item 
                label="Receita" 
                value="receita" 
                color={COLORS.success}
                labelStyle={styles.radioLabel}
              />
            </View>
          </RadioButton.Group>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição da recorrência"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pickerContainer}>
            {CATEGORIAS[tipo === 'despesa' ? 'despesas' : 'receitas'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.pickerItem,
                  categoria === cat && styles.pickerItemSelected
                ]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={[
                  styles.pickerItemText,
                  categoria === cat && styles.pickerItemTextSelected
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dia da Recorrência</Text>
          <View style={styles.diaPickerContainer}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
              <TouchableOpacity
                key={dia}
                style={[
                  styles.diaPickerItem,
                  diaRecorrencia === dia && styles.diaPickerItemSelected
                ]}
                onPress={() => setDiaRecorrencia(dia)}
              >
                <Text style={[
                  styles.diaPickerItemText,
                  diaRecorrencia === dia && styles.diaPickerItemTextSelected
                ]}>{dia}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de Início</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDatePickerMode('inicio');
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>
              {format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.dataFimHeader}>
            <Text style={styles.label}>Data Final (opcional)</Text>
            <Chip
              selected={temDataFim}
              onPress={() => setTemDataFim(!temDataFim)}
              style={styles.toggleChip}
              textStyle={styles.toggleChipText}
            >
              {temDataFim ? 'Definida' : 'Indefinida'}
            </Chip>
          </View>
          
          {temDataFim && (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setDatePickerMode('fim');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateButtonText}>
                {formatarData(dataFim)}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={datePickerMode === 'inicio' ? dataInicio : (dataFim || new Date())}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={datePickerMode === 'fim' ? dataInicio : undefined}
          />
        )}

        <View style={styles.formActions}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.formButton}
            textColor={COLORS.text}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.formButton}
            loading={loading}
            buttonColor={COLORS.primary}
          >
            {id ? 'Salvar' : 'Adicionar'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: LAYOUT.spacing.xl,
    paddingBottom: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: LAYOUT.spacing.lg,
  },
  formGroup: {
    marginBottom: LAYOUT.spacing.lg,
  },
  label: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: LAYOUT.spacing.xs,
  },
  radioLabel: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.xs,
  },
  pickerItem: {
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerItemText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  pickerItemTextSelected: {
    color: COLORS.white,
  },
  diaPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.xs,
  },
  diaPickerItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  diaPickerItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  diaPickerItemText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  diaPickerItemTextSelected: {
    color: COLORS.white,
  },
  dateButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  dataFimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  toggleChip: {
    backgroundColor: COLORS.surface,
  },
  toggleChipText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.xl,
  },
  formButton: {
    flex: 1,
    marginHorizontal: LAYOUT.spacing.xs,
  },
});

export default RecurringFormScreen; 