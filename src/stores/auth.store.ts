import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/domain.types';
import type { AuthSession } from '@/types/auth.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (session: AuthSession) => void;
  updateTokens: (session: Pick<AuthSession, 'accessToken' | 'refreshToken' | 'idToken' | 'expiresAt'>) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      idToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,
      setAuth: (session) =>
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null,
          idToken: session.idToken ?? null,
          expiresAt: session.expiresAt ?? null,
          user: session.user,
          isAuthenticated: true,
        }),
      updateTokens: (session) =>
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null,
          idToken: session.idToken ?? null,
          expiresAt: session.expiresAt ?? null,
        }),
      updateUser: (user) =>
        set({
          user,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          idToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'whereis-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        idToken: state.idToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export type { AuthState };
