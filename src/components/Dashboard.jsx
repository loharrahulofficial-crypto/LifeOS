import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Zap, Activity, BrainCircuit, Edit2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Dashboard({ habits, completions, pomodoroStats, pomodoroConfig, nutritionTotals, setActiveTab, levelProps }) {
  const { level, xp, rank, stats, currentLevelXP, nextLevelXP, progressPercent } = levelProps;
  
  const [userName, setUserName] = useLocalStorage('lifeos-username', 'System User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleNameSave = () => {
    if (tempName.trim()) setUserName(tempName.trim());
    else setTempName(userName);
    setIsEditingName(false);
  };

  const getTodayStr = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().split('T')[0];
  };
  const todayStr = getTodayStr();

  // Habit metrics (for HP)
  const habitsToday = habits;
  const completedToday = habitsToday.filter(h => completions[todayStr]?.[h.id]).length;
  const habitProgress = habitsToday.length === 0 ? 100 : (completedToday / habitsToday.length) * 100;
  
  // HP Logic: Connected to Vitality
  const maxHP = stats.vit * 10;
  const hpPercent = habitsToday.length === 0 ? 100 : Math.max(0, habitProgress);
  const currentHP = Math.floor((hpPercent / 100) * maxHP);

  // Focus metrics (for MP)
  const todaySessions = pomodoroStats?.todaySessions || 0;
  const workDuration = pomodoroConfig?.workDuration || 25;
  const focusTimeSafe = todaySessions * workDuration * 60; // total seconds focused today
  const focusHours = Math.floor(focusTimeSafe / 3600);
  const focusMinutes = Math.floor((focusTimeSafe % 3600) / 60);
  
  // MP Logic: Connected to Intellect. 1 focus session = 25 MP (focus energy)
  const maxMP = stats.int * 10;
  const earnedMP = todaySessions * 25; 
  const currentMP = Math.min(earnedMP, maxMP);
  const mpPercent = Math.min(100, (currentMP / maxMP) * 100) || 0;

  return (
    <div className="tab-animate" style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      {/* HUD Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div className="level-badge-container">
          <div className="level-badge-bg" style={{ borderColor: rank?.color || 'var(--accent)' }} />
          <span className="level-badge-text">{level}</span>
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 className="hud-rank-title" style={{ color: rank?.color || 'var(--accent)' }}>
            {rank?.title || 'Player'}
          </h2>
          {isEditingName ? (
            <div style={{ marginBottom: '0.25rem' }}>
              <input 
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                autoFocus
                className="input-field"
                style={{ fontSize: '1.2rem', fontWeight: 900, width: '100%', maxWidth: '200px', padding: '0.2rem 0.5rem', margin: 0, height: 'auto', background: 'var(--bg-input)' }}
              />
            </div>
          ) : (
            <p onClick={() => setIsEditingName(true)} style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'fit-content' }}>
              {userName} <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>XP: {Math.floor(xp)}</span>
            <span>Next Level: {Math.floor(nextLevelXP)}</span>
          </div>
          <div className="xp-glass-track">
            <div className="xp-glass-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* RPG Health & Mana Bars */}
      <div className="rpg-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', color: '#f43f5e' }}>
            <span>HP (Vitality)</span>
            <span>{currentHP} / {maxHP}</span>
          </div>
          <div className="xp-glass-track" style={{ height: 16 }}>
            <div className="xp-glass-fill hp-glass-fill" style={{ width: `${hpPercent}%` }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', color: '#06b6d4' }}>
            <span>MP (Focus Energy)</span>
            <span>{currentMP} / {maxMP}</span>
          </div>
          <div className="xp-glass-track" style={{ height: 16 }}>
            <div className="xp-glass-fill mp-glass-fill" style={{ width: `${mpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Attributes Grid */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
        Core Attributes
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('gym')} className="rpg-stat-box" style={{ cursor: 'pointer' }}>
          <Activity size={24} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STR (Strength)</span>
          <span className="rpg-stat-value">{stats.str}</span>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('habits')} className="rpg-stat-box" style={{ cursor: 'pointer' }}>
          <Zap size={24} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AGI (Agility)</span>
          <span className="rpg-stat-value">{stats.agi}</span>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('pomodoro')} className="rpg-stat-box" style={{ cursor: 'pointer' }}>
          <BrainCircuit size={24} style={{ color: '#06b6d4', marginBottom: '0.5rem' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>INT (Intellect)</span>
          <span className="rpg-stat-value">{stats.int}</span>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('nutrition')} className="rpg-stat-box" style={{ cursor: 'pointer' }}>
          <Target size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>VIT (Vitality)</span>
          <span className="rpg-stat-value">{stats.vit}</span>
        </motion.div>
      </div>

      {/* Daily Snapshot */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
        Daily Mission Briefing
      </h3>
      <div className="card-no-hover" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{completedToday}/{habitsToday.length}</p>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quests Done</p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent)' }}>{focusHours}h {focusMinutes}m</p>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Focus Time</p>
        </div>
        <div>
          <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{nutritionTotals.calories}</p>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cals Eaten</p>
        </div>
      </div>
      
    </div>
  );
}
