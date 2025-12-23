import { useRef, useCallback } from 'react';
import { detectPunches } from '../mediapipe/detectPunches.js';

/**
 * Custom hook for tracking punch states and counters
 */
export const usePunchTracking = (playPunchSound) => {
  // Punch counters
  const lPunchCounterRef = useRef(0);
  const rPunchCounterRef = useRef(0);

  // Previous punch states
  const lPrevPunchRef = useRef(false);
  const rPrevPunchRef = useRef(false);
  const lPrevPunchStateRef = useRef(false);
  const rPrevPunchStateRef = useRef(false);

  // Hand hit cooldown tracking
  const leftHandCanHitRef = useRef(true);
  const rightHandCanHitRef = useRef(true);

  /**
   * Process punch detection for current frame
   */
  const processPunches = useCallback((landmarks) => {
    const punchData = detectPunches(landmarks);
    
    // Check if hands have returned to non-punching state
    if(!punchData.leftArm && !leftHandCanHitRef.current){
      leftHandCanHitRef.current = true;
    }
    if(!punchData.rightArm && !rightHandCanHitRef.current){
      rightHandCanHitRef.current = true;
    }
    
    // Determine punch states
    const lPunchState = punchData.leftArm && lPrevPunchRef.current;
    const rPunchState = punchData.rightArm && rPrevPunchRef.current;
    
    // Update punch counters
    if(lPunchState && !lPrevPunchStateRef.current){
      lPunchCounterRef.current++;
      playPunchSound();
    }
    if(rPunchState && !rPrevPunchStateRef.current){
      rPunchCounterRef.current++;
      playPunchSound();
    }

    // Update previous states
    lPrevPunchStateRef.current = lPunchState;
    rPrevPunchStateRef.current = rPunchState;
    lPrevPunchRef.current = punchData.leftArm;
    rPrevPunchRef.current = punchData.rightArm;

    return{
      punchData,
      punchStates: { lPunchState, rPunchState },
      handStates: {
        leftHandCanHit: leftHandCanHitRef.current,
        rightHandCanHit: rightHandCanHitRef.current,
        setLeftHandCanHit: (value) => { leftHandCanHitRef.current = value; },
        setRightHandCanHit: (value) => { rightHandCanHitRef.current = value; }
      },
      counters: {
        left: lPunchCounterRef.current,
        right: rPunchCounterRef.current
      }
    };
  }, [playPunchSound]);

  /**
   * Reset punch tracking
   */
  const resetTracking = useCallback(() => {
    lPunchCounterRef.current = 0;
    rPunchCounterRef.current = 0;
    lPrevPunchRef.current = false;
    rPrevPunchRef.current = false;
    lPrevPunchStateRef.current = false;
    rPrevPunchStateRef.current = false;
    leftHandCanHitRef.current = true;
    rightHandCanHitRef.current = true;
  }, []);

  return {
    processPunches,
    resetTracking
  };
};
