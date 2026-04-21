import { useState, useEffect, useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';

export function useLocalStorage(key, defaultValue) {
  // 1. Synchronous L1 Cache load (prevents UI flashing on mount)
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Guard: skip dual-write on the very first render to prevent
  // wiping data before the async Preferences read completes.
  const isFirstRender = useRef(true);

  // 2. Asynchronous L2 Permanent Storage Load (Validates/updates L1 Cache)
  useEffect(() => {
    const loadFromDevice = async () => {
      try {
        const { value: nativeVal } = await Preferences.get({ key });
        if (nativeVal !== null) {
          const parsed = JSON.parse(nativeVal);
          // Only overwrite if device has a non-empty value
          if (parsed !== null && parsed !== undefined && parsed !== '') {
            setValue(parsed);
            localStorage.setItem(key, nativeVal);
          }
        }
      } catch (err) {
        console.warn('Native Preference read failed:', err);
      }
    };
    loadFromDevice();
  }, [key]);

  // 3. Dual-Write Strategy (Save to both caches when value changes)
  // Skip first render to avoid overwriting stored data with the default value.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      const stringified = JSON.stringify(value);
      localStorage.setItem(key, stringified);
      Preferences.set({ key, value: stringified }).catch(e =>
        console.warn('Native Preference write failed:', e)
      );
    } catch (e) {
      console.warn('Dual-write cache failed:', e);
    }
  }, [key, value]);

  const updateValue = useCallback((newValue) => {
    setValue(prev => typeof newValue === 'function' ? newValue(prev) : newValue);
  }, []);

  return [value, updateValue];
}
