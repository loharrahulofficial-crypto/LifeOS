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
  weight: 2000,
};

export function useNutrition() {
  const [goals, setGoals] = useLocalStorage('lifeos-nutrition-goals', DEFAULT_GOALS);
  const [entries, setEntries] = useLocalStorage('lifeos-nutrition-entries', {});

  const addEntry = useCallback((date, item) => {
    const d = date || getToday();
    setEntries(prev => {
      const dayEntries = prev[d] || { items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0, weight: 0 } };
      const newItems = [...dayEntries.items, item];
      const newTotals = {
        calories: dayEntries.totals.calories + (item.calories || 0),
        protein: dayEntries.totals.protein + (item.protein || 0),
        carbs: dayEntries.totals.carbs + (item.carbs || 0),
        fat: dayEntries.totals.fat + (item.fat || 0),
        fiber: dayEntries.totals.fiber + (item.fiber || 0),
        water: dayEntries.totals.water + (item.water || 0),
        weight: (dayEntries.totals.weight || 0) + (item.weight || 0),
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
        calories: Math.max(0, dayEntries.totals.calories - (removedItem.calories || 0)),
        protein: Math.max(0, dayEntries.totals.protein - (removedItem.protein || 0)),
        carbs: Math.max(0, dayEntries.totals.carbs - (removedItem.carbs || 0)),
        fat: Math.max(0, dayEntries.totals.fat - (removedItem.fat || 0)),
        fiber: Math.max(0, dayEntries.totals.fiber - (removedItem.fiber || 0)),
        water: Math.max(0, dayEntries.totals.water - (removedItem.water || 0)),
        weight: Math.max(0, (dayEntries.totals.weight || 0) - (removedItem.weight || 0)),
      };
      return {
        ...prev,
        [d]: { items: newItems, totals: newTotals },
      };
    });
  }, [setEntries]);

  const updateEntry = useCallback((date, index, updatedItem) => {
    const d = date || getToday();
    setEntries(prev => {
      const dayEntries = prev[d];
      if (!dayEntries) return prev;
      
      const oldItem = dayEntries.items[index];
      const newItems = [...dayEntries.items];
      newItems[index] = updatedItem;

      const newTotals = {
        calories: Math.max(0, dayEntries.totals.calories - (oldItem.calories || 0) + (updatedItem.calories || 0)),
        protein: Math.max(0, dayEntries.totals.protein - (oldItem.protein || 0) + (updatedItem.protein || 0)),
        carbs: Math.max(0, dayEntries.totals.carbs - (oldItem.carbs || 0) + (updatedItem.carbs || 0)),
        fat: Math.max(0, dayEntries.totals.fat - (oldItem.fat || 0) + (updatedItem.fat || 0)),
        fiber: Math.max(0, dayEntries.totals.fiber - (oldItem.fiber || 0) + (updatedItem.fiber || 0)),
        water: Math.max(0, dayEntries.totals.water - (oldItem.water || 0) + (updatedItem.water || 0)),
        weight: Math.max(0, (dayEntries.totals.weight || 0) - (oldItem.weight || 0) + (updatedItem.weight || 0)),
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
    return dayEntries ? dayEntries.totals : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0, weight: 0 };
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
    updateEntry,
    getTotals,
    getItems,
    getWeeklySummary,
    updateGoals,
  };
}

// FOOD_DATABASE: import from '../data/foodDatabase' only in NutritionLog so the main bundle stays light.

