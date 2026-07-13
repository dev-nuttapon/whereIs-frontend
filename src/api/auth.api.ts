import type { User } from '@/types/domain.types';
import type { AuthSession } from '@/types/auth.types';
import { client } from '@/api/client';
import { MOCK_USERS, MOCK_USER } from '@/mocks/mock-data';
import { isDemoModeEnabled } from '@/lib/demo-session';
import {
  buildKeycloakLogoutUrl,
  clearKeycloakPkce,
  exchangeKeycloakAuthorizationCode,
  refreshKeycloakSession,
  redirectToKeycloakLogin,
} from '@/lib/keycloak-auth';
import { authStore } from '@/stores/auth.store';
import { delay } from '@/utils/mock-api';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LogoutResult {
  success: true;
  redirectUrl?: string | null;
}

interface UserResponseEnvelope {
  success: boolean;
  data: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
    lastLoginAt?: string | null;
  };
}

function mapUser(apiUser: UserResponseEnvelope['data']): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.displayName,
    avatarUrl: apiUser.avatarUrl ?? undefined,
  };
}

function demoSessionFromUser(user: User): AuthSession {
  return {
    accessToken: 'demo-token',
    refreshToken: 'demo-refresh-token',
    idToken: 'demo-id-token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user,
  };
}

export async function login(input: LoginInput): Promise<AuthSession> {
  if (!isDemoModeEnabled()) {
    throw new Error('Use the Keycloak login flow in this environment.');
  }

  const user = MOCK_USERS.find((entry) => entry.email === input.email) ?? MOCK_USER;
  return delay(demoSessionFromUser(user));
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  if (!isDemoModeEnabled()) {
    throw new Error('Use the Keycloak login flow in this environment.');
  }

  const user = {
    id: `user-${input.email.split('@')[0]}`,
    email: input.email,
    name: input.name,
  };

  return delay(demoSessionFromUser(user));
}

export async function beginKeycloakLogin() {
  clearKeycloakPkce();
  await redirectToKeycloakLogin();
}

export async function completeKeycloakLogin(code: string, state: string): Promise<Omit<AuthSession, 'user'>> {
  return exchangeKeycloakAuthorizationCode(code, state);
}

export async function refreshAuthSession(refreshToken: string): Promise<Omit<AuthSession, 'user'>> {
  return refreshKeycloakSession(refreshToken);
}

export async function logout(): Promise<LogoutResult> {
  if (isDemoModeEnabled()) {
    return delay({ success: true });
  }

  const redirectUrl = buildKeycloakLogoutUrl(authStore.getState().idToken);
  return { success: true, redirectUrl };
}

export async function getCurrentUser(): Promise<User> {
  if (isDemoModeEnabled()) {
    return delay(authStore.getState().user ?? MOCK_USER);
  }

  const response = await client.get<UserResponseEnvelope>('/users/me');
  return mapUser(response.data.data);
}

export async function listDemoUsers(): Promise<User[]> {
  return delay(MOCK_USERS);
}
