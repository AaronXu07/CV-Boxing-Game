import { useRef, useEffect, useCallback } from 'react';
import { FRAME_TIME } from '../utils/constants.js';

/**
 * Custom hook for managing game render loop with FPS tracking
 */
export const useGameLoop = (isActive, processFrame) => {
  const rafIdRef = useRef(null);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsUpdateTimeRef = useRef(performance.now());
  const actualFPSRef = useRef(0);

  /**
   * Main render loop
   */
  const render = useCallback(async () => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;

    if(delta >= FRAME_TIME){
      lastFrameTimeRef.current = now - (delta % FRAME_TIME);
      
      //Calculate FPS
      frameCountRef.current++;
      const timeSinceLastUpdate = now - fpsUpdateTimeRef.current;
      if(timeSinceLastUpdate >= 1000){
        actualFPSRef.current = Math.round((frameCountRef.current * 1000) / timeSinceLastUpdate);
        frameCountRef.current = 0;
        fpsUpdateTimeRef.current = now;
      }

      // Process frame with current FPS
      await processFrame(actualFPSRef.current, now);
    }

    rafIdRef.current = requestAnimationFrame(render);
  }, [processFrame]);

  /**
   * Start/stop game loop based on isActive
   */
  useEffect(() => {
    if (!isActive) return;

    // Reset timing
    lastFrameTimeRef.current = performance.now();
    fpsUpdateTimeRef.current = performance.now();
    frameCountRef.current = 0;

    // Start render loop
    render();

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isActive, render]);

  return {
    currentFPS: actualFPSRef.current
  };
};
