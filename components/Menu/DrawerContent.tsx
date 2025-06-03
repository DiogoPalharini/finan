import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';
import ProfileHeader from './ProfileHeader';
import MenuItem from './MenuItem';
import { User } from 'firebase/auth';

const { width } = Dimensions.get('window');

interface DrawerContentProps {
  user: User | null;
  navigateTo: (path: string) => void;
  handleLogout: () => void;
  closeDrawer: () => void;
  currentRoute?: string;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ 
  user, 
  navigateTo, 
  handleLogout, 
  closeDrawer,
  currentRoute = '/'
}) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [menuItems] = React.useState([
    {
      key: 'home',
      label: 'Início',
      icon: 'home-outline',
      route: '/HomeScreen',
      active: currentRoute === '/HomeScreen',
    },
    {
      key: 'recorrencias',
      label: 'Recorrências',
      icon: 'repeat-outline',
      route: '/recorrencias',
      active: currentRoute === '/recorrencias',
    },
    {
      key: 'charts',
      label: 'Gráficos',
      icon: 'bar-chart-outline',
      route: '/ChartsScreen',
      active: currentRoute === '/charts',
    },
    {
      key: 'goals',
      label: 'Metas',
      icon: 'flag-outline',
      route: '/goals',
      active: currentRoute === '/goals',
    },
    {
      key: 'budget',
      label: 'Planejamento',
      icon: 'wallet-outline',
      route: '/budget',
      active: currentRoute === '/budget',
    },
    {
      key: 'reports',
      label: 'Relatórios',
      icon: 'document-text-outline',
      route: '/reports',
      active: currentRoute === '/reports',
    },
  ]);

  const [settingsItems] = React.useState([
    {
      key: 'profile',
      label: 'Perfil',
      icon: 'person-outline',
      route: '/profile',
      active: currentRoute === '/profile',
    },
    {
      key: 'settings',
      label: 'Config.',
      icon: 'settings-outline',
      route: '/settings',
      active: currentRoute === '/settings',
    },
    {
      key: 'help',
      label: 'Ajuda',
      icon: 'help-circle-outline',
      route: '/help',
      active: currentRoute === '/help',
    },
  ]);

  const handleProfilePress = () => {
    navigateTo('/profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={closeDrawer}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <ProfileHeader 
          user={user} 
          onProfilePress={handleProfilePress}
        />
        
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Menu Principal</Text>
          
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={item.active}
              onPress={() => navigateTo(item.route)}
              index={index}
            />
          ))}
          
          <View style={styles.divider} />
          
          <Text style={styles.menuSectionTitle}>Configurações</Text>
          
          {settingsItems.map((item, index) => (
            <MenuItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={item.active}
              onPress={() => navigateTo(item.route)}
              index={menuItems.length + index}
            />
          ))}
          
          <View style={styles.spacer} />
        </View>
      </Animated.ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Sair</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Finan v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingRight: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  menuContainer: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingTop: LAYOUT.spacing.md,
  },
  menuSectionTitle: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.medium,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.sm,
    marginLeft: LAYOUT.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: LAYOUT.spacing.md,
  },
  spacer: {
    height: 60,
  },
  footer: {
    padding: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  logoutButton: {
    borderRadius: LAYOUT.radius.large,
    overflow: 'hidden',
    marginBottom: LAYOUT.spacing.md,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    marginLeft: LAYOUT.spacing.sm,
  },
  versionText: {
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default DrawerContent;
