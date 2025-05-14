// src/components/Title.tsx
import React from 'react';
import { Text, useTheme, TextProps } from 'react-native-paper';

interface TitleProps extends TextProps<never> {
  children: React.ReactNode;
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
