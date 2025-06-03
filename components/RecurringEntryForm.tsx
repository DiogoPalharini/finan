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
  const [categoria, setCategoria] = useState('');
  const [fonte, setFonte] = useState('');
  const [diaRecorrencia, setDiaRecorrencia] = useState<number>(1);
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
      Alert.alert('Erro', 'Não foi possível carregar as recorrências');
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
    if (!auth.currentUser || !valor || !descricao || !dataInicio) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      await saveRecorrencia(auth.currentUser.uid, {
        tipo,
        valor: Number(valor),
        descricao,
        categoria,
        fonte,
        diaRecorrencia,
        dataInicio: formatarData(dataInicio),
        dataFim: temDataFim ? formatarData(dataFim) : undefined
      });
      
      await carregarRecorrencias();
      setValor('');
      setDescricao('');
      setCategoria('');
      setFonte('');
      setDiaRecorrencia(1);
      setDataInicio(null);
      setDataFim(null);
      setTemDataFim(false);
      Alert.alert('Sucesso', 'Recorrência adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar recorrência:', error);
      Alert.alert('Erro', 'Não foi possível salvar a recorrência');
    } finally {
      setLoading(false);
    }
  };

  const excluirRecorrencia = async (id: string) => {
    if (!auth.currentUser) return;
    
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta recorrência?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoadingDelete(id);
            try {
              await deleteRecorrencia(auth.currentUser!.uid, id);
              await carregarRecorrencias();
              Alert.alert('Sucesso', 'Recorrência excluída com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir recorrência:', error);
              Alert.alert('Erro', 'Não foi possível excluir a recorrência');
            } finally {
              setLoadingDelete(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Nova Recorrência</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                tipo === 'despesa' && styles.typeButtonActive
              ]}
              onPress={() => setTipo('despesa')}
            >
              <Text style={[
                styles.typeButtonText,
                tipo === 'despesa' && styles.typeButtonTextActive
              ]}>Despesa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                tipo === 'receita' && styles.typeButtonActive
              ]}
              onPress={() => setTipo('receita')}
            >
              <Text style={[
                styles.typeButtonText,
                tipo === 'receita' && styles.typeButtonTextActive
              ]}>Receita</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={formatarValor}
            keyboardType="numeric"
            placeholder="0,00"
            right={<TextInput.Affix text="R$" />}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição da recorrência"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoria</Text>
          <TextInput
            style={styles.input}
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Categoria da recorrência"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fonte</Text>
          <TextInput
            style={styles.input}
            value={fonte}
            onChangeText={setFonte}
            placeholder="Fonte da recorrência"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dia da Recorrência</Text>
          <TextInput
            style={styles.input}
            value={diaRecorrencia.toString()}
            onChangeText={(text) => {
              const dia = parseInt(text);
              if (!isNaN(dia) && dia >= 1 && dia <= 31) {
                setDiaRecorrencia(dia);
              }
            }}
            keyboardType="numeric"
            placeholder="Dia do mês (1-31)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Data de Início</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDataInicio(true)}
          >
            <Text style={styles.dateButtonText}>
              {dataInicio ? formatarData(dataInicio) : 'Selecione a data'}
            </Text>
          </TouchableOpacity>
          {showDataInicio && (
            <DateTimePicker
              value={dataInicio || new Date()}
              mode="date"
              display="default"
              onChange={handleDataInicioChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setTemDataFim(!temDataFim)}
          >
            <View style={[
              styles.checkbox,
              temDataFim && styles.checkboxChecked
            ]}>
              {temDataFim && (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Definir data final</Text>
          </TouchableOpacity>

          {temDataFim && (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDataFim(true)}
              >
                <Text style={styles.dateButtonText}>
                  {dataFim ? formatarData(dataFim) : 'Selecione a data'}
                </Text>
              </TouchableOpacity>
              {showDataFim && (
                <DateTimePicker
                  value={dataFim || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDataFimChange}
                  minimumDate={dataInicio || new Date()}
                />
              )}
            </>
          )}
        </View>

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
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Recorrências cadastradas</Text>
        
        {recorrencias.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemDescription}>{item.descricao}</Text>
              <TouchableOpacity
                onPress={() => excluirRecorrencia(item.id!)}
                disabled={loadingDelete === item.id}
              >
                {loadingDelete === item.id ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.itemDetails}>
              <Text style={[
                styles.itemValue,
                { color: item.tipo === 'receita' ? COLORS.success : COLORS.danger }
              ]}>
                {item.tipo === 'receita' ? '+' : '-'} R$ {item.valor.toFixed(2)}
              </Text>
              <Text style={styles.itemDate}>
                Dia {item.diaRecorrencia} de cada mês
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formContainer: {
    padding: LAYOUT.spacing.lg,
  },
  title: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.lg,
  },
  inputContainer: {
    marginBottom: LAYOUT.spacing.md,
  },
  label: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: LAYOUT.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  dateButton: {
    backgroundColor: COLORS.surface,
    padding: LAYOUT.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: LAYOUT.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
  },
  addButton: {
    marginTop: LAYOUT.spacing.lg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: LAYOUT.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
  },
  listContainer: {
    padding: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.lg,
  },
  itemContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  itemDescription: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
  },
  itemDate: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
});

export default RecurringEntryForm; 