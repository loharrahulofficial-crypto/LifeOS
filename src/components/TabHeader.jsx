// Shared RPG-style tab header shown at the top of every module tab
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function TabHeader({ title, icon, levelProps }) {
  const [userName] = useLocalStorage('lifeos-username', 'System User');
  const level = levelProps?.level || 1;
  const xp = levelProps?.xp || 0;
  const rank = levelProps?.rank || { title: 'Novice Soul', color: '#94a3b8' };
  const progressPercent = levelProps?.progressPercent || 0;
  const nextLevelXP = levelProps?.nextLevelXP || 100;

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--bg-card), var(--bg-input))',
      border: '1px solid var(--border-light)',
      borderRadius: 16,
      padding: '0.85rem 1rem',
      marginBottom: '1.25rem',
      boxSizing: 'border-box',
      width: '100%',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Level badge */}
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `color-mix(in srgb, ${rank.color} 15%, transparent)`,
          border: `2px solid ${rank.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 900, color: rank.color,
          boxShadow: `0 0 12px ${rank.color}40`,
        }}>
          {level}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              <span style={{ fontWeight: 900, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
            </div>
            <span style={{ fontSize: '0.6rem', color: rank.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
              {rank.title}
            </span>
          </div>

          {/* XP bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
            <div style={{ flex: 1, height: 5, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${rank.color}80, ${rank.color})`,
                boxShadow: `0 0 6px ${rank.color}`,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0 }}>
              {Math.floor(xp)} / {Math.floor(nextLevelXP)} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
