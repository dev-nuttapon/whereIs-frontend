import axios from 'axios';
import { env } from '@/lib/env';
import { authStore } from '@/stores/auth.store';
import { queryClient } from '@/lib/queryClient';

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
    if (error?.response?.status === 401) {
      authStore.getState().logout();
      queryClient.clear();
    }
    return Promise.reject(error);
  },
);
