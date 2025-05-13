// app/HomeScreen.tsx
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Title from '../src/components/Title';
import { COLORS, TYPO, LAYOUT } from '../src/styles';

const transactions = [
  { id: '1', type: 'income', description: 'Salário', amount: 5000, date: '10/05/2025' },
  { id: '2', type: 'expense', description: 'Aluguel', amount: 1500, date: '09/05/2025' },
  { id: '3', type: 'expense', description: 'Supermercado', amount: 250, date: '08/05/2025' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, padding: LAYOUT.spacing.md }}>

      {/* Cabeçalho */}
      <Title style={{ marginBottom: LAYOUT.spacing.lg }}>Olá, Usuário</Title>

      {/* Cartão de Saldo */}
      <Card style={{
        backgroundColor: COLORS.surface,
        borderRadius: LAYOUT.radius.default,
        elevation: LAYOUT.shadow.elevation,
        marginBottom: LAYOUT.spacing.lg,
      }}>
        <Card.Content>
          <Text style={{
            fontSize: TYPO.size.sm,
            color: COLORS.textSecondary,
            fontFamily: TYPO.family.regular,
          }}>
            Saldo Atual
          </Text>
          <Text style={{
            fontSize: TYPO.size.xxl,
            color: COLORS.text,
            fontFamily: TYPO.family.bold,
            marginTop: LAYOUT.spacing.sm,
          }}>
            R$ {balance},00
          </Text>
        </Card.Content>
      </Card>

      {/* Resumo de Receitas e Despesas */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: LAYOUT.spacing.lg,
      }}>
        <Card style={{
          flex: 1,
          backgroundColor: COLORS.surface,
          borderRadius: LAYOUT.radius.default,
          padding: LAYOUT.spacing.md,
          marginRight: LAYOUT.spacing.xs,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: TYPO.size.sm,
            color: COLORS.textSecondary,
            fontFamily: TYPO.family.regular,
          }}>
            Receitas
          </Text>
          <Text style={{
            fontSize: TYPO.size.lg,
            color: COLORS.success,
            fontFamily: TYPO.family.semibold,
            marginTop: LAYOUT.spacing.xs,
          }}>
            R$ {totalIncome},00
          </Text>
        </Card>

        <Card style={{
          flex: 1,
          backgroundColor: COLORS.surface,
          borderRadius: LAYOUT.radius.default,
          padding: LAYOUT.spacing.md,
          marginLeft: LAYOUT.spacing.xs,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: TYPO.size.sm,
            color: COLORS.textSecondary,
            fontFamily: TYPO.family.regular,
          }}>
            Despesas
          </Text>
          <Text style={{
            fontSize: TYPO.size.lg,
            color: COLORS.danger,
            fontFamily: TYPO.family.semibold,
            marginTop: LAYOUT.spacing.xs,
          }}>
            R$ {totalExpense},00
          </Text>
        </Card>
      </View>

      {/* Botões de Ação */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: LAYOUT.spacing.lg,
      }}>
        <TouchableOpacity
          onPress={() => router.push('/IncomeForm')}
          activeOpacity={0.8}
          style={{ flex: 1, marginRight: LAYOUT.spacing.xs }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: LAYOUT.radius.large,
              paddingVertical: LAYOUT.spacing.sm,
              elevation: LAYOUT.shadow.elevation,
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.background} />
            <Text style={{
              marginLeft: LAYOUT.spacing.xs,
              fontSize: TYPO.size.md,
              color: COLORS.background,
              fontFamily: TYPO.family.bold,
            }}>
              Nova Receita
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/ExpenseForm')}
          activeOpacity={0.8}
          style={{ flex: 1, marginLeft: LAYOUT.spacing.xs }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: LAYOUT.radius.large,
              paddingVertical: LAYOUT.spacing.sm,
              elevation: LAYOUT.shadow.elevation,
            }}
          >
            <Ionicons name="remove-circle-outline" size={24} color={COLORS.background} />
            <Text style={{
              marginLeft: LAYOUT.spacing.xs,
              fontSize: TYPO.size.md,
              color: COLORS.background,
              fontFamily: TYPO.family.bold,
            }}>
              Nova Despesa
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Lista de Transações */}
      <Title style={{ marginBottom: LAYOUT.spacing.sm }}>Últimas Transações</Title>
      <ScrollView>
        {transactions.map(item => (
          <View key={item.id} style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.surface,
            borderRadius: LAYOUT.radius.small,
            padding: LAYOUT.spacing.sm,
            marginBottom: LAYOUT.spacing.sm,
          }}>
            <Ionicons
              name={item.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={24}
              color={item.type === 'income' ? COLORS.success : COLORS.danger}
              style={{ marginRight: LAYOUT.spacing.sm }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: TYPO.size.md,
                color: COLORS.text,
                fontFamily: TYPO.family.medium,
              }}>
                {item.description}
              </Text>
              <Text style={{
                fontSize: TYPO.size.xs,
                color: COLORS.textSecondary,
                fontFamily: TYPO.family.regular,
                marginTop: LAYOUT.spacing.xs / 2,
              }}>
                {item.date}
              </Text>
            </View>
            <Text style={{
              fontSize: TYPO.size.md,
              color: item.type === 'income' ? COLORS.success : COLORS.danger,
              fontFamily: TYPO.family.semibold,
            }}>
              {item.type === 'income' ? '+' : '-'} R$ {item.amount},00
            </Text>
          </View>
        ))}
      </ScrollView>

    </View>
  );
}
