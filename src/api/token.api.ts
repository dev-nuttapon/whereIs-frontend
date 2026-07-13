import axios from 'axios';
import { env } from '@/lib/env';
import type { AuthSession } from '@/types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type TokenSession = Omit<AuthSession, 'user'>;

const tokenClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function loginWithPassword(username: string, password: string): Promise<TokenSession> {
  const response = await tokenClient.post<ApiResponse<TokenSession>>('/auth/login', { username, password });
  return response.data.data;
}

export async function registerWithPassword(
  username: string,
  email: string,
  password: string,
  displayName?: string,
): Promise<TokenSession> {
  const response = await tokenClient.post<ApiResponse<TokenSession>>('/auth/register', {
    username,
    email,
    password,
    displayName,
  });
  return response.data.data;
}

export async function refreshTokenSession(refreshToken: string): Promise<TokenSession> {
  const response = await tokenClient.post<ApiResponse<TokenSession>>('/auth/refresh', { refreshToken });
  return response.data.data;
}
