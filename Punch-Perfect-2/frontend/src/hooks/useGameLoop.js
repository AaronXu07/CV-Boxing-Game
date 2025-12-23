import { useRef, useEffect, useCallback } from 'react';
import { FRAME_TIME } from '../utils/constants.js';

/**
 * Custom hook for managing game render loop with FPS tracking
 */
export const useGameLoop = (isActive, gameKey, processFrame) => {
  const rafIdRef = useRef(null);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsUpdateTimeRef = useRef(performance.now());
  const actualFPSRef = useRef(0);

  /**
   * Main render loop
   */
  const render = useCallback(async (timestamp) => {
    if (!isActive) return;

    rafIdRef.current = requestAnimationFrame(render);

    const delta = timestamp - lastFrameTimeRef.current;
    if (delta < FRAME_TIME) return;

    // Calculate FPS
    frameCountRef.current++;
    const timeSinceLastUpdate = timestamp - fpsUpdateTimeRef.current;
    if (timeSinceLastUpdate >= 1000) {
      actualFPSRef.current = Math.round((frameCountRef.current * 1000) / timeSinceLastUpdate);
      frameCountRef.current = 0;
      fpsUpdateTimeRef.current = timestamp;
    }

    // Process frame
    await processFrame(actualFPSRef.current, timestamp);
    lastFrameTimeRef.current = timestamp;
  }, [isActive, processFrame]);

  /**
   * Start/stop game loop based on isActive and gameKey
   */
  useEffect(() => {
    
    if (!isActive) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // Reset timing on game start/restart
    lastFrameTimeRef.current = performance.now();
    fpsUpdateTimeRef.current = performance.now();
    frameCountRef.current = 0;
    actualFPSRef.current = 0;

    // Start render loop
    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isActive, gameKey, render]);

  return {
    currentFPS: actualFPSRef.current
  };
};
