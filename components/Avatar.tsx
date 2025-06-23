import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import { useProfileImage } from '../hooks/useProfileImage';
import * as FileSystem from 'expo-file-system';

export type AvatarSize = 'small' | 'medium' | 'large' | 'custom';

export interface AvatarProps {
  size?: AvatarSize;
  imageUri?: string;
  userName?: string;
  showBadge?: boolean;
  badgeStatus?: 'online' | 'offline' | 'away' | 'busy';
  onPress?: () => void;
  loading?: boolean;
  customSize?: number;
  showEditIcon?: boolean;
  backgroundColor?: string;
  textColor?: string;
  badgeColor?: string;
  style?: any;
  testID?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'medium',
  imageUri,
  userName = '',
  showBadge = false,
  badgeStatus = 'online',
  onPress,
  loading = false,
  customSize,
  showEditIcon = false,
  backgroundColor,
  textColor,
  badgeColor,
  style,
  testID,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [fileExists, setFileExists] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Hook para obter URI otimizada
  const { getOptimizedPhotoURL } = useProfileImage();

  // Cores do tema
  const defaultBackgroundColor = useThemeColor({}, 'background');
  const defaultTextColor = useThemeColor({}, 'text');
  const defaultBadgeColor = useThemeColor({}, 'tint');
  const tintColor = useThemeColor({}, 'tint');

  // Tamanhos padrão
  const getSize = () => {
    if (customSize) return customSize;
    
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 48;
      case 'large':
        return 80;
      default:
        return 48;
    }
  };

  const avatarSize = getSize();
  const badgeSize = avatarSize * 0.25;
  const editIconSize = avatarSize * 0.3;

  // Obter URI otimizada para o tamanho atual
  const optimizedImageUri = imageUri || getOptimizedPhotoURL(size);

  // Gerar iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Cor do badge baseada no status
  const getBadgeColor = () => {
    if (badgeColor) return badgeColor;
    
    switch (badgeStatus) {
      case 'online':
        return '#4CAF50';
      case 'offline':
        return '#9E9E9E';
      case 'away':
        return '#FF9800';
      case 'busy':
        return '#F44336';
      default:
        return defaultBadgeColor;
    }
  };

  // Estilos dinâmicos
  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: backgroundColor || 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    initials: {
      fontSize: avatarSize * 0.4,
      fontWeight: '600',
      color: textColor || defaultTextColor,
    },
    badge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: badgeSize,
      height: badgeSize,
      borderRadius: badgeSize / 2,
      backgroundColor: getBadgeColor(),
      borderWidth: 2,
      borderColor: defaultBackgroundColor,
    },
    editIcon: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: tintColor,
      borderRadius: editIconSize / 2,
      width: editIconSize,
      height: editIconSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: defaultBackgroundColor,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: avatarSize / 2,
    },
  });

  // Verificar se o arquivo existe quando imageUri mudar
  useEffect(() => {
    const checkFileExists = async () => {
      if (optimizedImageUri && optimizedImageUri.startsWith('file://')) {
        try {
          console.log('Avatar - Verificando se arquivo existe:', optimizedImageUri, 'para tamanho:', avatarSize);
          const fileInfo = await FileSystem.getInfoAsync(optimizedImageUri);
          console.log('Avatar - FileInfo:', fileInfo);
          setFileExists(fileInfo.exists);
          
          if (!fileInfo.exists) {
            console.log('Avatar - Arquivo não existe!');
            setImageError(true);
          } else {
            setImageError(false);
            // Verificar se o arquivo tem conteúdo
            try {
              const fileStats = await FileSystem.getInfoAsync(optimizedImageUri, { size: true });
              console.log('Avatar - Tamanho do arquivo:', (fileStats as any).size, 'bytes');
              if ((fileStats as any).size === 0) {
                console.log('Avatar - Arquivo vazio!');
                setImageError(true);
              }
            } catch (error) {
              console.log('Avatar - Erro ao verificar tamanho do arquivo:', error);
            }
          }
        } catch (error) {
          console.log('Avatar - Erro ao verificar arquivo:', error);
          setImageError(true);
          setFileExists(false);
        }
      } else if (optimizedImageUri) {
        // Para URLs remotas, assumir que existe
        setFileExists(true);
        setImageError(false);
      } else {
        // Sem URI, resetar estados
        setFileExists(false);
        setImageError(false);
      }
    };

    // Resetar estados quando imageUri mudar
    setImageError(false);
    setImageLoading(false);
    setFileExists(false);
    
    checkFileExists();
  }, [optimizedImageUri]);

  // Cleanup timeout quando componente desmontar
  useEffect(() => {
    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, []);

  // Gerenciar timeout de carregamento
  useEffect(() => {
    if (optimizedImageUri && !imageError && fileExists && !imageLoading) {
      // Limpar timeout anterior se existir
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
      
      // Definir timeout de 10 segundos para carregamento
      const timeout = setTimeout(() => {
        console.log('Avatar - Timeout de carregamento atingido');
        setImageError(true);
        setImageLoading(false);
      }, 10000);
      
      setLoadTimeout(timeout);
    }
  }, [optimizedImageUri, imageError, fileExists, imageLoading]);

  // Renderizar conteúdo do avatar
  const renderAvatarContent = useCallback(() => {
    // Reduzir logs para evitar spam
    if (optimizedImageUri && !imageError && fileExists) {
      console.log('Avatar - Renderizando imagem:', optimizedImageUri, 'tamanho:', avatarSize);
      
      return (
        <Image
          key={`${optimizedImageUri}-${avatarSize}`}
          source={{ uri: optimizedImageUri }}
          style={styles.image}
          onLoadStart={() => {
            console.log('Avatar - onLoadStart para tamanho:', avatarSize);
            setImageLoading(true);
          }}
          onLoadEnd={() => {
            console.log('Avatar - onLoadEnd para tamanho:', avatarSize);
            setImageLoading(false);
            // Limpar timeout quando carregar com sucesso
            if (loadTimeout) {
              clearTimeout(loadTimeout);
              setLoadTimeout(null);
            }
          }}
          onError={(error) => {
            console.log('Avatar - onError para tamanho:', avatarSize, 'erro:', error.nativeEvent);
            setImageError(true);
            setImageLoading(false);
            // Limpar timeout quando der erro
            if (loadTimeout) {
              clearTimeout(loadTimeout);
              setLoadTimeout(null);
            }
          }}
          resizeMode="cover"
          fadeDuration={0}
          progressiveRenderingEnabled={false}
        />
      );
    }

    if (loading || imageLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={tintColor} 
          />
        </View>
      );
    }

    // Mostrar iniciais se não há imagem ou se houve erro
    return (
      <Text style={styles.initials}>
        {getInitials(userName)}
      </Text>
    );
  }, [loading, imageLoading, optimizedImageUri, imageError, fileExists, userName, styles, tintColor, size, avatarSize]);

  // Componente base
  const AvatarContent = (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.avatar}>
        {renderAvatarContent()}
      </View>
      
      {showBadge && (
        <View style={styles.badge} />
      )}
      
      {showEditIcon && onPress && (
        <View style={styles.editIcon}>
          <Ionicons 
            name="camera" 
            size={editIconSize * 0.5} 
            color="white" 
          />
        </View>
      )}
    </View>
  );

  // Renderizar com ou sem onPress
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Avatar de ${userName || 'usuário'}. Toque para editar.`}
        accessibilityHint="Toque para editar a foto de perfil"
      >
        {AvatarContent}
      </TouchableOpacity>
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Avatar de ${userName || 'usuário'}`}
    >
      {AvatarContent}
    </View>
  );
};

export default Avatar; 