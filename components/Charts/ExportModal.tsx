import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'xlsx' | 'csv') => void;
  isLoading?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onExport,
  isLoading = false
}) => {
  const exportOptions = [
    { id: 'pdf', label: 'PDF', icon: 'document-text-outline', description: 'Documento para visualização e impressão' },
    { id: 'xlsx', label: 'Excel', icon: 'grid-outline', description: 'Planilha para análise detalhada' },
    { id: 'csv', label: 'CSV', icon: 'code-outline', description: 'Formato universal para importação' }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Exportar Relatório</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Escolha o formato para exportar seus dados financeiros
          </Text>
          
          <View style={styles.optionsContainer}>
            {exportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => onExport(option.id as 'pdf' | 'xlsx' | 'csv')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name={option.icon as any} size={28} color={COLORS.secondary} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    ...LAYOUT.shadow.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.lg,
  },
  optionsContainer: {
    marginBottom: LAYOUT.spacing.lg,
  },
  optionCard: {
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  optionLabel: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  cancelButton: {
    borderColor: COLORS.border,
  },
  cancelButtonLabel: {
    color: COLORS.textSecondary,
    fontFamily: TYPO.family.medium,
  },
});

export default ExportModal;
