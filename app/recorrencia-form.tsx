import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  SafeAreaView, 
  Alert,
  Animated,
  Dimensions
} from 'react-native';
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

const { width } = Dimensions.get('window');

// Categorias com ícones
const CATEGORIAS = {
  despesas: [
    { nome: 'Alimentação', icon: 'restaurant-outline' },
    { nome: 'Transporte', icon: 'car-outline' },
    { nome: 'Moradia', icon: 'home-outline' },
    { nome: 'Saúde', icon: 'medical-outline' },
    { nome: 'Educação', icon: 'school-outline' },
    { nome: 'Lazer', icon: 'game-controller-outline' },
    { nome: 'Vestuário', icon: 'shirt-outline' },
    { nome: 'Outros', icon: 'ellipsis-horizontal-outline' }
  ],
  receitas: [
    { nome: 'Salário', icon: 'briefcase-outline' },
    { nome: 'Freelance', icon: 'laptop-outline' },
    { nome: 'Investimentos', icon: 'trending-up-outline' },
    { nome: 'Outros', icon: 'ellipsis-horizontal-outline' }
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
  
  // Animações
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    if (id) {
      loadRecorrencia();
    }
  }, [id]);

  const loadRecorrencia = async () => {
    try {
      setLoading(true);
      const recorrencia = await getRecorrencia(user!.uid, id);
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
    if (!date) return 'Selecionar data';
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatarValor = (text: string) => {
    // Remove tudo que não é número
    const numeros = text.replace(/[^0-9]/g, '');
    
    // Converte para formato monetário
    if (numeros.length === 0) return '';
    
    const valor = parseInt(numeros) / 100;
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleValorChange = (text: string) => {
    const valorFormatado = formatarValor(text);
    setValor(valorFormatado);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!valor || !descricao || !categoria) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
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
        dataFim: temDataFim && dataFim ? dataFim.toISOString() : undefined
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

  const renderTipoCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Tipo de Transação</Text>
      </View>
      
      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[
            styles.tipoOption,
            tipo === 'despesa' && styles.tipoOptionSelected,
            { borderColor: COLORS.danger + '30' }
          ]}
          onPress={() => setTipo('despesa')}
        >
          <LinearGradient
            colors={tipo === 'despesa' ? [COLORS.danger, COLORS.danger + 'CC'] : ['transparent', 'transparent']}
            style={styles.tipoOptionGradient}
          >
            <Ionicons 
              name="trending-down" 
              size={24} 
              color={tipo === 'despesa' ? COLORS.white : COLORS.danger} 
            />
            <Text style={[
              styles.tipoOptionText,
              { color: tipo === 'despesa' ? COLORS.white : COLORS.danger }
            ]}>
              Despesa
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tipoOption,
            tipo === 'receita' && styles.tipoOptionSelected,
            { borderColor: COLORS.success + '30' }
          ]}
          onPress={() => setTipo('receita')}
        >
          <LinearGradient
            colors={tipo === 'receita' ? [COLORS.success, COLORS.success + 'CC'] : ['transparent', 'transparent']}
            style={styles.tipoOptionGradient}
          >
            <Ionicons 
              name="trending-up" 
              size={24} 
              color={tipo === 'receita' ? COLORS.white : COLORS.success} 
            />
            <Text style={[
              styles.tipoOptionText,
              { color: tipo === 'receita' ? COLORS.white : COLORS.success }
            ]}>
              Receita
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderValorCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Valor</Text>
      </View>
      
      <View style={styles.valorContainer}>
        <Text style={styles.valorPrefix}>R$</Text>
        <TextInput
          style={styles.valorInput}
          value={valor}
          onChangeText={handleValorChange}
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>
    </View>
  );

  const renderDescricaoCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Descrição</Text>
      </View>
      
      <TextInput
        style={styles.descricaoInput}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Aluguel do apartamento"
        placeholderTextColor={COLORS.textSecondary}
        multiline
        numberOfLines={2}
      />
    </View>
  );

  const renderCategoriaCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="folder-outline" size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Categoria</Text>
      </View>
      
      <View style={styles.categoriaContainer}>
        {CATEGORIAS[tipo === 'despesa' ? 'despesas' : 'receitas'].map((cat) => (
          <TouchableOpacity
            key={cat.nome}
            style={[
              styles.categoriaItem,
              categoria === cat.nome && styles.categoriaItemSelected
            ]}
            onPress={() => setCategoria(cat.nome)}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={16} 
              color={categoria === cat.nome ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[
              styles.categoriaItemText,
              categoria === cat.nome && styles.categoriaItemTextSelected
            ]}>
              {cat.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDiaCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Dia da Recorrência</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.diaContainer}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
            <TouchableOpacity
              key={dia}
              style={[
                styles.diaItem,
                diaRecorrencia === dia && styles.diaItemSelected
              ]}
              onPress={() => setDiaRecorrencia(dia)}
            >
              <Text style={[
                styles.diaItemText,
                diaRecorrencia === dia && styles.diaItemTextSelected
              ]}>
                {dia}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderDataCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Período</Text>
      </View>
      
      {/* Data de início */}
      <View style={styles.dataItem}>
        <Text style={styles.dataLabel}>Data de início</Text>
        <TouchableOpacity
          style={styles.dataButton}
          onPress={() => {
            setDatePickerMode('inicio');
            setShowDatePicker(true);
          }}
        >
          <Ionicons name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.dataButtonText}>
            {format(dataInicio, "dd/MM/yyyy")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toggle data fim */}
      <View style={styles.dataFimToggle}>
        <Text style={styles.dataLabel}>Tem data final?</Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            temDataFim && styles.toggleButtonActive
          ]}
          onPress={() => setTemDataFim(!temDataFim)}
        >
          <Text style={[
            styles.toggleButtonText,
            temDataFim && styles.toggleButtonTextActive
          ]}>
            {temDataFim ? 'Sim' : 'Não'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data de fim */}
      {temDataFim && (
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Data final</Text>
          <TouchableOpacity
            style={styles.dataButton}
            onPress={() => {
              setDatePickerMode('fim');
              setShowDatePicker(true);
            }}
          >
            <Ionicons name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.dataButtonText}>
              {dataFim ? format(dataFim, "dd/MM/yyyy") : 'Selecionar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {id ? 'Editar Recorrência' : 'Nova Recorrência'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {id ? 'Modifique os dados abaixo' : 'Preencha os dados abaixo'}
          </Text>
        </View>
        
        <View style={styles.headerIcon}>
          <Ionicons name="repeat" size={24} color={COLORS.white} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {renderTipoCard()}
          {renderValorCard()}
          {renderDescricaoCard()}
          {renderCategoriaCard()}
          {renderDiaCard()}
          {renderDataCard()}

          {/* Botões de ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.saveButtonGradient}
              >
                {loading ? (
                  <Animated.View style={styles.loadingContainer}>
                    <Text style={styles.saveButtonText}>Salvando...</Text>
                  </Animated.View>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                    <Text style={styles.saveButtonText}>
                      {id ? 'Salvar' : 'Criar'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 50 }} />
        </Animated.View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerMode === 'inicio' ? dataInicio : (dataFim || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={datePickerMode === 'fim' ? dataInicio : undefined}
        />
      )}
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
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.white + 'CC',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: LAYOUT.spacing.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  cardTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginLeft: LAYOUT.spacing.sm,
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
  },
  tipoOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  tipoOptionSelected: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tipoOptionGradient: {
    padding: LAYOUT.spacing.md,
    alignItems: 'center',
  },
  tipoOptionText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.semibold,
    marginTop: 4,
  },
  valorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  valorPrefix: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.primary,
    marginRight: LAYOUT.spacing.sm,
  },
  valorInput: {
    flex: 1,
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    paddingVertical: LAYOUT.spacing.sm,
  },
  descricaoInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  categoriaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
  },
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriaItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoriaItemText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginLeft: 6,
  },
  categoriaItemTextSelected: {
    color: COLORS.white,
  },
  diaContainer: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.xs,
  },
  diaItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  diaItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  diaItemText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  diaItemTextSelected: {
    color: COLORS.white,
  },
  dataItem: {
    marginBottom: LAYOUT.spacing.md,
  },
  dataLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.xs,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dataButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    marginLeft: LAYOUT.spacing.sm,
  },
  dataFimToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  toggleButton: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    marginTop: LAYOUT.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.md,
  },
  saveButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.white,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RecurringFormScreen;

