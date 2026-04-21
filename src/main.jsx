import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ─── Android Status Bar Height Detection ───
(function detectStatusBar() {
  const isCapacitor = window.Capacitor?.isNativePlatform?.() ||
                      navigator.userAgent.includes('CapacitorAndroid');
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isCapacitor || isAndroid) {
    document.documentElement.style.setProperty('--status-bar-height', '28px');
  }
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
