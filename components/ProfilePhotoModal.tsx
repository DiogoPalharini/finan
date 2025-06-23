import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';

const { width } = Dimensions.get('window');

interface ProfilePhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
  onRemovePhoto: () => void;
  onViewPhoto: () => void;
  hasPhoto: boolean;
}

const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromGallery,
  onRemovePhoto,
  onViewPhoto,
  hasPhoto,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            onRemovePhoto();
            onClose();
          }
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      minHeight: 300,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: borderColor,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: textColor,
      textAlign: 'center',
      marginBottom: 30,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${tintColor}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    optionText: {
      fontSize: 16,
      color: textColor,
      flex: 1,
    },
    optionSubtext: {
      fontSize: 12,
      color: useThemeColor({}, 'secondaryText'),
      marginTop: 2,
    },
    cancelButton: {
      marginTop: 20,
      marginHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: `${textColor}10`,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Foto de Perfil</Text>
          
          <TouchableOpacity 
            style={styles.optionContainer}
            onPress={() => {
              onTakePhoto();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="camera" size={20} color={tintColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>Tirar nova foto</Text>
              <Text style={styles.optionSubtext}>Usar a câmera do dispositivo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={borderColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionContainer}
            onPress={() => {
              onChooseFromGallery();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="images" size={20} color={tintColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>Escolher da galeria</Text>
              <Text style={styles.optionSubtext}>Selecionar foto existente</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={borderColor} />
          </TouchableOpacity>

          {hasPhoto && (
            <>
              <TouchableOpacity 
                style={styles.optionContainer}
                onPress={() => {
                  onViewPhoto();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="eye" size={20} color={tintColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionText}>Visualizar foto</Text>
                  <Text style={styles.optionSubtext}>Ver em tamanho maior</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={borderColor} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionContainer}
                onPress={handleRemovePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <Ionicons name="trash" size={20} color="#FF6B6B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionText, { color: '#FF6B6B' }]}>Remover foto</Text>
                  <Text style={styles.optionSubtext}>Excluir foto atual</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={borderColor} />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ProfilePhotoModal; 