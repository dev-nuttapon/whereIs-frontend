import { authStore } from '@/stores/auth.store';
import type { AuthState } from '@/stores/auth.store';

export function useAuth(): AuthState {
  return authStore();
}
