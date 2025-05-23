import React, { useEffect } from 'react';
import { Dimensions, View, StyleSheet, Animated } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider, Modal, Portal, Appbar } from 'react-native-paper';
import { auth } from '../config/firebaseConfig';
import type { User } from 'firebase/auth';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { AuthProvider } from '../contexts/AuthContext';
import DrawerContent from '../components/Menu/DrawerContent';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = React.useState(auth.currentUser as User | null);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [drawerAnimation] = React.useState(new Animated.Value(0));
  const [currentRoute, setCurrentRoute] = React.useState('/');

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      
      // Redirecionar com base no estado de autenticação
      const isAuthRoute = ['login', 'SignUpScreen'].includes(segments[0] || '');
      
      if (!authUser && !isAuthRoute) {
        // Usuário não autenticado e não está em uma rota de autenticação
        router.replace('/LoginScreen');
      } else if (authUser && isAuthRoute) {
        // Usuário autenticado e está em uma rota de autenticação
        router.replace('/HomeScreen');
      }
    });
    
    return () => unsubscribe();
  }, [segments]);

  // Monitorar mudanças de rota para atualizar o menu
  useEffect(() => {
    if (segments && segments.length > 0) {
      setCurrentRoute(`/${segments[0]}`);
    } else {
      setCurrentRoute('/');
    }
  }, [segments]);

  const isAuthScreen = ['LoginScreen', 'SignUpScreen'].includes(segments[0] || '');

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };
  
  const navigateTo = (path: string) => {
    closeDrawer();
    setTimeout(() => {
      router.push(path);
    }, 300);
  };
  
  const handleLogout = async () => {
    closeDrawer();
    try {
      await auth.signOut();
      router.replace('/LoginScreen');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderHeader = () => (
    <Appbar.Header style={styles.appbar}>
      <Appbar.Content title="" />
      <Appbar.Action
        icon="menu"
        color={COLORS.secondary}
        size={28}
        onPress={openDrawer}
        style={styles.menuButton}
      />
    </Appbar.Header>
  );

  // Animação do backdrop
  const backdropOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // Animação do drawer
  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH, 0],
  });

  return (
    <AuthProvider>
      <PaperProvider>
        <Portal>
          <Modal
            visible={drawerVisible}
            onDismiss={closeDrawer}
            contentContainerStyle={styles.modalContainer}
            dismissable={true}
          >
            <Animated.View 
              style={[
                styles.backdrop,
                { opacity: backdropOpacity }
              ]}
              pointerEvents={drawerVisible ? 'auto' : 'none'}
              onTouchStart={closeDrawer}
            />
            <Animated.View
              style={[
                styles.drawerContainer,
                { transform: [{ translateX: drawerTranslateX }] }
              ]}
            >
              <DrawerContent 
                user={user} 
                navigateTo={navigateTo} 
                handleLogout={handleLogout}
                closeDrawer={closeDrawer}
                currentRoute={currentRoute}
              />
            </Animated.View>
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
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: COLORS.background, 
    elevation: 0, 
    justifyContent: 'space-between'
  },
  menuButton: {
    borderRadius: 12,
    marginRight: 8,
  },
  modalContainer: {
    margin: 0,
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  drawerContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  }
});
