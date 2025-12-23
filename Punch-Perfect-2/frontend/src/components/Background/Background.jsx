import React, { useState, useEffect, useRef } from 'react';
import './background.css';
import breakSoundFile from '../../assets/sounds/break.mp3';

const Background = ({ enableTargets = false }) => {
  const [targets, setTargets] = useState([]);
  const nextId = useRef(0);
  const audioRef = useRef(new Audio(breakSoundFile));

  useEffect(() => {
    if (!enableTargets) return;
    // Preload audio
    audioRef.current.load();
  }, [enableTargets]);

  useEffect(() => {
    if (!enableTargets) return;

    const spawnInterval = setInterval(() => {
      setTargets(prev => {
        if (prev.length >= 4) return prev;
        
        // Random position (avoiding edges to keep them clickable and visible)
        // Keeping within 10% - 90% range
        const x = 10 + Math.random() * 80; 
        const y = 10 + Math.random() * 80; 
        
        return [...prev, {
          id: nextId.current++,
          x,
          y,
          isBreaking: false
        }];
      });
    }, 2000); // Attempt to spawn every 2 seconds

    return () => clearInterval(spawnInterval);
  }, [enableTargets]);

  const handleTargetClick = (id) => {
    // Play sound
    // Clone node allows overlapping sounds if multiple targets are clicked quickly
    const sound = audioRef.current.cloneNode(); 
    sound.volume = 0.4; 
    sound.play().catch(e => {});

    // Set breaking state
    setTargets(prev => prev.map(t => 
      t.id === id ? { ...t, isBreaking: true } : t
    ));

    // Remove after animation
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
    }, 400); // Slightly shorter than animation to ensure it's gone
  };

  return (
    <div className="global-background" aria-hidden="true">
      {/* Layer 1: Ring Floor / Grid */}
      <div className="bg-layer grid-layer">
        <div className="perspective-grid"></div>
      </div>

      {/* Layer 2: Ring Geometry (Corners) */}
      <div className="bg-layer geometry-layer">
        <div className="ring-corner corner-tl"></div>
        <div className="ring-corner corner-tr"></div>
        <div className="ring-corner corner-bl"></div>
        <div className="ring-corner corner-br"></div>
      </div>

      {/* Layer 4: Interactive Targets */}
      {enableTargets && (
        <div className="bg-layer target-layer">
          {targets.map(target => (
            <div 
              key={target.id}
              className={`floating-target ${target.isBreaking ? 'breaking' : ''}`}
              style={{ 
                left: `${target.x}%`, 
                top: `${target.y}%`,
                pointerEvents: target.isBreaking ? 'none' : 'auto'
              }}
              onClick={() => handleTargetClick(target.id)}
            >
              <div className="target-ring"></div>
              <div className="target-dot"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Background;
