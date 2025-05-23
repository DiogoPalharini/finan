import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { User } from 'firebase/auth';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface ProfileHeaderProps {
  user: User | null;
  onProfilePress: () => void;
  onClose: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  onProfilePress,
  onClose
}) => {
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
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={24} color={COLORS.white} />
      </TouchableOpacity>
      
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
          <Avatar.Text
            size={70}
            label={getUserInitials()}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={14} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Sem email'}</Text>
          
          <TouchableOpacity 
            style={styles.viewProfileButton}
            onPress={onProfilePress}
            activeOpacity={0.8}
          >
            <Text style={styles.viewProfileText}>Ver perfil</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarLabel: {
    fontSize: 26,
    fontFamily: TYPO.family.bold,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
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
