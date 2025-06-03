import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Text as RNText, SafeAreaView, TextInput } from 'react-native';
import { Text, Button, Portal, Modal, RadioButton, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { COLORS } from '../src/styles';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { rtdb } from '../config/firebaseConfig';
import { ref, get, query, orderByChild } from 'firebase/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { getRecorrencias, Recorrencia } from '../services/recurringService';

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

const RecurringScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadRecorrencias = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const dados = await getRecorrencias(user.uid);
      setRecorrencias(dados);
    } catch (error) {
      console.error('Erro ao carregar recorrências:', error);
      Alert.alert('Erro', 'Não foi possível carregar as recorrências');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecorrencias();
  }, [loadRecorrencias]);

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

  const handleSubmit = async () => {
    if (!user) return;

    if (!valor || !descricao || !categoria || !fonte) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const recorrenciaData = {
        userId: user.uid,
        tipo,
        valor: parseFloat(valor),
        descricao,
        categoria,
        fonte,
        diaRecorrencia,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim?.toISOString() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        // Implemente a lógica para atualizar uma recorrência no Realtime Database
      } else {
        // Implemente a lógica para adicionar uma nova recorrência no Realtime Database
      }

      setModalVisible(false);
      resetForm();
      loadRecorrencias();
    } catch (error) {
      console.error('Erro ao salvar recorrência:', error);
      Alert.alert('Erro', 'Não foi possível salvar a recorrência');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      // Implemente a lógica para deletar uma recorrência no Realtime Database
      loadRecorrencias();
    } catch (error) {
      console.error('Erro ao deletar recorrência:', error);
      Alert.alert('Erro', 'Não foi possível deletar a recorrência');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recorrencia: Recorrencia) => {
    setTipo(recorrencia.tipo);
    setValor(recorrencia.valor.toString());
    setDescricao(recorrencia.descricao);
    setCategoria(recorrencia.categoria);
    setFonte(recorrencia.fonte);
    setDiaRecorrencia(recorrencia.diaRecorrencia);
    setDataInicio(new Date(recorrencia.dataInicio));
    setDataFim(recorrencia.dataFim ? new Date(recorrencia.dataFim) : null);
    setEditingId(recorrencia.id);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTipo('despesa');
    setValor('');
    setDescricao('');
    setCategoria('');
    setFonte('');
    setDiaRecorrencia(1);
    setDataInicio(new Date());
    setDataFim(null);
    setEditingId(null);
  };

  const formatarData = (date: Date | null): string => {
    if (!date) return 'Sem data final';
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (loading && recorrencias.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Recorrências' }} />
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Recorrências</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {recorrencias.map((recorrencia) => (
          <View key={recorrencia.id} style={styles.recorrenciaCard}>
            <View style={styles.recorrenciaHeader}>
              <View style={styles.recorrenciaInfo}>
                <Text style={styles.recorrenciaDescricao}>{recorrencia.descricao}</Text>
                <Text style={[
                  styles.recorrenciaValor,
                  { color: recorrencia.tipo === 'receita' ? COLORS.success : COLORS.danger }
                ]}>
                  {recorrencia.tipo === 'receita' ? '+' : '-'} R$ {recorrencia.valor.toFixed(2)}
                </Text>
              </View>
              <View style={styles.recorrenciaActions}>
                <TouchableOpacity onPress={() => handleEdit(recorrencia)}>
                  <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(recorrencia.id!)}>
                  <Ionicons name="trash" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.recorrenciaDetails}>
              <Text style={styles.recorrenciaDetail}>
                <Ionicons name="calendar" size={16} color={COLORS.text} /> Dia {recorrencia.diaRecorrencia}
              </Text>
              {recorrencia.categoria && (
                <Text style={styles.recorrenciaDetail}>
                  <Ionicons name="folder" size={16} color={COLORS.text} /> {recorrencia.categoria}
                </Text>
              )}
              {recorrencia.fonte && (
                <Text style={styles.recorrenciaDetail}>
                  <Ionicons name="wallet" size={16} color={COLORS.text} /> {recorrencia.fonte}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <RecurringEntryForm onClose={() => setModalVisible(false)} />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: LAYOUT.spacing.lg,
  },
  recorrenciaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recorrenciaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.spacing.sm,
  },
  recorrenciaInfo: {
    flex: 1,
  },
  recorrenciaDescricao: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  recorrenciaValor: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
  },
  recorrenciaActions: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
  },
  recorrenciaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
  },
  recorrenciaDetail: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    padding: LAYOUT.spacing.lg,
    margin: LAYOUT.spacing.lg,
    borderRadius: 12,
  },
});

export default RecurringScreen; 