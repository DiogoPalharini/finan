import React, { useEffect } from 'react';
import { Dimensions, View, StyleSheet, Animated } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider, Modal, Portal, Appbar } from 'react-native-paper';
import { auth } from '../config/firebaseConfig';
import type { User } from 'firebase/auth';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { AuthProvider } from '../contexts/AuthContext';
import { DrawerProvider, useDrawer } from '../contexts/DrawerContext';
import DrawerContent from '../components/Menu/DrawerContent';
import MenuButton from '../components/Menu/MenuButton';
import { BalanceProvider } from '../hooks/useBalance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { isOpen, openDrawer, closeDrawer } = useDrawer();
  const [user, setUser] = React.useState(auth.currentUser as User | null);
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

  // Monitorar mudanças no estado do drawer
  useEffect(() => {
    if (isOpen) {
      Animated.timing(drawerAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const isAuthScreen = ['LoginScreen', 'SignUpScreen'].includes(segments[0] || '');
  
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

  const renderHeader = () => {
    const isHomeScreen = segments[0] === 'HomeScreen';
    return (
      <View style={styles.headerContainer}>
        <MenuButton 
          onPress={openDrawer} 
          color={isHomeScreen ? COLORS.secondary : COLORS.white}
        />
      </View>
    );
  };

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
        <DrawerProvider>
          <BalanceProvider>
            <Portal>
              <Modal
                visible={isOpen}
                onDismiss={closeDrawer}
                contentContainerStyle={styles.modalContainer}
                dismissable={true}
              >
                <Animated.View 
                  style={[
                    styles.backdrop,
                    { opacity: backdropOpacity }
                  ]}
                  pointerEvents={isOpen ? 'auto' : 'none'}
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
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="recorrencias" options={{ headerShown: false }} />
              <Stack.Screen name="recorrencia-form" options={{ headerShown: false }} />
            </Stack>
          </BalanceProvider>
        </DrawerProvider>
      </PaperProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <DrawerProvider>
          <BalanceProvider>
            <RootLayoutContent />
          </BalanceProvider>
        </DrawerProvider>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
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
