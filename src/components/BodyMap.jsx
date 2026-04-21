import { useMemo } from 'react';

// ── Solo Leveling rank system ─────────────────────────────────────
export const STRENGTH_TIERS = [
  { name: 'E-Rank', color: '#6b7280', minXP: 0 },
  { name: 'D-Rank', color: '#22d3ee', minXP: 500 },
  { name: 'C-Rank', color: '#4ade80', minXP: 3000 },
  { name: 'B-Rank', color: '#a78bfa', minXP: 15000 },
  { name: 'A-Rank', color: '#f97316', minXP: 60000 },
  { name: 'S-Rank', color: '#f59e0b', minXP: 200000 },
  { name: 'National Level', color: '#ef4444', minXP: 600000 },
];

export function getTier(xp) {
  for (let i = STRENGTH_TIERS.length - 1; i >= 0; i--) {
    if (xp >= STRENGTH_TIERS[i].minXP) return STRENGTH_TIERS[i];
  }
  return STRENGTH_TIERS[0];
}

// ── Scanline / hex grid overlay ───────────────────────────────────
const ScanlineOverlay = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
    background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(245,158,11,0.025) 3px,rgba(245,158,11,0.025) 4px)',
    borderRadius: 'inherit',
  }} />
);

// ── Polygon clip helper ───────────────────────────────────────────
const poly = 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)';
const polyLg = 'polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)';

// Corner accent — Solo Leveling style corner bracket
function CornerBrackets({ color }) {
  const s = { position: 'absolute', width: 14, height: 14, opacity: 0.9 };
  const line = { position: 'absolute', background: color };
  return (
    <>
      {/* TL */}
      <span style={{ ...s, top: 0, left: 0 }}>
        <span style={{ ...line, top: 0, left: 0, width: 14, height: 2 }} />
        <span style={{ ...line, top: 0, left: 0, width: 2, height: 14 }} />
      </span>
      {/* TR */}
      <span style={{ ...s, top: 0, right: 0 }}>
        <span style={{ ...line, top: 0, right: 0, width: 14, height: 2 }} />
        <span style={{ ...line, top: 0, right: 0, width: 2, height: 14 }} />
      </span>
      {/* BL */}
      <span style={{ ...s, bottom: 0, left: 0 }}>
        <span style={{ ...line, bottom: 0, left: 0, width: 14, height: 2 }} />
        <span style={{ ...line, bottom: 0, left: 0, width: 2, height: 14 }} />
      </span>
      {/* BR */}
      <span style={{ ...s, bottom: 0, right: 0 }}>
        <span style={{ ...line, bottom: 0, right: 0, width: 14, height: 2 }} />
        <span style={{ ...line, bottom: 0, right: 0, width: 2, height: 14 }} />
      </span>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────
export default function BodyMap({ muscleRanks }) {
  const totalXP = (muscleRanks || []).reduce((a, m) => a + m.xp, 0);
  const totalTier = getTier(totalXP);
  const score = Math.floor(totalXP / 100);

  // accent: gold for S-rank, else tier color
  const accent = totalTier.color;

  return (
    <div style={{ boxSizing: 'border-box', width: '100%', fontFamily: "'Courier New', monospace" }}>

      {/* ── SYSTEM HEADER ── */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(135deg, #0a0e14 0%, #0d1520 100%)`,
        border: `1px solid ${accent}55`,
        clipPath: polyLg,
        padding: '1.25rem 1.25rem 1rem',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}>
        <CornerBrackets color={accent} />
        <ScanlineOverlay />

        {/* System badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 32, height: 32, clipPath: poly,
            background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
            border: `1px solid ${accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: `0 0 16px ${accent}50`,
          }}>
            <span style={{ fontSize: '0.9rem' }}>🛡</span>
          </div>
          <div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: `${accent}99`, fontWeight: 700 }}>LifeOS SYSTEM</div>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: accent, fontWeight: 800, textShadow: `0 0 12px ${accent}80` }}>BODY STATUS WINDOW</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '0.55rem', color: `${accent}70`, letterSpacing: '0.1em' }}>POWER LEVEL</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: accent, textShadow: `0 0 24px ${accent}`, lineHeight: 1 }}>{score}</div>
          </div>
        </div>

        {/* Rank badge */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 1rem', clipPath: poly,
          background: `${accent}18`, border: `1px solid ${accent}50`,
          boxShadow: `0 0 20px ${accent}30`,
        }}>
          <span style={{ width: 8, height: 8, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: accent, display: 'inline-block', boxShadow: `0 0 8px ${accent}` }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: accent, letterSpacing: '0.18em', textShadow: `0 0 10px ${accent}` }}>{totalTier.name.toUpperCase()}</span>
          <span style={{ width: 8, height: 8, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: accent, display: 'inline-block', boxShadow: `0 0 8px ${accent}` }} />
        </div>
      </div>

      {/* ── PER-MUSCLE STATUS LIST ── */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: `${accent}80`, fontWeight: 800, marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
          ▸ MUSCLE ANALYSIS LOG
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingBottom: '2rem' }}>
          {(muscleRanks || []).map(m => {
            const tier = getTier(m.xp);
            const sc = Math.floor(m.xp / 10);
            const tierIdx = STRENGTH_TIERS.findIndex(t => t.color === tier.color);
            const nextTier = STRENGTH_TIERS[tierIdx + 1];
            const pct = nextTier
              ? Math.min(100, ((m.xp - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100)
              : 100;
            return (
              <div key={m.id} style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: `linear-gradient(135deg, ${tier.color}08, transparent)`,
                border: `1px solid ${tier.color}30`,
                borderLeft: `3px solid ${tier.color}`,
                clipPath: poly,
                overflow: 'hidden',
              }}>
                {/* Scanline */}
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)', pointerEvents: 'none' }} />

                {/* Rank diamond */}
                <div style={{
                  width: 10, height: 10, flexShrink: 0,
                  clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
                  background: tier.color, boxShadow: `0 0 10px ${tier.color}`,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.28rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem' }}>{m.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#d1d5db' }}>{m.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: tier.color, letterSpacing: '0.08em' }}>{tier.name}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: tier.color, textShadow: `0 0 10px ${tier.color}`, minWidth: 32, textAlign: 'right' }}>{sc}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', overflow: 'visible', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${tier.color}60, ${tier.color})`,
                      boxShadow: `0 0 10px ${tier.color}`,
                      transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
