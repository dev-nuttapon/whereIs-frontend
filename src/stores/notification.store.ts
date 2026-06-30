import { create } from 'zustand';

export type NotificationVariant = 'success' | 'info' | 'error';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  variant: NotificationVariant;
}

interface NotificationState {
  notifications: Notification[];
  push: (notification: Omit<Notification, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const dismissTimers = new Map<string, number>();

function createId() {
  return `notice-${Math.random().toString(36).slice(2, 10)}`;
}

export const notificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  push: (notification) => {
    const id = createId();
    const timeout = window.setTimeout(() => {
      get().remove(id);
    }, 3500);

    dismissTimers.set(id, timeout);
    set((state) => ({
      notifications: [...state.notifications, { id, ...notification }],
    }));
  },
  remove: (id) => {
    const timer = dismissTimers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      dismissTimers.delete(id);
    }
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    }));
  },
  clear: () => {
    dismissTimers.forEach((timer) => window.clearTimeout(timer));
    dismissTimers.clear();
    set({ notifications: [] });
  },
}));

export function pushNotification(notification: Omit<Notification, 'id'>) {
  notificationStore.getState().push(notification);
}
