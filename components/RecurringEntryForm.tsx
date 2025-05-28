import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { Text, TextInput, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, LAYOUT, TYPO } from '../src/styles';
import { saveRecorrencia, getRecorrencias, deleteRecorrencia, Recorrencia } from '../services/recurringService';
import { auth } from '../config/firebaseConfig';
import { formatCurrency } from '../utils/formatters';

const RecurringEntryForm: React.FC = () => {
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [temDataFim, setTemDataFim] = useState(false);
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  
  // Estados para controle do DatePicker
  const [showDataInicio, setShowDataInicio] = useState(false);
  const [showDataFim, setShowDataFim] = useState(false);

  useEffect(() => {
    carregarRecorrencias();
  }, []);

  const carregarRecorrencias = async () => {
    if (!auth.currentUser) return;
    try {
      const dados = await getRecorrencias(auth.currentUser.uid);
      setRecorrencias(dados);
    } catch (error) {
      console.error('Erro ao carregar recorrências:', error);
    }
  };

  const formatarValor = (text: string) => {
    const numero = text.replace(/\D/g, '');
    const valor = (Number(numero) / 100).toFixed(2);
    setValor(valor);
  };

  const handleDataInicioChange = (event: any, selectedDate?: Date) => {
    setShowDataInicio(Platform.OS === 'ios');
    if (selectedDate) {
      // Validar se a data é maior que hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (selectedDate < hoje) {
        Alert.alert(
          'Data inválida',
          'A data de início deve ser maior ou igual a hoje.'
        );
        return;
      }
      
      setDataInicio(selectedDate);
    }
  };

  const handleDataFimChange = (event: any, selectedDate?: Date) => {
    setShowDataFim(Platform.OS === 'ios');
    if (selectedDate) {
      setDataFim(selectedDate);
    }
  };

  const formatarData = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const adicionarRecorrencia = async () => {
    if (!auth.currentUser || !valor || !descricao || !dataInicio) return;
    
    setLoading(true);
    try {
      await saveRecorrencia(auth.currentUser.uid, {
        tipo,
        valor: Number(valor),
        descricao,
        dataInicio: formatarData(dataInicio),
        dataFim: temDataFim ? formatarData(dataFim) : undefined
      });
      
      await carregarRecorrencias();
      setValor('');
      setDescricao('');
      setDataInicio(null);
      setDataFim(null);
      setTemDataFim(false);
    } catch (error) {
      console.error('Erro ao salvar recorrência:', error);
    } finally {
      setLoading(false);
    }
  };

  const excluirRecorrencia = async (id: string) => {
    if (!auth.currentUser) return;
    
    setLoadingDelete(id);
    try {
      await deleteRecorrencia(auth.currentUser.uid, id);
      await carregarRecorrencias();
    } catch (error) {
      console.error('Erro ao excluir recorrência:', error);
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Nova recorrência mensal</Text>
      
      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[styles.tipoButton, tipo === 'despesa' && styles.tipoButtonActive]}
          onPress={() => setTipo('despesa')}
        >
          <Ionicons 
            name="arrow-down-outline" 
            size={20} 
            color={tipo === 'despesa' ? COLORS.white : COLORS.text} 
          />
          <Text style={[styles.tipoText, tipo === 'despesa' && styles.tipoTextActive]}>
            Despesa
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tipoButton, tipo === 'receita' && styles.tipoButtonActive]}
          onPress={() => setTipo('receita')}
        >
          <Ionicons 
            name="arrow-up-outline" 
            size={20} 
            color={tipo === 'receita' ? COLORS.white : COLORS.text} 
          />
          <Text style={[styles.tipoText, tipo === 'receita' && styles.tipoTextActive]}>
            Receita
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="cash-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
        <TextInput
          placeholder="Valor"
          value={valor}
          onChangeText={formatarValor}
          keyboardType="numeric"
          style={styles.input}
          dense
          mode="flat"
          underlineColor="transparent"
          theme={{
            colors: {
              primary: COLORS.primary,
              text: COLORS.text,
              placeholder: COLORS.textSecondary,
            },
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="create-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
        <TextInput
          placeholder="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          style={styles.input}
          dense
          mode="flat"
          underlineColor="transparent"
          theme={{
            colors: {
              primary: COLORS.primary,
              text: COLORS.text,
              placeholder: COLORS.textSecondary,
            },
          }}
        />
      </View>

      <TouchableOpacity 
        style={styles.datePickerButton}
        onPress={() => setShowDataInicio(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
        <Text style={styles.datePickerText}>
          {dataInicio ? `Todo dia ${dataInicio.getDate()} de cada mês` : 'Selecione o dia da recorrência'}
        </Text>
      </TouchableOpacity>

      <View style={styles.dataFimContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setTemDataFim(!temDataFim)}
        >
          <View style={[styles.checkbox, temDataFim && styles.checkboxChecked]}>
            {temDataFim && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
          </View>
          <Text style={styles.checkboxLabel}>Definir data final</Text>
        </TouchableOpacity>

        {temDataFim && (
          <TouchableOpacity 
            style={[styles.datePickerButton, { marginTop: LAYOUT.spacing.xs }]}
            onPress={() => setShowDataFim(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} style={styles.inputIcon} />
            <Text style={styles.datePickerText}>
              {dataFim ? formatarData(dataFim) : 'Selecione a data final'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showDataInicio && (
        <DateTimePicker
          value={dataInicio || new Date()}
          mode="date"
          display="default"
          onChange={handleDataInicioChange}
          minimumDate={new Date()}
        />
      )}

      {showDataFim && temDataFim && (
        <DateTimePicker
          value={dataFim || new Date()}
          mode="date"
          display="default"
          onChange={handleDataFimChange}
          minimumDate={dataInicio || undefined}
        />
      )}

      <TouchableOpacity
        onPress={adicionarRecorrencia}
        disabled={loading || !valor || !descricao || !dataInicio || (temDataFim && !dataFim)}
        style={styles.addButton}
      >
        <LinearGradient
          colors={[COLORS.secondary, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.buttonText}>Adicionar recorrência mensal</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recorrências cadastradas</Text>
      
      {recorrencias.map((item) => (
        <View key={item.id} style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTipo}>
                <Ionicons
                  name={item.tipo === 'despesa' ? 'arrow-down-outline' : 'arrow-up-outline'}
                  size={20}
                  color={item.tipo === 'despesa' ? COLORS.danger : COLORS.success}
                />
                <Text style={[
                  styles.itemValor,
                  { color: item.tipo === 'despesa' ? COLORS.danger : COLORS.success }
                ]}>
                  {formatCurrency(item.valor)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => excluirRecorrencia(item.id)}
                disabled={loadingDelete === item.id}
                style={styles.deleteButton}
              >
                {loadingDelete === item.id ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.itemDescricao}>{item.descricao}</Text>
            <Text style={styles.itemData}>
              Todo dia {new Date(item.dataInicio).getDate()} de cada mês
              {item.dataFim ? ` até ${formatarData(new Date(item.dataFim))}` : ' • Sem data final'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    marginBottom: LAYOUT.spacing.md,
    color: COLORS.text,
  },
  tipoContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  tipoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tipoButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  tipoText: {
    marginLeft: 8,
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  tipoTextActive: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    height: 48,
  },
  inputIcon: {
    marginRight: LAYOUT.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 40,
    paddingVertical: 0,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  datePickerText: {
    flex: 1,
    color: COLORS.text,
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
  },
  dataFimContainer: {
    marginBottom: LAYOUT.spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: LAYOUT.spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginRight: LAYOUT.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
  },
  checkboxLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xl,
  },
  gradientButton: {
    paddingVertical: LAYOUT.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
  },
  itemContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  itemContent: {
    padding: LAYOUT.spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  itemTipo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValor: {
    marginLeft: LAYOUT.spacing.xs,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
  },
  itemDescricao: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  itemData: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
});

export default RecurringEntryForm; 