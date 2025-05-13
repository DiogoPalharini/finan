// src/components/RootLayout.tsx
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { COLORS, LAYOUT, TYPO } from '../src/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RootLayout() {
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const router = useRouter();
  const segments = useSegments();
  const user = auth.currentUser;
  const { colors } = useTheme();

  const hideMenu = ['login', 'signup'].includes(segments[0] || '');

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);
  const navigateTo = (path: string) => {
    closeDrawer();
    router.push(path);
  };
  const handleLogout = async () => {
    closeDrawer();
    await auth.signOut();
    router.replace('/login');
  };

  const renderHeader = () => {
    if (hideMenu) {
      return (
        <Appbar.Header style={{ backgroundColor: colors.background, elevation: 0 }}>
          <Appbar.Content title="" />
        </Appbar.Header>
      );
    }
    return (
      <Appbar.Header style={{ 
          backgroundColor: 'transparent', 
          elevation: 0, 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
        <Appbar.Content
          title="MyFinance"
          titleStyle={{
            color: COLORS.primary,
            fontSize: TYPO.size.lg,
            fontFamily: TYPO.family.semibold,
          }}
        />
        <Appbar.Action
          icon="dots-vertical"
          color={COLORS.text}
          size={24}
          onPress={openDrawer}
          style={{ marginRight: LAYOUT.spacing.sm }}
        />
      </Appbar.Header>
    );
  };

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
          <DrawerContent
            user={user}
            navigateTo={navigateTo}
            handleLogout={handleLogout}
          />
        </Modal>
      </Portal>

      {!hideMenu && (
        <LinearGradient
          colors={[COLORS.background, COLORS.surface]}
          style={{
            position: 'absolute',
            top: 0,
            width: SCREEN_WIDTH,
            height: LAYOUT.spacing.xl * 2, // ex: 64
            zIndex: 1,
          }}
        />
      )}

      <Stack
        screenOptions={{
          header: renderHeader,
        }}
      />
    </PaperProvider>
  );
}

function DrawerContent({ user, navigateTo, handleLogout }) {
  return (
    <View>
      <Avatar.Text
        size={TYPO.size.xxl}
        label={user?.email?.charAt(0).toUpperCase() || '?'}
        style={{
          alignSelf: 'center',
          backgroundColor: COLORS.primary,
          marginBottom: LAYOUT.spacing.md,
        }}
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
        {user?.email}
      </Text>
      <Divider style={{ backgroundColor: COLORS.divider, marginVertical: LAYOUT.spacing.md }} />

      {/* Itens do Drawer */}
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
          labelStyle={{ color: COLORS.text }}
        />
      ))}

      <Divider style={{ backgroundColor: COLORS.divider, marginVertical: LAYOUT.spacing.md }} />
      <Drawer.Item
        label="Sair"
        icon="logout"
        onPress={handleLogout}
        labelStyle={{ color: COLORS.text }}
      />
    </View>
  );
}
