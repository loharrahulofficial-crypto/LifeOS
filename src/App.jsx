import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import HabitTracker from './components/HabitTracker';
import PomodoroTimer from './components/PomodoroTimer';
import NutritionLog from './components/NutritionLog';
import StatsPanel from './components/StatsPanel';
import AICoach from './components/AICoach';
import GymTracker from './components/GymTracker';
import ThemeSwitcher from './components/ThemeSwitcher';
import { useHabits } from './hooks/useHabits';
import { usePomodoro } from './hooks/usePomodoro';
import { useNutrition } from './hooks/useNutrition';
import { useTheme } from './hooks/useTheme';
import { useGym } from './hooks/useGym';

const pageVariants = {
  initial: { opacity: 0, x: 16 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -16 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.18,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('habits');
  const themeProps = useTheme();
  const habitProps = useHabits();
  const pomodoroProps = usePomodoro();
  const nutritionProps = useNutrition();
  const gymProps = useGym();

  const renderContent = () => {
    switch (activeTab) {
      case 'habits':
        return <HabitTracker {...habitProps} />;
      case 'pomodoro':
        return <PomodoroTimer {...pomodoroProps} />;
      case 'nutrition':
        return <NutritionLog {...nutritionProps} />;
      case 'stats':
        return (
          <StatsPanel
            habits={habitProps.habits}
            getWeeklyStats={habitProps.getWeeklyStats}
            getMonthlyStats={habitProps.getMonthlyStats}
            getStreak={habitProps.getStreak}
            getLongestStreak={habitProps.getLongestStreak}
            getTotalCompletions={habitProps.getTotalCompletions}
          />
        );
      case 'ai':
        return (
          <AICoach
            habits={habitProps.habits}
            completions={habitProps.completions}
            isCompleted={habitProps.isCompleted}
            getTotals={nutritionProps.getTotals}
            getItems={nutritionProps.getItems}
            addHabit={habitProps.addHabit}
          />
        );
      case 'gym':
        return <GymTracker {...gymProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        themeProps={themeProps}
      />

      <main className="app-content">
        {/* Mobile Header */}
        <div style={{
          display: 'none',
          marginBottom: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
          className="mobile-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
            <h1 style={{
              fontSize: '1.1rem', fontWeight: 800,
              background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>LifeOS</h1>
          </div>
          <ThemeSwitcher {...themeProps} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
