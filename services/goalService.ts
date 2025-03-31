import { ref, push, onValue, set, remove } from 'firebase/database';
import { rtdb } from '../config/firebaseConfig';

export interface Goal {
  id?: string;
  description: string;
  targetAmount: number;
  savedAmount: number;
}

export async function saveGoal(userId: string, goal: Omit<Goal, 'id'>) {
  const goalsRef = ref(rtdb, `users/${userId}/goals`);
  await push(goalsRef, goal);
}

export function subscribeGoals(userId: string, callback: (goals: Goal[]) => void) {
  const goalsRef = ref(rtdb, `users/${userId}/goals`);
  const unsubscribe = onValue(goalsRef, snapshot => {
    const data = snapshot.val() || {};
    const goals = Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value }));
    callback(goals);
  });
  return unsubscribe; // <-- ESSA LINHA ESTAVA FALTANDO
}


export async function deleteGoal(userId: string, goalId: string) {
  const goalRef = ref(rtdb, `users/${userId}/goals/${goalId}`);
  await remove(goalRef);
}
