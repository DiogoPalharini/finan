import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, TextInput, Platform, Alert } from 'react-native';
import { Text, Button, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getProfileStats, UserProfile, saveUserProfile } from '../services/userService';
import EditProfileModal from '../components/EditProfileModal';
import AvatarComponent from '../components/Avatar';
import ProfilePhotoModal from '../components/ProfilePhotoModal';
import ImageViewerModal from '../components/ImageViewerModal';
import FeedbackToast from '../components/FeedbackToast';
import { useProfileImage } from '../hooks/useProfileImage';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState({ goalCount: 0, savingsRate: 0, monthsActive: 0 });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editField, setEditField] = useState<{
    field: string;
    value: string;
    label: string;
  } | null>(null);
  
  // Estados para foto de perfil
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'loading';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  // Hook para gerenciamento de foto de perfil
  const {
    photoURL,
    isLoading: photoLoading,
    isUploading: photoUploading,
    updatePhoto,
    updatePhotoFromUri,
    takePhoto,
    selectFromGallery,
    removePhoto,
    getAvatar,
    refreshPhoto,
    hasPhoto,
    photoError,
    clearError,
  } = useProfileImage();

  // Debug: log do photoURL
  console.log('Profile - photoURL:', photoURL);
  console.log('Profile - photoLoading:', photoLoading);
  console.log('Profile - photoUploading:', photoUploading);
  console.log('Profile - hasPhoto:', hasPhoto);

  // Animações
  const [animation] = useState({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20)
  });

  // Carregar dados do perfil
  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      const profile = await getUserProfile(user.uid);
      setProfileData(profile);
      
      const stats = await getProfileStats(user.uid);
      setProfileStats(stats);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadProfileData();
  }, [user]);

  // Animar entrada dos elementos
  useEffect(() => {
    Animated.parallel([
      Animated.timing(animation.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(animation.translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Mostrar feedback toast
  const showFeedback = (message: string, type: 'success' | 'error' | 'info' | 'loading') => {
    setFeedbackToast({
      visible: true,
      message,
      type,
    });
  };

  // Esconder feedback toast
  const hideFeedback = () => {
    setFeedbackToast(prev => ({ ...prev, visible: false }));
  };

  // Obter as iniciais do nome ou email do usuário
  const getUserInitials = () => {
    if (user?.displayName) {
      const nameParts = user.displayName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.displayName[0].toUpperCase();
    }
    
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    
    return '?';
  };

  // Obter o nome de exibição do usuário
  const getDisplayName = useMemo(() => {
    if (user?.displayName) {
      return user.displayName;
    }
    
    if (profileData?.displayName) {
      return profileData.displayName;
    }
    
    if (user?.email) {
      // Retorna a parte antes do @ no email
      return user.email.split('@')[0];
    }
    
    return 'Convidado';
  }, [user?.displayName, user?.email, profileData?.displayName]);

  // Handlers para foto de perfil
  const handlePhotoPress = () => {
    setPhotoModalVisible(true);
  };

  const handleTakePhoto = async () => {
    try {
      console.log('Iniciando processo de tirar foto...');
      showFeedback('Abrindo câmera...', 'loading');
      await takePhoto();
      console.log('Foto tirada com sucesso');
      showFeedback('Foto atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      showFeedback('Erro ao tirar foto. Tente novamente.', 'error');
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      console.log('Iniciando processo de escolher da galeria...');
      showFeedback('Abrindo galeria...', 'loading');
      await selectFromGallery();
      console.log('Foto escolhida com sucesso');
      showFeedback('Foto atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao escolher foto:', error);
      showFeedback('Erro ao escolher foto. Tente novamente.', 'error');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      showFeedback('Removendo foto...', 'loading');
      await removePhoto();
      showFeedback('Foto removida com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      showFeedback('Erro ao remover foto. Tente novamente.', 'error');
    }
  };

  const handleViewPhoto = () => {
    if (photoURL) {
      setImageViewerVisible(true);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleProfileUpdated = () => {
    loadProfileData();
  };

  const handleEditField = (field: string, value: string, label: string) => {
    setEditField({ field, value, label });
  };

  const handleSaveField = async (newValue: string) => {
    if (!user || !editField) return;
    
    try {
      setIsLoading(true);
      const updates: Partial<UserProfile> = {
        [editField.field]: newValue,
        updatedAt: new Date().toISOString()
      };
      
      await saveUserProfile(user.uid, updates);
      await loadProfileData();
      Alert.alert('Sucesso', 'Informação atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar campo:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a informação.');
    } finally {
      setIsLoading(false);
      setEditField(null);
    }
  };

  const handleNotificationToggle = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Verificar permissões de notificação
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Para receber notificações, você precisa permitir o acesso nas configurações do seu dispositivo.',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Abrir Configurações',
              onPress: () => Linking.openSettings()
            }
          ]
        );
        return;
      }

      // Obter token do dispositivo
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Atualizar preferência de notificações no perfil
      const updates: Partial<UserProfile> = {
        notificationPreference: profileData?.notificationPreference === 'nenhuma' ? 'diaria' : 'nenhuma',
        pushToken: token,
        updatedAt: new Date().toISOString()
      };
      
      await saveUserProfile(user.uid, updates);
      await loadProfileData();
      
      Alert.alert(
        'Sucesso',
        updates.notificationPreference === 'diaria' 
          ? 'Notificações ativadas com sucesso!'
          : 'Notificações desativadas com sucesso!'
      );
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      Alert.alert('Erro', 'Não foi possível atualizar as configurações de notificação.');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar valor de renda mensal
  const formatMonthlyIncome = (value: string | undefined) => {
    if (!value) return 'Não definido';
    
    switch (value) {
      case 'ate_2000': return 'Até R$ 2.000';
      case '2000_5000': return 'R$ 2.000 a R$ 5.000';
      case '5000_10000': return 'R$ 5.000 a R$ 10.000';
      case 'acima_10000': return 'Acima de R$ 10.000';
      default: return value;
    }
  };

  // Formatar objetivo financeiro
  const formatFinancialGoal = (value: string | undefined) => {
    if (!value) return 'Não definido';
    
    switch (value) {
      case 'economizar': return 'Economizar';
      case 'investir': return 'Investir';
      case 'controlar_gastos': return 'Controlar gastos';
      case 'quitar_dividas': return 'Quitar dívidas';
      default: return value;
    }
  };

  // Formatar situação de emprego
  const formatEmploymentStatus = (value: string | undefined) => {
    if (!value) return 'Não definido';
    
    switch (value) {
      case 'clt': return 'CLT';
      case 'autonomo': return 'Autônomo';
      case 'empresario': return 'Empresário';
      case 'estudante': return 'Estudante';
      case 'aposentado': return 'Aposentado';
      default: return value;
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Cabeçalho com gradiente */}
        <LinearGradient
          colors={[COLORS.secondary, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.profileHeader}>
            {/* Avatar com foto de perfil */}
            <TouchableOpacity 
              style={styles.avatarContainer} 
              activeOpacity={0.9}
              onPress={handlePhotoPress}
            >
              <AvatarComponent
                size="large"
                imageUri={photoURL || undefined}
                userName={getDisplayName}
                loading={photoLoading || photoUploading}
                showEditIcon={true}
                onPress={handlePhotoPress}
                style={styles.avatar}
              />
            </TouchableOpacity>
            
            <Text style={styles.userName}>{getDisplayName}</Text>
            <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="middle">
              {user.email}
            </Text>
            
            <TouchableOpacity 
              style={styles.editButton} 
              activeOpacity={0.8}
              onPress={handleEditProfile}
            >
              <Ionicons name="pencil-outline" size={16} color={COLORS.white} />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Estatísticas do usuário */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: animation.opacity,
              transform: [{ translateY: animation.translateY }]
            }
          ]}
        >
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profileStats.goalCount}</Text>
            <Text style={styles.statLabel}>Metas</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profileStats.savingsRate}%</Text>
            <Text style={styles.statLabel}>Economia</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profileStats.monthsActive}</Text>
            <Text style={styles.statLabel}>Meses</Text>
          </View>
        </Animated.View>

        {/* Seção de informações pessoais */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: animation.opacity,
              transform: [{ 
                translateY: Animated.multiply(animation.translateY, 1.2) 
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Informações pessoais</Text>
          
          <View style={styles.infoCard}>
            <ProfileInfoItem 
              icon="person-outline" 
              label="Nome" 
              value={profileData?.displayName || user.displayName || 'Não definido'} 
              isEditable={true}
              onEdit={() => handleEditField('displayName', profileData?.displayName || '', 'Nome')}
            />
            
            <Divider style={styles.itemDivider} />
            
            <ProfileInfoItem 
              icon="mail-outline" 
              label="Email" 
              value={user.email || 'Não definido'} 
            />
            
            <Divider style={styles.itemDivider} />
            
            <ProfileInfoItem 
              icon="call-outline" 
              label="Telefone" 
              value={profileData?.phoneNumber || 'Não definido'} 
              isEditable={true}
              onEdit={() => handleEditField('phoneNumber', profileData?.phoneNumber || '', 'Telefone')}
            />
            
            <Divider style={styles.itemDivider} />
            
            <ProfileInfoItem 
              icon="calendar-outline" 
              label="Data de nascimento" 
              value={profileData?.birthDate || 'Não definido'} 
              isEditable={true}
              onEdit={() => handleEditField('birthDate', profileData?.birthDate || '', 'Data de nascimento')}
            />
          </View>
        </Animated.View>

        {/* Seção de informações financeiras */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: animation.opacity,
              transform: [{ 
                translateY: Animated.multiply(animation.translateY, 1.4) 
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Informações financeiras</Text>
          
          <View style={styles.infoCard}>
            <ProfileInfoItem 
              icon="cash-outline" 
              label="Renda mensal" 
              value={formatMonthlyIncome(profileData?.monthlyIncome)} 
              isEditable={true}
              onEdit={() => handleEditField('monthlyIncome', profileData?.monthlyIncome || '', 'Renda mensal')}
            />
            
            <Divider style={styles.itemDivider} />
            
            <ProfileInfoItem 
              icon="flag-outline" 
              label="Objetivo financeiro" 
              value={formatFinancialGoal(profileData?.financialGoal)} 
              isEditable={true}
              onEdit={() => handleEditField('financialGoal', profileData?.financialGoal || '', 'Objetivo financeiro')}
            />
            
            <Divider style={styles.itemDivider} />
            
            <ProfileInfoItem 
              icon="briefcase-outline" 
              label="Situação de emprego" 
              value={formatEmploymentStatus(profileData?.employmentStatus)} 
              isEditable={true}
              onEdit={() => handleEditField('employmentStatus', profileData?.employmentStatus || '', 'Situação de emprego')}
            />
          </View>
        </Animated.View>

        {/* Seção de configurações */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: animation.opacity,
              transform: [{ 
                translateY: Animated.multiply(animation.translateY, 1.6) 
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <View style={styles.infoCard}>
            <ProfileInfoItem 
              icon="notifications-outline" 
              label="Notificações" 
              value={profileData?.notificationPreference === 'diaria' ? 'Ativadas' : 'Desativadas'} 
              showToggle={true}
              isEnabled={profileData?.notificationPreference === 'diaria'}
              onEdit={handleNotificationToggle}
            />
            
            <Divider style={styles.itemDivider} />
            
            <ProfileInfoItem 
              icon="shield-outline" 
              label="Privacidade" 
              value="Configurações de privacidade" 
              onEdit={() => Alert.alert('Privacidade', 'Configurações de privacidade em desenvolvimento')}
            />
          </View>
        </Animated.View>

        {/* Botão de logout */}
        <Animated.View
          style={[
            styles.logoutContainer,
            {
              opacity: animation.opacity,
              transform: [{ 
                translateY: Animated.multiply(animation.translateY, 1.8) 
              }]
            }
          ]}
        >
          <Button
            mode="outlined"
            onPress={handleLogout}
            loading={isLoading}
            disabled={isLoading}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            icon="logout"
          >
            Sair da conta
          </Button>
        </Animated.View>
      </ScrollView>

      {/* Modal de edição de perfil */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleProfileUpdated}
        currentProfile={profileData}
      />

      {/* Modal de opções de foto */}
      <ProfilePhotoModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
        onRemovePhoto={handleRemovePhoto}
        onViewPhoto={handleViewPhoto}
        hasPhoto={hasPhoto}
      />

      {/* Modal de visualização de imagem */}
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUri={photoURL || ''}
        onClose={() => setImageViewerVisible(false)}
      />

      {/* Feedback toast */}
      <FeedbackToast
        visible={feedbackToast.visible}
        message={feedbackToast.message}
        type={feedbackToast.type}
        onHide={hideFeedback}
        duration={feedbackToast.type === 'loading' ? 0 : 3000}
      />
    </View>
  );
};

interface ProfileInfoItemProps {
  icon: string;
  label: string;
  value: string;
  showToggle?: boolean;
  isEnabled?: boolean;
  isSecure?: boolean;
  onEdit?: () => void;
  isEditable?: boolean;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({ 
  icon, 
  label, 
  value,
  showToggle = false,
  isEnabled: initialEnabled = false,
  isSecure = false,
  onEdit,
  isEditable = false
}) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled || value === 'Ativadas' || value === 'Ativado');
  const [showValue, setShowValue] = useState(!isSecure);
  
  useEffect(() => {
    setIsEnabled(initialEnabled || value === 'Ativadas' || value === 'Ativado');
  }, [initialEnabled, value]);
  
  const handleToggleSecure = () => {
    setShowValue(!showValue);
  };

  const handlePress = () => {
    if (isEditable && onEdit) {
      onEdit();
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.infoItem}
      onPress={handlePress}
      disabled={!isEditable}
    >
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon as any} size={20} color={COLORS.secondary} />
      </View>
      
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text 
          style={styles.infoValue}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {isSecure && !showValue ? '••••••••••' : value}
        </Text>
      </View>
      
      {isSecure ? (
        <TouchableOpacity 
          style={styles.secureButton}
          onPress={handleToggleSecure}
        >
          <Ionicons 
            name={showValue ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={COLORS.textSecondary} 
          />
        </TouchableOpacity>
      ) : showToggle ? (
        <TouchableOpacity 
          style={[styles.toggleButton, isEnabled && styles.toggleButtonActive]}
          onPress={() => setIsEnabled(!isEnabled)}
        >
          <View style={[styles.toggleCircle, isEnabled && styles.toggleCircleActive]} />
        </TouchableOpacity>
      ) : (
        <Ionicons 
          name={isEditable ? "pencil-outline" : "chevron-forward"} 
          size={18} 
          color={isEditable ? COLORS.secondary : COLORS.textSecondary} 
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: LAYOUT.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: LAYOUT.spacing.sm,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    // backgroundColor: 'rgba(255, 255, 255, 0.2)', // Removido para não ter fundo
  },
  avatarLabel: {
    fontSize: 32,
    fontFamily: TYPO.family.bold,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    color: COLORS.white,
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    marginTop: LAYOUT.spacing.md,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    marginTop: LAYOUT.spacing.xs,
    maxWidth: width * 0.8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: LAYOUT.spacing.md,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: LAYOUT.spacing.lg,
    marginTop: -25,
    padding: LAYOUT.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.divider,
  },
  section: {
    marginTop: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: LAYOUT.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.sm,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    color: COLORS.text,
  },
  infoValue: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemDivider: {
    backgroundColor: COLORS.divider,
    marginVertical: LAYOUT.spacing.xs,
  },
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.divider,
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  logoutContainer: {
    marginHorizontal: LAYOUT.spacing.lg,
    marginTop: LAYOUT.spacing.xl,
    borderRadius: 12,
  },
  logoutButton: {
    borderColor: COLORS.danger,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontFamily: TYPO.family.medium,
    fontSize: TYPO.size.md,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: LAYOUT.spacing.md,
  },
  versionText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
  },
  secureButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.divider,
    padding: 2,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: LAYOUT.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  modalInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: LAYOUT.spacing.sm,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default ProfileScreen;
