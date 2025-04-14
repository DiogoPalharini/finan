import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="signup" />
      <Stack.Screen name="home" />
      <Stack.Screen name="expense" />
      <Stack.Screen name="income" />
      <Stack.Screen name="charts" /> {/* Nova tela de gráficos */}
    </Stack>
  );
}