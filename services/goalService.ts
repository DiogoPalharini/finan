// services/goalService.ts
import { ref, push, onValue, remove } from 'firebase/database';
import { rtdb } from '../config/firebaseConfig';

export interface Goal {
  id?: string;
  description: string;
  category: string;       // adicionada propriedade category
  targetAmount: number;
  savedAmount: number;
}

/**
 * Salva uma nova meta no Realtime Database incluindo categoria
 */
export async function saveGoal(
  userId: string,
  goal: Omit<Goal, 'id'>  // agora inclui description, category, targetAmount, savedAmount
) {
  const goalsRef = ref(rtdb, `users/${userId}/goals`);
  await push(goalsRef, goal);
}

/**
 * Inscreve em alterações das metas do usuário
 */
export function subscribeGoals(
  userId: string,
  callback: (goals: Goal[]) => void
) {
  const goalsRef = ref(rtdb, `users/${userId}/goals`);
  const unsubscribe = onValue(goalsRef, snapshot => {
    const data = snapshot.val() || {};
    const goals = Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value }));
    callback(goals);
  });
  return unsubscribe;
}

/**
 * Deleta uma meta pelo ID
 */
export async function deleteGoal(
  userId: string,
  goalId: string
) {
  const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
  await remove(goalRef);
}
