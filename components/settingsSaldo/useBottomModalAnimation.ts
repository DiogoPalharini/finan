import { useEffect, useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const { height } = Dimensions.get('window');

interface UseBottomModalAnimationProps {
  visible: boolean;
  onClose: () => void;
  animationDuration?: number;
  closeThreshold?: number;
}

export const useBottomModalAnimation = ({
  visible,
  onClose,
  animationDuration = 300,
  closeThreshold = 100
}: UseBottomModalAnimationProps) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Animação de entrada e saída
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: animationDuration - 50,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: animationDuration - 50,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, animationDuration]);

  // PanResponder para arrastar para baixo e fechar
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dy > 0 && gestureState.dy > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
        // Reduzir opacidade do backdrop conforme arrasta
        const opacity = Math.max(0, 1 - (gestureState.dy / height));
        backdropOpacity.setValue(opacity);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > closeThreshold || gestureState.vy > 0.5) {
        // Fechar modal
        onClose();
      } else {
        // Voltar para posição original
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      }
    },
  });

  return {
    slideAnim,
    backdropOpacity,
    panResponder
  };
};

