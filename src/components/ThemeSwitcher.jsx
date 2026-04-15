import { motion } from 'motion/react';

export default function ThemeSwitcher({ theme, setTheme, THEMES, THEME_META }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {THEMES.map(t => (
        <motion.button
          key={t}
          onClick={() => setTheme(t)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          title={THEME_META[t].name}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: THEME_META[t].color,
            border: theme === t ? '3px solid var(--text-primary)' : '3px solid transparent',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: theme === t ? `0 0 12px ${THEME_META[t].color}40` : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
      ))}
    </div>
  );
}
