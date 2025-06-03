import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { COLORS } from '../src/styles';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { useAuth } from '../hooks/useAuth';
import { saveRecorrencia } from '../services/recurringService';

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

// Fontes fixas
const FONTES = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'PIX',
  'Transferência',
  'Outros'
];

interface RecurringEntryFormProps {
  onClose: () => void;
}

const RecurringEntryForm: React.FC<RecurringEntryFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fonte, setFonte] = useState('');
  const [diaRecorrencia, setDiaRecorrencia] = useState<number>(1);
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'inicio' | 'fim'>('inicio');

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

    try {
      setLoading(true);

      const valorNumerico = parseFloat(valor.replace(',', '.'));
      if (isNaN(valorNumerico)) {
        throw new Error('Valor inválido');
      }

      const recorrenciaData = {
        userId: user.uid,
        tipo,
        valor: valorNumerico,
        descricao,
        categoria,
        fonte,
        diaRecorrencia,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim?.toISOString() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveRecorrencia(recorrenciaData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar recorrência:', error);
      alert('Erro ao salvar recorrência. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <Text style={styles.modalTitle}>Nova Recorrência</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tipo</Text>
        <RadioButton.Group onValueChange={value => setTipo(value as 'despesa' | 'receita')} value={tipo}>
          <View style={styles.radioGroup}>
            <RadioButton.Item label="Despesa" value="despesa" color={COLORS.primary} />
            <RadioButton.Item label="Receita" value="receita" color={COLORS.primary} />
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
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição da recorrência"
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
        <Text style={styles.label}>Fonte</Text>
        <View style={styles.pickerContainer}>
          {FONTES.map((fonteItem) => (
            <TouchableOpacity
              key={fonteItem}
              style={[
                styles.pickerItem,
                fonte === fonteItem && styles.pickerItemSelected
              ]}
              onPress={() => setFonte(fonteItem)}
            >
              <Text style={[
                styles.pickerItemText,
                fonte === fonteItem && styles.pickerItemTextSelected
              ]}>{fonteItem}</Text>
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
        <Text style={styles.label}>Data Final (opcional)</Text>
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

      <View style={styles.modalActions}>
        <Button
          mode="outlined"
          onPress={onClose}
          style={styles.modalButton}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.modalButton}
          loading={loading}
        >
          Adicionar
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.lg,
    textAlign: 'center',
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
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: LAYOUT.spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: LAYOUT.spacing.xs,
  },
});

export default RecurringEntryForm; 