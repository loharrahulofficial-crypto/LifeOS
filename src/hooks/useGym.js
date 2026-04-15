import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'lifeos_gym_data';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const defaultState = {
  workoutPlans: [],       // custom plans user creates
  workoutLogs: [],        // completed workout sessions
  activeSession: null,    // currently active session
};

export function useGym() {
  const [gymData, setGymData] = useState(() => {
    const saved = loadFromStorage();
    return saved || defaultState;
  });

  const updateGymData = useCallback((updater) => {
    setGymData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(next);
      return next;
    });
  }, []);

  // ── Workout Plans ──────────────────────────────────────────
  const createPlan = useCallback((plan) => {
    updateGymData(prev => ({
      ...prev,
      workoutPlans: [
        ...prev.workoutPlans,
        {
          ...plan,
          id: `plan_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, [updateGymData]);

  const updatePlan = useCallback((id, updates) => {
    updateGymData(prev => ({
      ...prev,
      workoutPlans: prev.workoutPlans.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, [updateGymData]);

  const deletePlan = useCallback((id) => {
    updateGymData(prev => ({
      ...prev,
      workoutPlans: prev.workoutPlans.filter(p => p.id !== id),
    }));
  }, [updateGymData]);

  // ── Active Session ─────────────────────────────────────────
  const startSession = useCallback((template) => {
    const session = {
      id: `session_${Date.now()}`,
      name: template.name,
      startedAt: new Date().toISOString(),
      exercises: template.exercises.map((ex, idx) => ({
        id: `ex_${idx}_${Date.now()}`,
        name: ex.name,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          id: `set_${i}`,
          reps: ex.reps,
          weight: ex.weight,
          completed: false,
        })),
        notes: '',
        restTimer: 90,
      })),
    };
    updateGymData(prev => ({ ...prev, activeSession: session }));
  }, [updateGymData]);

  const updateSessionExercise = useCallback((exId, updater) => {
    updateGymData(prev => {
      if (!prev.activeSession) return prev;
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          exercises: prev.activeSession.exercises.map(ex =>
            ex.id === exId ? (typeof updater === 'function' ? updater(ex) : { ...ex, ...updater }) : ex
          ),
        },
      };
    });
  }, [updateGymData]);

  const toggleSetCompleted = useCallback((exId, setId) => {
    updateSessionExercise(exId, ex => ({
      ...ex,
      sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s),
    }));
  }, [updateSessionExercise]);

  const updateSetValue = useCallback((exId, setId, field, value) => {
    updateSessionExercise(exId, ex => ({
      ...ex,
      sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s),
    }));
  }, [updateSessionExercise]);

  const addSetToExercise = useCallback((exId) => {
    updateSessionExercise(exId, ex => {
      const last = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets,
          { id: `set_${Date.now()}`, reps: last?.reps || 10, weight: last?.weight || 0, completed: false },
        ],
      };
    });
  }, [updateSessionExercise]);

  const removeSetFromExercise = useCallback((exId, setId) => {
    updateSessionExercise(exId, ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.id !== setId),
    }));
  }, [updateSessionExercise]);

  const addExerciseToSession = useCallback((exerciseName) => {
    updateGymData(prev => {
      if (!prev.activeSession) return prev;
      const newEx = {
        id: `ex_new_${Date.now()}`,
        name: exerciseName,
        sets: [{ id: `set_0_${Date.now()}`, reps: 10, weight: 0, completed: false }],
        notes: '',
        restTimer: 90,
      };
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          exercises: [...prev.activeSession.exercises, newEx],
        },
      };
    });
  }, [updateGymData]);

  const removeExerciseFromSession = useCallback((exId) => {
    updateGymData(prev => {
      if (!prev.activeSession) return prev;
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          exercises: prev.activeSession.exercises.filter(ex => ex.id !== exId),
        },
      };
    });
  }, [updateGymData]);

  const finishSession = useCallback(() => {
    updateGymData(prev => {
      if (!prev.activeSession) return prev;
      const log = {
        ...prev.activeSession,
        finishedAt: new Date().toISOString(),
        duration: Math.round(
          (Date.now() - new Date(prev.activeSession.startedAt).getTime()) / 60000
        ),
      };
      return {
        ...prev,
        workoutLogs: [log, ...prev.workoutLogs],
        activeSession: null,
      };
    });
  }, [updateGymData]);

  const discardSession = useCallback(() => {
    updateGymData(prev => ({ ...prev, activeSession: null }));
  }, [updateGymData]);

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const logs = gymData.workoutLogs;
    const totalWorkouts = logs.length;
    const thisWeek = logs.filter(l => {
      const d = new Date(l.finishedAt);
      const now = new Date();
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;
    const totalVolume = logs.reduce((acc, log) => {
      return acc + log.exercises.reduce((a, ex) => {
        return a + ex.sets.filter(s => s.completed).reduce((s2, set) => s2 + set.reps * set.weight, 0);
      }, 0);
    }, 0);
    const totalSets = logs.reduce((acc, log) => {
      return acc + log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
    }, 0);

    // PRs per exercise
    const prs = {};
    [...logs].reverse().forEach(log => {
      log.exercises.forEach(ex => {
        const maxWeight = Math.max(0, ...ex.sets.filter(s => s.completed).map(s => s.weight));
        if (!prs[ex.name] || maxWeight > prs[ex.name]) {
          prs[ex.name] = maxWeight;
        }
      });
    });

    return { totalWorkouts, thisWeek, totalVolume, totalSets, prs };
  }, [gymData.workoutLogs]);

  return {
    gymData,
    createPlan,
    updatePlan,
    deletePlan,
    startSession,
    updateSessionExercise,
    toggleSetCompleted,
    updateSetValue,
    addSetToExercise,
    removeSetFromExercise,
    addExerciseToSession,
    removeExerciseFromSession,
    finishSession,
    discardSession,
    stats,
  };
}
