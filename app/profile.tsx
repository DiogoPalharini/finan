import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, Button, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getProfileStats, UserProfile } from '../services/userService';
import EditProfileModal from '../components/EditProfileModal';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState({ goalCount: 0, savingsRate: 0, monthsActive: 0 });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
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
  const getDisplayName = () => {
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
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.replace('/login');
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
    <ScrollView 
      style={styles.container} 
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
          <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.9}>
            <Avatar.Text
              size={80}
              label={getUserInitials()}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{getDisplayName()}</Text>
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
          />
          
          <Divider style={styles.itemDivider} />
          
          <ProfileInfoItem 
            icon="calendar-outline" 
            label="Data de nascimento" 
            value={profileData?.birthDate || 'Não definido'} 
          />
          
          {profileData?.cpf && (
            <>
              <Divider style={styles.itemDivider} />
              <ProfileInfoItem 
                icon="card-outline" 
                label="CPF" 
                value={profileData.cpf} 
              />
            </>
          )}
        </View>
      </Animated.View>

      {/* Seção de informações financeiras */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: animation.opacity,
            transform: [{ 
              translateY: Animated.multiply(animation.translateY, 1.3) 
            }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Informações financeiras</Text>
        
        <View style={styles.infoCard}>
          <ProfileInfoItem 
            icon="briefcase-outline" 
            label="Profissão" 
            value={profileData?.profession || 'Não definido'} 
          />
          
          <Divider style={styles.itemDivider} />
          
          <ProfileInfoItem 
            icon="business-outline" 
            label="Situação" 
            value={formatEmploymentStatus(profileData?.employmentStatus)} 
          />
          
          <Divider style={styles.itemDivider} />
          
          <ProfileInfoItem 
            icon="cash-outline" 
            label="Renda mensal" 
            value={formatMonthlyIncome(profileData?.monthlyIncome)} 
          />
          
          <Divider style={styles.itemDivider} />
          
          <ProfileInfoItem 
            icon="trending-up-outline" 
            label="Objetivo" 
            value={formatFinancialGoal(profileData?.financialGoal)} 
          />
        </View>
      </Animated.View>

      {/* Seção de preferências */}
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
        <Text style={styles.sectionTitle}>Preferências</Text>
        
        <View style={styles.infoCard}>
          <ProfileInfoItem 
            icon="notifications-outline" 
            label="Notificações" 
            value={profileData?.notificationPreference === 'nenhuma' ? 'Desativadas' : 'Ativadas'} 
            showToggle={true}
            isEnabled={profileData?.notificationPreference !== 'nenhuma'}
          />
          
          <Divider style={styles.itemDivider} />
          
          <ProfileInfoItem 
            icon="moon-outline" 
            label="Tema escuro" 
            value="Desativado" 
            showToggle={true}
          />
          
          <Divider style={styles.itemDivider} />
          
          <ProfileInfoItem 
            icon="globe-outline" 
            label="Moeda" 
            value={profileData?.preferredCurrency || 'BRL (R$)'} 
          />
        </View>
      </Animated.View>

      {/* Botão de logout */}
      <Animated.View
        style={{
          opacity: animation.opacity,
          transform: [{ 
            translateY: Animated.multiply(animation.translateY, 1.6) 
          }]
        }}
      >
        <LinearGradient
          colors={['rgba(215, 38, 61, 0.1)', 'rgba(215, 38, 61, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoutButtonContainer}
        >
          <Button 
            mode="outlined" 
            icon="log-out-outline"
            onPress={handleLogout}
            loading={isLoading}
            disabled={isLoading}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            labelStyle={styles.logoutButtonLabel}
          >
            Sair da conta
          </Button>
        </LinearGradient>
      </Animated.View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Finan v1.0.0</Text>
      </View>
      
      {/* Modal de edição de perfil */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleProfileUpdated}
        currentProfile={profileData}
      />
    </ScrollView>
  );
};

interface ProfileInfoItemProps {
  icon: string;
  label: string;
  value: string;
  showToggle?: boolean;
  isEnabled?: boolean;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({ 
  icon, 
  label, 
  value,
  showToggle = false,
  isEnabled: initialEnabled = false
}) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled || value === 'Ativadas' || value === 'Ativado');
  
  useEffect(() => {
    setIsEnabled(initialEnabled || value === 'Ativadas' || value === 'Ativado');
  }, [initialEnabled, value]);
  
  return (
    <View style={styles.infoItem}>
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
          {value}
        </Text>
      </View>
      
      {showToggle ? (
        <TouchableOpacity 
          style={[styles.toggleButton, isEnabled && styles.toggleButtonActive]}
          onPress={() => setIsEnabled(!isEnabled)}
        >
          <View style={[styles.toggleCircle, isEnabled && styles.toggleCircleActive]} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
  logoutButtonContainer: {
    marginHorizontal: LAYOUT.spacing.lg,
    marginTop: LAYOUT.spacing.xl,
    borderRadius: 12,
  },
  logoutButton: {
    borderColor: COLORS.danger,
    borderRadius: 12,
  },
  logoutButtonContent: {
    height: 50,
  },
  logoutButtonLabel: {
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
});

export default ProfileScreen;
