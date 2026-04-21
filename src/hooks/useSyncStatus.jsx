/**
 * useSyncStatus — Global sync status context
 * Shows the user when data is syncing / synced / offline
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const SyncContext = createContext({
  syncing: false,
  error: false,
  lastSynced: null,
  setSyncing: () => {},
  setError: () => {},
});

export function SyncStatusProvider({ children }) {
  const [syncing, setSyncingState] = useState(false);
  const [error, setErrorState] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const activeCount = useRef(0);

  const setSyncing = useCallback((val) => {
    if (val) {
      activeCount.current++;
    } else {
      activeCount.current = Math.max(0, activeCount.current - 1);
      if (activeCount.current === 0) {
        setLastSynced(new Date());
      }
    }
    setSyncingState(activeCount.current > 0);
  }, []);

  const setError = useCallback((val) => {
    setErrorState(val);
  }, []);

  return (
    <SyncContext.Provider value={{ syncing, error, lastSynced, setSyncing, setError }}>
      {children}
    </SyncContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSyncStatus() {
  return useContext(SyncContext);
}
