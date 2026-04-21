/**
 * Firebase initialization
 * Uses lazy initialization to avoid top-level await issues.
 * Gracefully handles missing config — returns null when not configured.
 */

let _firebasePromise = null;
let _resolved = null;

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !authDomain || !projectId ||
      apiKey === 'your_api_key_here' ||
      authDomain === 'your_project.firebaseapp.com') {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
}

/**
 * Returns a promise that resolves to { auth, googleProvider, signInWithPopup, signOut, ready }
 * Call this lazily — it only imports Firebase when config is present.
 */
export function initFirebase() {
  if (_resolved) return Promise.resolve(_resolved);

  if (!_firebasePromise) {
    const config = getFirebaseConfig();

    if (!config) {
      console.log('ℹ️ Firebase not configured — running in local-only mode');
      _resolved = { auth: null, googleProvider: null, signInWithPopup: null, signOut: null, ready: false };
      return Promise.resolve(_resolved);
    }

    _firebasePromise = Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
    ]).then(([appModule, authModule]) => {
      const app = appModule.initializeApp(config);
      const auth = authModule.getAuth(app);
      const googleProvider = new authModule.GoogleAuthProvider();
      console.log('✅ Firebase initialized');
      _resolved = {
        auth,
        googleProvider,
        signInWithPopup: authModule.signInWithPopup,
        signOut: authModule.signOut,
        ready: true,
      };
      return _resolved;
    }).catch(err => {
      console.warn('⚠️ Firebase init failed:', err.message);
      _resolved = { auth: null, googleProvider: null, signInWithPopup: null, signOut: null, ready: false };
      return _resolved;
    });
  }

  return _firebasePromise;
}
