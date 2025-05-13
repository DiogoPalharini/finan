// src/components/Title.tsx
import React from 'react';
import { Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

interface TitleProps {
  children: React.ReactNode;
  style?: object;
}

export default function Title({ children, style, ...props }: TitleProps) {
  const { colors } = useTheme();
  return (
    <Text
      variant="headlineLarge"
      style={[
        { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
