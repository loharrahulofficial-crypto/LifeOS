import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { get52WeekGrid, getToday, formatDisplayDate, getMonthDates, getDayName, getWeekDates } from '../utils/dateUtils';
import { playSuccessChime } from '../utils/audio';
import { IconMap } from '../utils/IconMap';

const ICON_OPTIONS = ['check', 'arms', 'book', 'walk', 'water', 'target', 'sun', 'moonstar', 'art', 'music', 'write', 'brain', 'apple', 'pill', 'food', 'money', 'star', 'focus', 'home', 'gym'];
const COLOR_OPTIONS = ['#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#3b82f6', '#f97316', '#14b8a6', '#a855f7'];

export default function HabitTracker({ habits, completions, addHabit, removeHabit, toggleCompletion, isCompleted, getStreak, getLongestStreak, getHeatmapData, getAllHeatmapData, getDayCompletionCount, levelProps }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('check');
  const [newColor, setNewColor] = useState('#f59e0b');
  const [view, setView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedHabitHeatmap, setSelectedHabitHeatmap] = useState(null);

  const [hoverCell, setHoverCell] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const today = getToday();

  const handleAdd = () => {
    if (!newName.trim()) return;
    addHabit(newName.trim(), newEmoji, newColor);
    setNewName('');
    setNewEmoji('check');
    setNewColor('#f59e0b');
    setShowAddForm(false);
  };

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const monthDates = useMemo(() => getMonthDates(calYear, calMonth), [calYear, calMonth]);
  const heatmapGrid = useMemo(() => get52WeekGrid(), []);
  const allHeatmap = useMemo(() => getAllHeatmapData(), [completions, habits]);

  const heatmapData = useMemo(() => {
    if (selectedHabitHeatmap) return getHeatmapData(selectedHabitHeatmap);
    return allHeatmap;
  }, [selectedHabitHeatmap, allHeatmap, getHeatmapData, completions]);

  const maxHeatVal = useMemo(() => {
    const vals = Object.values(heatmapData);
    return Math.max(1, ...vals);
  }, [heatmapData]);

  const getHeatmapColor = (val) => {
    if (!val) return 'var(--heatmap-0)';
    const ratio = val / maxHeatVal;
    if (ratio <= 0.25) return 'var(--heatmap-1)';
    if (ratio <= 0.5) return 'var(--heatmap-2)';
    if (ratio <= 0.75) return 'var(--heatmap-3)';
    return 'var(--heatmap-4)';
  };

  const views = ['daily', 'weekly', 'monthly', 'yearly'];

  const handleToggle = (id, date) => {
    const wasCompleted = isCompleted(id, date);
    toggleCompletion(id, date);
    if (!wasCompleted) {
      playSuccessChime();
      if (levelProps) {
        levelProps.addXP(25);
        levelProps.updateStat('agi', 1);
      }
    }
  };

  return (
    <div style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconMap name="habits" size={24} /> Habits
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {formatDisplayDate(selectedDate)}
          </p>
        </div>
        <motion.button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          whileTap={{ scale: 0.95 }}
        >
          {showAddForm ? '✕ Cancel' : '+ New Habit'}
        </motion.button>
      </div>

      {/* View Switcher */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {views.map(v => (
          <button
            key={v}
            className={`chip ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '1rem', overflow: 'hidden' }}
          >
            <p className="section-title">Create New Habit</p>
            <input
              className="input-field"
              placeholder="Habit name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ marginBottom: '0.75rem' }}
              id="habit-name-input"
            />
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>Emoji</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {ICON_OPTIONS.map(e => (
                  <motion.button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    whileTap={{ scale: 0.85 }}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: newEmoji === e ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: newEmoji === e ? 'var(--accent-subtle)' : 'var(--bg-input)', cursor: 'pointer', fontSize: '1.1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: newEmoji === e ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    <IconMap name={e} size={18} />
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>Color</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {COLOR_OPTIONS.map(c => (
                  <motion.button
                    key={c}
                    onClick={() => setNewColor(c)}
                    whileTap={{ scale: 0.85 }}
                    style={{
                      width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: newColor === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                      boxShadow: newColor === c ? `0 0 10px ${c}60` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
            <motion.button className="btn-primary" onClick={handleAdd} whileTap={{ scale: 0.95 }} style={{ width: '100%', justifyContent: 'center' }}>
              ✓ Add Habit
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            <IconMap name="target" size={48} />
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No habits yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create your first habit to start tracking!</p>
        </div>
      )}

      {/* DAILY VIEW */}
      {view === 'daily' && habits.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <button className="btn-ghost" onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}>←</button>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedDate === today ? 'Today' : formatDisplayDate(selectedDate)}</span>
            <button className="btn-ghost" onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              if (d.toISOString().split('T')[0] <= today) {
                setSelectedDate(d.toISOString().split('T')[0]);
              }
            }}>→</button>
            {selectedDate !== today && (
              <button className="btn-ghost" onClick={() => setSelectedDate(today)} style={{ color: 'var(--accent)' }}>Today</button>
            )}
          </div>

          {/* Progress Summary */}
          <div className="card-no-hover" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>TODAY'S PROGRESS</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {habits.filter(h => isCompleted(h.id, selectedDate)).length}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {habits.length}</span>
              </p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `conic-gradient(var(--accent) ${(habits.filter(h => isCompleted(h.id, selectedDate)).length / habits.length) * 360}deg, var(--bg-input) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                {Math.round((habits.filter(h => isCompleted(h.id, selectedDate)).length / habits.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Habit List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {habits.map((habit) => {
              const completed = isCompleted(habit.id, selectedDate);
              const streak = getStreak(habit.id);
              return (
                <div
                  key={habit.id}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}
                >
                  <motion.div
                    onClick={() => handleToggle(habit.id, selectedDate)}
                    whileTap={{ scale: 0.8 }}
                    animate={{ scale: completed ? [1, 1.25, 1] : 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      border: `2px solid ${completed ? habit.color : 'var(--border)'}`,
                      background: completed ? habit.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', cursor: 'pointer', flexShrink: 0,
                      boxShadow: completed ? `0 0 12px ${habit.color}50` : 'none',
                    }}
                  >
                    {completed && (
                      <motion.svg initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </motion.div>
                  <div style={{ width: 32, display: 'flex', justifyContent: 'center', flexShrink: 0, color: 'var(--text-secondary)' }}>
                    <IconMap name={habit.emoji || 'check'} size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <p style={{
                      fontWeight: 600, fontSize: '0.9rem',
                      textDecoration: completed ? 'line-through' : 'none',
                      color: completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {habit.name}
                    </p>
                  </div>
                  {streak > 0 && (
                    <div className="badge" style={{ background: `${habit.color}18`, color: habit.color, flexShrink: 0 }}>
                      🔥 {streak}
                    </div>
                  )}
                  <button
                    onClick={() => removeHabit(habit.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', flexShrink: 0, WebkitTapHighlightColor: 'transparent' }}
                    title="Delete habit"
                  >
                    <IconMap name="focus" size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* WEEKLY VIEW */}
      {view === 'weekly' && habits.length > 0 && (
        <div className="card-no-hover" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: 380, borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Habit</th>
                {weekDates.map(d => (
                  <th key={d} style={{ padding: '0.5rem', color: d === today ? 'var(--accent)' : 'var(--text-muted)', fontWeight: d === today ? 700 : 500, textAlign: 'center' }}>
                    {getDayName(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => (
                <tr key={habit.id}>
                  <td style={{ padding: '0.5rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.4rem', color: 'var(--text-secondary)' }}>
                      <IconMap name={habit.emoji || 'check'} size={14} />
                    </span>
                    <span style={{ verticalAlign: 'middle' }}>{habit.name}</span>
                  </td>
                  {weekDates.map(d => {
                    const done = isCompleted(habit.id, d);
                    return (
                      <td key={d} style={{ textAlign: 'center', padding: '0.35rem' }}>
                        <motion.div
                          onClick={() => d <= today && handleToggle(habit.id, d)}
                          whileTap={{ scale: 0.8 }}
                          animate={done ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ duration: 0.3 }}
                          style={{
                            width: 28, height: 28, borderRadius: 8, margin: '0 auto',
                            background: done ? habit.color : 'var(--bg-input)',
                            border: `1px solid ${done ? habit.color : 'var(--border)'}`,
                            cursor: d <= today ? 'pointer' : 'default',
                            opacity: d <= today ? 1 : 0.3,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', color: '#fff',
                          }}
                        >
                          {done && '✓'}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MONTHLY VIEW */}
      {view === 'monthly' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button className="btn-ghost" onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
              else setCalMonth(m => m - 1);
            }}>← Prev</button>
            <span style={{ fontWeight: 700 }}>{new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button className="btn-ghost" onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
              else setCalMonth(m => m + 1);
            }}>Next →</button>
          </div>
          <div className="card-no-hover">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0.4rem' }}>{d}</div>
              ))}
              {monthDates.map((cell, i) => {
                const count = getDayCompletionCount(cell.date);
                const isT = cell.date === today;
                return (
                  <div
                    key={i}
                    onClick={() => { setSelectedDate(cell.date); setView('daily'); }}
                    style={{
                      padding: '0.35rem', borderRadius: 8, cursor: 'pointer',
                      background: isT ? 'var(--accent-subtle)' : count > 0 ? getHeatmapColor(count) : 'transparent',
                      border: isT ? '2px solid var(--accent)' : '2px solid transparent',
                      opacity: cell.inMonth ? 1 : 0.25,
                      fontSize: '0.8rem', fontWeight: isT ? 700 : 400,
                      color: isT ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    {new Date(cell.date).getDate()}
                    {count > 0 && <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{count}✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* YEARLY VIEW — Heatmap */}
      {view === 'yearly' && (
        <div>
          {/* Habit selector for heatmap */}
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              className={`chip ${!selectedHabitHeatmap ? 'active' : ''}`}
              onClick={() => setSelectedHabitHeatmap(null)}
            >
              All Habits
            </button>
            {habits.map(h => (
                <button
                  key={h.id}
                  className={`chip ${selectedHabitHeatmap === h.id ? 'active' : ''}`}
                  onClick={() => setSelectedHabitHeatmap(h.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <IconMap name={h.emoji || 'check'} size={14} /> {h.name}
                </button>
            ))}
          </div>

          <div className="card-no-hover" style={{ overflowX: 'auto', padding: '1.25rem', WebkitOverflowScrolling: 'touch', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', minWidth: 53 * 14 + 30, overflow: 'hidden' }}>
              <svg width={53 * 14 + 30} height={7 * 14 + 24} style={{ display: 'block', overflow: 'hidden' }}>
                {/* Day labels */}
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
                  <text key={i} x={0} y={i * 14 + 24} fontSize="9" fill="var(--text-muted)" fontFamily="DM Sans" dominantBaseline="middle">
                    {label}
                  </text>
                ))}
                {/* Heatmap cells */}
                {heatmapGrid.map((week, wi) => (
                  week.map((date, di) => (
                    date && (
                      <rect
                        key={`${wi}-${di}`}
                        x={wi * 14 + 30}
                        y={di * 14 + 14}
                        width={11}
                        height={11}
                        rx={2.5}
                        fill={getHeatmapColor(heatmapData[date] || 0)}
                        style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                        onMouseEnter={() => setHoverCell({ x: wi * 14 + 30, y: di * 14, date, value: heatmapData[date] || 0 })}
                        onMouseLeave={() => setHoverCell(null)}
                        onClick={() => { setSelectedDate(date); setView('daily'); }}
                      />
                    )
                  ))
                ))}
              </svg>
              {/* Tooltip */}
              {hoverCell && (
                <div className="tooltip" style={{ left: hoverCell.x + 16, top: hoverCell.y - 8 }}>
                  {formatDisplayDate(hoverCell.date)}: {hoverCell.value} {selectedHabitHeatmap ? (hoverCell.value === 1 ? 'completion' : 'completions') : (hoverCell.value === 1 ? 'habit' : 'habits')}
                </div>
              )}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(l => (
                <div key={l} style={{ width: 11, height: 11, borderRadius: 2.5, background: `var(--heatmap-${l})` }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
