import { useEffect, useRef } from 'react';
import { App as AntdApp } from 'antd';
import { notificationStore, type NotificationVariant } from '@/stores/notification.store';

export function NotificationStack() {
  const notifications = notificationStore((state) => state.notifications);
  const remove = notificationStore((state) => state.remove);
  const shownIds = useRef(new Set<string>());
  const { notification } = AntdApp.useApp();

  useEffect(() => {
    notifications.forEach((item) => {
      if (shownIds.current.has(item.id)) {
        return;
      }

      shownIds.current.add(item.id);
      notification.open({
        key: item.id,
        message: item.title,
        description: item.description,
        placement: 'topRight',
        type: item.variant === 'error' ? 'error' : item.variant === 'success' ? 'success' : 'info',
        onClose: () => remove(item.id),
      });
    });
  }, [notification, notifications, remove]);

  return null;
}
