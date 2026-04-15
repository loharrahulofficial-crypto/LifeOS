import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const THEMES = ['midnight', 'ocean', 'forest', 'sunset', 'minimal'];

const THEME_META = {
  midnight: { name: 'Midnight', emoji: '🌙', color: '#f59e0b' },
  ocean: { name: 'Ocean', emoji: '🌊', color: '#06b6d4' },
  forest: { name: 'Forest', emoji: '🌲', color: '#10b981' },
  sunset: { name: 'Sunset', emoji: '🌅', color: '#ec4899' },
  minimal: { name: 'Minimal', emoji: '✨', color: '#8b5cf6' },
};

export function useTheme() {
  const [theme, setThemeState] = useLocalStorage('lifeos-theme', 'midnight');

  const setTheme = useCallback((t) => {
    if (THEMES.includes(t)) {
      setThemeState(t);
      document.documentElement.setAttribute('data-theme', t);
    }
  }, [setThemeState]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme, THEMES, THEME_META };
}
