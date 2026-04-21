import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const ThemeSwitcher = memo(function ThemeSwitcher({ theme, setTheme, THEMES, THEME_META }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost"
        style={{
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', borderRadius: '50%', color: 'var(--text-primary)', padding: 0
        }}
      >
        <span>⋮</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '110%', right: 0,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '0.5rem', minWidth: '200px',
              maxHeight: 'min(72vh, 480px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              zIndex: 5000, boxShadow: '0 10px 25px var(--shadow-color)',
              display: 'flex', flexDirection: 'column', gap: '0.2rem',
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '0.25rem 0.5rem', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Anime Themes
            </div>
            {THEMES.map(t => (
              <button
                key={t}
                onClick={() => { setTheme(t); setIsOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem', borderRadius: 8, outline: 'none',
                  background: theme === t ? 'var(--bg-card-hover)' : 'transparent',
                  border: `1px solid ${theme === t ? 'var(--accent)' : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: theme === t ? 600 : 500,
                  transition: 'all 0.2s ease', fontFamily: 'inherit'
                }}
              >
                <span style={{ fontSize: '1.2rem', minWidth: '1.5rem', textAlign: 'center' }}>{THEME_META[t].emoji}</span>
                <span style={{ flex: 1 }}>{THEME_META[t].name}</span>
                {theme === t && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800 }}>✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ThemeSwitcher;
