// app/_layout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  Provider as PaperProvider,
  Drawer,
  Modal,
  Portal,
  Text,
  IconButton,
  Avatar,
  Divider,
} from 'react-native-paper';
import { auth } from '../config/firebaseConfig';

export default function RootLayout() {
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const router = useRouter();
  const segments = useSegments();
  const user = auth.currentUser;

  // Hide menu on login and signup screens
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

  return (
    <PaperProvider>
      {!hideMenu && (
        <Portal>
          <Modal
            visible={drawerVisible}
            onDismiss={closeDrawer}
            contentContainerStyle={styles.drawerContainer}
          >
            <View style={styles.drawerContent}>
              <View style={styles.userSection}>
                <Avatar.Text size={48} label={user?.email?.charAt(0).toUpperCase() || '?'} />
                <Text style={styles.email}>{user?.email}</Text>
              </View>
              <Divider style={styles.divider} />
              <Drawer.Item
                label="Home"
                icon="home"
                onPress={() => navigateTo('/HomeScreen')}
                style={styles.drawerItem}
              />
              <Drawer.Item
                label="Meus Gráficos"
                icon="chart-bar"
                onPress={() => navigateTo('/graphs')}
                style={styles.drawerItem}
              />

              {/* 🔹 Novo item: Orçamentos */}
              <Drawer.Item
                label="Orçamentos"
                icon="wallet"
                onPress={() => navigateTo('/BudgetsScreen')}
                style={styles.drawerItem}
              />

              {/* 🔹 Novo item: Metas */}
              <Drawer.Item
                label="Metas"
                icon="target"
                onPress={() => navigateTo('/goals')}
                style={styles.drawerItem}
              />
              <Drawer.Item
                  label="Relatório Mensal"
                  icon="file-document-outline"
                  onPress={() => navigateTo('/monthlyReport')}
                  style={styles.drawerItem}
              />

              <View style={styles.spacer} />
              <Divider style={styles.divider} />
              <Drawer.Item
                label="Sair"
                icon="logout"
                onPress={handleLogout}
                style={styles.drawerItem}
              />
            </View>
          </Modal>
        </Portal>
      )}

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2C3E50' },
          headerTitleStyle: { color: '#fff' },
          headerRight: () => (
            !hideMenu && (
              <IconButton icon="dots-vertical" color="#fff" onPress={openDrawer} />
            )
          ),
        }}
      />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    backgroundColor: '#2C3E50',
    padding: 20,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    width: '75%',
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  drawerContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  email: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
  },
  drawerItem: {
    marginVertical: 4,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#fff3',
  },
  spacer: {
    flex: 1,
  },
});
