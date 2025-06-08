import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/colors';

interface MenuButtonProps {
  onPress: () => void;
  color?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onPress, color = COLORS.secondary }) => {
  return (
    <TouchableOpacity 
      style={styles.menuButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MenuButton; 