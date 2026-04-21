import {
  useState, useMemo, useCallback, useRef, memo, startTransition, useDeferredValue, useEffect,
} from 'react';
import NumberInput from './NumberInput';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FOOD_DATABASE, QUICK_ADD_ITEMS } from '../data/foodDatabase';
import { getToday, formatDisplayDate, getDayName } from '../utils/dateUtils';

// ── Build flat search index ONCE at module load ─────────────────
const FLAT_INDEX = (() => {
  const arr = [];
  for (const type of Object.keys(FOOD_DATABASE)) {
    for (const cuisine of Object.keys(FOOD_DATABASE[type])) {
      for (const item of FOOD_DATABASE[type][cuisine]) {
        arr.push({ ...item, _nameLower: item.name.toLowerCase() });
      }
    }
  }
  return arr;
})();

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', emoji: '🔥', unit: 'kcal', color: '#f59e0b' },
  { key: 'protein',  label: 'Protein',  emoji: '🥩', unit: 'g',    color: '#ef4444' },
  { key: 'carbs',    label: 'Carbs',    emoji: '🍞', unit: 'g',    color: '#3b82f6' },
  { key: 'fat',      label: 'Fat',      emoji: '🥑', unit: 'g',    color: '#f97316' },
  { key: 'fiber',    label: 'Fiber',    emoji: '🥬', unit: 'g',    color: '#10b981' },
  { key: 'water',    label: 'Water',    emoji: '💧', unit: 'glasses', color: '#06b6d4' },
  { key: 'weight',   label: 'Weight',   emoji: '⚖️', unit: 'g',   color: '#94a3b8' },
];

const foodTypes = Object.keys(FOOD_DATABASE);

const FOOD_ROW_H = 56;
const VIRTUAL_OVERSCAN = 6;

/** One food row — memoised so scrolling does not re-create every button. */
const FoodListRow = memo(function FoodListRow({ item, onPick, dense }) {
  return (
    <button
      type="button"
      onClick={() => onPick(item)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', minHeight: FOOD_ROW_H - 10, padding: '0.75rem 1rem', marginBottom: dense ? 0 : 6,
        background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 14,
        cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', boxSizing: 'border-box',
      }}
    >
      <span style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.25, paddingRight: '0.5rem' }}>{item.name}</span>
      <span style={{
        fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 600,
        background: 'var(--bg-card)', padding: '0.25rem 0.5rem', borderRadius: 8, flexShrink: 0,
      }}>
        {item.calories}cal · {item.protein}P
      </span>
    </button>
  );
});

/** Windowed list for hundreds of dishes — only mounts ~20 rows at a time. */
function VirtualFoodList({ items, onPick }) {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(360);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight || 360));
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    setViewportH(el.clientHeight || 360);
    return () => ro.disconnect();
  }, [items.length]);

  const totalH = items.length * FOOD_ROW_H;
  const start = Math.max(0, Math.floor(scrollTop / FOOD_ROW_H) - VIRTUAL_OVERSCAN);
  const visibleCount = Math.ceil(viewportH / FOOD_ROW_H) + VIRTUAL_OVERSCAN * 2;
  const end = Math.min(items.length, start + visibleCount);

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        No dishes in this category.
      </div>
    );
  }

  if (items.length <= 24) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'min(58vh, 480px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {items.map((item, i) => (
          <FoodListRow key={`${item.name}-${i}`} item={item} onPick={onPick} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      style={{
        maxHeight: 'min(58vh, 480px)', overflowY: 'auto', position: 'relative',
        WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', contain: 'layout',
      }}
    >
      <div style={{ height: totalH, position: 'relative' }}>
        {items.slice(start, end).map((item, i) => {
          const idx = start + i;
          const top = idx * FOOD_ROW_H;
          return (
            <div
              key={`${item.name}-${idx}`}
              style={{ position: 'absolute', left: 0, right: 0, top, height: FOOD_ROW_H, paddingRight: 2 }}
            >
              <FoodListRow item={item} onPick={onPick} dense />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bottom sheet: anchored bottom-center; optional modal center for edit flows ─────────
function BottomSheet({ open, onClose, title, children, isModal = false, contentClassName = '' }) {
  if (!open) return null;
  const overlayClass = isModal ? 'modal-overlay' : 'bottom-sheet-overlay';
  const contentClass = isModal ? 'modal-content' : 'bottom-sheet-content';

  return (
    <div className={overlayClass} onClick={onClose}>
      <div
        className={`${contentClass}${contentClassName ? ` ${contentClassName}` : ''}`}
        onClick={e => e.stopPropagation()}
        style={{ overflow: 'hidden', minHeight: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0, gap: '0.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.35, minWidth: 0, flex: 1 }}>{title}</div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '1.2rem', background: 'var(--bg-input)', flexShrink: 0 }}>
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingRight: '0.2rem', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function NutritionLog({
  goals, addEntry, removeEntry, updateEntry,
  getTotals, getItems, getWeeklySummary, updateGoals, levelProps
}) {
  const [showGoals,    setShowGoals]    = useState(false);
  const [showCustom,   setShowCustom]   = useState(false);
  const [showBrowser,  setShowBrowser]  = useState(false);
  const [customItem,   setCustomItem]   = useState({ name:'', calories:0, protein:0, carbs:0, fat:0, fiber:0, water:0, weight:100 });
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedType, setSelectedType] = useState(foodTypes[0]);
  /** 'categories' = pick cuisine; 'items' = second pane with dish list; 'search' = global search */
  const [foodBrowsePhase, setFoodBrowsePhase] = useState('categories');
  const [pickedCuisine, setPickedCuisine] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [debouncedQ,   setDebouncedQ]   = useState('');
  const [editingItem,  setEditingItem]  = useState(null);
  const searchTimer = useRef(null);
  const deferredSearch = useDeferredValue(debouncedQ);

  const today = getToday();

  // ── Debounce search with ref (avoids re-render) ─────────────
  const resetFoodBrowser = useCallback(() => {
    setFoodBrowsePhase('categories');
    setPickedCuisine(null);
    setSearchQuery('');
    setDebouncedQ('');
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedQ(val);
      const q = val.trim();
      startTransition(() => {
        if (q) {
          setFoodBrowsePhase('search');
          setPickedCuisine(null);
        } else {
          setFoodBrowsePhase('categories');
          setPickedCuisine(null);
        }
      });
    }, 320);
  }, []);

  // ── Memoized derived values ──────────────────────────────────
  const totals  = useMemo(() => getTotals(selectedDate),    [getTotals, selectedDate]);
  const items   = useMemo(() => getItems(selectedDate),     [getItems, selectedDate]);
  const weekly  = useMemo(() => getWeeklySummary(),         [getWeeklySummary]);

  const chartData = useMemo(() => weekly.map(d => ({
    day:      getDayName(d.date),
    calories: d.calories,
    goal:     goals.calories,
  })), [weekly, goals.calories]);

  const cuisines = useMemo(
    () => (FOOD_DATABASE[selectedType] ? Object.keys(FOOD_DATABASE[selectedType]) : []),
    [selectedType]
  );

  const searchResults = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return [];
    return FLAT_INDEX.filter((item) => item._nameLower.includes(q)).slice(0, 80);
  }, [deferredSearch]);

  const cuisineItems = useMemo(() => {
    if (foodBrowsePhase !== 'items' || !pickedCuisine) return [];
    const arr = FOOD_DATABASE[selectedType]?.[pickedCuisine];
    return Array.isArray(arr) ? arr : [];
  }, [foodBrowsePhase, pickedCuisine, selectedType]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleQuickAdd = useCallback((item) => {
    addEntry(selectedDate, { ...item, weight: item.weight || (item.calories > 0 ? 100 : 0) });
    if (levelProps) { levelProps.addXP(10); levelProps.updateStat('vit', 1); }
  }, [addEntry, selectedDate, levelProps]);

  const handleSelectMenu = useCallback((item) => {
    const base = { ...item, weight: item.calories > 0 ? 100 : 0 };
    setEditingItem({ ...base, _baseItem: base, isNew: true });
    setShowBrowser(false);
    setFoodBrowsePhase('categories');
    setPickedCuisine(null);
    setSearchQuery('');
    setDebouncedQ('');
  }, []);

  const handleSelectLog = useCallback((item, index) => {
    const defaultWt = item.calories > 0 ? 100 : 0;
    const base = item._baseItem || { ...item, weight: item.weight || defaultWt };
    setEditingItem({ ...item, weight: item.weight || defaultWt, _baseItem: base, isNew: false, index });
  }, []);

  const handleMacroChange = useCallback((key, value) => {
    setEditingItem(prev => {
      if (key === 'weight' && prev._baseItem?.weight > 0) {
        const ratio = value / prev._baseItem.weight;
        const b = prev._baseItem;
        return {
          ...prev, weight: value,
          calories: Math.round((b.calories||0) * ratio),
          protein:  Math.round((b.protein||0)  * ratio * 10) / 10,
          carbs:    Math.round((b.carbs||0)    * ratio * 10) / 10,
          fat:      Math.round((b.fat||0)      * ratio * 10) / 10,
          fiber:    Math.round((b.fiber||0)    * ratio * 10) / 10,
          water:    Math.round((b.water||0)    * ratio * 10) / 10,
        };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingItem?.name.trim()) return;
    const { isNew, index, _nameLower, _baseItem, ...itemToSave } = editingItem;
    if (isNew) {
      addEntry(selectedDate, itemToSave);
      if (levelProps) { levelProps.addXP(15); levelProps.updateStat('vit', 1); }
    }
    else updateEntry(selectedDate, index, itemToSave);
    setEditingItem(null);
  }, [editingItem, addEntry, updateEntry, selectedDate, levelProps]);

  const handleCustomAdd = useCallback(() => {
    if (!customItem.name.trim()) return;
    addEntry(selectedDate, customItem);
    if (levelProps) { levelProps.addXP(20); levelProps.updateStat('vit', 1); }
    setCustomItem({ name:'', calories:0, protein:0, carbs:0, fat:0, fiber:0, water:0, weight:100 });
    setShowCustom(false);
  }, [customItem, addEntry, selectedDate, levelProps]);

  const setCustomField = useCallback((key, val) => {
    setCustomItem(prev => ({ ...prev, [key]: val }));
  }, []);

  const navDate = useCallback((delta) => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      const next = d.toISOString().split('T')[0];
      return next <= today ? next : prev;
    });
  }, [today]);

  return (
    <div style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.2rem,5vw,1.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>🥗 Nutrition</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {selectedDate === today ? 'Today' : formatDisplayDate(selectedDate)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowGoals(true)}
          >
            ⚙️ Goals
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowCustom(true)}
          >
            + Custom
          </button>
        </div>
      </div>

      {/* ── Progress Card ───────────────────────────────── */}
      <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <p className="section-title" style={{ marginBottom: 0 }}>Today's Nutrition</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.3rem', borderRadius: '12px' }}>
            <button className="btn-ghost" style={{ padding: '0.2rem 0.5rem' }} onClick={() => navDate(-1)}>←</button>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              {selectedDate === today ? 'Today' : formatDisplayDate(selectedDate)}
            </span>
            <button className="btn-ghost" style={{ padding: '0.2rem 0.5rem' }} onClick={() => navDate(1)}>→</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Hero Calories */}
          {(() => {
            const m = MACRO_CONFIG.find(x => x.key === 'calories');
            const current = totals.calories || 0;
            const goal    = goals.calories;
            const pct     = Math.min((current / goal) * 100, 100) || 0;
            return (
              <div style={{ background: 'var(--bg-input)', borderRadius: '14px', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {m.emoji} Calories
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {goal} kcal</span>
                </div>
                <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2rem)', fontWeight: 900, color: m.color, lineHeight: 1, marginBottom: '0.5rem' }}>
                  {current}
                </div>
                <div className="progress-bar-track" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>0</span>
                  <span style={{ fontSize: '0.65rem', color: m.color, fontWeight: 700 }}>{Math.round(pct)}%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{goal}</span>
                </div>
              </div>
            );
          })()}

          {/* Core Macros Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {['protein', 'carbs', 'fat'].map(key => {
              const m = MACRO_CONFIG.find(x => x.key === key);
              const current = totals[key] || 0;
              const goal = goals[key];
              const pct = Math.min((current / goal) * 100, 100) || 0;
              return (
                <div key={key} style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{current}<span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>{m.unit}</span></span>
                  <div className="progress-bar-track" style={{ height: '4px', marginTop: '0.5rem', background: 'var(--bg-secondary)' }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary Details Toggle */}
          <details style={{ background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <summary style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}>
               Show Secondary Macros (Water, Fiber)
            </summary>
            <div style={{ padding: '0 1rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {['water', 'fiber'].map(key => {
                const m = MACRO_CONFIG.find(x => x.key === key);
                const current = totals[key] || 0;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{m.emoji}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{current} {m.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      </div>

      {/* ── Food Add Entry & Browser Trigger ──────────────────────────────────────── */}
      <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <p className="section-title" style={{ marginBottom: 0 }}>🌍 Add Meal</p>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            onClick={() => {
              resetFoodBrowser();
              setShowBrowser(true);
            }}
          >
            🔍 Search Database
          </button>
        </div>

        {/* Quick favorites Horizontal Scroller */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="no-scrollbar">
          {QUICK_ADD_ITEMS.map((item, i) => (
            <button
              key={i}
              className="btn-secondary"
              onClick={() => handleQuickAdd(item)}
              style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.8rem', fontSize: '0.75rem', borderRadius: '16px', flexShrink: 0 }}
            >
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>{item.calories > 0 ? `${item.calories}cal` : '+1💧'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Compact Food Log ─────────────────────────────────── */}
      {items.length > 0 && (
        <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p className="section-title" style={{ marginBottom: 0 }}>📝 Food Log</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>{items.length} logged today</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="no-scrollbar">
            {items.map((item, i) => (
              <div
                key={i}
                onClick={() => handleSelectLog(item, i)}
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  padding: '0.85rem', borderRadius: '16px', minWidth: '140px', flexShrink: 0,
                  background: 'var(--bg-input)', border: '1px solid var(--border-light)',
                  cursor: 'pointer', position: 'relative'
                }}
              >
                <div style={{ minWidth: 0, overflow: 'hidden', paddingRight: '20px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>
                        {item.weight > 0 ? `${item.weight}g · ` : ''}{item.calories > 0 ? `${item.calories} kcal` : 'Water'}
                    </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeEntry(selectedDate, i); }}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--danger-bg)', border: 'none', color: 'var(--danger)', borderRadius: '10px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Weekly Chart ──────────────────────────────────────── */}
      <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
        <p className="section-title">📊 Weekly Calories</p>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day"  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis                tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip cursor={{ fill: 'var(--bg-input)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-primary)' }} />
              <Bar dataKey="calories" fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals + Custom — centered modal dialogs */}
      <BottomSheet open={showGoals} onClose={() => setShowGoals(false)} title="🎯 Daily Goals" isModal contentClassName="nutrition-modal-panel">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', paddingBottom: '1rem' }}>
          {MACRO_CONFIG.map(m => (
            <div key={m.key}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {m.emoji} {m.label} <span style={{fontSize: '0.65rem'}}>({m.unit})</span>
              </label>
              <NumberInput
                value={goals[m.key]}
                onChange={val => updateGoals({ [m.key]: val })}
                min={0}
                style={{ marginTop: '0.35rem', textAlign: 'center', fontWeight: 'bold', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 10, padding: '0.6rem', width: '100%', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit' }}
              />
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowGoals(false)} style={{ width: '100%', justifyContent: 'center' }}>Save Goals</button>
      </BottomSheet>

      <BottomSheet open={showCustom} onClose={() => setShowCustom(false)} title="🍴 Add custom item" isModal contentClassName="nutrition-modal-panel">
         <input
            className="input-field"
            placeholder="Name of food..."
            value={customItem.name}
            onChange={e => setCustomField('name', e.target.value)}
            style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {MACRO_CONFIG.map(m => (
              <div key={m.key}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.emoji} {m.label}</label>
                <div style={{ position: 'relative' }}>
                  <NumberInput
                    value={customItem[m.key]}
                    onChange={val => setCustomField(m.key, val)}
                    min={0}
                    style={{ marginTop: '0.25rem', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 10, padding: '0.6rem 2.2rem 0.6rem 0.6rem', width: '100%', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, pointerEvents: 'none' }}>
                    {m.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={handleCustomAdd}
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
          >
            ✓ Confirm Addition
          </button>
      </BottomSheet>

      {/* Edit Log Modal (Modal Style) */}
      <BottomSheet open={!!editingItem} onClose={() => setEditingItem(null)} title={editingItem?.isNew ? 'Customize Meal' : 'Edit Logged Meal'} isModal contentClassName="nutrition-modal-panel">
        {editingItem && (
            <>
                <input
                    className="input-field"
                    placeholder="Food name..."
                    value={editingItem.name}
                    onChange={e => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    style={{ marginBottom: '1rem', fontWeight: 800, fontSize: '1.05rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {MACRO_CONFIG.map(m => (
                        <div key={m.key}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {m.emoji} {m.label}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <NumberInput
                                  value={editingItem[m.key] === undefined ? 0 : editingItem[m.key]}
                                  onChange={val => handleMacroChange(m.key, Math.max(0, val))}
                                  min={0}
                                  style={{ marginTop: '0.25rem', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 10, padding: '0.6rem 2.2rem 0.6rem 0.6rem', width: '100%', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                />
                                <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, pointerEvents: 'none' }}>
                                    {m.unit}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    className="btn-primary"
                    onClick={handleSaveEdit}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {editingItem.isNew ? '✓ Add Meal' : '✓ Save Changes'}
                </button>
            </>
        )}
      </BottomSheet>

      {/* Database Browser — step 1: categories · step 2: virtualised dish list or search */}
      <BottomSheet
        open={showBrowser}
        onClose={() => {
          setShowBrowser(false);
          resetFoodBrowser();
        }}
        title={
          foodBrowsePhase === 'items' && pickedCuisine ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  startTransition(() => {
                    setFoodBrowsePhase('categories');
                    setPickedCuisine(null);
                  });
                }}
                style={{
                  padding: '0.35rem 0.55rem', fontSize: '0.95rem', borderRadius: 10,
                  background: 'var(--bg-input)', border: '1px solid var(--border-light)', flexShrink: 0,
                }}
                aria-label="Back to categories"
              >
                ←
              </button>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pickedCuisine}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                {cuisineItems.length} items
              </span>
            </div>
          ) : foodBrowsePhase === 'search' ? (
            '🌍 Search results'
          ) : (
            '🌍 Internal Food Database'
          )
        }
      >
        <input
          className="input-field"
          placeholder="🔍 Search across 55,000+ items..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ marginBottom: '1rem', fontSize: '0.95rem' }}
        />

        {foodBrowsePhase === 'search' && (
          <>
            {searchResults.length > 0 ? (
              <VirtualFoodList key={`search-${deferredSearch}`} items={searchResults} onPick={handleSelectMenu} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 600 }}>No matches yet. Try another spelling.</p>
              </div>
            )}
          </>
        )}

        {foodBrowsePhase === 'items' && pickedCuisine && (
          <VirtualFoodList key={pickedCuisine} items={cuisineItems} onPick={handleSelectMenu} />
        )}

        {foodBrowsePhase === 'categories' && (
          <>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
              {foodTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    startTransition(() => {
                      setSelectedType(type);
                      setPickedCuisine(null);
                      setFoodBrowsePhase('categories');
                    });
                  }}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    background: selectedType === type ? 'var(--accent-subtle)' : 'var(--bg-input)',
                    borderColor: selectedType === type ? 'var(--accent)' : 'var(--border)',
                    color: selectedType === type ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.65rem' }}>
              Tap a category — dishes open on the next screen for smoother scrolling.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setPickedCuisine(cuisine);
                      setFoodBrowsePhase('items');
                    });
                  }}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.8rem 0.6rem',
                    borderRadius: 14,
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-light)',
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  {cuisine}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              Or use search above to scan the full index.
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
