import { motion } from 'motion/react';
import ThemeSwitcher from './ThemeSwitcher';

const NAV_ITEMS = [
  { id: 'habits', label: 'Habits', icon: '📋' },
  { id: 'pomodoro', label: 'Pomodoro', icon: '⏱️' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'gym', label: 'Gym', icon: '🏋️' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'ai', label: 'AI Coach', icon: '🤖' },
];

export default function Sidebar({ activeTab, setActiveTab, themeProps }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <div>
              <h1 style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>
                LifeOS
              </h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-2px' }}>Personal Tracker</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {NAV_ITEMS.map(item => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '0.25rem',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                fontWeight: activeTab === item.id ? 600 : 500,
                background: activeTab === item.id ? 'var(--accent-subtle)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: '60%',
                    borderRadius: 4,
                    background: 'var(--accent)',
                  }}
                />
              )}
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>THEME</p>
          <ThemeSwitcher {...themeProps} />
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.4rem 0.6rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === item.id ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === item.id ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.65rem',
              fontWeight: activeTab === item.id ? 600 : 400,
              transition: 'all 0.2s ease',
              minWidth: '52px',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>
    </>
  );
}
