import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles';
import { useDrawer } from '../contexts/DrawerContext';

interface MenuButtonProps {
  color?: string;
}

export const MenuButton = ({ color = COLORS.text }: MenuButtonProps) => {
  const { openDrawer } = useDrawer();

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={openDrawer}
    >
      <Ionicons name="menu" size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 