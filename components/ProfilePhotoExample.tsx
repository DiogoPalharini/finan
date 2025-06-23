import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useProfileImage } from '../hooks/useProfileImage';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';

/**
 * Componente de exemplo que demonstra como usar o hook useProfileImage
 * 
 * Este componente mostra:
 * - Como exibir avatar com foto ou fallback
 * - Como atualizar foto de perfil
 * - Como remover foto de perfil
 * - Como lidar com estados de loading
 * - Como exibir erros
 */
const ProfilePhotoExample: React.FC = () => {
  const {
    photoURL,
    isLoading,
    isUploading,
    updatePhoto,
    removePhoto,
    getAvatar,
    hasPhoto,
    photoError,
    clearError,
  } = useProfileImage({
    size: 300,
    quality: 0.8,
    format: 'JPEG',
    enableCache: true,
    cacheDuration: 24 * 60 * 60 * 1000, // 24 horas
    autoSaveToGallery: false,
  });

  // Obter dados do avatar (foto ou iniciais)
  const avatar = getAvatar();

  const handleUpdatePhoto = async () => {
    try {
      await updatePhoto();
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removePhoto();
    } catch (error) {
      console.error('Erro ao remover foto:', error);
    }
  };

  const handleErrorPress = () => {
    if (photoError) {
      Alert.alert('Erro', photoError, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo de Foto de Perfil</Text>
      
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleUpdatePhoto}
            disabled={isUploading}
          >
            {avatar.uri ? (
              // Exibir foto
              <Avatar.Image
                size={120}
                source={{ uri: avatar.uri }}
                style={styles.avatar}
              />
            ) : (
              // Exibir iniciais
              <Avatar.Text
                size={120}
                label={avatar.initials}
                style={[styles.avatar, styles.avatarFallback]}
                labelStyle={styles.avatarLabel}
              />
            )}
            
            {/* Ícone de edição */}
            <View style={styles.editIcon}>
              <Ionicons
                name="camera"
                size={20}
                color={COLORS.white}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Status da foto */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {hasPhoto ? 'Foto de perfil definida' : 'Nenhuma foto de perfil'}
        </Text>
        {photoURL && (
          <Text style={styles.photoUrl} numberOfLines={1}>
            {photoURL}
          </Text>
        )}
      </View>

      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleUpdatePhoto}
          loading={isUploading}
          disabled={isUploading}
          style={styles.button}
          icon="camera"
        >
          {hasPhoto ? 'Alterar Foto' : 'Adicionar Foto'}
        </Button>

        {hasPhoto && (
          <Button
            mode="outlined"
            onPress={handleRemovePhoto}
            loading={isUploading}
            disabled={isUploading}
            style={[styles.button, styles.removeButton]}
            icon="trash"
            buttonColor={COLORS.danger}
          >
            Remover Foto
          </Button>
        )}
      </View>

      {/* Exibição de erro */}
      {photoError && (
        <TouchableOpacity
          style={styles.errorContainer}
          onPress={handleErrorPress}
        >
          <Ionicons name="warning" size={16} color={COLORS.danger} />
          <Text style={styles.errorText}>{photoError}</Text>
          <Ionicons name="close" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      )}

      {/* Informações de debug */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Informações de Debug:</Text>
        <Text style={styles.debugText}>Loading: {isLoading ? 'Sim' : 'Não'}</Text>
        <Text style={styles.debugText}>Uploading: {isUploading ? 'Sim' : 'Não'}</Text>
        <Text style={styles.debugText}>Tem Foto: {hasPhoto ? 'Sim' : 'Não'}</Text>
        <Text style={styles.debugText}>Iniciais: {avatar.initials}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: LAYOUT.spacing.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
  },
  loadingText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.xs,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
  },
  avatarLabel: {
    fontSize: 48,
    fontFamily: TYPO.family.bold,
    color: COLORS.white,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  statusText: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  photoUrl: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    maxWidth: '100%',
  },
  buttonContainer: {
    gap: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.lg,
  },
  button: {
    borderRadius: LAYOUT.radius.small,
  },
  removeButton: {
    borderColor: COLORS.danger,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(215, 38, 61, 0.1)',
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.small,
    marginBottom: LAYOUT.spacing.lg,
    gap: LAYOUT.spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.danger,
  },
  debugContainer: {
    backgroundColor: COLORS.surface,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  debugTitle: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.xs,
  },
  debugText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
});

export default ProfilePhotoExample; 