/**
 * useCloudStorage — Drop-in replacement for useLocalStorage
 * ----------------------------------------------------------
 * 1. Reads from localStorage immediately (zero flicker).
 * 2. On mount, fetches from the MySQL server. If server has data,
 *    it merges/overwrites localStorage so the device stays in sync.
 * 3. On every state change, writes to localStorage instantly AND
 *    debounces a background save to the server (500 ms).
 * 4. If the server is offline, everything still works from localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { loadModule, saveModule } from '../utils/api';
import { useSyncStatus } from './useSyncStatus';

const DEBOUNCE_MS = 800;

export function useCloudStorage(module, defaultValue) {
  const lsKey = `lifeos-${module}`;
  const { setSyncing, setError } = useSyncStatus();

  // ── 1. Load from localStorage immediately ──────────────────
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(lsKey);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const debounceTimer = useRef(null);
  const isFirstMount  = useRef(true);

  // ── 2. On mount — fetch from server & merge ─────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchFromServer() {
      const serverData = await loadModule(module);
      if (cancelled) return;
      if (serverData !== null) {
        // Server has data — trust it as source of truth
        setValue(serverData);
        try { localStorage.setItem(lsKey, JSON.stringify(serverData)); } catch (_e) { /* ignore */ }
      }
    }
    fetchFromServer();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  // ── 3. On every value change — write localStorage + debounce server ──
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    // Instant localStorage write
    try { localStorage.setItem(lsKey, JSON.stringify(value)); } catch (_e) { /* ignore */ }

    // Debounced server write
    clearTimeout(debounceTimer.current);
    setSyncing(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        await saveModule(module, value);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setSyncing(false);
      }
    }, DEBOUNCE_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateValue = useCallback((newValue) => {
    setValue(prev => typeof newValue === 'function' ? newValue(prev) : newValue);
  }, []);

  return [value, updateValue];
}
