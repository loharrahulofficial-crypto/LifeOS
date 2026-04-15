import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { QUICK_ADD_ITEMS } from '../hooks/useNutrition';
import { getToday, formatDisplayDate, getDayName } from '../utils/dateUtils';

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', emoji: '🔥', unit: 'kcal', color: '#f59e0b' },
  { key: 'protein', label: 'Protein', emoji: '🥩', unit: 'g', color: '#ef4444' },
  { key: 'carbs', label: 'Carbs', emoji: '🍞', unit: 'g', color: '#3b82f6' },
  { key: 'fat', label: 'Fat', emoji: '🥑', unit: 'g', color: '#f97316' },
  { key: 'fiber', label: 'Fiber', emoji: '🥬', unit: 'g', color: '#10b981' },
  { key: 'water', label: 'Water', emoji: '💧', unit: 'glasses', color: '#06b6d4' },
];

export default function NutritionLog({ goals, entries, addEntry, removeEntry, getTotals, getItems, getWeeklySummary, updateGoals }) {
  const [showGoals, setShowGoals] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customItem, setCustomItem] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 });
  const [selectedDate, setSelectedDate] = useState(getToday());

  const today = getToday();
  const totals = getTotals(selectedDate);
  const items = getItems(selectedDate);
  const weeklySummary = getWeeklySummary();

  const handleQuickAdd = (item) => {
    addEntry(selectedDate, item);
  };

  const handleCustomAdd = () => {
    if (!customItem.name.trim()) return;
    addEntry(selectedDate, customItem);
    setCustomItem({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 });
    setShowCustom(false);
  };

  const chartData = weeklySummary.map(d => ({
    day: getDayName(d.date),
    calories: d.calories,
    goal: goals.calories,
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>🥗 Nutrition</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {selectedDate === today ? 'Today' : formatDisplayDate(selectedDate)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <motion.button className="btn-secondary" onClick={() => setShowGoals(!showGoals)} whileTap={{ scale: 0.95 }}>
            ⚙️ Goals
          </motion.button>
          <motion.button className="btn-primary" onClick={() => setShowCustom(!showCustom)} whileTap={{ scale: 0.95 }}>
            + Custom
          </motion.button>
        </div>
      </div>

      {/* Goals Config */}
      <AnimatePresence>
        {showGoals && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '1rem', overflow: 'hidden' }}
          >
            <p className="section-title">🎯 Daily Goals</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {MACRO_CONFIG.map(m => (
                <div key={m.key}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {m.emoji} {m.label} ({m.unit})
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    value={goals[m.key]}
                    onChange={e => updateGoals({ [m.key]: parseInt(e.target.value) || 0 })}
                    style={{ marginTop: '0.25rem' }}
                    id={`goal-${m.key}`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Add Form */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '1rem', overflow: 'hidden' }}
          >
            <p className="section-title">🍴 Add Custom Item</p>
            <input
              className="input-field"
              placeholder="Food name..."
              value={customItem.name}
              onChange={e => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
              style={{ marginBottom: '0.75rem' }}
              id="custom-food-name"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {MACRO_CONFIG.map(m => (
                <div key={m.key}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.emoji} {m.label}</label>
                  <input
                    className="input-field"
                    type="number"
                    value={customItem[m.key]}
                    onChange={e => setCustomItem(prev => ({ ...prev, [m.key]: parseFloat(e.target.value) || 0 }))}
                    style={{ marginTop: '0.15rem', padding: '0.45rem 0.65rem' }}
                  />
                </div>
              ))}
            </div>
            <motion.button className="btn-primary" onClick={handleCustomAdd} whileTap={{ scale: 0.95 }} style={{ width: '100%', justifyContent: 'center' }}>
              ✓ Add Item
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Macro Progress Bars */}
      <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p className="section-title" style={{ marginBottom: 0 }}>Today's Nutrition</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-ghost" onClick={() => {
              const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}>←</button>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{selectedDate === today ? 'Today' : formatDisplayDate(selectedDate)}</span>
            <button className="btn-ghost" onClick={() => {
              const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
              if (d.toISOString().split('T')[0] <= today) setSelectedDate(d.toISOString().split('T')[0]);
            }}>→</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {MACRO_CONFIG.map(m => {
            const current = totals[m.key] || 0;
            const goal = goals[m.key];
            const pct = Math.min((current / goal) * 100, 100);
            const remaining = Math.max(goal - current, 0);
            return (
              <div key={m.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {m.emoji} {m.label}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: m.color }}>{current}</span>
                    <span style={{ color: 'var(--text-muted)' }}> / {goal} {m.unit}</span>
                  </span>
                </div>
                <div className="progress-bar-track">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      background: pct >= 100
                        ? `linear-gradient(90deg, ${m.color}, var(--success))`
                        : `linear-gradient(90deg, ${m.color}80, ${m.color})`,
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {remaining > 0 ? `${remaining} ${m.unit} left` : '✓ Goal reached!'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
        <p className="section-title">⚡ Quick Add</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
          {QUICK_ADD_ITEMS.map((item, i) => (
            <motion.button
              key={i}
              className="btn-secondary"
              onClick={() => handleQuickAdd(item)}
              whileTap={{ scale: 0.93 }}
              style={{
                flexDirection: 'column', alignItems: 'flex-start', padding: '0.6rem 0.75rem',
                fontSize: '0.78rem', lineHeight: 1.3,
              }}
            >
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {item.calories > 0 ? `${item.calories} cal` : ''}
                {item.protein > 0 ? ` · ${item.protein}g P` : ''}
                {item.water > 0 ? '+1 glass' : ''}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Food Log */}
      {items.length > 0 && (
        <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
          <p className="section-title">📝 Food Log</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.75rem', borderRadius: 10,
                  background: 'var(--bg-input)', fontSize: '0.85rem',
                }}
              >
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.calories} cal</span>
                  <motion.button
                    onClick={() => removeEntry(selectedDate, i)}
                    whileTap={{ scale: 0.85 }}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="card-no-hover">
        <p className="section-title">📊 Weekly Calories</p>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, fontFamily: 'DM Sans', fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="calories" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
