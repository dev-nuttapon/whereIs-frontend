import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/domain.types';
import { workspaceStore } from '@/stores/workspace.store';
import { getInitialAuthState, isDemoModeEnabled } from '@/lib/demo-session';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  password: string | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  updatePassword: (password: string) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      ...getInitialAuthState(),
      setAuth: (token, user) =>
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
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
          const persistedUser = (persistedState as Partial<AuthState> | undefined)?.user ?? currentState.user;
          const persistedPassword = (persistedState as Partial<AuthState> | undefined)?.password ?? currentState.password;

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
