import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EXERCISES, MUSCLE_GROUPS, WORKOUT_TEMPLATES } from '../data/gymExercises';

// ─────────────────────── SUB-COMPONENTS ───────────────────────

function StatCard({ icon, label, value, sub }) {
  return (
    <div
      className="card-no-hover"
      style={{ textAlign: 'center', padding: '1rem' }}
    >
      <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function DifficultyBadge({ level }) {
  const colors = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444' };
  return (
    <span style={{
      padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700,
      background: `${colors[level]}22`, color: colors[level], letterSpacing: '0.02em',
    }}>{level}</span>
  );
}

function TimerBadge({ minutes }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600,
      background: 'var(--accent-subtle)', color: 'var(--accent)',
    }}>⏱ {minutes}m</span>
  );
}

// REST TIMER
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
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        style={{
          background: 'var(--bg-card)', borderRadius: 24, padding: '2rem',
          textAlign: 'center', width: 280, border: '1px solid var(--border-light)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          REST TIMER
        </p>
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
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: seconds <= 10 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
            </span>
            {seconds === 0 && <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>GO!</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
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
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setRunning(r => !r)}>
            {running ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onClose}>Skip</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// EXERCISE PICKER
function ExercisePicker({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedSub, setSelectedSub] = useState('all');
  const [selectedEquip, setSelectedEquip] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const exercises = Object.entries(EXERCISES);
  const equipmentOptions = ['all', ...new Set(exercises.map(([, v]) => v.equipment))];
  const typeOptions = ['all', 'Compound', 'Isolation', 'Cardio'];

  const subGroups = selectedMuscle !== 'all'
    ? Object.entries(MUSCLE_GROUPS[selectedMuscle]?.subGroups || {})
    : [];

  const filtered = exercises.filter(([name, info]) => {
    const matchMuscle = selectedMuscle === 'all' || info.muscle === selectedMuscle;
    const matchSub = selectedSub === 'all' || info.sub === selectedSub;
    const matchEquip = selectedEquip === 'all' || info.equipment === selectedEquip;
    const matchType = selectedType === 'all' || info.type === selectedType;
    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMuscle && matchSub && matchEquip && matchType && matchSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        zIndex: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          background: 'var(--bg-secondary)', borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 680, maxHeight: '88vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--border-light)', borderBottom: 'none',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Add Exercise</h3>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '1.1rem' }}>✕</button>
          </div>
          <input
            className="input-field"
            placeholder="🔍 Search exercises..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Filters */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
          {/* Muscle Group */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'none' }}>
            <button
              className={`chip ${selectedMuscle === 'all' ? 'active' : ''}`}
              onClick={() => { setSelectedMuscle('all'); setSelectedSub('all'); }}
            >All</button>
            {Object.entries(MUSCLE_GROUPS).map(([key, mg]) => (
              <button
                key={key}
                className={`chip ${selectedMuscle === key ? 'active' : ''}`}
                onClick={() => { setSelectedMuscle(key); setSelectedSub('all'); }}
                style={{ whiteSpace: 'nowrap' }}
              >
                {mg.icon} {mg.label}
              </button>
            ))}
          </div>
          {/* Sub Group */}
          {subGroups.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginTop: '0.4rem', paddingBottom: '0.4rem', scrollbarWidth: 'none' }}>
              <button className={`chip ${selectedSub === 'all' ? 'active' : ''}`} onClick={() => setSelectedSub('all')}>All</button>
              {subGroups.map(([key, sg]) => (
                <button
                  key={key}
                  className={`chip ${selectedSub === key ? 'active' : ''}`}
                  onClick={() => setSelectedSub(key)}
                  style={{ whiteSpace: 'nowrap', fontSize: '0.72rem' }}
                >{sg.label}</button>
              ))}
            </div>
          )}
          {/* Equipment & Type */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            {equipmentOptions.slice(0, 8).map(e => (
              <button key={e} className={`chip ${selectedEquip === e ? 'active' : ''}`} onClick={() => setSelectedEquip(e)}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
              >{e === 'all' ? '🏋️ All Equipment' : e}</button>
            ))}
            <span style={{ width: '100%', height: 0 }} />
            {typeOptions.map(t => (
              <button key={t} className={`chip ${selectedType === t ? 'active' : ''}`} onClick={() => setSelectedType(t)}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
              >{t === 'all' ? 'Any Type' : t}</button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            {filtered.length} EXERCISES
          </p>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <p>No exercises found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {filtered.map(([name, info]) => {
                const mg = MUSCLE_GROUPS[info.muscle];
                return (
                  <motion.button
                    key={name}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onSelect(name); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: 12,
                      border: '1px solid var(--border-light)', background: 'var(--bg-card)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      fontFamily: 'inherit', transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{
                      width: 36, height: 36, borderRadius: 10, background: `${mg.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', flexShrink: 0,
                    }}>{mg.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {mg?.subGroups[info.sub]?.label || info.sub} · {info.equipment}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
                      <DifficultyBadge level={info.difficulty} />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>{info.type}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// SET ROW
function SetRow({ set, index, onToggle, onUpdate, onRemove, isCardio }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        display: 'grid',
        gridTemplateColumns: isCardio ? '28px 1fr 1fr 36px' : '28px 1fr 1fr 36px',
        gap: '0.4rem', alignItems: 'center',
        padding: '0.4rem 0',
        borderBottom: '1px solid var(--border-light)',
        opacity: set.completed ? 0.6 : 1,
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: 8,
        background: set.completed ? 'var(--accent)' : 'var(--bg-input)',
        border: `1px solid ${set.completed ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.72rem', fontWeight: 700, color: set.completed ? '#000' : 'var(--text-muted)',
        flexShrink: 0,
      }}>{index + 1}</span>

      <input
        type="number"
        value={set.reps}
        onChange={e => onUpdate('reps', Number(e.target.value))}
        style={{
          background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)',
          borderRadius: 8, padding: '0.4rem 0.5rem', textAlign: 'center',
          fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', width: '100%',
          outline: 'none',
        }}
        placeholder={isCardio ? 'sec' : 'reps'}
      />
      <input
        type="number"
        value={set.weight}
        onChange={e => onUpdate('weight', Number(e.target.value))}
        style={{
          background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)',
          borderRadius: 8, padding: '0.4rem 0.5rem', textAlign: 'center',
          fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', width: '100%',
          outline: 'none',
        }}
        placeholder={isCardio ? 'km' : 'kg'}
      />
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onToggle}
        style={{
          width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
          background: set.completed ? 'var(--success)' : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
          transition: 'all 0.2s ease',
        }}
      >
        {set.completed ? '✓' : '○'}
      </motion.button>
    </motion.div>
  );
}

// ACTIVE SESSION EXERCISE CARD
function SessionExerciseCard({ ex, onToggleSet, onUpdateSet, onAddSet, onRemove, onAddNote, gymProps }) {
  const [showTimer, setShowTimer] = useState(false);
  const [timerSecs, setTimerSecs] = useState(ex.restTimer || 90);
  const exInfo = EXERCISES[ex.name] || {};
  const completedSets = ex.sets.filter(s => s.completed).length;
  const isCardio = exInfo.type === 'Cardio';

  const lastCompleted = ex.sets.filter(s => s.completed).at(-1);
  const handleComplete = (setId) => {
    onToggleSet(ex.id, setId);
    const set = ex.sets.find(s => s.id === setId);
    if (!set?.completed) setShowTimer(true); // show timer when marking complete
  };

  return (
    <div
      className="card-no-hover"
      style={{ marginBottom: '0.75rem', padding: '1rem' }}
    >
      {/* Header */}
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
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {exInfo.equipment} · {exInfo.type}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
            background: 'var(--bg-input)', padding: '0.2rem 0.5rem', borderRadius: 8,
          }}>{completedSets}/{ex.sets.length} sets</span>
          <button onClick={onRemove} className="btn-ghost"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track" style={{ marginBottom: '0.75rem', height: 4 }}>
        <div className="progress-bar-fill" style={{
          width: `${(completedSets / ex.sets.length) * 100}%`,
          background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
        }} />
      </div>

      {/* Set header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px',
        gap: '0.4rem', padding: '0 0 0.3rem',
        borderBottom: '1px solid var(--border-light)', marginBottom: '0.25rem',
      }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>SET</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
          {isCardio ? 'SECS' : 'REPS'}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
          {isCardio ? 'KM' : 'KG'}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>✓</span>
      </div>

      {/* Sets */}
      <AnimatePresence>
        {ex.sets.map((set, i) => (
          <SetRow
            key={set.id}
            set={set}
            index={i}
            isCardio={isCardio}
            onToggle={() => handleComplete(set.id)}
            onUpdate={(field, val) => onUpdateSet(ex.id, set.id, field, val)}
            onRemove={() => gymProps.removeSetFromExercise(ex.id, set.id)}
          />
        ))}
      </AnimatePresence>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button
          onClick={() => gymProps.addSetToExercise(ex.id)}
          className="btn-secondary"
          style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
        >
          ⊕ Add Set
        </button>
        <button
          onClick={() => setShowTimer(true)}
          style={{
            padding: '0.45rem 0.75rem', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-input)', color: 'var(--accent)', cursor: 'pointer',
            fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600,
          }}
        >⏱ Rest</button>
      </div>

      {/* Notes */}
      <input
        className="input-field"
        placeholder="📝 Add notes..."
        value={ex.notes}
        onChange={e => gymProps.updateSessionExercise(ex.id, { notes: e.target.value })}
        style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
      />

      {showTimer && (
        <AnimatePresence>
          <RestTimer defaultSeconds={timerSecs} onClose={() => setShowTimer(false)} />
        </AnimatePresence>
      )}
    </div>
  );
}

// ACTIVE SESSION VIEW
function ActiveSessionView({ session, gymProps }) {
  const [showExPicker, setShowExPicker] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    const start = new Date(session.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  const totalSets = session.exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const completedSets = session.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
  const totalVolume = session.exercises.reduce((a, ex) =>
    a + ex.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0);

  const formatTime = (s) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div>
      {/* Session Header */}
      <div className="card-no-hover" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{session.name}</h2>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {session.exercises.length} exercises
            </div>
          </div>
          <div style={{
            fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          }}>
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {[
            { label: 'Sets Done', value: `${completedSets}/${totalSets}` },
            { label: 'Volume', value: `${totalVolume.toLocaleString()}kg` },
            { label: 'Progress', value: `${totalSets ? Math.round((completedSets / totalSets) * 100) : 0}%` },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg-input)', borderRadius: 10, padding: '0.5rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)' }}>{item.value}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div className="progress-bar-track" style={{ height: 5 }}>
          <div className="progress-bar-fill" style={{
            width: `${totalSets ? (completedSets / totalSets) * 100 : 0}%`,
            background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
          }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={() => setShowFinishConfirm(true)}
          >🏁 Finish Workout</button>
          <button
            className="btn-secondary"
            onClick={() => gymProps.discardSession()}
            style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
          >Discard</button>
        </div>
      </div>

      {/* Exercises */}
      <AnimatePresence>
        {session.exercises.map(ex => (
          <SessionExerciseCard
            key={ex.id}
            ex={ex}
            gymProps={gymProps}
            onToggleSet={(exId, setId) => gymProps.toggleSetCompleted(exId, setId)}
            onUpdateSet={(exId, setId, field, val) => gymProps.updateSetValue(exId, setId, field, val)}
            onAddSet={() => gymProps.addSetToExercise(ex.id)}
            onRemove={() => gymProps.removeExerciseFromSession(ex.id)}
            onAddNote={note => gymProps.updateSessionExercise(ex.id, { notes: note })}
          />
        ))}
      </AnimatePresence>

      {/* Add Exercise */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowExPicker(true)}
        style={{
          width: '100%', padding: '0.9rem', borderRadius: 14,
          border: '2px dashed var(--border)', background: 'transparent',
          color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
          fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '0.5rem',
        }}
      >
        ⊕ Add Exercise
      </motion.button>

      {/* Modals */}
      <AnimatePresence>
        {showExPicker && (
          <ExercisePicker
            onSelect={(name) => gymProps.addExerciseToSession(name)}
            onClose={() => setShowExPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Finish Confirm */}
      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--bg-card)', borderRadius: 20, padding: '1.5rem',
                width: '100%', maxWidth: 340, border: '1px solid var(--border-light)',
                textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.35rem' }}>Finish Workout?</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {completedSets} sets completed · {totalVolume.toLocaleString()}kg total volume
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFinishConfirm(false)}>
                  Keep Going
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => { gymProps.finishSession(); setShowFinishConfirm(false); }}>
                  🏁 Finish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// TEMPLATE CARD
function TemplateCard({ template, onStart, color }) {
  const diffColors = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444' };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      style={{
        background: 'var(--bg-card)', borderRadius: 16,
        border: '1px solid var(--border-light)',
        padding: '1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: '16px 16px 0 0',
      }} />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
        }}>{template.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{template.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
            {template.description}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <TimerBadge minutes={template.estimatedTime} />
            <DifficultyBadge level={template.difficulty} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {template.exercises.length} exercises
            </span>
          </div>
        </div>
      </div>

      {/* Exercises preview */}
      <div style={{
        marginTop: '0.75rem', padding: '0.5rem 0.75rem',
        background: 'var(--bg-input)', borderRadius: 8,
        fontSize: '0.72rem', color: 'var(--text-muted)',
      }}>
        {template.exercises.slice(0, 3).map(e => e.name).join(' · ')}
        {template.exercises.length > 3 && ` +${template.exercises.length - 3} more`}
      </div>

      <button
        className="btn-primary"
        onClick={(e) => { e.stopPropagation(); onStart(template); }}
        style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center', padding: '0.55rem' }}
      >
        ▶ Start Workout
      </button>
    </motion.div>
  );
}

// CREATE PLAN MODAL
function CreatePlanModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏋️');
  const [color, setColor] = useState('#f59e0b');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [exercises, setExercises] = useState([]);
  const [showExPicker, setShowExPicker] = useState(false);
  const [exPickerIdx, setExPickerIdx] = useState(null);

  const icons = ['🏋️', '💪', '🔥', '⚡', '🎯', '🏆', '⭐', '🦵', '🫁', '🔙', '🏅', '🌟'];
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

  const addExercise = (name) => {
    setExercises(prev => [...prev, { name, sets: 3, reps: 10, weight: 0 }]);
  };

  const updateExercise = (idx, field, value) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex));
  };

  const removeExercise = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;
    onSave({ name, description, icon, color, difficulty, exercises, estimatedTime: exercises.length * 8, category: 'Custom' });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)', zIndex: 120,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          background: 'var(--bg-secondary)', borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 680, maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--border-light)', borderBottom: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Create Workout Plan</h3>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: '1.1rem', padding: '0.3rem 0.6rem' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {/* Name + Desc */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>PLAN NAME</label>
            <input className="input-field" placeholder="e.g. My Push Day" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>DESCRIPTION</label>
            <input className="input-field" placeholder="Brief description..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          {/* Icon */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>ICON</label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {icons.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)}
                  style={{
                    width: 40, height: 40, borderRadius: 10, border: `2px solid ${icon === ic ? 'var(--accent)' : 'var(--border)'}`,
                    background: icon === ic ? 'var(--accent-subtle)' : 'var(--bg-input)',
                    fontSize: '1.3rem', cursor: 'pointer',
                  }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>COLOR</label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {colors.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'white' : 'transparent'}`,
                    cursor: 'pointer', transition: 'border 0.15s',
                  }} />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>DIFFICULTY</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                <button key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              EXERCISES ({exercises.length})
            </label>
            {exercises.map((ex, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)', borderRadius: 12, padding: '0.75rem',
                marginBottom: '0.4rem', border: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ex.name}</span>
                  <button onClick={() => removeExercise(idx)} className="btn-ghost"
                    style={{ padding: '0.2rem 0.45rem', fontSize: '0.8rem', color: 'var(--danger)' }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['sets', 'reps', 'weight'].map(field => (
                    <div key={field} style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', textAlign: 'center', fontWeight: 600 }}>
                        {field.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        value={ex[field]}
                        onChange={e => updateExercise(idx, field, Number(e.target.value))}
                        style={{
                          width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', borderRadius: 8, padding: '0.3rem',
                          textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
                          outline: 'none',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowExPicker(true)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 12,
                border: '2px dashed var(--border)', background: 'transparent',
                color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 600, fontSize: '0.85rem',
              }}
            >⊕ Add Exercise</button>
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-light)' }}>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
            onClick={handleSave}
            disabled={!name.trim() || exercises.length === 0}
          >
            💾 Save Workout Plan
          </button>
        </div>

        <AnimatePresence>
          {showExPicker && (
            <ExercisePicker
              onSelect={(name) => { addExercise(name); }}
              onClose={() => setShowExPicker(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// HISTORY LOG ITEM
function HistoryItem({ log }) {
  const [expanded, setExpanded] = useState(false);
  const totalVolume = log.exercises.reduce((a, ex) =>
    a + ex.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0);
  const totalSets = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
  const date = new Date(log.finishedAt);

  return (
    <div
      className="card-no-hover"
      style={{ marginBottom: '0.5rem', padding: '0.9rem 1rem', cursor: 'pointer' }}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            {' · '}{log.duration}min
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)' }}>{totalVolume.toLocaleString()}kg</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{totalSets} sets</div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}
          >
            {log.exercises.map((ex, i) => {
              const completedSets = ex.sets.filter(s => s.completed);
              if (completedSets.length === 0) return null;
              return (
                <div key={i} style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)' }}>{ex.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {completedSets.map(s => `${s.reps}×${s.weight}kg`).join(', ')}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────── MAIN GYM TRACKER ───────────────────────
export default function GymTracker(props) {
  const {
    gymData, stats, startSession, createPlan, deletePlan,
    toggleSetCompleted, updateSetValue, addSetToExercise,
    removeSetFromExercise, addExerciseToSession, removeExerciseFromSession,
    finishSession, discardSession, updateSessionExercise,
  } = props;

  const [activeView, setActiveView] = useState('home'); // home | templates | exercises | history | plans
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [templateCategory, setTemplateCategory] = useState('all');

  const gymProps = {
    toggleSetCompleted, updateSetValue, addSetToExercise,
    removeSetFromExercise, addExerciseToSession, removeExerciseFromSession,
    finishSession, discardSession, updateSessionExercise,
  };

  // If there's an active session, show session view
  if (gymData.activeSession) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', background: 'var(--success)',
            boxShadow: '0 0 12px var(--success)', display: 'inline-block',
            animation: 'pulse-glow 1.5s infinite',
          }} />
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--success)' }}>Active Session</h2>
        </div>
        <ActiveSessionView session={gymData.activeSession} gymProps={gymProps} />
      </div>
    );
  }

  const categories = ['all', ...new Set(WORKOUT_TEMPLATES.map(t => t.category))];
  const filteredTemplates = templateCategory === 'all'
    ? WORKOUT_TEMPLATES
    : WORKOUT_TEMPLATES.filter(t => t.category === templateCategory);

  const allCustomPlans = gymData.workoutPlans;

  const NAV = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'templates', icon: '📋', label: 'Templates' },
    { id: 'exercises', icon: '🔍', label: 'Exercises' },
    { id: 'history', icon: '📊', label: 'History' },
    { id: 'plans', icon: '⚡', label: 'My Plans' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          🏋️ GymOS
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Track every rep, every set, every PR
        </p>
      </div>

      {/* Sub-Nav */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '1.25rem', paddingBottom: '4px' }}>
        {NAV.map(n => (
          <motion.button
            key={n.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActiveView(n.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap',
              padding: '0.45rem 0.9rem', borderRadius: 20, border: '1px solid',
              borderColor: activeView === n.id ? 'var(--accent)' : 'var(--border)',
              background: activeView === n.id ? 'var(--accent-subtle)' : 'var(--bg-card)',
              color: activeView === n.id ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
              fontSize: '0.8rem', transition: 'all 0.2s ease',
            }}
          >
            <span>{n.icon}</span>
            <span>{n.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── HOME ── */}
        {activeView === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <StatCard icon="🏋️" label="Total Workouts" value={stats.totalWorkouts} />
              <StatCard icon="🔥" label="This Week" value={stats.thisWeek} sub="sessions" />
              <StatCard icon="📊" label="Total Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}T`} sub="tonnes lifted" />
              <StatCard icon="✅" label="Total Sets" value={stats.totalSets.toLocaleString()} />
            </div>

            {/* Quick Start */}
            <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.85rem', color: 'var(--text-muted)' }}>QUICK START</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {WORKOUT_TEMPLATES.slice(0, 4).map(t => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startSession(t)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.65rem 0.85rem', borderRadius: 12,
                      border: '1px solid var(--border-light)', background: 'var(--bg-input)',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.estimatedTime}min · {t.exercises.length} exercises</div>
                    </div>
                    <DifficultyBadge level={t.difficulty} />
                    <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>▶</span>
                  </motion.button>
                ))}
              </div>
              <button
                className="btn-ghost"
                style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                onClick={() => setActiveView('templates')}
              >View all templates →</button>
            </div>

            {/* Recent PRs */}
            {Object.keys(stats.prs).length > 0 && (
              <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>🏆 PERSONAL RECORDS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {Object.entries(stats.prs).slice(0, 6).map(([ex, weight]) => (
                    <div key={ex} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.45rem 0.75rem', borderRadius: 8, background: 'var(--bg-input)',
                    }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{ex}</span>
                      <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.88rem' }}>{weight}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent History */}
            {gymData.workoutLogs.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>RECENT SESSIONS</h3>
                {gymData.workoutLogs.slice(0, 3).map((log, i) => <HistoryItem key={i} log={log} />)}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TEMPLATES ── */}
        {activeView === 'templates' && (
          <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '1rem', paddingBottom: '4px' }}>
              {categories.map(c => (
                <button
                  key={c}
                  className={`chip ${templateCategory === c ? 'active' : ''}`}
                  onClick={() => setTemplateCategory(c)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '0.75rem' }}>
              {filteredTemplates.map(t => (
                <TemplateCard key={t.id} template={t} color={t.color} onStart={startSession} />
              ))}
              {allCustomPlans.filter(p => templateCategory === 'all' || p.category === templateCategory).map(plan => (
                <TemplateCard
                  key={plan.id}
                  template={plan}
                  color={plan.color || 'var(--accent)'}
                  onStart={startSession}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── EXERCISE BROWSER ── */}
        {activeView === 'exercises' && (
          <motion.div key="exercises" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ExerciseBrowser />
          </motion.div>
        )}

        {/* ── HISTORY ── */}
        {activeView === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {gymData.workoutLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📊</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No workouts yet</h3>
                <p style={{ fontSize: '0.82rem' }}>Start your first session to see your history</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  <StatCard icon="🏋️" label="Workouts" value={stats.totalWorkouts} />
                  <StatCard icon="📊" label="Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}T`} />
                  <StatCard icon="⏱" label="This Week" value={stats.thisWeek} />
                </div>
                {gymData.workoutLogs.map((log, i) => <HistoryItem key={i} log={log} />)}
              </div>
            )}
          </motion.div>
        )}

        {/* ── MY PLANS ── */}
        {activeView === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '0.75rem' }}
              onClick={() => setShowCreatePlan(true)}
            >
              ⊕ Create New Workout Plan
            </motion.button>

            {allCustomPlans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚡</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>No custom plans yet</h3>
                <p style={{ fontSize: '0.82rem' }}>Create your first personalized workout plan</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '0.75rem' }}>
                {allCustomPlans.map(plan => (
                  <div key={plan.id} style={{ position: 'relative' }}>
                    <TemplateCard template={plan} color={plan.color || 'var(--accent)'} onStart={startSession} />
                    <button
                      onClick={() => { if (confirm('Delete this plan?')) deletePlan(plan.id); }}
                      style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        background: 'var(--danger-bg)', color: 'var(--danger)',
                        border: 'none', borderRadius: 8, padding: '0.25rem 0.5rem',
                        cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit',
                      }}
                    >Delete</button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showCreatePlan && (
          <CreatePlanModal onSave={createPlan} onClose={() => setShowCreatePlan(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────── EXERCISE BROWSER (full) ───────────────────────
function ExerciseBrowser() {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('all');
  const [sub, setSub] = useState('all');
  const [equip, setEquip] = useState('all');
  const [diff, setDiff] = useState('all');
  const [selectedEx, setSelectedEx] = useState(null);

  const all = Object.entries(EXERCISES);
  const equipOptions = ['all', ...new Set(all.map(([, v]) => v.equipment))];
  const subGroups = muscle !== 'all' ? Object.entries(MUSCLE_GROUPS[muscle]?.subGroups || {}) : [];

  const filtered = all.filter(([name, info]) => {
    return (muscle === 'all' || info.muscle === muscle)
      && (sub === 'all' || info.sub === sub)
      && (equip === 'all' || info.equipment === equip)
      && (diff === 'all' || info.difficulty === diff)
      && name.toLowerCase().includes(search.toLowerCase());
  });

  // Group by muscle
  const grouped = {};
  filtered.forEach(([name, info]) => {
    if (!grouped[info.muscle]) grouped[info.muscle] = [];
    grouped[info.muscle].push([name, info]);
  });

  return (
    <div>
      <input
        className="input-field"
        placeholder="🔍 Search all exercises..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '0.75rem' }}
      />

      {/* Muscle filter */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '0.5rem', paddingBottom: '4px' }}>
        <button className={`chip ${muscle === 'all' ? 'active' : ''}`} onClick={() => { setMuscle('all'); setSub('all'); }}>All</button>
        {Object.entries(MUSCLE_GROUPS).map(([key, mg]) => (
          <button
            key={key}
            className={`chip ${muscle === key ? 'active' : ''}`}
            onClick={() => { setMuscle(key); setSub('all'); }}
            style={{ whiteSpace: 'nowrap' }}
          >{mg.icon} {mg.label}</button>
        ))}
      </div>

      {/* Sub group */}
      {subGroups.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '0.5rem', paddingBottom: '4px' }}>
          <button className={`chip ${sub === 'all' ? 'active' : ''}`} onClick={() => setSub('all')}>All</button>
          {subGroups.map(([key, sg]) => (
            <button key={key} className={`chip ${sub === key ? 'active' : ''}`} onClick={() => setSub(key)}
              style={{ whiteSpace: 'nowrap', fontSize: '0.72rem' }}>{sg.label}</button>
          ))}
        </div>
      )}

      {/* Equipment + Difficulty */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {equipOptions.slice(0, 8).map(e => (
          <button key={e} className={`chip ${equip === e ? 'active' : ''}`} onClick={() => setEquip(e)}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
          >{e === 'all' ? 'All Equipment' : e}</button>
        ))}
        {['all', 'Beginner', 'Intermediate', 'Advanced'].map(d => (
          <button key={d} className={`chip ${diff === d ? 'active' : ''}`} onClick={() => setDiff(d)}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
          >{d === 'all' ? 'Any Difficulty' : d}</button>
        ))}
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
        {filtered.length} of {all.length} exercises
      </p>

      {/* Results grouped by muscle */}
      {Object.entries(grouped).map(([mg, exList]) => (
        <div key={mg} style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem',
            padding: '0.35rem 0.5rem', borderRadius: 8, background: `${MUSCLE_GROUPS[mg]?.color || 'var(--accent)'}11`,
          }}>
            <span style={{ fontSize: '1rem' }}>{MUSCLE_GROUPS[mg]?.icon}</span>
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: MUSCLE_GROUPS[mg]?.color || 'var(--accent)' }}>
              {MUSCLE_GROUPS[mg]?.label}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({exList.length})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '0.4rem' }}>
            {exList.map(([name, info]) => (
              <motion.div
                key={name}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedEx(selectedEx === name ? null : name)}
                style={{
                  padding: '0.65rem 0.85rem', borderRadius: 10,
                  border: `1px solid ${selectedEx === name ? MUSCLE_GROUPS[mg]?.color || 'var(--accent)' : 'var(--border-light)'}`,
                  background: selectedEx === name ? `${MUSCLE_GROUPS[mg]?.color || 'var(--accent)'}11` : 'var(--bg-card)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{name}</div>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{info.equipment}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>·</span>
                  <DifficultyBadge level={info.difficulty} />
                </div>
                <AnimatePresence>
                  {selectedEx === name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.4rem' }}
                    >
                      <strong>Targets:</strong> {MUSCLE_GROUPS[mg]?.subGroups[info.sub]?.label || info.sub}
                      <br /><strong>Type:</strong> {info.type}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
