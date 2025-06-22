import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Switch, Button, Slider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { ImageSettings, DEFAULT_IMAGE_SETTINGS } from '../types/settings';
import settingsService from '../services/settingsService';
import imageProcessingService from '../services/imageProcessingService';
import imageCleanupService from '../services/imageCleanupService';
import { useAuth } from '../contexts/useAuth';

interface ImageSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ImageSettingsModal: React.FC<ImageSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ImageSettings>(DEFAULT_IMAGE_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [storageStats, setStorageStats] = useState({
    totalImages: 0,
    totalSize: 0,
    orphanedImages: 0,
    orphanedSize: 0,
    cacheSize: 0,
  });

  useEffect(() => {
    if (visible) {
      loadSettings();
      loadStorageStats();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const currentSettings = settingsService.getImageSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadStorageStats = async () => {
    if (!user) return;
    
    try {
      const stats = await imageCleanupService.getStorageStats(user.uid);
      setStorageStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const updateSetting = async (key: keyof ImageSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await settingsService.updateImageSettings(newSettings);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar o cache de imagens?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await imageProcessingService.clearCache();
              await loadStorageStats();
              Alert.alert('Sucesso', 'Cache limpo com sucesso!');
            } catch (error) {
              console.error('Erro ao limpar cache:', error);
              Alert.alert('Erro', 'Não foi possível limpar o cache');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCleanupOrphanedImages = async () => {
    if (!user) return;

    Alert.alert(
      'Limpar Imagens Órfãs',
      'Tem certeza que deseja remover imagens não utilizadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await imageCleanupService.cleanupOrphanedImages(user.uid);
              await loadStorageStats();
              
              Alert.alert(
                'Limpeza Concluída',
                `${result.orphanedImages.length} imagens removidas\n${imageCleanupService.formatBytes(result.freedSpace)} liberados`
              );
            } catch (error) {
              console.error('Erro na limpeza:', error);
              Alert.alert('Erro', 'Não foi possível executar a limpeza');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Resetar Configurações',
      'Tem certeza que deseja resetar todas as configurações de imagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.updateImageSettings(DEFAULT_IMAGE_SETTINGS);
              setSettings(DEFAULT_IMAGE_SETTINGS);
              Alert.alert('Sucesso', 'Configurações resetadas!');
            } catch (error) {
              console.error('Erro ao resetar configurações:', error);
              Alert.alert('Erro', 'Não foi possível resetar as configurações');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.background, COLORS.surface]}
          style={styles.background}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Configurações de Imagem</Text>
            <Button
              mode="text"
              onPress={onClose}
              icon="close"
              textColor={COLORS.text}
            >
              Fechar
            </Button>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Processando...</Text>
              </View>
            )}

            {/* Estatísticas de Armazenamento */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Armazenamento</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="images-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.statValue}>{storageStats.totalImages}</Text>
                  <Text style={styles.statLabel}>Imagens</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="hardware-chip-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.statValue}>
                    {imageCleanupService.formatBytes(storageStats.totalSize)}
                  </Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                  <Text style={styles.statValue}>{storageStats.orphanedImages}</Text>
                  <Text style={styles.statLabel}>Órfãs</Text>
                </View>
              </View>
            </View>

            {/* Configurações de Qualidade */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Qualidade da Imagem</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Qualidade</Text>
                  <Text style={styles.settingValue}>{settings.imageQuality}%</Text>
                </View>
                <Slider
                  value={settings.imageQuality}
                  onValueChange={(value) => updateSetting('imageQuality', Math.round(value))}
                  minimumValue={10}
                  maximumValue={100}
                  step={5}
                  style={styles.slider}
                  thumbStyle={{ backgroundColor: COLORS.primary }}
                  trackStyle={{ backgroundColor: COLORS.background }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Tamanho Máximo</Text>
                  <Text style={styles.settingValue}>{settings.maxImageSize}px</Text>
                </View>
                <Slider
                  value={settings.maxImageSize}
                  onValueChange={(value) => updateSetting('maxImageSize', Math.round(value))}
                  minimumValue={512}
                  maximumValue={2048}
                  step={128}
                  style={styles.slider}
                  thumbStyle={{ backgroundColor: COLORS.primary }}
                  trackStyle={{ backgroundColor: COLORS.background }}
                />
              </View>
            </View>

            {/* Configurações Automáticas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configurações Automáticas</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Comprimir Automaticamente</Text>
                  <Text style={styles.settingDescription}>
                    Reduz o tamanho das imagens ao salvar
                  </Text>
                </View>
                <Switch
                  value={settings.autoCompress}
                  onValueChange={(value) => updateSetting('autoCompress', value)}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Salvar na Galeria</Text>
                  <Text style={styles.settingDescription}>
                    Salva automaticamente as fotos na galeria
                  </Text>
                </View>
                <Switch
                  value={settings.autoSaveToGallery}
                  onValueChange={(value) => updateSetting('autoSaveToGallery', value)}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Cache de Imagens</Text>
                  <Text style={styles.settingDescription}>
                    Armazena imagens processadas para melhor performance
                  </Text>
                </View>
                <Switch
                  value={settings.enableImageCache}
                  onValueChange={(value) => updateSetting('enableImageCache', value)}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Limpeza Automática</Text>
                  <Text style={styles.settingDescription}>
                    Remove imagens não utilizadas automaticamente
                  </Text>
                </View>
                <Switch
                  value={settings.autoCleanupOrphanedImages}
                  onValueChange={(value) => updateSetting('autoCleanupOrphanedImages', value)}
                  color={COLORS.primary}
                />
              </View>
            </View>

            {/* Ações */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ações</Text>
              
              <Button
                mode="outlined"
                onPress={handleClearCache}
                icon="delete-sweep"
                style={styles.actionButton}
                textColor={COLORS.primary}
              >
                Limpar Cache ({imageCleanupService.formatBytes(storageStats.cacheSize)})
              </Button>

              <Button
                mode="outlined"
                onPress={handleCleanupOrphanedImages}
                icon="trash-can-outline"
                style={styles.actionButton}
                textColor={COLORS.danger}
                disabled={storageStats.orphanedImages === 0}
              >
                Limpar Imagens Órfãs ({storageStats.orphanedImages})
              </Button>

              <Button
                mode="outlined"
                onPress={handleResetSettings}
                icon="refresh"
                style={styles.actionButton}
                textColor={COLORS.warning}
              >
                Resetar Configurações
              </Button>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingTop: 60,
    paddingBottom: LAYOUT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: LAYOUT.spacing.sm,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  section: {
    marginVertical: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginTop: LAYOUT.spacing.xs,
  },
  statLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.medium,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: LAYOUT.spacing.md,
  },
  settingLabel: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.primary,
    marginTop: 2,
  },
  slider: {
    width: 150,
  },
  actionButton: {
    marginBottom: LAYOUT.spacing.sm,
    borderColor: COLORS.border,
  },
});

export default ImageSettingsModal; 