import type { User } from '@/types/domain.types';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string | null;
  idToken?: string | null;
  expiresAt?: string | null;
  user: User;
}

