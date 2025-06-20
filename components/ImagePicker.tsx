import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Text, ActivityIndicator, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useImagePicker } from '../hooks/useImagePicker';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { isValidImageUri } from '../services/utils/transactionUtils';

const { width } = Dimensions.get('window');

interface ImagePickerProps {
  onImageSelected: (imageUri: string) => void;
  onImageRemoved: () => void;
  currentImage?: string;
  disabled?: boolean;
  label?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onImageRemoved,
  currentImage,
  disabled = false,
  label = 'Adicionar foto do recibo',
}) => {
  const { pickImage, takePhoto, isLoading } = useImagePicker();
  const [showOptions, setShowOptions] = useState(false);

  const handleImageSelection = async (imageUri: string | null) => {
    if (imageUri && isValidImageUri(imageUri)) {
      onImageSelected(imageUri);
    }
  };

  const handlePickFromGallery = async () => {
    setShowOptions(false);
    const imageUri = await pickImage();
    await handleImageSelection(imageUri);
  };

  const handleTakePhoto = async () => {
    setShowOptions(false);
    const imageUri = await takePhoto();
    await handleImageSelection(imageUri);
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: onImageRemoved },
      ]
    );
  };

  const showImageOptions = () => {
    if (disabled) return;
    setShowOptions(true);
  };

  if (currentImage && isValidImageUri(currentImage)) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Surface style={styles.imageContainer} elevation={2}>
          <Image source={{ uri: currentImage }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveImage}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.danger, '#d32f2f']}
              style={styles.removeButtonGradient}
            >
              <Ionicons name="close" size={16} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
          {!disabled && (
            <TouchableOpacity
              style={styles.changeButton}
              onPress={showImageOptions}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.changeButtonGradient}
              >
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Surface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.addButton, disabled && styles.disabledButton]}
        onPress={showImageOptions}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.addButtonText, disabled && styles.disabledText]}>
              Adicionar foto
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolher foto</Text>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.optionButtonGradient}
              >
                <Ionicons name="camera" size={24} color={COLORS.white} />
                <Text style={styles.optionButtonText}>Tirar foto</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                style={styles.optionButtonGradient}
              >
                <Ionicons name="images-outline" size={24} color={COLORS.white} />
                <Text style={styles.optionButtonText}>Escolher da galeria</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: LAYOUT.spacing.md,
  },
  label: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.md,
    minHeight: 80,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: COLORS.textSecondary,
  },
  iconContainer: {
    marginRight: LAYOUT.spacing.sm,
  },
  addButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: LAYOUT.spacing.sm,
    right: LAYOUT.spacing.sm,
    zIndex: 10,
  },
  removeButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButton: {
    position: 'absolute',
    bottom: LAYOUT.spacing.sm,
    right: LAYOUT.spacing.sm,
    zIndex: 10,
  },
  changeButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: LAYOUT.spacing.lg,
    width: width * 0.8,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  optionButton: {
    marginBottom: LAYOUT.spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  optionButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.white,
    marginLeft: LAYOUT.spacing.sm,
  },
  cancelButton: {
    marginTop: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
});

export default ImagePicker; 