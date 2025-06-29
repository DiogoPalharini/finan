// services/notificationService.ts
import { rtdb } from '../config/firebaseConfig';
import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Interface para notificações
export interface Notification {
  id?: string;
  type: 'budget_warning' | 'recurring_transaction' | 'goal_deadline' | 'system';
  title: string;
  message: string;
  relatedId?: string;  // ID do recurso relacionado (ex: orçamento, meta, etc.)
  read: boolean;
  dismissed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

/**
 * Cria uma nova notificação
 * @param userId ID do usuário
 * @param notification Dados da notificação
 * @returns ID da notificação criada
 */
export async function createNotification(
  userId: string, 
  notification: Omit<Notification, 'id' | 'read' | 'dismissed' | 'createdAt'>
): Promise<string> {
  try {
    const notificationsRef = ref(rtdb, `users/${userId}/notifications`);
    const newNotificationRef = push(notificationsRef);
    const notificationId = newNotificationRef.key as string;
    
    const completeNotification = {
      ...notification,
      id: notificationId,
      read: false,
      dismissed: false,
      createdAt: new Date().toISOString()
    };
    
    await set(newNotificationRef, completeNotification);
    
    return notificationId;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

/**
 * Obtém todas as notificações do usuário
 * @param userId ID do usuário
 * @param includeRead Se deve incluir notificações já lidas
 * @param includeDismissed Se deve incluir notificações descartadas
 * @returns Array de notificações
 */
export async function getNotifications(
  userId: string, 
  includeRead: boolean = false,
  includeDismissed: boolean = false
): Promise<Notification[]> {
  try {
    const notificationsRef = ref(rtdb, `users/${userId}/notifications`);
    const snapshot = await get(notificationsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const notifications: Notification[] = [];
    snapshot.forEach((childSnapshot) => {
      const notification = childSnapshot.val() as Notification;
      
      // Filtrar conforme parâmetros
      if ((includeRead || !notification.read) && (includeDismissed || !notification.dismissed)) {
        notifications.push(notification);
      }
    });
    
    // Ordenar por data de criação (mais recente primeiro) e depois por prioridade
    return notifications.sort((a, b) => {
      // Primeiro por prioridade
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Depois por data (mais recente primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
}

/**
 * Marca uma notificação como lida
 * @param userId ID do usuário
 * @param notificationId ID da notificação
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  try {
    const notificationRef = ref(rtdb, `users/${userId}/notifications/${notificationId}`);
    await update(notificationRef, { read: true });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
}

/**
 * Marca uma notificação como descartada
 * @param userId ID do usuário
 * @param notificationId ID da notificação
 */
export async function dismissNotification(userId: string, notificationId: string): Promise<void> {
  try {
    const notificationRef = ref(rtdb, `users/${userId}/notifications/${notificationId}`);
    await update(notificationRef, { dismissed: true });
  } catch (error) {
    console.error('Erro ao descartar notificação:', error);
    throw error;
  }
}

/**
 * Marca todas as notificações como lidas
 * @param userId ID do usuário
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notifications = await getNotifications(userId, true, false);
    
    const updates: Record<string, boolean> = {};
    notifications.forEach(notification => {
      if (!notification.read) {
        updates[`users/${userId}/notifications/${notification.id}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb), updates);
    }
  } catch (error) {
    console.error('Erro ao marcar todas notificações como lidas:', error);
    throw error;
  }
}

/**
 * Exclui uma notificação
 * @param userId ID do usuário
 * @param notificationId ID da notificação
 */
export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  try {
    const notificationRef = ref(rtdb, `users/${userId}/notifications/${notificationId}`);
    await remove(notificationRef);
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    throw error;
  }
}

/**
 * Exclui todas as notificações descartadas
 * @param userId ID do usuário
 */
export async function clearDismissedNotifications(userId: string): Promise<void> {
  try {
    const notifications = await getNotifications(userId, true, true);
    
    const dismissedNotifications = notifications.filter(notification => notification.dismissed);
    
    for (const notification of dismissedNotifications) {
      await deleteNotification(userId, notification.id!);
    }
  } catch (error) {
    console.error('Erro ao limpar notificações descartadas:', error);
    throw error;
  }
}

/**
 * Cria uma notificação de alerta de orçamento
 * @param userId ID do usuário
 * @param category Categoria do orçamento
 * @param percentage Percentual do limite atingido
 * @param budgetId ID do orçamento
 */
export async function createBudgetWarningNotification(
  userId: string,
  category: string,
  percentage: number,
  budgetId: string
): Promise<string> {
  return await createNotification(userId, {
    type: 'budget_warning',
    title: 'Alerta de Orçamento',
    message: `Você já gastou ${percentage}% do orçamento de ${category}`,
    relatedId: budgetId,
    priority: percentage >= 100 ? 'high' : 'medium'
  });
}

/**
 * Cria uma notificação de transação recorrente processada
 * @param userId ID do usuário
 * @param description Descrição da transação
 * @param amount Valor da transação
 * @param transactionId ID da transação
 */
export async function createRecurringTransactionNotification(
  userId: string,
  description: string,
  amount: number,
  transactionId: string
): Promise<string> {
  return await createNotification(userId, {
    type: 'recurring_transaction',
    title: 'Transação Recorrente Processada',
    message: `A transação recorrente "${description}" de R$ ${amount.toFixed(2)} foi processada`,
    relatedId: transactionId,
    priority: 'low'
  });
}

/**
 * Cria uma notificação de prazo de meta se aproximando
 * @param userId ID do usuário
 * @param goalTitle Título da meta
 * @param daysLeft Dias restantes
 * @param goalId ID da meta
 */
export async function createGoalDeadlineNotification(
  userId: string,
  goalTitle: string,
  daysLeft: number,
  goalId: string
): Promise<string> {
  return await createNotification(userId, {
    type: 'goal_deadline',
    title: 'Prazo de Meta se Aproximando',
    message: `Faltam ${daysLeft} dias para o prazo da meta "${goalTitle}"`,
    relatedId: goalId,
    priority: daysLeft <= 7 ? 'high' : 'medium'
  });
}

/**
 * Solicita permissão para notificações ao usuário
 * @returns true se permitido, false caso contrário
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === 'granted';
  }
  return true;
}

/**
 * Dispara uma notificação local de teste imediatamente
 */
export async function sendTestNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificação de Teste',
        body: 'Se você está vendo isso, as notificações locais estão funcionando!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
    console.log('sendTestNotification: Notificação de teste disparada');
  } catch (e) {
    console.error('sendTestNotification: Erro ao disparar notificação de teste:', e);
  }
}

/**
 * Agenda uma notificação local para uma recorrência
 * @param recorrencia Recorrencia
 */
export async function scheduleRecurringNotification(recorrencia: {
  descricao: string;
  diaRecorrencia: number;
  valor: number;
}) {
  try {
    const now = new Date();
    const localDay = now.getDate();
    console.log('scheduleRecurringNotification: now (local)', now);
    console.log('scheduleRecurringNotification: recorrencia', recorrencia);
    // Notificação para hoje, se for o dia da recorrência (horário local)
    if (localDay === recorrencia.diaRecorrencia) {
      console.log('scheduleRecurringNotification: Disparando notificação IMEDIATA');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recorrência para hoje!',
          body: `Você tem uma recorrência: ${recorrencia.descricao} de R$ ${recorrencia.valor.toFixed(2)}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // dispara imediatamente
      });
    } else {
      console.log('scheduleRecurringNotification: Não é o dia da recorrência, não dispara notificação imediata');
    }
    // Agenda para o próximo mês (horário local, 9h)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, recorrencia.diaRecorrencia, 9, 0, 0, 0);
    console.log('scheduleRecurringNotification: Agendando para o próximo mês em', nextMonth);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recorrência mensal',
        body: `Você tem uma recorrência para hoje: ${recorrencia.descricao} de R$ ${recorrencia.valor.toFixed(2)}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: nextMonth,
        type: 'date',
        repeats: false,
      } as any,
    });
    console.log('scheduleRecurringNotification: Notificação agendada para o próximo mês');
  } catch (e) {
    console.error('Erro ao agendar/disparar notificação local:', e);
  }
}
