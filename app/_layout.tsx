import React from 'react';
import { Dimensions, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  Provider as PaperProvider,
  Modal,
  Portal,
  Text,
  Avatar,
  Divider,
  Appbar,
  Icon,
} from 'react-native-paper';
import { auth } from '../config/firebaseConfig';
import type { User } from 'firebase/auth';
import { COLORS, LAYOUT, TYPO } from '../src/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const user = auth.currentUser as User | null;
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  const isAuthScreen = ['login', 'signup'].includes(segments[0] || '');

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);
  const navigateTo = (path: string) => {
    closeDrawer();
    router.push(path as any);
  };
  const handleLogout = async () => {
    closeDrawer();
    await auth.signOut();
    router.replace('/login');
  };

  const renderHeader = () => (
    <Appbar.Header style={{ backgroundColor: COLORS.background, elevation: 0, justifyContent: 'space-between' }}>
      <Appbar.Content title="" />
      <Appbar.Action
        icon="menu"
        color={COLORS.inputText}
        size={28}
        onPress={openDrawer}
      />
    </Appbar.Header>
  );

  return (
    <PaperProvider>
      <Portal>
        <Modal
          visible={drawerVisible}
          onDismiss={closeDrawer}
          contentContainerStyle={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: SCREEN_WIDTH * 0.75,
            height: SCREEN_HEIGHT,
            backgroundColor: COLORS.surface,
            padding: LAYOUT.spacing.lg,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 10,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
          }}
        >
          <DrawerContent user={user} navigateTo={navigateTo} handleLogout={handleLogout} />
        </Modal>
      </Portal>
      <Stack
        screenOptions={{
          header: isAuthScreen ? undefined : renderHeader,
          headerShown: !isAuthScreen,
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
        }}
      />
    </PaperProvider>
  );
}

interface DrawerContentProps {
  user: User | null;
  navigateTo: (path: string) => void;
  handleLogout: () => Promise<void>;
}

function DrawerContent({ user, navigateTo, handleLogout }: DrawerContentProps) {
  return (
    <View>
      <Avatar.Text
        size={TYPO.size.xxl}
        label={user?.email?.charAt(0).toUpperCase() || '?'}
        style={{ alignSelf: 'center', backgroundColor: COLORS.primary, marginBottom: LAYOUT.spacing.md }}
      />
      <Text
        style={{
          color: '#000000',
          textAlign: 'center',
          marginBottom: LAYOUT.spacing.lg,
          fontFamily: TYPO.family.medium,
          fontSize: TYPO.size.md,
        }}
      >
        {user?.email ?? 'Convidado'}
      </Text>

      <Divider style={{ backgroundColor: COLORS.inputText, marginVertical: LAYOUT.spacing.md }} />

      {[
        { label: 'Home', icon: 'home-outline', path: '/HomeScreen' },
        { label: 'Gráficos', icon: 'chart-bar', path: '/graphs' },
        { label: 'Orçamentos', icon: 'wallet-outline', path: '/BudgetsScreen' },
        { label: 'Metas', icon: 'target', path: '/goals' },
        { label: 'Relatório Mensal', icon: 'file-document-outline', path: '/monthlyReport' },
      ].map(item => (
        <CustomDrawerItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          onPress={() => navigateTo(item.path)}
        />
      ))}

      <Divider style={{ backgroundColor: COLORS.divider, marginVertical: LAYOUT.spacing.md }} />

      <CustomDrawerItem
        label="Sair"
        icon="logout"
        iconColor={COLORS.danger}
        onPress={handleLogout}
      />
    </View>
  );
}

interface CustomDrawerItemProps {
  label: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
}

function CustomDrawerItem({ label, icon, iconColor = '#000000', onPress }: CustomDrawerItemProps) {
  return (
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon source={icon} color={iconColor} size={24} />
      <Text
        style={{
          color: '#000000', // Explicitly set label color to black
          fontFamily: TYPO.family.medium,
          fontSize: TYPO.size.md,
          marginLeft: LAYOUT.spacing.md,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    borderRadius: 12,
    marginVertical: 4,
  },
});