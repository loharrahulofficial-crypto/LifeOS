import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function RadialMenu({ navItems, activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  
  const centerRef = useRef(null);
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });

  // Prevent default context menu (like long press on mobile selecting text)
  useEffect(() => {
    const preventContext = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventContext);
    return () => document.removeEventListener('contextmenu', preventContext);
  }, []);

  const handlePointerDown = (e) => {
    // only react to primary touch/click
    if (e.button && e.button !== 0) return;
    
    // Capture the pointer to trace dragging anywhere on screen
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // Get actual center position relative to viewport
    const rect = centerRef.current.getBoundingClientRect();
    setCenterPos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    
    // Slight haptic feedback hint if supported
    if (navigator.vibrate) navigator.vibrate(50);
    
    setIsOpen(true);
    setHoveredId(null);
  };

  const handlePointerMove = (e) => {
    if (!isOpen) return;

    const dx = e.clientX - centerPos.x;
    const dy = e.clientY - centerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If outside inner radius, find closest angle
    if (distance > 45) {
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Normalize to 0-360
      if (angle < 0) angle += 360; 
      
      const gap = 180 / (navItems.length - 1);
      
      let closestId = null;
      let minDiff = Infinity;
      
      navItems.forEach((item, i) => {
        // Items are arranged from 180 (left) to 360 (right)
        const itemAngle = 180 + (i * gap);
        
        let diff = Math.abs(angle - itemAngle);
        if (diff > 180) diff = 360 - diff; // shortest distance around circle
        
        if (diff < minDiff) {
          minDiff = diff;
          closestId = item.id;
        }
      });
      
      // If pointer is aiming upwards/sideways
      if (angle >= 150 || angle <= 30) {
        if (hoveredId !== closestId) {
            if (navigator.vibrate) navigator.vibrate(10); // subtle snap haptic
            setHoveredId(closestId);
        }
      } else {
        // If cursor moves downwards (angles 30-150 relative to our 0-360 mapped wheel)
        if (hoveredId !== null) setHoveredId(null);
      }

    } else {
      if (hoveredId !== null) setHoveredId(null);
    }
  };

  const handlePointerUp = (e) => {
    if (!isOpen) return;
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsOpen(false);
    
    if (hoveredId) {
      setActiveTab(hoveredId);
      if (navigator.vibrate) navigator.vibrate(40); // select haptic
    }
    setHoveredId(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(3px)',
              zIndex: 55,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <div 
        className="radial-menu-container"
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          touchAction: 'none' // critical to prevent default gestures while dragging on mobile
        }}
      >
        <div 
          ref={centerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            boxShadow: isOpen ? '0 0 25px var(--accent-glow)' : '0 4px 15px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s',
            transform: isOpen ? 'scale(0.92)' : 'scale(1)',
            userSelect: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {/* Elegant 9-dot grid or grid icon */}
          <span style={{ transform: isOpen ? 'scale(0.8) rotate(45deg)' : 'scale(1) rotate(0deg)', transition: 'all 0.3s ease', display: 'flex' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </span>
        </div>

        <AnimatePresence>
          {isOpen && navItems.map((item, i) => {
            const gap = 180 / (navItems.length - 1);
            // Arrange from 180 (left) to 360 (right)
            const angleDeg = 180 + (i * gap); 
            const angleRad = angleDeg * (Math.PI / 180);
            
            // Adjust radius for more thumb-room and space between tabs
            const radius = 150; 
            
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);

            const isHovered = hoveredId === item.id;
            const isActive = activeTab === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  x, 
                  y, 
                  scale: isHovered ? 1.25 : 1 
                }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 25,
                  delay: i * 0.01 // slight stagger out effect
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  marginLeft: -28, // half width
                  marginTop: -28,  // half height
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                  border: isActive ? 'none' : '1px solid var(--border)',
                  color: isActive ? '#000' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  pointerEvents: 'none', // center thumb controls everything
                  boxShadow: isHovered ? '0 0 20px var(--accent)' : '0 4px 10px rgba(0,0,0,0.5)',
                  zIndex: isHovered ? 62 : 61,
                }}
              >
                {item.icon}
                
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: -35,
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px var(--shadow-color)',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {item.label}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
