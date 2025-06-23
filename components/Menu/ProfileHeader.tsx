import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { User } from 'firebase/auth';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import AvatarComponent from '../Avatar';
import { useProfileImage } from '../../hooks/useProfileImage';

interface ProfileHeaderProps {
  user?: User | null;
  onProfilePress?: () => void;
  onClose?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  onProfilePress,
  onClose
}) => {
  // Hook para gerenciamento de foto de perfil
  const { photoURL, isLoading: photoLoading } = useProfileImage();

  // Debug: log do photoURL no ProfileHeader
  console.log('ProfileHeader - photoURL:', photoURL);
  console.log('ProfileHeader - photoLoading:', photoLoading);

  // Animações
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animar entrada do cabeçalho
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Obter o nome de exibição do usuário
  const getDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    
    if (user?.email) {
      // Retorna a parte antes do @ no email
      return user.email.split('@')[0];
    }
    
    return 'Convidado';
  };

  return (
    <LinearGradient
      colors={[COLORS.secondary, COLORS.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      {onClose && (
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
      
      <Animated.View 
        style={[
          styles.profileSection,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          onPress={onProfilePress}
          activeOpacity={0.9}
          style={styles.avatarContainer}
        >
          <AvatarComponent
            size="large"
            imageUri={photoURL || undefined}
            userName={getDisplayName()}
            loading={photoLoading}
            showEditIcon={true}
            onPress={onProfilePress}
            style={styles.avatar}
          />
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
            {user?.email || 'Sem email'}
          </Text>
          
          {onProfilePress && (
            <TouchableOpacity 
              style={styles.viewProfileButton}
              onPress={onProfilePress}
              activeOpacity={0.8}
            >
              <Text style={styles.viewProfileText}>Ver perfil</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    marginBottom: LAYOUT.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: LAYOUT.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    // backgroundColor: 'rgba(255, 255, 255, 0.2)', // Removido para não ter fundo
  },
  userInfo: {
    marginLeft: LAYOUT.spacing.md,
    flex: 1,
  },
  userName: {
    color: COLORS.white,
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.bold,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    marginBottom: LAYOUT.spacing.sm,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  viewProfileText: {
    color: COLORS.white,
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    marginRight: 4,
  },
});

export default ProfileHeader;
