import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import imageProcessingService from '../services/imageProcessingService';
import settingsService from '../services/settingsService';

interface UseImagePickerReturn {
  imageUri: string | null;
  isLoading: boolean;
  pickImage: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
  removeImage: () => void;
  replaceImage: (onImageUpdate?: (newUri: string) => void) => Promise<void>;
}

export const useImagePicker = (initialUri?: string): UseImagePickerReturn => {
  const [imageUri, setImageUri] = useState<string | null>(initialUri || null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      // Solicitar permissão da câmera
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar a câmera'
        );
        return false;
      }

      // Solicitar permissão da galeria
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (mediaPermission.status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar a galeria'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  };

  const processAndSetImage = async (uri: string, onImageUpdate?: (newUri: string) => void): Promise<string> => {
    try {
      setIsLoading(true);
      console.log('Processando imagem:', uri);
      
      // Obter configurações de imagem
      const imageSettings = settingsService.getImageSettings();
      
      // Processar imagem (comprimir e redimensionar)
      const processedImage = await imageProcessingService.processImage(uri);
      console.log('Imagem processada:', processedImage.uri);
      
      // Salvar automaticamente na galeria se configurado
      if (imageSettings.autoSaveToGallery) {
        try {
          await imageProcessingService.saveToGallery(processedImage.uri);
        } catch (error) {
          console.warn('Erro ao salvar na galeria:', error);
        }
      }
      
      setImageUri(processedImage.uri);
      
      // Chamar callback se fornecido
      if (onImageUpdate) {
        onImageUpdate(processedImage.uri);
      }

      return processedImage.uri;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem');
      return uri; // Retornar URI original em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (): Promise<string | null> => {
    try {
      console.log('Iniciando seleção de imagem da galeria');
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1, // Qualidade máxima para processamento posterior
      });

      console.log('Resultado da seleção:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Imagem selecionada:', result.assets[0].uri);
        const processedUri = await processAndSetImage(result.assets[0].uri);
        return processedUri;
      }
      return null;
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
      return null;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      console.log('Iniciando captura de foto');
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1, // Qualidade máxima para processamento posterior
      });

      console.log('Resultado da captura:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Foto capturada:', result.assets[0].uri);
        const processedUri = await processAndSetImage(result.assets[0].uri);
        return processedUri;
      }
      return null;
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
      return null;
    }
  };

  const removeImage = (): void => {
    setImageUri(null);
  };

  const replaceImage = async (onImageUpdate?: (newUri: string) => void): Promise<void> => {
    Alert.alert(
      'Substituir Imagem',
      'Como você gostaria de substituir a imagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Tirar Foto', 
          onPress: async () => {
            try {
              const hasPermission = await requestPermissions();
              if (!hasPermission) return;

              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });

              if (!result.canceled && result.assets[0]) {
                await processAndSetImage(result.assets[0].uri, onImageUpdate);
              }
            } catch (error) {
              console.error('Erro ao tirar foto:', error);
              Alert.alert('Erro', 'Não foi possível tirar a foto');
            }
          }
        },
        { 
          text: 'Escolher da Galeria', 
          onPress: async () => {
            try {
              const hasPermission = await requestPermissions();
              if (!hasPermission) return;

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });

              if (!result.canceled && result.assets[0]) {
                await processAndSetImage(result.assets[0].uri, onImageUpdate);
              }
            } catch (error) {
              console.error('Erro ao selecionar imagem:', error);
              Alert.alert('Erro', 'Não foi possível selecionar a imagem');
            }
          }
        },
      ]
    );
  };

  return {
    imageUri,
    isLoading,
    pickImage,
    takePhoto,
    removeImage,
    replaceImage,
  };
}; 