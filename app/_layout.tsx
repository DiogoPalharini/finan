// src/components/RootLayout.tsx
import React from 'react';
import { Dimensions, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  Provider as PaperProvider,
  Drawer,
  Modal,
  Portal,
  Text,
  Avatar,
  Divider,
  Appbar,
  useTheme
} from 'react-native-paper';
import { auth } from '../config/firebaseConfig';
import type { User } from 'firebase/auth';
import { COLORS, LAYOUT, TYPO } from '../src/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const user = auth.currentUser as User | null;
  const { colors } = useTheme();
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  // Identifica telas de autenticação para esconder header
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

  // Header com mesmo fundo da tela e ícone de menu branco
     const renderHeader = () => (
    <Appbar.Header style={{ backgroundColor: COLORS.background, elevation: 0, justifyContent: 'space-between' }}>
      <Appbar.Content title="" />
      <Appbar.Action
        icon="menu"
        color="#ffffff"
        size={24}
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
          color: COLORS.textSecondary,
          textAlign: 'center',
          marginBottom: LAYOUT.spacing.lg,
          fontFamily: TYPO.family.regular,
          fontSize: TYPO.size.md,
        }}
      >
        {user?.email ?? 'Convidado'}
      </Text>
      <Divider style={{ backgroundColor: COLORS.divider, marginVertical: LAYOUT.spacing.md }} />

      {[
        { label: 'Home', icon: 'home', path: '/HomeScreen' },
        { label: 'Gráficos', icon: 'chart-bar', path: '/graphs' },
        { label: 'Orçamentos', icon: 'wallet', path: '/BudgetsScreen' },
        { label: 'Metas', icon: 'target', path: '/goals' },
        { label: 'Relatório Mensal', icon: 'file-document-outline', path: '/monthlyReport' },
      ].map(item => (
        <Drawer.Item
          key={item.label}
          label={item.label}
          icon={item.icon}
          onPress={() => navigateTo(item.path)}
          theme={{ colors: { text: COLORS.text } }}
        />
      ))}

      <Divider style={{ backgroundColor: COLORS.divider, marginVertical: LAYOUT.spacing.md }} />
      <Drawer.Item label="Sair" icon="logout" onPress={handleLogout} theme={{ colors: { text: COLORS.text } }} />
    </View>
  );
}
