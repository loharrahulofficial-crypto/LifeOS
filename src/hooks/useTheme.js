import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/** Six anime-inspired palettes — each has a different color agenda (no duplicates). */
export const THEMES = ['jujutsu', 'shinobi', 'scout', 'saiyan', 'slayer', 'eva'];

export const THEME_META = {
  jujutsu: { name: 'Jujutsu — Cursed Energy', emoji: '🧿', color: '#22d3ee' },
  shinobi: { name: 'Naruto — Hidden Leaf', emoji: '🍥', color: '#10b981' },
  scout:   { name: 'Attack on Titan — Scout', emoji: '🗡️', color: '#ec4899' },
  saiyan:  { name: 'Dragon Ball — Golden Ki', emoji: '⚡', color: '#f59e0b' },
  slayer:  { name: 'Demon Slayer — Water Moon', emoji: '🌊', color: '#f43f5e' },
  eva:     { name: 'Evangelion — NERV', emoji: '🧬', color: '#84cc16' },
};

const DEFAULT_THEME = 'jujutsu';

export function useTheme() {
  const [theme, setThemeState] = useLocalStorage('lifeos-theme', DEFAULT_THEME);

  const setTheme = useCallback(
    (t) => {
      if (THEMES.includes(t)) {
        setThemeState(t);
        document.documentElement.setAttribute('data-theme', t);
      }
    },
    [setThemeState],
  );

  useEffect(() => {
    if (!THEMES.includes(theme)) {
      setThemeState(DEFAULT_THEME);
      document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, setThemeState]);

  return { theme, setTheme, THEMES, THEME_META };
}
