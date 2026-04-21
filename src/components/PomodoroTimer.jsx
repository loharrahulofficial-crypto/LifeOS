import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { playChime, playBreakChime, playSuccessChime, playTick } from '../utils/audio';
import { playAmbient, stopAmbient } from '../utils/ambient';

// Helper component to decouple slider dragging from global App redraws (Fixes Android lag)
const SmoothSlider = ({ label, min, max, unit, value, onCommit }) => {
  const [localVal, setLocalVal] = useState(value);

  // Keep local value in sync if reset externally
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>{localVal} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={localVal}
        onChange={e => setLocalVal(parseInt(e.target.value))}
        onPointerUp={() => onCommit(localVal)}
        onTouchEnd={() => onCommit(localVal)}
        onKeyUp={() => onCommit(localVal)}
        style={{ width: '100%' }}
        id={`slider-${label.replace(/\s+/g, '-').toLowerCase()}`}
      />
    </div>
  );
};


export default function PomodoroTimer({
  mode, timeDisplay, isRunning, progress, sessionCount, config, stats,
  start, pause, reset, switchMode, updateConfig, toggleSound, levelProps
}) {
  const [ambientSound, setAmbientSound] = useState('none');

  useEffect(() => {
    if (sessionCount > 0 && levelProps) {
      levelProps.addXP(40);
      levelProps.updateStat('int', 1);
    }
  }, [sessionCount, levelProps]);

  useEffect(() => {
    // Unmount or stop when not running
    if (!isRunning) stopAmbient();
    else playAmbient(ambientSound);
    return () => stopAmbient();
  }, [isRunning, ambientSound]);

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
      if (mode !== 'work') playSuccessChime(); // Completed work session, now entering break
      else playBreakChime(); // Completed break, returning to work
    }
  }, [mode]);

  // Play tick on final 5 seconds
  useEffect(() => {
    if (!config.soundEnabled || !isRunning) return;
    const parts = timeDisplay.split(':');
    if (parts.length === 2 && parts[0] === '00') {
      const secs = parseInt(parts[1], 10);
      if (secs <= 5 && secs > 0) {
        playTick();
      }
    }
  }, [timeDisplay, isRunning, config.soundEnabled]);

  const sessionDots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="tab-animate" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 0 10px var(--accent)', borderLeft: '4px solid var(--accent)', paddingLeft: '0.5rem', marginBottom: '1.5rem' }}>
        SYSTEM LINK
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
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '1.5rem 1rem',
        borderRadius: '20px',
        border: `1px solid color-mix(in srgb, ${modeColors[mode]} 50%, transparent)`,
        boxShadow: `0 0 30px color-mix(in srgb, ${modeColors[mode]} 15%, transparent)`,
        background: `linear-gradient(135deg, var(--bg-card), color-mix(in srgb, ${modeColors[mode]} 10%, transparent))`,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* SVG Ring — capped at 200px, scales below that on small screens */}
        <div style={{
          position: 'relative',
          width: 'min(200px, calc(100vw - 6rem))',
          height: 'min(200px, calc(100vw - 6rem))',
          flexShrink: 0,
          marginBottom: '1rem'
        }}>
          <svg
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', display: 'block' }}
          >
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
              animate={{
                filter: isRunning 
                  ? [`drop-shadow(0 0 15px color-mix(in srgb, ${modeColors[mode]} 70%, transparent))`, `drop-shadow(0 0 35px ${modeColors[mode]})`, `drop-shadow(0 0 15px color-mix(in srgb, ${modeColors[mode]} 70%, transparent))`]
                  : `drop-shadow(0 0 15px color-mix(in srgb, ${modeColors[mode]} 50%, transparent))`
              }}
              transition={isRunning ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: isRunning ? 'none' : 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>
          {/* Time in center */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', width: '80%',
            pointerEvents: 'none'
          }}>
            <p style={{
              fontSize: 'clamp(1.6rem, 10vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '0.05em',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              textShadow: `0 0 20px color-mix(in srgb, ${modeColors[mode]} 80%, transparent)`,
              whiteSpace: 'nowrap'
            }}>
              {timeDisplay}
            </p>
            <p style={{ fontSize: '0.75rem', color: modeColors[mode], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
              {modeLabels[mode]}
            </p>
          </div>
        </div>

        {/* Session Dots */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          {sessionDots.map(i => (
            <motion.div
              key={i}
              animate={{ scale: i < (sessionCount % 4) ? 1 : 0.8 }}
              style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < (sessionCount % 4) ? modeColors.work : 'var(--bg-input)',
                border: `2px solid ${i < (sessionCount % 4) ? modeColors.work : 'var(--border)'}`,
                transition: 'all 0.3s', flexShrink: 0,
              }}
            />
          ))}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem', alignSelf: 'center' }}>
            Session {(sessionCount % 4) + 1}/4
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', width: '100%', boxSizing: 'border-box' }}>
          {!isRunning ? (
            <motion.button className="btn-primary" onClick={start} whileTap={{ scale: 0.95 }}
              style={{ flex: 1, justifyContent: 'center', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em', boxShadow: `0 0 15px color-mix(in srgb, ${modeColors[mode]} 50%, transparent)`, background: modeColors[mode] }}>
              ▶ INITIATE
            </motion.button>
          ) : (
            <motion.button className="btn-primary" onClick={pause} whileTap={{ scale: 0.95 }}
              style={{ flex: 1, justifyContent: 'center', background: 'transparent', color: modeColors[mode], border: `2px solid ${modeColors[mode]}`, borderRadius: '12px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em', boxShadow: `inset 0 0 10px color-mix(in srgb, ${modeColors[mode]} 20%, transparent), 0 0 15px color-mix(in srgb, ${modeColors[mode]} 30%, transparent)` }}>
              ⏸ HALT
            </motion.button>
          )}
          <motion.button className="btn-secondary" onClick={reset} whileTap={{ scale: 0.95 }}
            style={{ flex: 1, justifyContent: 'center', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>
            ↺ REBOOT
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
        {/* Ambient Sound Selector */}
        <div style={{ marginTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>🎧 NATURE SOUNDS (OFFLINE)</p>
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'none', label: '🔇 Off' },
              { id: 'rain', label: '🌧️ Rain' },
              { id: 'waves', label: '🌊 Waves' },
              { id: 'focus', label: '🧠 Deep Focus' }
            ].map(sound => (
              <button
                key={sound.id}
                onClick={() => setAmbientSound(sound.id)}
                className={`chip ${ambientSound === sound.id ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
              >
                {sound.label}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
        {[
          { label: 'TODAY', value: stats.todaySessions, sub: 'CYCLES' },
          { label: 'LIFETIME', value: stats.totalSessions, sub: 'CYCLES' },
          { label: 'FOCUS', value: `${Math.round(stats.totalSessions * config.workDuration / 60)}H`, sub: 'TOTAL' }
        ].map((s, i) => (
          <div key={i} className="card-no-hover" style={{ 
            textAlign: 'center', borderRadius: '12px',
            border: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-input))'
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, textShadow: '0 0 8px var(--text-primary)' }}>{s.value}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Duration Config */}
      <div className="card-no-hover" style={{ 
        marginTop: '1rem', borderRadius: '16px',
        border: `1px solid color-mix(in srgb, var(--accent) 30%, transparent)`,
        background: `linear-gradient(135deg, var(--bg-card), color-mix(in srgb, var(--accent) 8%, transparent))`,
        boxShadow: `0 0 20px color-mix(in srgb, var(--accent) 10%, transparent)`
      }}>
        <p className="section-title" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 900, color: 'var(--accent)', textShadow: '0 0 8px var(--accent)80' }}>⚙️ CONFIGURATION</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {[
            { key: 'workDuration', label: 'Work', min: 1, max: 60, unit: 'min' },
            { key: 'shortBreak', label: 'Short Break', min: 1, max: 15, unit: 'min' },
            { key: 'longBreak', label: 'Long Break', min: 1, max: 30, unit: 'min' },
          ].map(({ key, label, min, max, unit }) => (
            <SmoothSlider
              key={key}
              label={label}
              min={min}
              max={max}
              unit={unit}
              value={config[key]}
              onCommit={(val) => updateConfig({ [key]: val })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
