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
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

interface ImagePickerProps {
  onImageSelected: (imageUri: string) => void;
  onImageRemoved: () => void;
  currentImage?: string;
  disabled?: boolean;
  label?: string;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onImageRemoved,
  currentImage,
  disabled = false,
  label = 'Adicionar foto do recibo',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera e galeria');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  };

  const handleImageSelection = async (imageUri: string | null) => {
    console.log('handleImageSelection chamado com:', imageUri);
    if (imageUri) {
      console.log('URI válida, chamando onImageSelected');
      onImageSelected(imageUri);
    } else {
      console.log('URI nula');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      console.log('handlePickFromGallery iniciado');
      setShowOptions(false);
      setIsLoading(true);
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Resultado da seleção:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Imagem selecionada:', result.assets[0].uri);
        await handleImageSelection(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      console.log('handleTakePhoto iniciado');
      setShowOptions(false);
      setIsLoading(true);
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Resultado da captura:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Foto capturada:', result.assets[0].uri);
        await handleImageSelection(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    } finally {
      setIsLoading(false);
    }
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

  if (currentImage) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentImage }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveImage}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View style={styles.removeButtonBackground}>
              <Ionicons name="close" size={16} color="white" />
            </View>
          </TouchableOpacity>
          {!disabled && (
            <TouchableOpacity
              style={styles.changeButton}
              onPress={showImageOptions}
              activeOpacity={0.7}
            >
              <View style={styles.changeButtonBackground}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
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
          <ActivityIndicator size="small" color="#0052CC" />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="camera-outline" size={24} color="#0052CC" />
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
              <View style={styles.optionButtonBackground}>
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.optionButtonText}>Tirar foto</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
            >
              <View style={styles.optionButtonBackground}>
                <Ionicons name="images-outline" size={24} color="white" />
                <Text style={styles.optionButtonText}>Escolher da galeria</Text>
              </View>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#333',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 80,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  iconContainer: {
    marginRight: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  removeButtonBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D7263D',
  },
  changeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 10,
  },
  changeButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0052CC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: width * 0.8,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButtonBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0052CC',
  },
  optionButtonText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: '#fff',
    marginLeft: 10,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: '#ccc',
  },
});

export default ImagePickerComponent; 