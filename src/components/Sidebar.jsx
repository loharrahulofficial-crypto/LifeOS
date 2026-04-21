import { motion } from 'motion/react';
import ThemeSwitcher from './ThemeSwitcher';
import RadialMenu from './RadialMenu';
import { 
  Home, 
  Repeat, 
  CheckSquare, 
  Crosshair, 
  Dna, 
  Dumbbell, 
  BarChart2, 
  Bot,
  Orbit
} from 'lucide-react';

const NAV_IDS = ['dashboard', 'habits', 'tasks', 'pomodoro', 'nutrition', 'gym', 'stats', 'ai'];
const NAV_LABELS = ['Home', 'Habits', 'Tasks', 'Focus', 'Diet', 'Gym', 'Stats', 'F.R.I.D.A.Y.'];

/** One canonical row for every theme: icon order matches NAV_IDS exactly. */
const NAV_TAB_ICONS = [
  <Home size={20} strokeWidth={2.5} />,
  <Repeat size={20} strokeWidth={2.5} />,
  <CheckSquare size={20} strokeWidth={2.5} />,
  <Crosshair size={20} strokeWidth={2.5} />,
  <Dna size={20} strokeWidth={2.5} />,
  <Dumbbell size={20} strokeWidth={2.5} />,
  <BarChart2 size={20} strokeWidth={2.5} />,
  <Bot size={20} strokeWidth={2.5} />
];

export default function Sidebar({ activeTab, setActiveTab, themeProps, levelProps }) {
  const navItems = NAV_IDS.map((id, i) => ({
    id,
    label: NAV_LABELS[i],
    icon: NAV_TAB_ICONS[i],
  }));

  const level = levelProps?.level || 1;
  const rank = levelProps?.rank || { title: 'Player', color: 'var(--accent)' };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `color-mix(in srgb, ${rank.color} 20%, transparent)`, border: `2px solid ${rank.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, color: rank.color, textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
              {level}
            </div>
            <div>
              <h1 style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '0.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Orbit className="text-accent" size={20} strokeWidth={2.5} style={{ color: 'var(--accent)' }} /> 
                LifeOS
              </h1>
              <p style={{ fontSize: '0.65rem', color: rank.color, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                {rank.title}
              </p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {navItems.map(item => (
            <motion.button
              key={item.id}
              type="button"
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
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }} aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>THEME</p>
          <ThemeSwitcher {...themeProps} />
        </div>
      </aside>

      {/* Mobile Radial Menu */}
      <RadialMenu navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}
