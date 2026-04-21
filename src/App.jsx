import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { App as CapApp } from '@capacitor/app';
import Sidebar from './components/Sidebar';
import ThemeSwitcher from './components/ThemeSwitcher';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import TabHeader from './components/TabHeader';

const HabitTracker = lazy(() => import('./components/HabitTracker'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer'));
const NutritionLog = lazy(() => import('./components/NutritionLog'));
const StatsPanel = lazy(() => import('./components/StatsPanel'));
const AICoach = lazy(() => import('./components/AICoach'));
const GymTracker = lazy(() => import('./components/GymTracker'));
import { 
  Home, 
  Repeat, 
  CheckSquare, 
  Crosshair, 
  Dna, 
  Dumbbell, 
  BarChart2, 
  Bot 
} from 'lucide-react';

function TabSuspenseFallback() {
  return <div className="tab-suspense-fallback" aria-label="Loading" role="status" />;
}
import { useTasks } from './hooks/useTasks';
import { useHabits } from './hooks/useHabits';
import { usePomodoro } from './hooks/usePomodoro';
import { useNutrition } from './hooks/useNutrition';
import { useTheme } from './hooks/useTheme';
import { useGym } from './hooks/useGym';
import { useLevelSystem } from './hooks/useLevelSystem';

const MOTIVATIONAL_QUOTES = [
  { text: "A drop of water is nothing, but together they make an ocean.", author: "Ryota Mitarai" },
  { text: "If you don't take risks, you can't create a future.", author: "Monkey D. Luffy" },
  { text: "Hard work is worthless for those that don't believe in themselves.", author: "Naruto Uzumaki" },
  { text: "A lesson without pain is meaningless.", author: "Edward Elric" },
  { text: "Even if we forget the faces of our friends, We will never forget the bonds that were carved into our souls.", author: "Otonashi Yuzuru" }
];

/** Keeps tab content mounted when hidden so timers, AI streams, and voice keep running. */
function TabPanel({ id, activeTab, mountedTabs, children }) {
  if (!mountedTabs.has(id)) return null;
  return (
    <div
      className="tab-panel-root"
      role="tabpanel"
      id={`panel-${id}`}
      style={{
        display: activeTab === id ? 'block' : 'none',
        width: '100%',
        boxSizing: 'border-box',
      }}
      aria-hidden={activeTab !== id}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  /** Which tabs have been opened at least once — those panels stay mounted when switching away. */
  const [mountedTabs, setMountedTabs] = useState(() => new Set(['dashboard']));
  
  // Exit Modal State
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitQuote, setExitQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const themeProps    = useTheme();
  const habitProps    = useHabits();
  const taskProps     = useTasks();
  const pomodoroProps = usePomodoro();
  const nutritionProps = useNutrition();
  const gymProps      = useGym();
  const levelProps    = useLevelSystem();

  // ── Welcome screen: Show lockscreen on every boot ────────────────
  const [showWelcome, setShowWelcome] = useState(true);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  useEffect(() => {
    setMountedTabs((prev) => new Set([...prev, activeTab]));
  }, [activeTab]);

  // ── Capacitor Hardware Back Button Intercept ──
  useEffect(() => {
    const handleBackButton = ({ canGoBack }) => {
      if (!canGoBack) {
        // We are at the root, show motivational exit screen instead of closing
        setExitQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
        setShowExitModal(true);
      } else {
        // If there is actual navigation history, let the system handle it (rare in PWA)
        window.history.back();
      }
    };

    const listener = CapApp.addListener('backButton', handleBackButton);
    return () => { listener.then(l => l.remove()); };
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div
          key="welcome-stage"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.988, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            minHeight: '100vh',
          }}
        >
          <WelcomePage onEnter={dismissWelcome} />
        </motion.div>
      ) : (
        <motion.div
          key="app-shell"
          className="app-layout"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        themeProps={themeProps}
        levelProps={levelProps}
      />

      <main className="app-content">
        {/* Mobile Header */}
        <div className="mobile-header" style={{ marginBottom: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${levelProps?.rank?.color || 'var(--accent)'} 20%, transparent)`, border: `2px solid ${levelProps?.rank?.color || 'var(--accent)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: levelProps?.rank?.color || 'var(--accent)', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
              {levelProps?.level || 1}
            </div>
            <div>
              <h1 style={{
                fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.1rem',
              }}>LifeOS</h1>
              <p style={{ fontSize: '0.55rem', color: levelProps?.rank?.color || 'var(--accent)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                {levelProps?.rank?.title || 'Player'}
              </p>
            </div>
          </div>
          <div>
            <ThemeSwitcher {...themeProps} />
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <TabPanel id="dashboard" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <Dashboard
                habits={habitProps.habits}
                completions={habitProps.completions}
                pomodoroStats={pomodoroProps.stats}
                pomodoroConfig={pomodoroProps.config}
                nutritionTotals={nutritionProps.getTotals()}
                setActiveTab={setActiveTab}
                levelProps={levelProps}
              />
            </div>
          </TabPanel>
          <TabPanel id="habits" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <TabHeader title="Habits" icon={<Repeat size={18} />} levelProps={levelProps} />
              <Suspense fallback={<TabSuspenseFallback />}>
                <HabitTracker {...habitProps} levelProps={levelProps} />
              </Suspense>
            </div>
          </TabPanel>
          <TabPanel id="tasks" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <TabHeader title="Tasks" icon={<CheckSquare size={18} />} levelProps={levelProps} />
              <Suspense fallback={<TabSuspenseFallback />}>
                <TaskManager {...taskProps} levelProps={levelProps} />
              </Suspense>
            </div>
          </TabPanel>
          <TabPanel id="pomodoro" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <TabHeader title="Focus" icon={<Crosshair size={18} />} levelProps={levelProps} />
              <Suspense fallback={<TabSuspenseFallback />}>
                <PomodoroTimer {...pomodoroProps} levelProps={levelProps} />
              </Suspense>
            </div>
          </TabPanel>
          <TabPanel id="nutrition" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <TabHeader title="Nutrition" icon={<Dna size={18} />} levelProps={levelProps} />
              <Suspense fallback={<TabSuspenseFallback />}>
                <NutritionLog {...nutritionProps} levelProps={levelProps} />
              </Suspense>
            </div>
          </TabPanel>
          <TabPanel id="stats" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <TabHeader title="Stats" icon={<BarChart2 size={18} />} levelProps={levelProps} />
              <Suspense fallback={<TabSuspenseFallback />}>
                <StatsPanel
                  habits={habitProps.habits}
                  getWeeklyStats={habitProps.getWeeklyStats}
                  getMonthlyStats={habitProps.getMonthlyStats}
                  getStreak={habitProps.getStreak}
                  getLongestStreak={habitProps.getLongestStreak}
                  getTotalCompletions={habitProps.getTotalCompletions}
                />
              </Suspense>
            </div>
          </TabPanel>
          <TabPanel id="ai" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <TabHeader title="F.R.I.D.A.Y." icon={<Bot size={18} />} levelProps={levelProps} />
              <Suspense fallback={<TabSuspenseFallback />}>
                <AICoach
                  habits={habitProps.habits}
                  completions={habitProps.completions}
                  isCompleted={habitProps.isCompleted}
                  getTotals={nutritionProps.getTotals}
                  getItems={nutritionProps.getItems}
                  addHabit={habitProps.addHabit}
                  setActiveTab={handleTabChange}
                  taskProps={taskProps}
                  pomodoroProps={pomodoroProps}
                />
              </Suspense>
            </div>
          </TabPanel>
          <TabPanel id="gym" activeTab={activeTab} mountedTabs={mountedTabs}>
            <div className="tab-content">
              <TabHeader title="GymOS" icon={<Dumbbell size={18} />} levelProps={levelProps} />
              <Suspense fallback={<TabSuspenseFallback />}>
                <GymTracker {...gymProps} levelProps={levelProps} />
              </Suspense>
            </div>
          </TabPanel>
        </div>
      </main>

      {/* ── Motivational Exit Modal ── */}
      {showExitModal && (
        <div className="exit-modal-overlay">
          <div className="exit-modal">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Hold on!</h2>
            <blockquote style={{ 
              fontStyle: 'italic', color: 'var(--text-secondary)', paddingLeft: '1rem', 
              borderLeft: '4px solid var(--primary-color)', marginBottom: '0.5rem', lineHeight: '1.6' 
            }}>
              "{exitQuote.text}"
            </blockquote>
            <p style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              — {exitQuote.author}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => CapApp.exitApp()} 
                style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Exit App
              </button>
              <button 
                onClick={() => setShowExitModal(false)}
                style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
              >
                Stay & Focus
              </button>
            </div>
          </div>
          <style>{`
            .exit-modal-overlay {
              position: fixed; inset: 0; background: rgba(0,0,0,0.6); 
              backdrop-filter: blur(8px); z-index: 9999;
              display: flex; align-items: center; justify-content: center;
              padding: 1rem; animation: fadeIn 0.2s ease-out;
            }
            .exit-modal {
              background: var(--card-bg); border: 1px solid var(--border-color);
              padding: 1.5rem; border-radius: 16px; width: 100%; max-width: 320px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.5); animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
        </div>
      )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
