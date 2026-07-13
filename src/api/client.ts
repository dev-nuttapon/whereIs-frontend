import axios from 'axios';
import { env } from '@/lib/env';
import { authStore } from '@/stores/auth.store';
import { queryClient } from '@/lib/queryClient';
import { refreshKeycloakSession } from '@/lib/keycloak-auth';

let refreshSessionPromise: Promise<void> | null = null;

export const client = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const refreshToken = authStore.getState().refreshToken;

      if (refreshToken) {
        try {
          originalRequest._retry = true;
          refreshSessionPromise ??= refreshKeycloakSession(refreshToken)
            .then((session) => {
              authStore.getState().updateTokens(session);
            })
            .finally(() => {
              refreshSessionPromise = null;
            });

          await refreshSessionPromise;
          const token = authStore.getState().accessToken;
          if (token) {
            originalRequest.headers = {
              ...(originalRequest.headers ?? {}),
              Authorization: `Bearer ${token}`,
            };
            return client(originalRequest);
          }
        } catch {
          authStore.getState().logout();
          queryClient.clear();
        }
      }
    }

    if (error?.response?.status === 401) {
      authStore.getState().logout();
      queryClient.clear();
    }
    return Promise.reject(error);
  },
);
