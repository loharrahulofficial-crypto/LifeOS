/**
 * useAuth — Google Sign-In hook
 * Lazy-loads Firebase. When not configured, shows a helpful alert.
 */

import { useState, useEffect, useCallback } from 'react';
import { initFirebase } from '../firebase';
import { setAuthToken } from '../utils/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fb, setFb] = useState(null); // { auth, googleProvider, signInWithPopup, signOut, ready }

  // Initialize Firebase on mount
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    initFirebase().then(firebase => {
      if (cancelled) return;
      setFb(firebase);

      if (firebase.ready && firebase.auth) {
        // Listen for auth state changes
        unsubscribe = firebase.auth.onAuthStateChanged(async (currentUser) => {
          if (cancelled) return;
          setUser(currentUser);
          if (currentUser) {
            try {
              const token = await currentUser.getIdToken();
              setAuthToken(token);
            } catch (error) {
              console.error('Error getting token:', error);
              setAuthToken(null);
            }
          } else {
            setAuthToken(null);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    if (!fb?.ready || !fb?.auth || !fb?.googleProvider) {
      alert(
        'Google Sign-In is not configured yet.\n\n' +
        'To enable it:\n' +
        '1. Create a Firebase project at console.firebase.google.com\n' +
        '2. Enable Authentication → Google provider\n' +
        '3. Copy your web app config\n' +
        '4. Create a .env file in the project root with:\n' +
        '   VITE_FIREBASE_API_KEY=...\n' +
        '   VITE_FIREBASE_AUTH_DOMAIN=...\n' +
        '   VITE_FIREBASE_PROJECT_ID=...\n' +
        '   VITE_FIREBASE_APP_ID=...\n' +
        '5. Restart the dev server'
      );
      return;
    }
    try {
      setLoading(true);
      await fb.signInWithPopup(fb.auth, fb.googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup — not an error
      } else if (error.code === 'auth/popup-blocked') {
        alert('Sign-in popup was blocked. Please allow popups for this site and try again.');
      } else {
        alert('Sign-in failed: ' + (error.message || 'Unknown error'));
      }
      setLoading(false);
    }
  }, [fb]);

  const signOut = useCallback(async () => {
    if (!fb?.auth) return;
    try {
      await fb.signOut(fb.auth);
      setAuthToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [fb]);

  return { user, loading, signIn, signOut };
}
