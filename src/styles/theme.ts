// src/styles/theme.ts
import { MD3DarkTheme } from 'react-native-paper';
import { COLORS } from './colors';
import { LAYOUT } from './layout';

export const theme = {
  ...MD3DarkTheme,
  roundness: LAYOUT.radius.small,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    onBackground: COLORS.text,
    text: COLORS.text,
    placeholder: COLORS.textSecondary,
    outline: COLORS.divider,
  },
};