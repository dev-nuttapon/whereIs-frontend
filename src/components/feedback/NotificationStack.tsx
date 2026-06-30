import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { notificationStore, type NotificationVariant } from '@/stores/notification.store';

const variantClasses: Record<NotificationVariant, string> = {
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50',
  info: 'border-sky-500/20 bg-sky-500/10 text-sky-950 dark:text-sky-50',
  error: 'border-rose-500/20 bg-rose-500/10 text-rose-950 dark:text-rose-50',
};

export function NotificationStack() {
  const notifications = notificationStore((state) => state.notifications);
  const remove = notificationStore((state) => state.remove);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(100vw-2rem,24rem)] flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'pointer-events-auto rounded-2xl border p-4 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl',
            variantClasses[notification.variant],
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{notification.title}</p>
              {notification.description ? <p className="text-sm leading-5 opacity-85">{notification.description}</p> : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full px-0"
              onClick={() => remove(notification.id)}
              aria-label="Dismiss notification"
            >
              ×
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
