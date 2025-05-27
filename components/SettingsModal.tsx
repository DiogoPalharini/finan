import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Portal, RadioButton, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import RecurringEntryForm from './RecurringEntryForm';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  balanceView: string;
  onChangeBalanceView: (view: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, balanceView, onChangeBalanceView }) => {
  const [tab, setTab] = useState<'recorrencias' | 'saldo'>('recorrencias');

  return (
    <Portal>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Text style={styles.title}>Configurações</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setTab('recorrencias')} style={[styles.tab, tab === 'recorrencias' && styles.activeTab]}>
                  <Text style={[styles.tabText, tab === 'recorrencias' && styles.activeTabText]}>Recorrências</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab('saldo')} style={[styles.tab, tab === 'saldo' && styles.activeTab]}>
                  <Text style={[styles.tabText, tab === 'saldo' && styles.activeTabText]}>Exibição do Saldo</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
            <View style={styles.content}>
              <Divider style={{ marginBottom: LAYOUT.spacing.md }} />
              {tab === 'recorrencias' ? (
                <RecurringEntryForm />
              ) : (
                <View>
                  <Text style={styles.sectionTitle}>Como deseja exibir o saldo?</Text>
                  <RadioButton.Group onValueChange={onChangeBalanceView} value={balanceView}>
                    <RadioButton.Item label="Apenas mês atual" value="mes_atual" color={COLORS.secondary} labelStyle={styles.radioLabel} />
                    <RadioButton.Item label="Período determinado" value="periodo" color={COLORS.secondary} labelStyle={styles.radioLabel} />
                    <RadioButton.Item label="Total acumulado" value="total" color={COLORS.secondary} labelStyle={styles.radioLabel} />
                  </RadioButton.Group>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width > 500 ? 420 : '92%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 4,
  },
  title: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.sm,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tabText: {
    color: COLORS.white,
    fontFamily: TYPO.family.medium,
    fontSize: TYPO.size.sm,
    opacity: 0.7,
  },
  activeTabText: {
    color: COLORS.white,
    opacity: 1,
    fontFamily: TYPO.family.bold,
  },
  content: {
    padding: LAYOUT.spacing.lg,
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  sectionTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    marginBottom: LAYOUT.spacing.md,
    color: COLORS.text,
  },
  radioLabel: {
    fontFamily: TYPO.family.regular,
    fontSize: TYPO.size.sm,
    color: COLORS.text,
  },
});

export default SettingsModal; 