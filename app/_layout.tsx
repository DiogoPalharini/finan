import { Stack } from 'expo-router';
import HomeScreen from './HomeScreen';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import SignUpScreen from './SignUpScreen';
import Login from './login';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="signup" component={SignUpScreen} />
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="expense" component={ExpenseForm} />
      <Stack.Screen name="income" component={IncomeForm} />
    </Stack>
  );
}