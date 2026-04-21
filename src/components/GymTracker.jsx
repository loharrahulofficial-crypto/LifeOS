import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { IconMap } from '../utils/IconMap';
import { EXERCISES, MUSCLE_GROUPS, WORKOUT_TEMPLATES } from '../data/gymExercises';
import NumberInput from './NumberInput';
import BodyMap from './BodyMap';

// ─── CSS-only collapsible — zero JS physics, instant on Android ───
function Collapse({ open, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.opacity = '1';
    } else {
      el.style.maxHeight = '0px';
      el.style.opacity = '0';
    }
  }, [open]);
  return (
    <div ref={ref} style={{
      maxHeight: '0px', opacity: '0', overflow: 'hidden',
      transition: 'max-height 0.25s ease, opacity 0.2s ease',
    }}>
      {children}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card-no-hover" style={{ textAlign: 'center', padding: '0.75rem 0.5rem', overflow: 'hidden', minWidth: 0 }}>
      <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{icon}</div>
      <div style={{ fontSize: 'clamp(1.1rem, 4vw, 1.6rem)', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, wordBreak: 'break-all' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function DifficultyBadge({ level }) {
  const colors = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444' };
  return (
    <span style={{
      padding: '0.15rem 0.45rem', borderRadius: 20, fontSize: '0.6rem', fontWeight: 700,
      background: `${colors[level]}22`, color: colors[level], flexShrink: 0,
    }}>{level}</span>
  );
}

// ─── REST TIMER (CSS-only animation) ───────────────────────────────
function RestTimer({ defaultSeconds = 90, onClose }) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, seconds]);

  const pct = ((defaultSeconds - seconds) / defaultSeconds) * 100;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: 24, padding: '2rem',
          textAlign: 'center', width: 280, border: '1px solid var(--border-light)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>REST TIMER</p>
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 1.5rem' }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--ring-track)" strokeWidth="8" />
            <circle
              cx="70" cy="70" r="60" fill="none"
              stroke="var(--accent)" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: seconds <= 10 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
            </span>
            {seconds === 0 && <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>GO!</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
          {[60, 90, 120, 180].map(s => (
            <button key={s} onClick={() => { setSeconds(s); setRunning(true); }}
              style={{
                padding: '0.35rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)',
                background: seconds === s ? 'var(--accent-subtle)' : 'var(--bg-input)',
                color: seconds === s ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit',
              }}
            >{s}s</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setRunning(r => !r)}>
            {running ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onClose}>Skip</button>
        </div>
      </div>
    </div>
  );
}

// ─── EXERCISE PICKER MODAL (pure CSS) ─────────────────────────────
function ExercisePicker({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [selectedEquip, setSelectedEquip] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const exercises = useMemo(() => Object.entries(EXERCISES), []);
  const equipmentOptions = useMemo(() => ['all', ...new Set(exercises.map(([, v]) => v.equipment))], [exercises]);
  const difficultyOptions = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = useMemo(() => exercises.filter(([name, info]) => {
    if (activeGroup && activeGroup !== 'all' && info.muscle !== activeGroup) return false;
    if (activeSub && activeSub !== 'all' && info.sub !== activeSub) return false;
    if (selectedEquip !== 'all' && info.equipment !== selectedEquip) return false;
    if (selectedDifficulty !== 'all' && info.difficulty !== selectedDifficulty) return false;
    if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).slice(0, 100), [exercises, activeGroup, activeSub, selectedEquip, selectedDifficulty, searchQuery]);

  return createPortal(
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" style={{ padding: '0', maxHeight: '92vh', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {(activeGroup || searchQuery) && (
                <button onClick={() => { 
                  if (activeSub) { setActiveSub(null); } 
                  else if (searchQuery) { setSearchQuery(''); setActiveSub(null); setActiveGroup(null); }
                  else { setActiveGroup(null); setActiveSub(null); }
                }} className="btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '1.4rem', color: 'var(--text-muted)' }}>←</button>
              )}
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                {activeSub && activeSub !== 'all' ? MUSCLE_GROUPS[activeGroup]?.subGroups?.[activeSub]?.label : activeGroup && activeGroup !== 'all' ? MUSCLE_GROUPS[activeGroup].label : searchQuery ? 'Search Results' : 'Add Exercise'}
              </h3>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}><IconMap name='focus' size={14} /></button>
          </div>
          
          <input className="input-field" placeholder="🔍 Search any exercise..." value={searchQuery} 
            onChange={e => { setSearchQuery(e.target.value); if(e.target.value) { setActiveGroup('all'); setActiveSub('all'); } }} 
            style={{ padding: '0.8rem 1rem', borderRadius: 14, fontSize: '0.9rem' }} 
          />
          
          {(activeSub || searchQuery) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
                {equipmentOptions.slice(0, 10).map(e => (
                  <button key={e} className={`chip ${selectedEquip === e ? 'active' : ''}`} onClick={() => setSelectedEquip(e)} style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                    {e === 'all' ? 'All Equipment' : e}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
                {difficultyOptions.map(d => (
                  <button key={d} className={`chip ${selectedDifficulty === d ? 'active' : ''}`} onClick={() => setSelectedDifficulty(d)} style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                    {d === 'all' ? 'Any Difficulty' : d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {!activeGroup && !searchQuery ? (
            // Step 1: Big Grid for Muscle Groups
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', paddingBottom: '2rem' }}>
              {Object.entries(MUSCLE_GROUPS).map(([key, mg]) => (
                <button key={key} onClick={() => setActiveGroup(key)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem 0.5rem', borderRadius: 20, border: '1px solid var(--border-light)',
                    background: `linear-gradient(145deg, var(--bg-card), ${mg.color}15)`,
                    cursor: 'pointer', textAlign: 'center', transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                >
                  <span style={{ fontSize: '3rem', marginBottom: '0.75rem', filter: `drop-shadow(0 4px 12px ${mg.color}44)` }}><IconMap name={mg.icon} size={48} /></span>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>{mg.label}</span>
                </button>
              ))}
            </div>
          ) : activeGroup && !activeSub && !searchQuery ? (
            // Step 2: Grid for Sub-Muscles
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', paddingBottom: '2rem' }}>
              <button onClick={() => setActiveSub('all')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '1.25rem 0.5rem', borderRadius: 16, border: '1px solid var(--border-light)',
                  background: `linear-gradient(145deg, var(--bg-card), var(--accent-glow))`,
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><IconMap name='star' size={40} /></span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>All {MUSCLE_GROUPS[activeGroup]?.label}</span>
              </button>
              {Object.entries(MUSCLE_GROUPS[activeGroup]?.subGroups || {}).map(([key, sg]) => (
                <button key={key} onClick={() => setActiveSub(key)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '1.25rem 0.5rem', borderRadius: 16, border: '1px solid var(--border-light)',
                    background: `linear-gradient(145deg, var(--bg-card), ${MUSCLE_GROUPS[activeGroup].color}12)`,
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{sg.label}</span>
                </button>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><IconMap name='focus' size={48} /></div>
              <p style={{ fontWeight: 600 }}>No exercises found</p>
            </div>
          ) : (
            <div style={{ paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {filtered.map(([name, info]) => {
                const mg = MUSCLE_GROUPS[info.muscle];
                return (
                  <button key={name} onClick={() => { onSelect(name); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', borderRadius: 14,
                      border: '1px solid var(--border-light)', background: 'var(--bg-card)',
                      cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit',
                    }}
                  >
                    <span style={{
                      width: 40, height: 40, borderRadius: 12, background: `${mg?.color || 'var(--accent)'}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
                    }}>{mg?.icon || '🏋️'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{info.equipment} · {info.type}</div>
                    </div>
                    <DifficultyBadge level={info.difficulty} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── SET ROW (plain div, no motion) ───────────────────────────────
function SetRow({ set, index, onToggle, onUpdate, isCardio }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px',
      gap: '0.4rem', alignItems: 'center',
      padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)',
      opacity: set.completed ? 0.6 : 1, transition: 'opacity 0.15s',
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8,
        background: set.completed ? 'var(--accent)' : 'var(--bg-input)',
        border: `1px solid ${set.completed ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.72rem', fontWeight: 700, color: set.completed ? '#000' : 'var(--text-muted)',
      }}>{index + 1}</span>
      <NumberInput
        value={set.reps}
        onChange={val => onUpdate('reps', val)}
        min={0}
        placeholder={isCardio ? 'sec' : 'reps'}
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 8, padding: '0.4rem 0.5rem', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', width: '100%', outline: 'none' }}
      />
      <NumberInput
        value={set.weight}
        onChange={val => onUpdate('weight', val)}
        min={0}
        placeholder={isCardio ? 'km' : 'kg'}
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 8, padding: '0.4rem 0.5rem', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', width: '100%', outline: 'none' }}
      />
      <button onClick={onToggle}
        style={{
          width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
          background: set.completed ? 'var(--success)' : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
          transition: 'background 0.15s ease', color: set.completed ? '#000' : 'var(--text-muted)',
        }}
      >{set.completed ? '✓' : '○'}</button>
    </div>
  );
}

// ─── SESSION EXERCISE CARD ─────────────────────────────────────────
function SessionExerciseCard({ ex, onToggleSet, onUpdateSet, onAddSet, onRemove, gymProps, levelProps }) {
  const [showTimer, setShowTimer] = useState(false);
  const exInfo = EXERCISES[ex.name] || {};
  const safeSets = ex.sets || [];
  const completedSets = safeSets.filter(s => s.completed).length;
  const isCardio = exInfo.type === 'Cardio';

  const handleComplete = useCallback((setId) => {
    const set = safeSets.find(s => s.id === setId);
    onToggleSet(ex.id, setId);
    if (!set?.completed) {
      setShowTimer(true);
      if (levelProps) {
        levelProps.addXP(10);
        levelProps.updateStat('str', 1);
      }
    }
  }, [safeSets, ex.id, onToggleSet, levelProps]);

  return (
    <div className="card-no-hover" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: MUSCLE_GROUPS[exInfo.muscle]?.color ? `${MUSCLE_GROUPS[exInfo.muscle].color}22` : 'var(--accent-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
        }}>
          {MUSCLE_GROUPS[exInfo.muscle]?.icon || '🏋️'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent)' }}>{ex.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{exInfo.equipment} · {exInfo.type}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.2rem 0.5rem', borderRadius: 8 }}>{completedSets}/{safeSets.length}</span>
          <button onClick={onRemove} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}><IconMap name='focus' size={14} /></button>
        </div>
      </div>

      <div className="progress-bar-track" style={{ marginBottom: '0.75rem', height: 4 }}>
        <div className="progress-bar-fill" style={{
          width: `${safeSets.length > 0 ? (completedSets / safeSets.length) * 100 : 0}%`,
          background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: '0.4rem', padding: '0 0 0.3rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>SET</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{isCardio ? 'SECS' : 'REPS'}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{isCardio ? 'KM' : 'KG'}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}><IconMap name='tasks' size={14} /></span>
      </div>

      {safeSets.map((set, i) => (
        <SetRow
          key={set.id} set={set} index={i} isCardio={isCardio}
          onToggle={() => handleComplete(set.id)}
          onUpdate={(field, val) => onUpdateSet(ex.id, set.id, field, val)}
        />
      ))}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button onClick={() => gymProps.addSetToExercise(ex.id)} className="btn-secondary" style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}><IconMap name='focus' size={18} /> Add Set</button>
        <button onClick={() => setShowTimer(true)}
          style={{ padding: '0.45rem 0.75rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600 }}
        ><IconMap name='focus' size={14} /> Rest</button>
      </div>

      <input className="input-field" placeholder="📝 Add notes..." value={ex.notes}
        onChange={e => gymProps.updateSessionExercise(ex.id, { notes: e.target.value })}
        style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} />

      {showTimer && <RestTimer defaultSeconds={90} onClose={() => setShowTimer(false)} />}
    </div>
  );
}

// ─── ACTIVE SESSION ────────────────────────────────────────────────
function ActiveSessionView({ session, gymProps, levelProps }) {
  const [showExPicker, setShowExPicker] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    const start = new Date(session.startedAt).getTime();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  const totalSets = (session.exercises || []).reduce((a, ex) => a + (ex.sets?.length || 0), 0);
  const completedSets = (session.exercises || []).reduce((a, ex) => a + (ex.sets?.filter(s => s.completed)?.length || 0), 0);
  const totalVolume = (session.exercises || []).reduce((a, ex) => a + (ex.sets?.filter(s => s.completed)?.reduce((b, s) => b + (s.reps || 0) * (s.weight || 0), 0) || 0), 0);
  const formatTime = s => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div>
      <div className="card-no-hover" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{session.name}</h2>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{session.exercises.length} exercises</div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{formatTime(elapsed)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {[
            { label: 'Sets Done', value: `${completedSets}/${totalSets}` },
            { label: 'Volume', value: `${totalVolume.toLocaleString()}kg` },
            { label: 'Progress', value: `${totalSets ? Math.round((completedSets / totalSets) * 100) : 0}%` },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg-input)', borderRadius: 10, padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)' }}>{item.value}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div className="progress-bar-track" style={{ height: 5 }}>
          <div className="progress-bar-fill" style={{ width: `${totalSets ? (completedSets / totalSets) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowFinishConfirm(true)}><IconMap name='tasks' size={18} /> Finish Workout</button>
          <button className="btn-secondary" onClick={() => gymProps.discardSession()} style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>Discard</button>
        </div>
      </div>

      {session.exercises.map(ex => (
        <SessionExerciseCard key={ex.id} ex={ex} gymProps={gymProps} levelProps={levelProps}
          onToggleSet={(exId, setId) => gymProps.toggleSetCompleted(exId, setId)}
          onUpdateSet={(exId, setId, field, val) => gymProps.updateSetValue(exId, setId, field, val)}
          onAddSet={() => gymProps.addSetToExercise(ex.id)}
          onRemove={() => gymProps.removeExerciseFromSession(ex.id)}
        />
      ))}

      <button onClick={() => setShowExPicker(true)}
        style={{
          width: '100%', padding: '0.9rem', borderRadius: 14, border: '2px dashed var(--border)',
          background: 'transparent', color: 'var(--accent)', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}
      ><IconMap name='focus' size={18} /> Add Exercise</button>

      {showExPicker && <ExercisePicker onSelect={name => gymProps.addExerciseToSession(name)} onClose={() => setShowExPicker(false)} />}

      {showFinishConfirm && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 340, border: '1px solid var(--border-light)', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'scaleIn 0.2s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><IconMap name='gold' size={48} /></div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.35rem' }}>Finish Workout?</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {completedSets} sets completed · {totalVolume.toLocaleString()}kg total volume
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFinishConfirm(false)}>Keep Going</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { gymProps.finishSession(); setShowFinishConfirm(false); }}><IconMap name='tasks' size={18} /> Finish</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── TEMPLATE CARD ────────────────────────────────────────────────
function TemplateCard({ template, onStart, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)',
      padding: '1rem', position: 'relative', overflow: 'hidden',
      transition: 'background 0.15s',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}><IconMap name={template.icon} size={24} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{template.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{template.description}</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, background: 'var(--accent-subtle)', color: 'var(--accent)' }}>⏱ {template.estimatedTime}m</span>
            <DifficultyBadge level={template.difficulty} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{template.exercises.length} exercises</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        {template.exercises.slice(0, 3).map(e => e.name).join(' · ')}{template.exercises.length > 3 && ` +${template.exercises.length - 3} more`}
      </div>
      <button className="btn-primary" onClick={e => { e.stopPropagation(); onStart(template); }} style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center', padding: '0.55rem' }}>
        ▶ Start Workout
      </button>
    </div>
  );
}

// ─── CREATE PLAN MODAL ────────────────────────────────────────────
function CreatePlanModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏋️');
  const [color, setColor] = useState('#f59e0b');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [exercises, setExercises] = useState([]);
  const [showExPicker, setShowExPicker] = useState(false);
  const scrollRef = useRef(null);

  const icons = ['🏋️', '💪', '🔥', '⚡', '🎯', '🏆', '⭐', '🦵', '🫁', '🔙', '🏅', '🌟'];
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;
    onSave({ name, description, icon, color, difficulty, exercises, estimatedTime: exercises.length * 8, category: 'Custom' });
    onClose();
  };

  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }} onClick={onClose}>
        <div style={{ background: 'var(--bg-card)', width: '100%', maxHeight: '90vh', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
          
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Create Workout Plan</h3>
            <button onClick={onClose} className="btn-ghost" style={{ fontSize: '1.1rem', padding: '0.3rem 0.6rem' }}><IconMap name='focus' size={14} /></button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>PLAN NAME</label>
              <input className="input-field" placeholder="e.g. My Push Day" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>DESCRIPTION</label>
              <input className="input-field" placeholder="Brief description..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>ICON</label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {icons.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${icon === ic ? 'var(--accent)' : 'var(--border)'}`, background: icon === ic ? 'var(--accent-subtle)' : 'var(--bg-input)', fontSize: '1.3rem', cursor: 'pointer' }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>COLOR</label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {colors.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'white' : 'transparent'}`, cursor: 'pointer', transition: 'border 0.15s' }} />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>DIFFICULTY</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                  <button key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>EXERCISES ({exercises.length})</label>
              {exercises.map((ex, idx) => (
                <div key={idx} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '0.75rem', marginBottom: '0.4rem', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ex.name}</span>
                    <button onClick={() => setExercises(prev => prev.filter((_, i) => i !== idx))} className="btn-ghost" style={{ padding: '0.2rem 0.45rem', fontSize: '0.8rem', color: 'var(--danger)' }}><IconMap name='focus' size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['sets', 'reps', 'weight'].map(field => (
                      <div key={field} style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', textAlign: 'center', fontWeight: 600 }}>{field.toUpperCase()}</label>
                        <NumberInput
                          value={ex[field]}
                          onChange={val => setExercises(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item))}
                          min={0}
                          style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 8, padding: '0.3rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit', outline: 'none' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setShowExPicker(true)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 12, border: '2px dashed var(--border)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>
                ⊕ Add Exercise
              </button>
            </div>
          </div>

          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }} onClick={handleSave} disabled={!name.trim() || exercises.length === 0}>
              💾 Save Workout Plan
            </button>
          </div>
        </div>
      </div>
      {showExPicker && <ExercisePicker onSelect={name => setExercises(prev => [...prev, { name, sets: 3, reps: 10, weight: 0 }])} onClose={() => setShowExPicker(false)} />}
    </>,
    document.body
  );
}

// ─── HISTORY ITEM ─────────────────────────────────────────────────
function HistoryItem({ log }) {
  const [expanded, setExpanded] = useState(false);
  const totalVolume = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0);
  const totalSets = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
  const date = new Date(log.finishedAt);

  return (
    <div className="card-no-hover" style={{ marginBottom: '0.5rem', padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {log.duration}min
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)' }}>{totalVolume.toLocaleString()}kg</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{totalSets} sets</div>
        </div>
      </div>
      <Collapse open={expanded}>
        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
          {log.exercises.map((ex, i) => {
            const completedSets = ex.sets.filter(s => s.completed);
            if (completedSets.length === 0) return null;
            return (
              <div key={i} style={{ marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)' }}>{ex.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{completedSets.map(s => `${s.reps}×${s.weight}kg`).join(', ')}</span>
              </div>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}

// ─── EXERCISE BROWSER ─────────────────────────────────────────────
function ExerciseBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [equip, setEquip] = useState('all');
  const [diff, setDiff] = useState('all');
  const [selectedEx, setSelectedEx] = useState(null);

  const all = useMemo(() => Object.entries(EXERCISES), []);
  const equipOptions = useMemo(() => ['all', ...new Set(all.map(([, v]) => v.equipment))], [all]);

  const { filteredCount, grouped } = useMemo(() => {
    let count = 0;
    const limit = 80;
    const localGrouped = {};
    const searchLower = searchQuery.toLowerCase();
    for (let i = 0; i < all.length; i++) {
        const [name, info] = all[i];
        if (activeGroup && activeGroup !== 'all' && info.muscle !== activeGroup) continue;
        if (activeSub && activeSub !== 'all' && info.sub !== activeSub) continue;
        if (equip !== 'all' && info.equipment !== equip) continue;
        if (diff !== 'all' && info.difficulty !== diff) continue;
        if (searchLower && !name.toLowerCase().includes(searchLower)) continue;
        count++;
        if (count <= limit) {
          if (!localGrouped[info.muscle]) localGrouped[info.muscle] = [];
          localGrouped[info.muscle].push([name, info]);
        }
    }
    return { filteredCount: count, grouped: localGrouped };
  }, [all, activeGroup, activeSub, equip, diff, searchQuery]);

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        {(activeGroup || searchQuery) && (
          <button onClick={() => { 
            if (activeSub) { setActiveSub(null); } 
            else if (searchQuery) { setSearchQuery(''); setActiveSub(null); setActiveGroup(null); }
            else { setActiveGroup(null); setActiveSub(null); }
          }} className="btn-ghost" style={{ padding: '0.4rem 0.6rem', fontSize: '1.4rem', color: 'var(--text-muted)' }}>←</button>
        )}
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeSub && activeSub !== 'all' ? MUSCLE_GROUPS[activeGroup]?.subGroups?.[activeSub]?.label : activeGroup && activeGroup !== 'all' ? MUSCLE_GROUPS[activeGroup].label : searchQuery ? 'Search Results' : 'All Exercises'}
        </h2>
      </div>

      <input className="input-field" placeholder="🔍 Search all exercises..." value={searchQuery} 
        onChange={e => { setSearchQuery(e.target.value); if(e.target.value) { setActiveGroup('all'); setActiveSub('all'); } }} 
        style={{ marginBottom: '0.75rem', padding: '0.8rem 1rem', borderRadius: 14 }} 
      />

      {(activeSub || searchQuery) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
            {equipOptions.slice(0, 10).map(e => (
              <button key={e} className={`chip ${equip === e ? 'active' : ''}`} onClick={() => setEquip(e)} style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                {e === 'all' ? 'All Equipment' : e}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
            {['all', 'Beginner', 'Intermediate', 'Advanced'].map(d => (
              <button key={d} className={`chip ${diff === d ? 'active' : ''}`} onClick={() => setDiff(d)} style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                {d === 'all' ? 'Any Difficulty' : d}
              </button>
            ))}
          </div>
        </div>
      )}

      {!activeGroup && !searchQuery ? (
        // Step 1: Big Grid for Muscle Groups
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', paddingBottom: '2rem' }}>
          {Object.entries(MUSCLE_GROUPS).map(([key, mg]) => (
            <button key={key} onClick={() => setActiveGroup(key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '1.75rem 0.5rem', borderRadius: 20, border: '1px solid var(--border-light)',
                background: `linear-gradient(145deg, var(--bg-card), ${mg.color}15)`,
                cursor: 'pointer', textAlign: 'center', transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <span style={{ fontSize: '3.5rem', marginBottom: '0.75rem', filter: `drop-shadow(0 4px 12px ${mg.color}44)` }}><IconMap name={mg.icon} size={48} /></span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>{mg.label}</span>
            </button>
          ))}
        </div>
      ) : activeGroup && !activeSub && !searchQuery ? (
        // Step 2: Grid for Sub-Muscles
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', paddingBottom: '2rem' }}>
          <button onClick={() => setActiveSub('all')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem 0.5rem', borderRadius: 16, border: '1px solid var(--border-light)',
              background: `linear-gradient(145deg, var(--bg-card), var(--accent-glow))`,
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}><IconMap name='star' size={40} /></span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>All {MUSCLE_GROUPS[activeGroup]?.label}</span>
          </button>
          {Object.entries(MUSCLE_GROUPS[activeGroup]?.subGroups || {}).map(([key, sg]) => (
            <button key={key} onClick={() => setActiveSub(key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem 0.5rem', borderRadius: 16, border: '1px solid var(--border-light)',
                background: `linear-gradient(145deg, var(--bg-card), ${MUSCLE_GROUPS[activeGroup].color}12)`,
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{sg.label}</span>
            </button>
          ))}
        </div>
      ) : (
        // Step 3: Exercise List
        <>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
            {filteredCount} exercises {filteredCount > 80 && '(showing top 80)'}
          </p>
          {filteredCount === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><IconMap name='focus' size={48} /></div>
              <p style={{ fontWeight: 600 }}>No exercises found</p>
            </div>
          )}
          {Object.entries(grouped).map(([mg, exList]) => (
            <div key={mg} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', padding: '0.35rem 0.5rem', borderRadius: 8, background: `${MUSCLE_GROUPS[mg]?.color || 'var(--accent)'}11` }}>
                <span style={{ fontSize: '1.2rem' }}>{MUSCLE_GROUPS[mg]?.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: MUSCLE_GROUPS[mg]?.color || 'var(--accent)' }}>{MUSCLE_GROUPS[mg]?.label}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({exList.length})</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '0.4rem' }}>
                {exList.map(([name, info]) => (
                  <div key={name}
                    onClick={() => setSelectedEx(selectedEx === name ? null : name)}
                    style={{
                      padding: '0.85rem', borderRadius: 14,
                      border: `1px solid ${selectedEx === name ? MUSCLE_GROUPS[mg]?.color || 'var(--accent)' : 'var(--border-light)'}`,
                      background: selectedEx === name ? `${MUSCLE_GROUPS[mg]?.color || 'var(--accent)'}11` : 'var(--bg-card)',
                      cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{info.equipment}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>·</span>
                      <DifficultyBadge level={info.difficulty} />
                    </div>
                    <Collapse open={selectedEx === name}>
                      <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                        <strong>Targets:</strong> {MUSCLE_GROUPS[mg]?.subGroups?.[info.sub]?.label || info.sub}
                        <br /><strong>Type:</strong> {info.type}
                      </div>
                    </Collapse>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── MAIN GYM TRACKER ─────────────────────────────────────────────
export default function GymTracker(props) {
  const {
    gymData, stats, startSession, createPlan, deletePlan,
    toggleSetCompleted, updateSetValue, addSetToExercise,
    removeSetFromExercise, addExerciseToSession, removeExerciseFromSession,
    finishSession, discardSession, updateSessionExercise,
  } = props;

  const [activeView, setActiveView] = useState('stats');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [templateCategory, setTemplateCategory] = useState('all');

  const gymProps = {
    toggleSetCompleted, updateSetValue, addSetToExercise,
    removeSetFromExercise, addExerciseToSession, removeExerciseFromSession,
    finishSession, discardSession, updateSessionExercise,
  };

  // ── ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURN ──────────────
  const calculateMuscleRanks = useMemo(() => {
    const xp = {};
    Object.keys(MUSCLE_GROUPS).forEach(k => xp[k] = 0);
    (gymData.workoutLogs || []).forEach(log => {
      (log.exercises || []).forEach(ex => {
        const m = EXERCISES[ex.name]?.muscle;
        if (!m || xp[m] === undefined) return;
        (ex.sets || []).forEach(set => {
          if (set.completed) {
            xp[m] += (set.reps || 0) * ((set.weight > 0 ? set.weight : 5));
          }
        });
      });
    });

    const getRank = (score) => {
      if (score >= 1000000) return { title: 'Legendary', color: '#ff4500', icon: 'legendary', max: null, min: 1000000 };
      if (score >= 500000) return { title: 'Master', color: '#c084fc', icon: 'master', max: 1000000, min: 500000 };
      if (score >= 200000) return { title: 'Diamond', color: '#06b6d4', icon: 'diamond', max: 500000, min: 200000 };
      if (score >= 75000) return { title: 'Platinum', color: '#14b8a6', icon: 'platinum', max: 200000, min: 75000 };
      if (score >= 25000) return { title: 'Gold', color: '#eab308', icon: 'gold', max: 75000, min: 25000 };
      if (score >= 5000) return { title: 'Silver', color: '#9ca3af', icon: 'silver', max: 25000, min: 5000 };
      return { title: 'Novice', color: '#8c7e75', icon: 'wood', max: 5000, min: 0 };
    };

    return Object.keys(xp).map(m => ({
      id: m,
      label: MUSCLE_GROUPS[m]?.label || m,
      icon: MUSCLE_GROUPS[m]?.icon || '🏋️',
      xp: Math.round(xp[m]),
      rank: getRank(xp[m])
    })).sort((a, b) => b.xp - a.xp);
  }, [gymData.workoutLogs]);

  const categories = useMemo(() => ['all', ...new Set(WORKOUT_TEMPLATES.map(t => t.category))], []);
  const filteredTemplates = useMemo(() => templateCategory === 'all' ? WORKOUT_TEMPLATES : WORKOUT_TEMPLATES.filter(t => t.category === templateCategory), [templateCategory]);
  const allCustomPlans = gymData.workoutPlans || [];

  // ── NOW safe to conditionally render ─────────────────────────────
  if (gymData.activeSession) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 12px var(--success)', display: 'inline-block', animation: 'pulse-glow 1.5s infinite' }} />
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--success)' }}>Active Session</h2>
        </div>
        <ActiveSessionView session={gymData.activeSession} gymProps={gymProps} levelProps={props.levelProps} />
      </div>
    );
  }

  const NAV = [
    { id: 'stats',     icon: 'stats', label: 'Stats' },
    { id: 'home',      icon: 'home', label: 'Home' },
    { id: 'templates', icon: 'tasks', label: 'Templates' },
    { id: 'exercises', icon: 'focus', label: 'Exercises' },
    { id: 'history',  icon: 'habits', label: 'History' },
    { id: 'plans',    icon: 'zap', label: 'My Plans' },
  ];


  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          fontWeight: 900, fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>GymOS</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Track every rep, every set, every PR</p>
      </div>

      {/* Sub-Nav */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', marginBottom: '1.25rem', paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setActiveView(n.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap',
              padding: '0.45rem 0.75rem', borderRadius: 20, border: '1px solid',
              borderColor: activeView === n.id ? 'var(--accent)' : 'var(--border)',
              background: activeView === n.id ? 'var(--accent-subtle)' : 'var(--bg-card)',
              color: activeView === n.id ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.78rem',
              transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
              flexShrink: 0, WebkitTapHighlightColor: 'transparent',
            }}
          ><span><IconMap name={n.icon} size={16} /></span><span>{n.label}</span></button>
        ))}
      </div>

      {/* HOME */}
      <div style={{ display: activeView === 'home' ? 'block' : 'none' }}>
        <button className="btn-primary" style={{
          width: '100%', justifyContent: 'center', marginBottom: '1.25rem',
          padding: '0.9rem 1rem', fontSize: '0.95rem', fontWeight: 800,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}
          onClick={() => startSession({ id: 'custom_empty', name: 'Custom Session', category: 'custom', icon: 'zap', difficulty: 'Any', estimatedTime: 0, exercises: [] })}>
          ⊕ START EMPTY SESSION
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <StatCard icon="gym" label="Workouts" value={stats.totalWorkouts} />
          <StatCard icon="core" label="This Week" value={stats.thisWeek} sub="sessions" />
          <StatCard icon="stats" label="Volume" value={`${((stats.totalVolume || 0) / 1000).toFixed(1)}T`} sub="tonnes" />
          <StatCard icon="tasks" label="Sets" value={(stats.totalSets || 0).toLocaleString()} />
        </div>
        <div className="card-no-hover" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>QUICK START</h3>
            <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} onClick={() => setActiveView('templates')}>View All →</button>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
            {WORKOUT_TEMPLATES.slice(0, 5).map(t => (
              <button key={t.id} onClick={() => startSession(t)}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0, width: 140, padding: '0.85rem', borderRadius: 16, border: '1px solid var(--border-light)', background: 'var(--bg-input)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ fontSize: '1.4rem' }}><IconMap name={t.icon} size={24} /></span>
                  <DifficultyBadge level={t.difficulty} />
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.2, height: '2.4em' }}>{t.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 600 }}>{t.estimatedTime}m · {t.exercises.length} ex</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        {Object.keys(stats.prs || {}).length > 0 && (
          <div className="card-no-hover" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Personal Records</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.4rem' }}>
              {Object.entries(stats.prs).slice(0, 6).map(([ex, weight]) => (
                <div key={ex} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.6rem 0.75rem', borderRadius: 12, background: 'var(--bg-input)', border: '1px solid var(--border-light)', minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex}</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>{weight}kg</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {(gymData.workoutLogs || []).length > 0 && (
          <div className="card-no-hover" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>RECENT SESSIONS</h3>
              <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} onClick={() => setActiveView('history')}>View All →</button>
            </div>
            {(gymData.workoutLogs || []).slice(0, 3).map((log, i) => <HistoryItem key={i} log={log} />)}
          </div>
        )}
      </div>

      {/* TEMPLATES */}
      <div style={{ display: activeView === 'templates' ? 'block' : 'none' }}>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '1rem', paddingBottom: '4px' }}>
          {categories.map(c => <button key={c} className={`chip ${templateCategory === c ? 'active' : ''}`} onClick={() => setTemplateCategory(c)} style={{ whiteSpace: 'nowrap' }}>{c === 'all' ? 'All' : c}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {filteredTemplates.map(t => <TemplateCard key={t.id} template={t} color={t.color} onStart={startSession} />)}
          {allCustomPlans.filter(p => templateCategory === 'all' || p.category === templateCategory).map(plan => <TemplateCard key={plan.id} template={plan} color={plan.color || 'var(--accent)'} onStart={startSession} />)}
        </div>
      </div>

      {/* EXERCISES */}
      <div style={{ display: activeView === 'exercises' ? 'block' : 'none' }}>
        <ExerciseBrowser />
      </div>

      {/* HISTORY */}
      <div style={{ display: activeView === 'history' ? 'block' : 'none' }}>
        {(gymData.workoutLogs || []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📊</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No workouts yet</h3>
            <p style={{ fontSize: '0.82rem' }}>Start your first session to see your history</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
              <StatCard icon="gym" label="Workouts" value={stats.totalWorkouts} />
              <StatCard icon="stats" label="Volume" value={`${((stats.totalVolume || 0) / 1000).toFixed(1)}T`} />
              <StatCard icon="⏱" label="This Week" value={stats.thisWeek} />
            </div>
            {(gymData.workoutLogs || []).map((log, i) => <HistoryItem key={i} log={log} />)}
          </div>
        )}
      </div>

      {/* STATS (MUSCLE BODY MAP) */}
      <div style={{ display: activeView === 'stats' ? 'block' : 'none' }}>
        <BodyMap muscleRanks={calculateMuscleRanks} />
      </div>

      {/* MY PLANS */}
      <div style={{ display: activeView === 'plans' ? 'block' : 'none' }}>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '0.75rem' }} onClick={() => setShowCreatePlan(true)}>
          ⊕ Create New Workout Plan
        </button>
        {allCustomPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚡</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>No custom plans yet</h3>
            <p style={{ fontSize: '0.82rem' }}>Create your first personalized workout plan</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {allCustomPlans.map(plan => (
              <div key={plan.id} style={{ position: 'relative' }}>
                <TemplateCard template={plan} color={plan.color || 'var(--accent)'} onStart={startSession} />
                <button onClick={() => { if (confirm('Delete this plan?')) deletePlan(plan.id); }}
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: 8, padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreatePlan && <CreatePlanModal onSave={createPlan} onClose={() => setShowCreatePlan(false)} />}
    </div>
  );
}

