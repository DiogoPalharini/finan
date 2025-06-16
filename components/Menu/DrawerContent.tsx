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
      isActive: currentRoute === '/HomeScreen',
    },
    {
      key: 'recorrencias',
      label: 'Recorrências',
      icon: 'repeat-outline',
      route: '/recorrencias',
      isActive: currentRoute === '/recorrencias',
    },
    {
      key: 'charts',
      label: 'Gráficos',
      icon: 'bar-chart-outline',
      route: '/ChartsScreen',
      isActive: currentRoute === '/charts',
    },
    {
      key: 'goals',
      label: 'Metas',
      icon: 'flag-outline',
      route: '/goals',
      isActive: currentRoute === '/goals',
    },
    {
      key: 'budget',
      label: 'Planejamento',
      icon: 'wallet-outline',
      route: '/budget',
      isActive: currentRoute === '/budget',
    },
  ]);

  const [helpItems] = React.useState([
    {
      key: 'help',
      label: 'Ajuda',
      icon: 'help-circle-outline',
      route: '/help',
      isActive: currentRoute === '/help',
    },
  ]);

  const handleProfilePress = () => {
    navigateTo('/profile');
  };

  return (
    <View style={styles.container}>
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
          
          {menuItems.map((item) => (
            <MenuItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
              onPress={() => navigateTo(item.route)}
            />
          ))}
          
          <View style={styles.divider} />
          
          <Text style={styles.menuSectionTitle}>Suporte</Text>
          
          {helpItems.map((item) => (
            <MenuItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
              onPress={() => navigateTo(item.route)}
            />
          ))}
        </View>
        
        <View style={styles.spacer} />
        
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
      </Animated.ScrollView>
    </View>
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
  logoutButton: {
    marginHorizontal: LAYOUT.spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    marginLeft: LAYOUT.spacing.sm,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPO.size.xs,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.md,
  },
});

export default DrawerContent;
