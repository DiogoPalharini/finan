import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';
import { LAYOUT } from '../../src/styles/layout';
import { TYPO } from '../../src/styles/typography';

interface MenuItemProps {
  label: string;
  icon: string;
  onPress: () => void;
  isActive?: boolean;
  delay?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  label, 
  icon, 
  onPress,
  isActive = false,
  delay = 0
}) => {
  // Animações
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animar entrada com delay para efeito cascata
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [delay]);

  // Animar ao pressionar
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        style={[
          styles.menuItem,
          isActive && styles.activeMenuItem
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[
          styles.iconContainer,
          isActive && styles.activeIconContainer
        ]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={isActive ? COLORS.white : COLORS.primary} 
          />
        </View>
        
        <Text 
          style={[
            styles.menuItemText,
            isActive && styles.activeMenuItemText
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
        
        {isActive ? (
          <View style={styles.activeIndicator} />
        ) : (
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={COLORS.textSecondary} 
            style={styles.chevron}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: 12,
    marginVertical: 3,
    position: 'relative',
  },
  activeMenuItem: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    marginRight: LAYOUT.spacing.sm,
  },
  activeIconContainer: {
    backgroundColor: COLORS.secondary,
  },
  menuItemText: {
    color: COLORS.text,
    fontFamily: TYPO.family.medium,
    fontSize: TYPO.size.sm,
    flex: 1,
  },
  activeMenuItemText: {
    color: COLORS.secondary,
    fontFamily: TYPO.family.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 3,
    height: 20,
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  chevron: {
    opacity: 0.5,
    marginLeft: 4,
  }
});

export default MenuItem;
