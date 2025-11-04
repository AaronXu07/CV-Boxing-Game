import { useRef, useEffect, useCallback } from 'react';
import { CANVAS_SIZE, TARGET_SPAWN_INTERVAL } from '../utils/constants.js';
import { lIndex, rIndex } from '../mediapipe/landmarks.js';
import { StaticTarget, FruitTarget } from '../components/Game/Targets.js';

/**
 * Custom hook for managing targets and collision detection
 */
export const useTargetManager = (targetType, isActive, playHitSound, playFruitSound) => {
  const targetsRef = useRef([]);
  const spawnIntervalRef = useRef(null);

  /**
   * Spawn a new target
   */
  const spawnTarget = useCallback(() => {
    let newTarget;
    
    if(targetType === 'fruit'){
      newTarget = new FruitTarget(CANVAS_SIZE.width, CANVAS_SIZE.height);
      console.log("new fruit created");
    } 
    else if(targetType === 'target'){
      newTarget = new StaticTarget(CANVAS_SIZE.width, CANVAS_SIZE.height);
    }
    
    if(newTarget){
      targetsRef.current = [...targetsRef.current, newTarget];
    }
  }, [targetType]);

  /**
   * Handle collision detection
   */
  const handleCollisions = useCallback((landmarks, punchStates, handStates) => {
    const {lPunchState, rPunchState} = punchStates;
    const {leftHandCanHit, rightHandCanHit, setLeftHandCanHit, setRightHandCanHit} = handStates;

    // Update targets first (for animated targets like fruits)
    if(targetType === 'fruit'){
      targetsRef.current = targetsRef.current.filter(target => {
        return target.update();
      });
    }
    
    // Check left hand collision
    if(lPunchState && leftHandCanHit){
      const leftHand = { 
        x: CANVAS_SIZE.width - (landmarks[lIndex].x * CANVAS_SIZE.width), 
        y: landmarks[lIndex].y * CANVAS_SIZE.height 
      };
      
      targetsRef.current = targetsRef.current.filter(target => {
        const hitByLeft = target.checkCollisionLeft(leftHand.x, leftHand.y);
        if(hitByLeft){
          console.log('Left hand target hit!', { target, leftHand });
          target.hit();
          
          // Play appropriate sound based on target type
          if(targetType === 'fruit' && target.fruitType) {
            playFruitSound(target.fruitType.name);
          } else {
            playHitSound();
          }
          
          setLeftHandCanHit(false);
          return false;
        }
        return true;
      });
    }
    
    // Check right hand collision
    if(rPunchState && rightHandCanHit){
      const rightHand = { 
        x: CANVAS_SIZE.width - (landmarks[rIndex].x * CANVAS_SIZE.width), 
        y: landmarks[rIndex].y * CANVAS_SIZE.height 
      };
      
      targetsRef.current = targetsRef.current.filter(target => {
        const hitByRight = target.checkCollisionRight(rightHand.x, rightHand.y);
        if(hitByRight){
          console.log('Right hand target hit!', { target, rightHand });
          target.hit();
          
          // Play appropriate sound based on target type
          if(targetType === 'fruit' && target.fruitType) {
            playFruitSound(target.fruitType.name);
          } else {
            playHitSound();
          }
          
          setRightHandCanHit(false);
          return false;
        }
        return true;
      });
    }
  }, [targetType, playHitSound, playFruitSound]);

  /**
   * Start spawning targets
   */
  useEffect(() => {
    if (!isActive) return;

    // Clear existing targets
    targetsRef.current = [];

    // Spawn initial target
    spawnTarget();

    // Set up spawn interval
    spawnIntervalRef.current = setInterval(() => {
      if(targetsRef.current.length === 0){
        spawnTarget();
      }
    }, TARGET_SPAWN_INTERVAL);

    return () => {
      if(spawnIntervalRef.current){
        clearInterval(spawnIntervalRef.current);
      }
      targetsRef.current = [];
    };
  }, [isActive, spawnTarget]);

  return{
    targetsRef,
    handleCollisions,
    spawnTarget
  };
};
