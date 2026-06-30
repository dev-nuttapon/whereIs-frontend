import type { User } from '@/types/domain.types';
import { MOCK_USER } from '@/mocks/mock-data';
import { authStore } from '@/stores/auth.store';
import { delay } from '@/utils/mock-api';

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  void input;
  return delay({
    token: 'demo-token',
    user: MOCK_USER,
  });
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  void input;
  return delay({
    token: 'demo-token',
    user: MOCK_USER,
  });
}

export async function logout(): Promise<{ success: true }> {
  return delay({ success: true });
}

export async function getCurrentUser(): Promise<User> {
  return delay(authStore.getState().user ?? MOCK_USER);
}
