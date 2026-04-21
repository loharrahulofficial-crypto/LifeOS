/**
 * LifeOS API Client
 * ------------------
 * Talks to the Express/MySQL server.
 * - When user is signed in: sends Firebase ID token for auth
 * - When not signed in: sends device-id header for anonymous storage
 * - Falls back silently when the server is offline.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let authToken = null;

// Called by useAuth when Firebase provides a token
export function setAuthToken(token) {
  authToken = token;
}

// Stable device ID for anonymous usage
function getDeviceId() {
  let id = localStorage.getItem('lifeos-device-id');
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('lifeos-device-id', id);
  }
  return id;
}

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  if (authToken) {
    h['Authorization'] = `Bearer ${authToken}`;
  }
  h['x-device-id'] = getDeviceId();
  return h;
};

// ── Load a single module from server ─────────────────────────
export async function loadModule(module) {
  try {
    const res = await fetch(`${API_BASE}/data/${module}`, {
      method: 'GET',
      headers: headers(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.payload ?? null;
  } catch {
    return null; // server offline — caller uses localStorage
  }
}

// ── Save a single module to server ───────────────────────────
export async function saveModule(module, payload) {
  try {
    await fetch(`${API_BASE}/data/${module}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ payload }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // silent — localStorage write already happened
  }
}

// ── Load ALL modules (used on app startup) ───────────────────
export async function loadAllModules() {
  try {
    const res = await fetch(`${API_BASE}/data`, {
      method: 'GET',
      headers: headers(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = {};
    for (const [mod, val] of Object.entries(data)) {
      result[mod] = val.payload;
    }
    return result;
  } catch {
    return null;
  }
}

// ── Health check ─────────────────────────────────────────────
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export { getDeviceId };
