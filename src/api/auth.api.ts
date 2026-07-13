import type { User } from '@/types/domain.types';
import type { AuthSession } from '@/types/auth.types';
import { client } from '@/api/client';
import {
  buildKeycloakLogoutUrl,
  clearKeycloakPkce,
  exchangeKeycloakAuthorizationCode,
  refreshKeycloakSession,
  redirectToKeycloakLogin,
} from '@/lib/keycloak-auth';

interface UserResponseEnvelope {
  success: boolean;
  data: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
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

export async function logout(idTokenHint?: string | null): Promise<{ success: true; redirectUrl?: string | null }> {
  return {
    success: true,
    redirectUrl: buildKeycloakLogoutUrl(idTokenHint ?? null),
  };
}

export async function getCurrentUser(): Promise<User> {
  const response = await client.get<UserResponseEnvelope>('/users/me');
  return mapUser(response.data.data);
}
