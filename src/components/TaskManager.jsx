import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getToday, get52WeekGrid, getLastNDays, formatDisplayDate } from '../utils/dateUtils';
import { IconMap } from '../utils/IconMap';

const LEVELS = [
  'var(--bg-input)',                     // 0 completed
  'color-mix(in srgb, var(--success) 30%, transparent)', // 1
  'color-mix(in srgb, var(--success) 55%, transparent)', // 2
  'color-mix(in srgb, var(--success) 80%, transparent)', // 3
  'var(--success)'                       // 4+
];

function HeatmapCell({ date, completedCount, onClick, isSelected }) {
  const levelIndex = Math.min(completedCount, LEVELS.length - 1);
  const color = LEVELS[levelIndex];

  return (
    <div
      onClick={() => onClick(date)}
      title={`${date}: ${completedCount} completed`}
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '3px',
        background: color,
        cursor: date ? 'pointer' : 'default',
        opacity: date ? 1 : 0,
        border: isSelected ? '2px solid var(--text-primary)' : '1px solid transparent',
        transition: 'transform 0.1s',
        transform: isSelected ? 'scale(1.2)' : 'scale(1)',
        zIndex: isSelected ? 10 : 1
      }}
    />
  );
}

export default function TaskManager({ 
  tasks, addTask, toggleTask, removeTask, 
  getTasksForDate, getHeatmapData, levelProps 
}) {
  const [view, setView] = useState('daily'); // daily, weekly, monthly, yearly
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [inputTitle, setInputTitle] = useState('');
  const [inputDeadline, setInputDeadline] = useState('');

  // Daily Tasks
  const currentTasks = getTasksForDate(selectedDate);
  const completedCount = currentTasks.filter(t => t.completed).length;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    addTask(inputTitle.trim(), selectedDate, 'normal', inputDeadline || null);
    setInputTitle('');
    setInputDeadline('');
    if (levelProps) {
      levelProps.addXP(5);
    }
  };

  const handleToggle = (taskId) => {
    toggleTask(taskId, selectedDate);
    const wasCompleted = currentTasks.find(t => t.id === taskId)?.completed;
    if (!wasCompleted && levelProps) {
      levelProps.addXP(10);
      levelProps.updateStat('str', 1);
    }
  };

  const heatmapData = useMemo(() => getHeatmapData(), [getHeatmapData]);

  // Views Renderers
  const renderDaily = () => (
    <div className="card-no-hover" style={{ marginTop: '1rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {selectedDate === getToday() ? 'Today\'s Tasks' : formatDisplayDate(selectedDate)}
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {completedCount} / {currentTasks.length} Done
        </span>
      </div>

      {/* Input */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          value={inputTitle} 
          onChange={e => setInputTitle(e.target.value)}
          placeholder="New task..."
          className="search-input"
          style={{ flex: 1, minWidth: '150px' }}
        />
        <input 
          type="date"
          value={inputDeadline}
          onChange={e => setInputDeadline(e.target.value)}
          className="search-input"
          style={{ width: 'auto', flexShrink: 0, paddingRight: '0.5rem' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem' }}>＋</button>
      </form>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {currentTasks.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
              No tasks scheduled for this day.
            </motion.p>
          )}
          {currentTasks.map(task => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={task.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-input)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
                <button 
                  onClick={() => handleToggle(task.id)}
                  style={{
                    width: 24, height: 24, borderRadius: '6px', border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border)'}`,
                    background: task.completed ? 'var(--success)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0
                  }}
                >
                  {task.completed && <IconMap name="check" size={14} />}
                </button>
                <span style={{ 
                  color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', 
                  textDecoration: task.completed ? 'line-through' : 'none',
                  fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {task.title}
                  {task.deadline && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--danger)', marginLeft: '0.5rem', fontWeight: 700, background: 'color-mix(in srgb, var(--danger) 15%, transparent)', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <IconMap name="focus" size={12} /> {task.deadline}
                    </span>
                  )}
                </span>
              </div>
              <button 
                onClick={() => removeTask(task.id, selectedDate)}
                style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
              >
                <IconMap name="focus" size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderWeekly = () => {
    const days = getLastNDays(7).reverse();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {days.map(d => {
          const dayTasks = getTasksForDate(d);
          const done = dayTasks.filter(t=>t.completed).length;
          return (
            <div key={d} className="card-no-hover" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => { setSelectedDate(d); setView('daily'); }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: d === getToday() ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {formatDisplayDate(d)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dayTasks.length === 0 ? 'No tasks' : `${dayTasks.length} task${dayTasks.length>1?'s':''}`}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: done === dayTasks.length && dayTasks.length > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
                  {done}/{dayTasks.length}
                </span>
                <div style={{ width: 40, height: 6, borderRadius: 3, background: 'var(--bg-input)', overflow: 'hidden' }}>
                  <div style={{ width: `${dayTasks.length ? (done/dayTasks.length)*100 : 0}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHeatmap = (grid, title) => (
    <div className="card-no-hover" style={{ marginTop: '1rem' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title} Activity</h3>
      
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '4px', minWidth: 'min-content' }}>
          {grid.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: '4px' }}>
              {week.map((day, dIdx) => (
                <HeatmapCell 
                  key={`${wIdx}-${dIdx}`}
                  date={day}
                  completedCount={day ? (heatmapData[day] || 0) : 0}
                  isSelected={day === selectedDate && day !== null}
                  onClick={(d) => {
                    if (d) {
                      setSelectedDate(d);
                    }
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        <span>Less</span>
        {LEVELS.map((color, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: color }} />)}
        <span>More</span>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--accent)', marginTop: '1rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => setView('daily')}>
        View tasks for {formatDisplayDate(selectedDate)} ➝
      </p>
    </div>
  );

  const renderMonthly = () => {
    // Generate a quick 4-5 week grid for the last 30 days
    const last30 = getLastNDays(30).reverse();
    const grid = [];
    let currentWeek = [];
    
    // Pad first week logically if needed (just simple chunking by 7 for visual purposes)
    for (const day of last30) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while(currentWeek.length < 7) currentWeek.push(null);
      grid.push(currentWeek);
    }
    
    return renderHeatmap(grid, "30-Day");
  };

  const renderYearly = () => {
    const grid = get52WeekGrid();
    return renderHeatmap(grid, "Annual");
  };

  return (
    <div className="tab-animate" style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* View Toggles */}
      <div style={{ display: 'flex', gap: '0.4rem', padding: '0.3rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1, padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, 
              color: view === v ? '#fff' : 'var(--text-muted)',
              background: view === v ? 'var(--accent)' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
              boxShadow: view === v ? '0 2px 10px var(--accent-subtle)' : 'none'
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'daily' && renderDaily()}
      {view === 'weekly' && renderWeekly()}
      {view === 'monthly' && renderMonthly()}
      {view === 'yearly' && renderYearly()}

    </div>
  );
}
