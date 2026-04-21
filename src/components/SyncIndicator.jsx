/**
 * SyncIndicator — Shows cloud sync status
 * ✅ synced  |  🔄 syncing  |  ⚠️ offline/error
 */

import { useSyncStatus } from '../hooks/useSyncStatus';

export default function SyncIndicator() {
  const { syncing, error, lastSynced } = useSyncStatus();

  const getStatus = () => {
    if (error) return { icon: '⚠️', text: 'Offline', color: '#ef4444' };
    if (syncing) return { icon: '🔄', text: 'Syncing...', color: 'var(--accent)' };
    if (lastSynced) return { icon: '☁️', text: 'Synced', color: '#22c55e' };
    return { icon: '💾', text: 'Local', color: 'var(--text-muted)' };
  };

  const status = getStatus();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-light)',
        fontSize: '0.65rem',
        fontWeight: 500,
        color: status.color,
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all 0.3s ease',
        animation: syncing ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }}
      title={lastSynced ? `Last synced: ${lastSynced.toLocaleTimeString()}` : 'Not synced yet'}
    >
      <span style={{ fontSize: '0.75rem', animation: syncing ? 'spin 1s linear infinite' : 'none' }}>
        {status.icon}
      </span>
      <span>{status.text}</span>
    </div>
  );
}
