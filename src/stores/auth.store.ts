import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/domain.types';
import type { AuthSession } from '@/types/auth.types';
import { workspaceStore } from '@/stores/workspace.store';
import { getInitialAuthState, isDemoModeEnabled } from '@/lib/demo-session';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: string | null;
  user: User | null;
  isAuthenticated: boolean;
  password: string | null;
  setAuth: (session: AuthSession) => void;
  updateTokens: (session: Pick<AuthSession, 'accessToken' | 'refreshToken' | 'idToken' | 'expiresAt'>) => void;
  updateUser: (user: User) => void;
  updatePassword: (password: string) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      ...getInitialAuthState(),
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
      updatePassword: (password) =>
        set({
          password,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          idToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
          password: null,
        }),
    }),
    {
      name: 'whereis-auth',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        if (isDemoModeEnabled()) {
          const persisted = persistedState as Partial<AuthState> | undefined;
          const persistedUser = persisted?.user ?? currentState.user;
          const persistedPassword = persisted?.password ?? currentState.password;

          return {
            ...currentState,
            ...getInitialAuthState(),
            user: persistedUser,
            password: persistedPassword,
          };
        }

        return {
          ...currentState,
          ...(persistedState as Partial<AuthState>),
        };
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        idToken: state.idToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        password: state.password,
      }),
    },
  ),
);

authStore.subscribe((state, previousState) => {
  if (previousState?.isAuthenticated && !state.isAuthenticated) {
    workspaceStore.getState().clear();
  }
});

export type { AuthState };
