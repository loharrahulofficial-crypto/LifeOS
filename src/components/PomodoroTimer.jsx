import { useEffect } from 'react';
import { motion } from 'motion/react';
import { playChime, playBreakChime } from '../utils/audio';

export default function PomodoroTimer({
  mode, timeDisplay, isRunning, progress, sessionCount, config, stats,
  start, pause, reset, resetAll, switchMode, updateConfig, toggleSound, completeSession
}) {
  const radius = 90;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const modeColors = {
    work: 'var(--accent)',
    shortBreak: 'var(--success)',
    longBreak: '#06b6d4',
  };

  const modeLabels = {
    work: '🎯 Focus',
    shortBreak: '☕ Short Break',
    longBreak: '🌴 Long Break',
  };

  // Play chime on mode change (when timer hits 0)
  useEffect(() => {
    if (progress === 0 && !isRunning) return;
    if (progress >= 1 && config.soundEnabled) {
      if (mode === 'work') playBreakChime();
      else playChime();
    }
  }, [mode]);

  const sessionDots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
        ⏱️ Pomodoro Timer
      </h2>

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(modeLabels).map(([m, label]) => (
          <button
            key={m}
            className={`chip ${mode === m ? 'active' : ''}`}
            onClick={() => switchMode(m)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="card-no-hover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
        {/* SVG Ring */}
        <div style={{ position: 'relative', width: radius * 2, height: radius * 2, marginBottom: '1.5rem' }}>
          <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              stroke="var(--ring-track)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress */}
            <motion.circle
              stroke={modeColors[mode]}
              fill="transparent"
              strokeWidth={stroke}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease',
                filter: `drop-shadow(0 0 8px ${modeColors[mode]}40)`,
              }}
            />
          </svg>
          {/* Time in center */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.05em', fontVariantNumeric: 'tabular-nums' }}>
              {timeDisplay}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {modeLabels[mode]}
            </p>
          </div>
        </div>

        {/* Session Dots */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {sessionDots.map(i => (
            <motion.div
              key={i}
              animate={{ scale: i < (sessionCount % 4) ? 1 : 0.8 }}
              style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < (sessionCount % 4) ? modeColors.work : 'var(--bg-input)',
                border: `2px solid ${i < (sessionCount % 4) ? modeColors.work : 'var(--border)'}`,
                transition: 'all 0.3s',
              }}
            />
          ))}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem', alignSelf: 'center' }}>
            Session {(sessionCount % 4) + 1}/4
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          {!isRunning ? (
            <motion.button className="btn-primary" onClick={start} whileTap={{ scale: 0.95 }}
              style={{ minWidth: 120, justifyContent: 'center' }}>
              ▶ Start
            </motion.button>
          ) : (
            <motion.button className="btn-primary" onClick={pause} whileTap={{ scale: 0.95 }}
              style={{ minWidth: 120, justifyContent: 'center', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              ⏸ Pause
            </motion.button>
          )}
          <motion.button className="btn-secondary" onClick={reset} whileTap={{ scale: 0.95 }}>
            ↺ Reset
          </motion.button>
        </div>

        {/* Sound Toggle */}
        <button
          className="btn-ghost"
          onClick={toggleSound}
          style={{ color: config.soundEnabled ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          {config.soundEnabled ? '🔔 Sound On' : '🔇 Sound Off'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
        <div className="card-no-hover" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>Today</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.todaySessions}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>sessions</p>
        </div>
        <div className="card-no-hover" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>All Time</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalSessions}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>sessions</p>
        </div>
        <div className="card-no-hover" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>Focus Time</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Math.round(stats.totalSessions * config.workDuration / 60)}h</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>total</p>
        </div>
      </div>

      {/* Duration Config */}
      <div className="card-no-hover" style={{ marginTop: '1rem' }}>
        <p className="section-title">⚙️ Timer Settings</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'workDuration', label: 'Work', min: 1, max: 60, unit: 'min' },
            { key: 'shortBreak', label: 'Short Break', min: 1, max: 15, unit: 'min' },
            { key: 'longBreak', label: 'Long Break', min: 1, max: 30, unit: 'min' },
          ].map(({ key, label, min, max, unit }) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>{config[key]} {unit}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={config[key]}
                onChange={e => updateConfig({ [key]: parseInt(e.target.value) })}
                style={{ width: '100%' }}
                id={`slider-${key}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
