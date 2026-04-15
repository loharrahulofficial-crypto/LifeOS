import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getToday, getLastNDays } from '../utils/dateUtils';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function useHabits() {
  const [habits, setHabits] = useLocalStorage('lifeos-habits', []);
  const [completions, setCompletions] = useLocalStorage('lifeos-completions', {});

  const addHabit = useCallback((name, emoji, color) => {
    const newHabit = {
      id: generateId(),
      name,
      emoji: emoji || '✅',
      color: color || '#f59e0b',
      createdAt: getToday(),
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, [setHabits]);

  const removeHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, [setHabits]);

  const editHabit = useCallback((id, updates) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, [setHabits]);

  const toggleCompletion = useCallback((habitId, date) => {
    const d = date || getToday();
    setCompletions(prev => {
      const dayData = prev[d] || {};
      return {
        ...prev,
        [d]: {
          ...dayData,
          [habitId]: !dayData[habitId],
        },
      };
    });
  }, [setCompletions]);

  const isCompleted = useCallback((habitId, date) => {
    const d = date || getToday();
    return !!(completions[d] && completions[d][habitId]);
  }, [completions]);

  const getStreak = useCallback((habitId) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (completions[dateStr] && completions[dateStr][habitId]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [completions]);

  const getLongestStreak = useCallback((habitId) => {
    let longest = 0;
    let current = 0;
    const days = getLastNDays(365);
    for (const day of days) {
      if (completions[day] && completions[day][habitId]) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    return longest;
  }, [completions]);

  const getCompletionRate = useCallback((date) => {
    if (habits.length === 0) return 0;
    const d = date || getToday();
    const dayData = completions[d] || {};
    const completed = habits.filter(h => dayData[h.id]).length;
    return Math.round((completed / habits.length) * 100);
  }, [habits, completions]);

  const getDayCompletionCount = useCallback((date) => {
    const dayData = completions[date] || {};
    return habits.filter(h => dayData[h.id]).length;
  }, [habits, completions]);

  const getHeatmapData = useCallback((habitId) => {
    const last365 = getLastNDays(365);
    const data = {};
    for (const day of last365) {
      data[day] = completions[day] && completions[day][habitId] ? 1 : 0;
    }
    return data;
  }, [completions]);

  const getAllHeatmapData = useCallback(() => {
    const last365 = getLastNDays(365);
    const data = {};
    for (const day of last365) {
      const dayData = completions[day] || {};
      data[day] = habits.filter(h => dayData[h.id]).length;
    }
    return data;
  }, [habits, completions]);

  const getWeeklyStats = useCallback(() => {
    const days = getLastNDays(7);
    return days.map(day => ({
      date: day,
      completed: getDayCompletionCount(day),
      total: habits.length,
      rate: getCompletionRate(day),
    }));
  }, [habits, getDayCompletionCount, getCompletionRate]);

  const getMonthlyStats = useCallback(() => {
    const days = getLastNDays(30);
    return days.map(day => ({
      date: day,
      rate: getCompletionRate(day),
    }));
  }, [getCompletionRate]);

  const getTodayCompletedCount = useCallback(() => {
    return getDayCompletionCount(getToday());
  }, [getDayCompletionCount]);

  const getTotalCompletions = useCallback(() => {
    let total = 0;
    Object.values(completions).forEach(day => {
      Object.values(day).forEach(v => { if (v) total++; });
    });
    return total;
  }, [completions]);

  return {
    habits,
    completions,
    addHabit,
    removeHabit,
    editHabit,
    toggleCompletion,
    isCompleted,
    getStreak,
    getLongestStreak,
    getCompletionRate,
    getDayCompletionCount,
    getHeatmapData,
    getAllHeatmapData,
    getWeeklyStats,
    getMonthlyStats,
    getTodayCompletedCount,
    getTotalCompletions,
  };
}
