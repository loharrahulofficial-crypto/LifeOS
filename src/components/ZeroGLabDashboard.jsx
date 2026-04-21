import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ShieldAlert, Zap, Activity } from 'lucide-react';

export default function ZeroGLabDashboard({ phase }) {
  const [data, setData] = useState(Array.from({ length: 40 }, () => ({ val: 0 })));
  const [scram, setScram] = useState(false);

  useEffect(() => {
    if (scram) return;
    // Massive mobile optimization: Reduced telemetry tick frequency to 1200ms (approx 1Hz)
    // to prevent heavy React DOM thrashing inside Recharts on low-end Androids.
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        const val = Math.sin(Date.now() / 800) * 4 + (Math.random() * 3 - 1.5);
        newData.push({ val });
        return newData;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [scram]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        width: '100%',
        maxWidth: 580,
        margin: '0 auto 1rem auto',
        padding: '1.25rem',
        borderRadius: 18,
        background: scram ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)',
        border: `1px solid ${scram ? '#ef4444' : 'var(--accent)'}`,
        boxShadow: `0 8px 32px ${scram ? 'rgba(239, 68, 68, 0.2)' : 'var(--shadow-color)'}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color={scram ? '#ef4444' : "var(--accent)"} />
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: scram ? '#ef4444' : 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Zero-G Telemetry — Phase {phase}
          </h3>
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: scram ? '#ef4444' : '#10b981', padding: '0.2rem 0.6rem', borderRadius: '8px', background: scram ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)' }}>
          {scram ? 'CONTAINMENT BREACH' : 'CONTAINMENT STABLE'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 12, border: '1px solid var(--border-light)' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Magnetic Field (T)</p>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {scram ? '0.00' : '4.21'} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+/- 0.05</span>
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 12, border: '1px solid var(--border-light)' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Inertial Diff</p>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {scram ? '0.00%' : '-0.012%'}
          </div>
        </div>
      </div>

      <div style={{ height: 60, width: '100%', marginBottom: '1.25rem', opacity: scram ? 0.3 : 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={[-8, 8]} hide />
            <Line type="monotone" dataKey="val" stroke={scram ? '#ef4444' : "var(--accent)"} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 4, color: '#f59e0b' }} />
          System Power {scram ? '0' : '8.4'} kW
        </div>
        <button 
          onClick={() => setScram(!scram)}
          style={{ 
            background: scram ? '#ef4444' : 'transparent',
            color: scram ? '#fff' : '#ef4444',
            border: `2px solid #ef4444`,
            padding: '0.4rem 1rem',
            borderRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <ShieldAlert size={16} />
          {scram ? 'Reset Safety' : 'Scram System'}
        </button>
      </div>
    </motion.div>
  );
}
