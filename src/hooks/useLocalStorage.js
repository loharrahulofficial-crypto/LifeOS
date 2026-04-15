import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  }, [key, value]);

  const updateValue = useCallback((newValue) => {
    setValue(prev => typeof newValue === 'function' ? newValue(prev) : newValue);
  }, []);

  return [value, updateValue];
}
