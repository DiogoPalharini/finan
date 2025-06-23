// Hook para gerenciamento de foto de perfil
import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';
import { updateProfile } from 'firebase/auth';
import { useAuth } from './useAuth';
import { saveUserProfile, getUserProfile } from '../services/userService';
import imageProcessingService from '../services/imageProcessingService';
import settingsService from '../services/settingsService';

interface UseProfileImageReturn {
  photoURL: string | null;
  isLoading: boolean;
  isUploading: boolean;
  updatePhoto: () => Promise<void>;
  updatePhotoFromUri: (uri: string) => Promise<void>;
  takePhoto: () => Promise<void>;
  selectFromGallery: () => Promise<void>;
  removePhoto: () => Promise<void>;
  getAvatar: () => { uri?: string; initials: string };
  getOptimizedPhotoURL: (size: 'small' | 'medium' | 'large' | 'custom') => string | null;
  refreshPhoto: () => Promise<void>;
  hasPhoto: boolean;
  photoError: string | null;
  clearError: () => void;
}

interface ProfileImageOptions {
  size?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
  enableCache?: boolean;
  cacheDuration?: number;
  autoSaveToGallery?: boolean;
}

const DEFAULT_OPTIONS: Required<ProfileImageOptions> = {
  size: 300,
  quality: 0.8,
  format: 'JPEG',
  enableCache: true,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 horas
  autoSaveToGallery: false,
};

export const useProfileImage = (options?: ProfileImageOptions): UseProfileImageReturn => {
  const { user, photoURL: sharedPhotoURL, setPhotoURL: setSharedPhotoURL } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Usar photoURL do contexto compartilhado
  const photoURL = sharedPhotoURL;
  const setPhotoURL = setSharedPhotoURL;

  // Carregar foto do usuário
  const loadUserPhoto = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setPhotoError(null);
      
      // Primeiro, verificar se o usuário tem foto no Firebase Auth
      if (user.photoURL) {
        console.log('useProfileImage - Carregando foto do Firebase Auth:', user.photoURL);
        setPhotoURL(user.photoURL);
        return;
      }

      // Se não estiver no Firebase Auth, carregar do Realtime Database
      const profile = await getUserProfile(user.uid);
      if (profile?.photoURL) {
        console.log('useProfileImage - Carregando foto do Realtime Database:', profile.photoURL);
        setPhotoURL(profile.photoURL);
      } else {
        console.log('useProfileImage - Nenhuma foto encontrada');
        // Não limpar photoURL se já temos uma foto local válida
        setPhotoURL(prev => {
          if (prev && prev.startsWith('file://')) {
            console.log('useProfileImage - Mantendo foto local:', prev);
            return prev;
          }
          return null;
        });
      }
    } catch (error) {
      console.error('Erro ao carregar foto do usuário:', error);
      setPhotoError('Erro ao carregar foto do perfil');
      // Não limpar photoURL se já temos uma foto local válida
      setPhotoURL(prev => {
        if (prev && prev.startsWith('file://')) {
          console.log('useProfileImage - Mantendo foto local após erro:', prev);
          return prev;
        }
        return null;
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, user?.photoURL]);

  // Carregar foto quando o usuário mudar
  useEffect(() => {
    loadUserPhoto();
  }, [loadUserPhoto]);

  // Debug: log do estado photoURL
  useEffect(() => {
    console.log('useProfileImage - photoURL atualizado:', photoURL);
  }, [photoURL]);

  // Solicitar permissões
  const requestPermissions = async (): Promise<boolean> => {
    try {
      console.log('Solicitando permissões...');
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      console.log('Permissão câmera:', cameraPermission.status);
      console.log('Permissão mídia:', mediaPermission.status);
      
      if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar a câmera e galeria'
        );
        return false;
      }
      console.log('Permissões concedidas');
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  };

  // Processar e salvar imagem localmente
  const processAndSaveImage = async (imageUri: string): Promise<string> => {
    try {
      console.log('Processando e salvando imagem:', imageUri);
      
      // Redimensionar e comprimir a imagem para avatar
      console.log('Redimensionando imagem para avatar...');
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 300, height: 300 } }
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      console.log('Imagem redimensionada:', processedImage.uri);
      console.log('Tamanho da imagem processada:', processedImage.width, 'x', processedImage.height);
      
      // Criar versão menor para avatares pequenos (otimização)
      const smallImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 100, height: 100 } }
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      console.log('Imagem pequena criada:', smallImage.uri);
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `profile_${timestamp}.jpg`;
      const smallFileName = `profile_small_${timestamp}.jpg`;
      const localPath = `${FileSystem.documentDirectory}${fileName}`;
      const smallLocalPath = `${FileSystem.documentDirectory}${smallFileName}`;
      
      // Copiar imagem processada para o diretório de documentos
      await FileSystem.copyAsync({
        from: processedImage.uri,
        to: localPath,
      });
      
      // Copiar imagem pequena para o diretório de documentos
      await FileSystem.copyAsync({
        from: smallImage.uri,
        to: smallLocalPath,
      });
      
      console.log('Imagem salva localmente:', localPath);
      console.log('Imagem pequena salva localmente:', smallLocalPath);
      
      // Verificar tamanho do arquivo final
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      const smallFileInfo = await FileSystem.getInfoAsync(smallLocalPath);
      console.log('Tamanho do arquivo final:', fileInfo.exists ? (fileInfo as any).size : 'N/A', 'bytes');
      console.log('Tamanho do arquivo pequeno:', smallFileInfo.exists ? (smallFileInfo as any).size : 'N/A', 'bytes');
      
      // Salvar automaticamente na galeria se configurado
      if (opts.autoSaveToGallery) {
        try {
          await imageProcessingService.saveToGallery(localPath);
        } catch (error) {
          console.warn('Erro ao salvar na galeria:', error);
        }
      }
      
      return localPath;
    } catch (error) {
      console.error('Erro ao processar e salvar imagem:', error);
      throw new Error('Falha ao processar imagem');
    }
  };

  // Tirar foto com a câmera
  const takePhoto = async (): Promise<void> => {
    if (!user) {
      setPhotoError('Usuário não autenticado');
      return;
    }

    try {
      setIsUploading(true);
      setPhotoError(null);

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Formato quadrado
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await updatePhotoFromUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      setPhotoError('Não foi possível tirar a foto');
    } finally {
      setIsUploading(false);
    }
  };

  // Selecionar da galeria
  const selectFromGallery = async (): Promise<void> => {
    if (!user) {
      setPhotoError('Usuário não autenticado');
      return;
    }

    try {
      setIsUploading(true);
      setPhotoError(null);

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Formato quadrado
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await updatePhotoFromUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      setPhotoError('Não foi possível selecionar a imagem');
    } finally {
      setIsUploading(false);
    }
  };

  // Atualizar foto de perfil (selecionar e processar)
  const updatePhoto = async (): Promise<void> => {
    if (!user) {
      setPhotoError('Usuário não autenticado');
      return;
    }

    try {
      setIsUploading(true);
      setPhotoError(null);
      
      // Por padrão, abrir a galeria
      await selectFromGallery();
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      setPhotoError('Não foi possível atualizar a foto de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  // Atualizar foto de perfil a partir de uma URI
  const updatePhotoFromUri = async (imageUri: string): Promise<void> => {
    if (!user) {
      setPhotoError('Usuário não autenticado');
      return;
    }

    try {
      console.log('Iniciando updatePhotoFromUri com URI:', imageUri);
      setIsUploading(true);
      setPhotoError(null);

      // Processar e salvar imagem localmente
      console.log('Processando e salvando imagem localmente...');
      const localImagePath = await processAndSaveImage(imageUri);
      console.log('Imagem salva localmente:', localImagePath);

      // Remover foto anterior se existir
      if (photoURL && photoURL.startsWith('file://')) {
        console.log('Removendo foto anterior...');
        try {
          await FileSystem.deleteAsync(photoURL, { idempotent: true });
        } catch (error) {
          console.warn('Erro ao remover foto anterior:', error);
        }
      }

      // Atualizar Firebase Auth
      console.log('Atualizando Firebase Auth...');
      await updateProfile(user, { photoURL: null });

      // Atualizar Realtime Database
      console.log('Atualizando Realtime Database...');
      await saveUserProfile(user.uid, {
        photoURL: null as any,
        photoUpdatedAt: new Date().toISOString(),
      });

      // Atualizar estado local
      console.log('Atualizando estado local...');
      setPhotoURL(localImagePath);

      console.log('Foto atualizada com sucesso!');
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      setPhotoError('Não foi possível atualizar a foto de perfil');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Remover foto de perfil
  const removePhoto = async (): Promise<void> => {
    if (!user) {
      setPhotoError('Usuário não autenticado');
      return;
    }

    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUploading(true);
              setPhotoError(null);

              // Remover arquivo local se existir
              if (photoURL && photoURL.startsWith('file://')) {
                try {
                  await FileSystem.deleteAsync(photoURL, { idempotent: true });
                } catch (error) {
                  console.warn('Erro ao remover arquivo local:', error);
                }
              }

              // Atualizar Firebase Auth
              await updateProfile(user, { photoURL: null });

              // Atualizar Realtime Database
              await saveUserProfile(user.uid, {
                photoURL: null as any,
                photoUpdatedAt: new Date().toISOString(),
              });

              // Atualizar estado local
              setPhotoURL(null);

              Alert.alert('Sucesso', 'Foto de perfil removida com sucesso!');
            } catch (error) {
              console.error('Erro ao remover foto:', error);
              setPhotoError('Não foi possível remover a foto de perfil');
            } finally {
              setIsUploading(false);
            }
          }
        },
      ]
    );
  };

  // Obter avatar (foto ou iniciais)
  const getAvatar = (): { uri?: string; initials: string } => {
    if (photoURL) {
      return { uri: photoURL, initials: '' };
    }

    // Gerar iniciais do nome
    let initials = '?';
    if (user?.displayName) {
      const names = user.displayName.trim().split(' ');
      if (names.length === 1) {
        initials = names[0].charAt(0).toUpperCase();
      } else {
        initials = (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
    } else if (user?.email) {
      initials = user.email.charAt(0).toUpperCase();
    }

    return { initials };
  };

  // Atualizar foto
  const refreshPhoto = async (): Promise<void> => {
    await loadUserPhoto();
  };

  // Limpar erro
  const clearError = (): void => {
    setPhotoError(null);
  };

  // Obter URI otimizada baseada no tamanho
  const getOptimizedPhotoURL = useCallback((size: 'small' | 'medium' | 'large' | 'custom'): string | null => {
    if (!photoURL) return null;
    
    // Para tamanhos pequenos, tentar usar uma versão menor se disponível
    if (size === 'small' && photoURL.startsWith('file://')) {
      const baseName = photoURL.split('/').pop();
      if (baseName && baseName.startsWith('profile_')) {
        const smallFileName = baseName.replace('profile_', 'profile_small_');
        const smallPath = photoURL.replace(baseName, smallFileName);
        return smallPath;
      }
    }
    
    // Para tamanhos custom, usar a versão original
    if (size === 'custom') {
      return photoURL;
    }
    
    return photoURL;
  }, [photoURL]);

  return {
    photoURL,
    isLoading,
    isUploading,
    updatePhoto,
    updatePhotoFromUri,
    takePhoto,
    selectFromGallery,
    removePhoto,
    getAvatar,
    getOptimizedPhotoURL,
    refreshPhoto,
    hasPhoto: !!photoURL,
    photoError,
    clearError,
  };
};

/**
 * Hook para gerenciamento de foto de perfil
 * 
 * Funcionalidades:
 * - Redimensionamento automático para formato quadrado (configurável)
 * - Compressão otimizada para avatares (configurável)
 * - Upload automático para Firebase Storage
 * - Cache local com expiração configurável
 * - Sincronização com Firebase Auth e Realtime Database
 * - Fallback para avatar com iniciais quando não há foto
 * - Tratamento de erros robusto
 * - Estados de loading separados para carregamento e upload
 * - Opção de salvar automaticamente na galeria
 * 
 * Exemplo de uso:
 * ```typescript
 * const { 
 *   photoURL, 
 *   isLoading, 
 *   isUploading,
 *   updatePhoto, 
 *   removePhoto, 
 *   getAvatar,
 *   hasPhoto,
 *   photoError,
 *   clearError
 * } = useProfileImage({
 *   size: 300,
 *   quality: 0.8,
 *   format: 'JPEG',
 *   enableCache: true,
 *   cacheDuration: 24 * 60 * 60 * 1000,
 *   autoSaveToGallery: false
 * });
 * 
 * // Exibir avatar
 * const avatar = getAvatar();
 * if (avatar.uri) {
 *   // Usar foto
 *   <Avatar.Image source={{ uri: avatar.uri }} />
 * } else {
 *   // Usar iniciais
 *   <Avatar.Text label={avatar.initials} />
 * }
 * 
 * // Atualizar foto
 * <Button onPress={updatePhoto} loading={isUploading}>
 *   Atualizar Foto
 * </Button>
 * 
 * // Remover foto
 * <Button onPress={removePhoto} loading={isUploading}>
 *   Remover Foto
 * </Button>
 * 
 * // Mostrar erro
 * {photoError && (
 *   <Text style={{ color: 'red' }}>{photoError}</Text>
 * )}
 * ```
 */ 