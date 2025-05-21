// components/DeleteConfirmationModal.tsx
import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { TYPO } from '../src/styles/typography';
import { LAYOUT } from '../src/styles/layout';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  itemType: 'income' | 'expense';
  itemDescription: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading,
  itemType,
  itemDescription
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.confirmModalOverlay}>
        <View style={styles.confirmModalContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={48} 
            color={COLORS.danger} 
            style={styles.confirmModalIcon}
          />
          
          <Text style={styles.confirmModalTitle}>Confirmar Exclusão</Text>
          
          <Text style={styles.confirmModalText}>
            Tem certeza que deseja excluir {itemType === 'income' ? 'a receita' : 'a despesa'}{' '}
            <Text style={styles.confirmModalHighlight}>
              {itemDescription}
            </Text>?
          </Text>
          
          <Text style={styles.confirmModalSubtext}>
            Esta ação não pode ser desfeita.
          </Text>
          
          <View style={styles.confirmModalButtons}>
            <Button 
              mode="outlined" 
              onPress={onClose}
              style={styles.confirmCancelButton}
            >
              Cancelar
            </Button>
            
            <Button 
              mode="contained" 
              onPress={onConfirm}
              style={styles.confirmDeleteButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Excluir
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.radius.large,
    padding: LAYOUT.spacing.lg,
    width: '80%',
    alignItems: 'center',
  },
  confirmModalIcon: {
    marginBottom: LAYOUT.spacing.md,
  },
  confirmModalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  confirmModalText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  confirmModalHighlight: {
    fontFamily: TYPO.family.semibold,
  },
  confirmModalSubtext: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    marginRight: LAYOUT.spacing.sm,
    borderColor: COLORS.border,
  },
  confirmDeleteButton: {
    flex: 1,
    marginLeft: LAYOUT.spacing.sm,
    backgroundColor: COLORS.danger,
  },
});

export default DeleteConfirmationModal;
