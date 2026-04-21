import { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Clock, Cpu, Activity, Zap } from 'lucide-react';
import './WelcomePage.css';

export default function WelcomePage({ onEnter }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  let greeting = 'GOOD EVENING';
  if (hours < 12) greeting = 'GOOD MORNING';
  else if (hours < 18) greeting = 'GOOD AFTERNOON';

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleAcknowledge = () => {
    onEnter();
  };

  return (
    <>
      <div className="welcome-ambient-bg">
        <div className="welcome-ambient-glow-1" />
        <div className="welcome-ambient-glow-2" />
      </div>

      <div className="welcome-overlay-container">
        <div className="welcome-motivation-card">
          <div className="welcome-scanline" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div className="welcome-sys-header" style={{ marginBottom: 0 }}>
              <Terminal size={16} />
              <span>CRITICAL SYSTEM OVERRIDE INITIATED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              <Clock size={14} />
              <span>
                {greeting} // {timeString}
              </span>
            </div>
          </div>

          <h1 className="welcome-title">
            YOU ARE CAPABLE <br />
            OF EVERYTHING.
          </h1>

          <div className="welcome-quote-container">
            <p className="welcome-quote">
              "The limit does not exist. It is an arbitrary boundary constructed by the mind.
              Shatter the glass. Rewrite the constraints. Execute your vision."
            </p>
            <span className="welcome-quote-author">// NEURAL DIRECTIVE_001</span>
          </div>

          <div className="welcome-metrics-row">
            <div className="welcome-metric-box">
              <Cpu size={16} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
              <span className="welcome-metric-label">FOCUS LEVEL</span>
              <span className="welcome-metric-value">MAX</span>
            </div>
            <div className="welcome-metric-box">
              <Activity size={16} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
              <span className="welcome-metric-label">POTENTIAL</span>
              <span className="welcome-metric-value">LIMITLESS</span>
            </div>
            <div className="welcome-metric-box">
              <ShieldAlert size={16} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
              <span className="welcome-metric-label">OBSTACLES</span>
              <span className="welcome-metric-value">BYPASSED</span>
            </div>
          </div>

          <button type="button" className="welcome-action-btn" onClick={handleAcknowledge}>
            <Zap size={18} />
            ACKNOWLEDGE & INITIALIZE
          </button>
        </div>
      </div>
    </>
  );
}
