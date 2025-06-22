import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { useImagePicker } from '../hooks/useImagePicker';

const { width, height } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onImageUpdate?: (newUri: string) => void;
  onImageRemove?: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  imageUri,
  onClose,
  onImageUpdate,
  onImageRemove,
}) => {
  const [currentImageUri, setCurrentImageUri] = useState(imageUri);
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar URI quando a prop mudar
  React.useEffect(() => {
    setCurrentImageUri(imageUri);
  }, [imageUri]);

  const handleShare = async () => {
    try {
      console.log('Iniciando compartilhamento da imagem:', currentImageUri);
      
      // Para compartilhamento, precisamos de uma URL válida
      let shareUrl = currentImageUri;
      
      // Se for uma URI local, tentar criar um link compartilhável
      if (currentImageUri.startsWith('file://')) {
        // Para URIs locais, usar a URI diretamente
        shareUrl = currentImageUri;
        console.log('Compartilhando URI local:', shareUrl);
      } else if (currentImageUri.startsWith('content://')) {
        // Para URIs de conteúdo, tentar copiar para um local temporário
        const tempFileName = `share_${Date.now()}.jpg`;
        const tempUri = `${FileSystem.cacheDirectory}${tempFileName}`;
        
        console.log('Copiando URI de conteúdo para:', tempUri);
        
        try {
          await FileSystem.copyAsync({
            from: currentImageUri,
            to: tempUri,
          });
          shareUrl = tempUri;
          console.log('Arquivo copiado com sucesso para compartilhamento');
        } catch (error) {
          console.error('Erro ao copiar arquivo para compartilhamento:', error);
          Alert.alert('Erro', 'Não foi possível preparar a imagem para compartilhamento');
          return;
        }
      } else if (currentImageUri.startsWith('http://') || currentImageUri.startsWith('https://')) {
        // Para URLs remotas, usar diretamente
        shareUrl = currentImageUri;
        console.log('Compartilhando URL remota:', shareUrl);
      } else {
        console.error('Tipo de URI não suportado para compartilhamento:', currentImageUri);
        Alert.alert('Erro', 'Tipo de imagem não suportado para compartilhamento');
        return;
      }

      console.log('Tentando compartilhar:', shareUrl);
      
      // Tentar compartilhar com diferentes abordagens
      try {
        const result = await Share.share({
          url: shareUrl,
          message: 'Compartilhando imagem do recibo',
          title: 'Recibo',
        });

        if (result.action === Share.sharedAction) {
          console.log('Imagem compartilhada com sucesso');
          Alert.alert('Sucesso', 'Imagem compartilhada!');
        } else if (result.action === Share.dismissedAction) {
          console.log('Compartilhamento cancelado pelo usuário');
        }
      } catch (shareError) {
        console.error('Erro no Share.share:', shareError);
        
        // Fallback: tentar compartilhar apenas a mensagem
        try {
          const result = await Share.share({
            message: 'Compartilhando imagem do recibo',
            title: 'Recibo',
          });
          
          if (result.action === Share.sharedAction) {
            console.log('Mensagem compartilhada com sucesso');
            Alert.alert('Sucesso', 'Mensagem compartilhada!');
          }
        } catch (fallbackError) {
          console.error('Erro no fallback de compartilhamento:', fallbackError);
          Alert.alert('Erro', 'Não foi possível compartilhar a imagem. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a imagem. Tente novamente.');
    }
  };

  const handleSaveToGallery = async () => {
    try {
      // Solicitar permissão para salvar na galeria
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para salvar imagens na galeria'
        );
        return;
      }

      // Se a URI for local, salvar diretamente
      if (currentImageUri.startsWith('file://') || currentImageUri.startsWith('content://')) {
        await MediaLibrary.saveToLibraryAsync(currentImageUri);
        Alert.alert('Sucesso', 'Imagem salva na galeria!');
        return;
      }

      // Se for uma URL remota, baixar primeiro
      if (currentImageUri.startsWith('http://') || currentImageUri.startsWith('https://')) {
        const fileName = `recibo_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        const downloadResult = await FileSystem.downloadAsync(currentImageUri, fileUri);
        
        if (downloadResult.status === 200) {
          await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
          Alert.alert('Sucesso', 'Imagem salva na galeria!');
        } else {
          throw new Error('Falha ao baixar imagem');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar na galeria:', error);
      Alert.alert('Erro', 'Não foi possível salvar a imagem na galeria');
    }
  };

  const handleReplaceImage = async () => {
    if (!onImageUpdate) {
      Alert.alert('Erro', 'Função de atualização não disponível');
      return;
    }

    try {
      setIsLoading(true);
      
      // Solicitar permissões
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera e galeria');
        return;
      }

      Alert.alert(
        'Substituir Imagem',
        'Como você gostaria de substituir a imagem?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Tirar Foto', 
            onPress: async () => {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 1,
                });

                if (!result.canceled && result.assets[0]) {
                  console.log('Nova foto capturada:', result.assets[0].uri);
                  setCurrentImageUri(result.assets[0].uri);
                  onImageUpdate(result.assets[0].uri);
                }
              } catch (error) {
                console.error('Erro ao tirar foto:', error);
                Alert.alert('Erro', 'Não foi possível tirar a foto');
              } finally {
                setIsLoading(false);
              }
            }
          },
          { 
            text: 'Escolher da Galeria', 
            onPress: async () => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 1,
                });

                if (!result.canceled && result.assets[0]) {
                  console.log('Nova imagem selecionada:', result.assets[0].uri);
                  setCurrentImageUri(result.assets[0].uri);
                  onImageUpdate(result.assets[0].uri);
                }
              } catch (error) {
                console.error('Erro ao selecionar imagem:', error);
                Alert.alert('Erro', 'Não foi possível selecionar a imagem');
              } finally {
                setIsLoading(false);
              }
            }
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao substituir imagem:', error);
      Alert.alert('Erro', 'Não foi possível substituir a imagem');
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!onImageRemove) {
      Alert.alert('Erro', 'Função de remoção não disponível');
      return;
    }

    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive', 
          onPress: () => {
            console.log('Removendo imagem:', currentImageUri);
            onImageRemove();
            onClose();
          }
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.background}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Foto do Recibo</Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSaveToGallery}
                activeOpacity={0.7}
              >
                <Ionicons name="download-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>

              {onImageUpdate && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleReplaceImage}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Ionicons name="create-outline" size={20} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImageUri }}
              style={styles.image}
              resizeMode="contain"
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Processando...</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.danger, '#d32f2f']}
                style={styles.deleteButtonGradient}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                <Text style={styles.deleteButtonText}>Remover</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: LAYOUT.spacing.sm,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  image: {
    width: width - LAYOUT.spacing.lg * 2,
    height: height * 0.6,
    borderRadius: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
  },
  footer: {
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  deleteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    marginLeft: LAYOUT.spacing.sm,
  },
});

export default ImageViewerModal; 