import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';

const { width } = Dimensions.get('window');

const HelpSection = ({ title, description, icon }: { title: string; description: string; icon: string }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionDescription}>{description}</Text>
  </View>
);

const HelpScreen = () => {
  const router = useRouter();

  const helpSections = [
    {
      title: 'Início',
      description: 'Visualize seu saldo atual, transações recentes e um resumo das suas finanças. Use o botão "+" para adicionar novas transações rapidamente.',
      icon: 'home-outline'
    },
    {
      title: 'Recorrências',
      description: 'Gerencie suas transações recorrentes como assinaturas, salários e contas fixas. Configure a frequência e o valor para manter seu controle financeiro organizado.',
      icon: 'repeat-outline'
    },
    {
      title: 'Gráficos',
      description: 'Analise seus gastos e receitas através de gráficos interativos. Visualize tendências, categorias e compare períodos diferentes.',
      icon: 'bar-chart-outline'
    },
    {
      title: 'Metas',
      description: 'Defina e acompanhe suas metas financeiras. Estabeleça objetivos de economia e acompanhe seu progresso com atualizações em tempo real.',
      icon: 'flag-outline'
    },
    {
      title: 'Planejamento',
      description: 'Crie um orçamento mensal e acompanhe seus gastos por categoria. Receba alertas quando estiver próximo do limite definido.',
      icon: 'wallet-outline'
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Ajuda</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Bem-vindo à Ajuda do Finan</Text>
          <Text style={styles.welcomeDescription}>
            Aqui você encontrará informações sobre todas as funcionalidades do aplicativo. 
            Selecione uma seção abaixo para saber mais.
          </Text>
        </View>

        {helpSections.map((section, index) => (
          <React.Fragment key={section.title}>
            <HelpSection {...section} />
            {index < helpSections.length - 1 && <Divider style={styles.divider} />}
          </React.Fragment>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Precisa de mais ajuda?</Text>
          <Text style={styles.contactDescription}>
            Se você não encontrou o que procurava, entre em contato conosco pelo email:
            {'\n'}suporte@finan.app
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: LAYOUT.spacing.lg,
    backgroundColor: COLORS.white,
    marginBottom: LAYOUT.spacing.md,
  },
  welcomeTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  welcomeDescription: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  section: {
    padding: LAYOUT.spacing.lg,
    backgroundColor: COLORS.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.sm,
  },
  sectionTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  sectionDescription: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: 56,
  },
  divider: {
    backgroundColor: COLORS.divider,
  },
  contactSection: {
    padding: LAYOUT.spacing.lg,
    backgroundColor: COLORS.white,
    marginTop: LAYOUT.spacing.md,
  },
  contactTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  contactDescription: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default HelpScreen; 