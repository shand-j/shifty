import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  toggle: () =>
    set((state) => {
      const next = !state.isDark;
      document.documentElement.classList.toggle('dark', next);
      return { isDark: next };
    }),
}));
