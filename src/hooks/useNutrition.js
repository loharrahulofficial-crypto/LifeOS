import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getToday, getLastNDays } from '../utils/dateUtils';

const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 30,
  water: 8,
};

export function useNutrition() {
  const [goals, setGoals] = useLocalStorage('lifeos-nutrition-goals', DEFAULT_GOALS);
  const [entries, setEntries] = useLocalStorage('lifeos-nutrition-entries', {});

  const addEntry = useCallback((date, item) => {
    const d = date || getToday();
    setEntries(prev => {
      const dayEntries = prev[d] || { items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 } };
      const newItems = [...dayEntries.items, item];
      const newTotals = {
        calories: dayEntries.totals.calories + (item.calories || 0),
        protein: dayEntries.totals.protein + (item.protein || 0),
        carbs: dayEntries.totals.carbs + (item.carbs || 0),
        fat: dayEntries.totals.fat + (item.fat || 0),
        fiber: dayEntries.totals.fiber + (item.fiber || 0),
        water: dayEntries.totals.water + (item.water || 0),
      };
      return {
        ...prev,
        [d]: { items: newItems, totals: newTotals },
      };
    });
  }, [setEntries]);

  const removeEntry = useCallback((date, index) => {
    const d = date || getToday();
    setEntries(prev => {
      const dayEntries = prev[d];
      if (!dayEntries) return prev;
      const removedItem = dayEntries.items[index];
      const newItems = dayEntries.items.filter((_, i) => i !== index);
      const newTotals = {
        calories: dayEntries.totals.calories - (removedItem.calories || 0),
        protein: dayEntries.totals.protein - (removedItem.protein || 0),
        carbs: dayEntries.totals.carbs - (removedItem.carbs || 0),
        fat: dayEntries.totals.fat - (removedItem.fat || 0),
        fiber: dayEntries.totals.fiber - (removedItem.fiber || 0),
        water: dayEntries.totals.water - (removedItem.water || 0),
      };
      return {
        ...prev,
        [d]: { items: newItems, totals: newTotals },
      };
    });
  }, [setEntries]);

  const getTotals = useCallback((date) => {
    const d = date || getToday();
    const dayEntries = entries[d];
    return dayEntries ? dayEntries.totals : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 };
  }, [entries]);

  const getItems = useCallback((date) => {
    const d = date || getToday();
    const dayEntries = entries[d];
    return dayEntries ? dayEntries.items : [];
  }, [entries]);

  const getWeeklySummary = useCallback(() => {
    const days = getLastNDays(7);
    return days.map(day => ({
      date: day,
      ...getTotals(day),
    }));
  }, [getTotals]);

  const updateGoals = useCallback((newGoals) => {
    setGoals(prev => ({ ...prev, ...newGoals }));
  }, [setGoals]);

  return {
    goals,
    entries,
    addEntry,
    removeEntry,
    getTotals,
    getItems,
    getWeeklySummary,
    updateGoals,
  };
}

export const QUICK_ADD_ITEMS = [
  { name: '🥚 Egg', calories: 70, protein: 6, carbs: 1, fat: 5, fiber: 0, water: 0 },
  { name: '🍌 Banana', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, water: 0 },
  { name: '🍗 Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, water: 0 },
  { name: '🍚 Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0, fiber: 1, water: 0 },
  { name: '🥑 Avocado', calories: 240, protein: 3, carbs: 12, fat: 22, fiber: 10, water: 0 },
  { name: '🥤 Protein Shake', calories: 150, protein: 30, carbs: 5, fat: 2, fiber: 1, water: 0 },
  { name: '🥛 Milk (1 cup)', calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, water: 0 },
  { name: '🍎 Apple', calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, water: 0 },
  { name: '🥗 Salad Bowl', calories: 120, protein: 4, carbs: 10, fat: 7, fiber: 5, water: 0 },
  { name: '🐟 Salmon Fillet', calories: 280, protein: 35, carbs: 0, fat: 15, fiber: 0, water: 0 },
  { name: '🥜 Almonds (1oz)', calories: 165, protein: 6, carbs: 6, fat: 14, fiber: 4, water: 0 },
  { name: '💧 Water', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 1 },
];
