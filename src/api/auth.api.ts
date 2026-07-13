import type { User } from '@/types/domain.types';
import type { AuthSession } from '@/types/auth.types';
import { client } from '@/api/client';
import { loginWithPassword, refreshTokenSession, registerWithPassword } from '@/api/token.api';

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

export async function login(username: string, password: string): Promise<Omit<AuthSession, 'user'>> {
  return loginWithPassword(username, password);
}

export async function register(
  username: string,
  email: string,
  password: string,
  displayName?: string,
): Promise<Omit<AuthSession, 'user'>> {
  return registerWithPassword(username, email, password, displayName);
}

export async function refreshAuthSession(refreshToken: string): Promise<Omit<AuthSession, 'user'>> {
  return refreshTokenSession(refreshToken);
}

export async function logout(idTokenHint?: string | null): Promise<{ success: true; redirectUrl?: string | null }> {
  void idTokenHint;
  return {
    success: true,
    redirectUrl: null,
  };
}

export async function getCurrentUser(): Promise<User> {
  const response = await client.get<UserResponseEnvelope>('/users/me');
  return mapUser(response.data.data);
}
