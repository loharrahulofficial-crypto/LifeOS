import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function usePomodoro() {
  const [config, setConfig] = useLocalStorage('lifeos-pomodoro-config', {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    soundEnabled: true,
  });

  const [stats, setStats] = useLocalStorage('lifeos-pomodoro-stats', {
    totalSessions: 0,
    todaySessions: 0,
    todayDate: new Date().toISOString().split('T')[0],
  });

  const [mode, setMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(config.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef(null);

  const getDuration = useCallback((m) => {
    switch (m) {
      case 'work': return config.workDuration * 60;
      case 'shortBreak': return config.shortBreak * 60;
      case 'longBreak': return config.longBreak * 60;
      default: return config.workDuration * 60;
    }
  }, [config]);

  const totalDuration = getDuration(mode);
  const progress = 1 - (timeLeft / totalDuration);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchMode = useCallback((newMode) => {
    clearTimer();
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsRunning(false);
  }, [clearTimer, getDuration]);

  const completeSession = useCallback(() => {
    clearTimer();
    setIsRunning(false);

    if (mode === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      const today = new Date().toISOString().split('T')[0];
      setStats(prev => ({
        totalSessions: prev.totalSessions + 1,
        todaySessions: prev.todayDate === today ? prev.todaySessions + 1 : 1,
        todayDate: today,
      }));

      // After 4 work sessions, long break
      if (newCount % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(getDuration('longBreak'));
      } else {
        setMode('shortBreak');
        setTimeLeft(getDuration('shortBreak'));
      }
    } else {
      // Break finished, go back to work
      setMode('work');
      setTimeLeft(getDuration('work'));
    }
  }, [mode, sessionCount, clearTimer, getDuration, setStats]);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  }, [clearTimer, getDuration, mode]);

  const resetAll = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setMode('work');
    setTimeLeft(getDuration('work'));
    setSessionCount(0);
  }, [clearTimer, getDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimer();
  }, [isRunning, clearTimer]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      completeSession();
    }
  }, [timeLeft, isRunning, completeSession]);

  const updateConfig = useCallback((updates) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      return newConfig;
    });
  }, [setConfig]);

  // Sync timeLeft when config changes and timer is stopped
  useEffect(() => {
    if (!isRunning) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setTimeLeft(getDuration(mode));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.workDuration, config.shortBreak, config.longBreak]);

  const toggleSound = useCallback(() => {
    setConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, [setConfig]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    mode,
    timeLeft,
    timeDisplay,
    isRunning,
    progress,
    sessionCount,
    config,
    stats,
    start,
    pause,
    reset,
    resetAll,
    switchMode,
    updateConfig,
    toggleSound,
    completeSession,
  };
}
