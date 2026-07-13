import axios, { AxiosError } from 'axios';
import { env } from '@/lib/env';
import type { AuthSession } from '@/types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  message?: string;
  errors?: string[];
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
  try {
    const response = await tokenClient.post<ApiResponse<TokenSession>>('/auth/login', { username, password });
    return response.data.data;
  } catch (cause) {
    throw toAuthError(cause, 'Unable to sign in.');
  }
}

export async function registerWithPassword(
  username: string,
  email: string,
  password: string,
  displayName?: string,
): Promise<TokenSession> {
  try {
    const response = await tokenClient.post<ApiResponse<TokenSession>>('/auth/register', {
      username,
      email,
      password,
      displayName,
    });
    return response.data.data;
  } catch (cause) {
    throw toAuthError(cause, 'Unable to create account.');
  }
}

export async function refreshTokenSession(refreshToken: string): Promise<TokenSession> {
  try {
    const response = await tokenClient.post<ApiResponse<TokenSession>>('/auth/refresh', { refreshToken });
    return response.data.data;
  } catch (cause) {
    throw toAuthError(cause, 'Unable to refresh session.');
  }
}

function toAuthError(cause: unknown, fallback: string) {
  if (cause instanceof AxiosError) {
    const data = cause.response?.data as ApiErrorResponse | undefined;
    const message = data?.message || data?.errors?.[0];

    if (message) {
      return new Error(message);
    }
  }

  return cause instanceof Error ? cause : new Error(fallback);
}
