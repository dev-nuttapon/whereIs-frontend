import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/domain.types';
import type { AuthSession } from '@/types/auth.types';

interface AuthState {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
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
  markUnauthenticated: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      authStatus: 'unauthenticated',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,
      setAuth: (session) =>
        set({
          authStatus: 'authenticated',
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null,
          idToken: session.idToken ?? null,
          expiresAt: session.expiresAt ?? null,
          user: session.user,
          isAuthenticated: true,
        }),
      updateTokens: (session) =>
        set({
          authStatus: 'authenticated',
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null,
          idToken: session.idToken ?? null,
          expiresAt: session.expiresAt ?? null,
        }),
      updateUser: (user) =>
        set({
          authStatus: 'authenticated',
          user,
        }),
      logout: () =>
        set({
          authStatus: 'unauthenticated',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
        }),
      markUnauthenticated: () =>
        set({
          authStatus: 'unauthenticated',
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
      // Tokens are intentionally memory-only. A reload must require a fresh
      // session bootstrap instead of restoring bearer credentials from storage.
      partialize: () => ({}),
      onRehydrateStorage: () => (state) => {
        state?.markUnauthenticated();
      },
    },
  ),
);

export type { AuthState };
