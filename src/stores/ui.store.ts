import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'th';

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = window.localStorage.getItem('whereis-ui');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { theme?: Theme } };
      if (parsed.state?.theme === 'light' || parsed.state?.theme === 'dark' || parsed.state?.theme === 'system') {
        return parsed.state.theme;
      }
    } catch {
      // Fall through to media query fallback.
    }
  }

  return 'system';
}

function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem('whereis-ui');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { locale?: Locale } };
      if (parsed.state?.locale === 'en' || parsed.state?.locale === 'th') {
        return parsed.state.locale;
      }
    } catch {
      // Fall through to browser language fallback.
    }
  }

  return window.navigator.language.toLowerCase().startsWith('th') ? 'th' : 'en';
}

interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  locale: Locale;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const uiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: resolveInitialTheme(),
      locale: resolveInitialLocale(),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set((state) => ({ locale: state.locale === 'en' ? 'th' : 'en' })),
    }),
    {
      name: 'whereis-ui',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
