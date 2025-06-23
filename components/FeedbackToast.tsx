import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';

const { width } = Dimensions.get('window');

interface FeedbackToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
  onHide?: () => void;
  duration?: number;
}

const FeedbackToast: React.FC<FeedbackToastProps> = ({
  visible,
  message,
  type,
  onHide,
  duration = 3000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'checkmark-circle',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'close-circle',
          iconColor: '#FFFFFF',
        };
      case 'loading':
        return {
          backgroundColor: '#2196F3',
          icon: 'refresh',
          iconColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: '#FF9800',
          icon: 'information-circle',
          iconColor: '#FFFFFF',
        };
    }
  };

  const toastStyle = getToastStyle();

  useEffect(() => {
    if (visible) {
      // Mostrar toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Esconder automaticamente (exceto para loading)
      if (type !== 'loading' && duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, type, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 20,
      right: 20,
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    toast: {
      backgroundColor: toastStyle.backgroundColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 50,
    },
    icon: {
      marginRight: 12,
    },
    message: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.toast}>
        <Ionicons
          name={toastStyle.icon as any}
          size={20}
          color={toastStyle.iconColor}
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default FeedbackToast; 