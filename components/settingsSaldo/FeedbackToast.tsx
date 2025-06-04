import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';

interface FeedbackToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onHide?: () => void;
}

const FeedbackToast: React.FC<FeedbackToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 2000,
  onHide
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle-outline',
          textColor: COLORS.white
        };
      case 'info':
        return {
          backgroundColor: COLORS.primary,
          icon: 'information-circle-outline',
          textColor: COLORS.white
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warning,
          icon: 'warning-outline',
          textColor: COLORS.white
        };
      case 'error':
        return {
          backgroundColor: COLORS.danger,
          icon: 'close-circle-outline',
          textColor: COLORS.white
        };
      default:
        return {
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle-outline',
          textColor: COLORS.white
        };
    }
  };

  useEffect(() => {
    if (visible) {
      // Animação de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        })
      ]).start();

      // Auto-hide após duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      onHide?.();
    });
  };

  const typeConfig = getTypeConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: typeConfig.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Ionicons 
        name={typeConfig.icon as any} 
        size={20} 
        color={typeConfig.textColor} 
      />
      <Text style={[styles.message, { color: typeConfig.textColor }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: LAYOUT.spacing.md,
    right: LAYOUT.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  message: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.medium,
    marginLeft: 8,
    flex: 1,
  },
});

export default FeedbackToast;

