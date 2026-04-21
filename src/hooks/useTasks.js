import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getToday } from '../utils/dateUtils';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function useTasks() {
  // Store tasks grouped by date: { 'YYYY-MM-DD': [{ id, title, completed, priority }, ...] }
  const [tasks, setTasks] = useLocalStorage('lifeos-tasks', {});

  const addTask = useCallback((title, date = getToday(), priority = 'normal', deadline = null) => {
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      priority,
      deadline,
      createdAt: Date.now()
    };
    
    setTasks(prev => {
      const dayTasks = prev[date] || [];
      return {
        ...prev,
        [date]: [...dayTasks, newTask]
      };
    });
    return newTask;
  }, [setTasks]);

  const toggleTask = useCallback((taskId, date) => {
    setTasks(prev => {
      const dayTasks = prev[date] || [];
      return {
        ...prev,
        [date]: dayTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      };
    });
  }, [setTasks]);

  const removeTask = useCallback((taskId, date) => {
    setTasks(prev => {
      const dayTasks = prev[date] || [];
      return {
        ...prev,
        [date]: dayTasks.filter(t => t.id !== taskId)
      };
    });
  }, [setTasks]);

  const editTask = useCallback((taskId, date, updates) => {
    setTasks(prev => {
      const dayTasks = prev[date] || [];
      return {
        ...prev,
        [date]: dayTasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      };
    });
  }, [setTasks]);

  const getTasksForDate = useCallback((date) => {
    return tasks[date] || [];
  }, [tasks]);

  const moveTaskToDate = useCallback((taskId, fromDate, toDate) => {
    setTasks(prev => {
      const sourceTasks = prev[fromDate] || [];
      const taskToMove = sourceTasks.find(t => t.id === taskId);
      if (!taskToMove) return prev;

      const newSourceTasks = sourceTasks.filter(t => t.id !== taskId);
      const destTasks = prev[toDate] || [];
      
      return {
        ...prev,
        [fromDate]: newSourceTasks,
        [toDate]: [...destTasks, taskToMove]
      };
    });
  }, [setTasks]);

  const getHeatmapData = useCallback(() => {
    const data = {};
    for (const [date, dayTasks] of Object.entries(tasks)) {
      const completedCount = dayTasks.filter(t => t.completed).length;
      data[date] = completedCount;
    }
    return data;
  }, [tasks]);

  return {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    editTask,
    getTasksForDate,
    moveTaskToDate,
    getHeatmapData
  };
}
