import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '@/routes';
import { queryClient } from '@/lib/queryClient';
import { useThemeSync } from '@/hooks/useThemeSync';
import { useLocaleSync } from '@/hooks/useLocaleSync';
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap';
import { NotificationStack } from '@/components/feedback/NotificationStack';

export function App() {
  useThemeSync();
  useLocaleSync();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <AppRoutes />
        <NotificationStack />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
