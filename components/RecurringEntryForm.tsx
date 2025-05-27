import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, Button, RadioButton, List } from 'react-native-paper';
import { COLORS, LAYOUT, TYPO } from '../src/styles';

interface Recorrencia {
  id: string;
  tipo: 'despesa' | 'receita';
  valor: string;
  descricao: string;
  data: string;
}

const mockRecorrencias: Recorrencia[] = [
  { id: '1', tipo: 'despesa', valor: '100', descricao: 'Aluguel', data: '2024-07-01' },
  { id: '2', tipo: 'receita', valor: '3000', descricao: 'Salário', data: '2024-07-05' },
];

const RecurringEntryForm: React.FC = () => {
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>(mockRecorrencias);

  const adicionarRecorrencia = () => {
    if (!valor || !descricao || !data) return;
    setRecorrencias([
      ...recorrencias,
      { id: Date.now().toString(), tipo, valor, descricao, data }
    ]);
    setValor('');
    setDescricao('');
    setData('');
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Nova recorrência</Text>
      <RadioButton.Group onValueChange={v => setTipo(v as any)} value={tipo}>
        <View style={styles.radioRow}>
          <RadioButton value="despesa" /><Text>Despesa</Text>
          <RadioButton value="receita" style={{ marginLeft: 16 }} /><Text>Receita</Text>
        </View>
      </RadioButton.Group>
      <TextInput
        label="Valor"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        style={styles.input}
      />
      <TextInput
        label="Data (YYYY-MM-DD)"
        value={data}
        onChangeText={setData}
        style={styles.input}
      />
      <Button mode="contained" onPress={adicionarRecorrencia} style={styles.button}>
        Adicionar recorrência
      </Button>
      <Text style={styles.sectionTitle}>Recorrências cadastradas</Text>
      <FlatList
        data={recorrencias}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.tipo === 'despesa' ? 'Despesa' : 'Receita'}: R$ ${item.valor}`}
            description={`${item.descricao} - Data: ${item.data}`}
            left={props => <List.Icon {...props} icon={item.tipo === 'despesa' ? 'arrow-down' : 'arrow-up'} />}
          />
        )}
      />
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
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  input: {
    marginBottom: LAYOUT.spacing.sm,
  },
  button: {
    marginBottom: LAYOUT.spacing.lg,
  },
});

export default RecurringEntryForm; 