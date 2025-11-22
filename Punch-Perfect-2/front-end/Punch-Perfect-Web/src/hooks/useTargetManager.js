import { useRef, useEffect, useCallback } from 'react';
import { CANVAS_SIZE, TARGET_SPAWN_INTERVAL, FRUIT_TARGET_SPAWN_INTERVAL } from '../utils/constants.js';
import { lIndex, rIndex } from '../mediapipe/landmarks.js';
import { StaticTarget, FruitTarget } from '../components/Game/Targets.js';

/**
 * Custom hook for managing targets and collision detection
 */
export const useTargetManager = (
  targetType, 
  isActive, 
  gameKey, 
  playHitSound, 
  playFruitSound, 
  onFruitDropped, 
  onBombExplode,
  playLaunchFruitSound,
  playLaunchBombSound,
  playBombFuseSound,
  stopBombFuseSound,
  pendingGameOverRef,
  isPausedRef
) => {
  const targetsRef = useRef([]);
  const spawnIntervalRef = useRef(null);
  const scoreRef = useRef(0);
  const bombFuseSoundPlayedRef = useRef(false); 

  /**
   * Spawn a new target (for fruit mode, randomly spawns 1-3 targets)
   */
  const spawnTarget = useCallback(() => {

    if(targetType === 'fruit'){
      // Randomly spawn 1-3 fruits/bombs at once
      const numTargets = Math.floor(Math.random() * 3) + 1; // 1-3 targets
      const newTargets = [];
      
      for (let i = 0; i < numTargets; i++) {
        const newTarget = new FruitTarget(CANVAS_SIZE.width, CANVAS_SIZE.height);
        newTargets.push(newTarget);
        
        // Play appropriate launch sound
        if (newTarget.fruitType.name === 'bomb' && playLaunchBombSound) {
          playLaunchBombSound();
        } else if (playLaunchFruitSound) {
          playLaunchFruitSound();
        }
      }
      
      targetsRef.current = [...targetsRef.current, ...newTargets];
      console.log(`Spawned ${numTargets} fruits/bombs`);
    } 
    else if(targetType === 'target'){
      const newTarget = new StaticTarget(CANVAS_SIZE.width, CANVAS_SIZE.height);
      if(newTarget){
        targetsRef.current = [...targetsRef.current, newTarget];
      }
    }
  }, [targetType, playLaunchFruitSound, playLaunchBombSound]);

  /**
   * Handle collision detection
   */
  const handleCollisions = useCallback((landmarks, punchStates, handStates, setIsGameOver) => {

    const {lPunchState, rPunchState} = punchStates;
    const {leftHandCanHit, rightHandCanHit, setLeftHandCanHit, setRightHandCanHit} = handStates;

    // Update targets first (for animated targets like fruits)
    if(targetType === 'fruit'){
      targetsRef.current = targetsRef.current.filter(target => {
        return target.update();
      });
      
      // Check if there's a bomb on screen and play fuse sound
      const hasBomb = targetsRef.current.some(target => target.fruitType?.name === 'bomb');
      if (hasBomb && !bombFuseSoundPlayedRef.current && playBombFuseSound) {
        playBombFuseSound();
        bombFuseSoundPlayedRef.current = true;
      } else if (!hasBomb && bombFuseSoundPlayedRef.current) {
        // Stop the bomb fuse sound when bomb leaves screen
        if (stopBombFuseSound) {
          stopBombFuseSound();
        }
        bombFuseSoundPlayedRef.current = false;
      }
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
          scoreRef.current++; 
          console.log('Left hand target hit!', { target, leftHand });
          target.hit();

          // Play appropriate sound based on target type
          if(targetType === 'fruit' && target.fruitType) {
            if(target.fruitType.name === 'bomb') {
              // Don't call setIsGameOver here - let animation complete
              if (stopBombFuseSound) {
                stopBombFuseSound();
              }
              bombFuseSoundPlayedRef.current = false; // Reset for next game
              if (onBombExplode) {
                onBombExplode({ x: target.x, y: target.y });
              }
            }
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
          scoreRef.current++; 
          console.log('Right hand target hit!', { target, rightHand });
          target.hit();
          
          // Play appropriate sound based on target type
          if(targetType === 'fruit' && target.fruitType) {
            if(target.fruitType.name === 'bomb') {
              // Don't call setIsGameOver here - let animation complete
              if (stopBombFuseSound) {
                stopBombFuseSound();
              }
              bombFuseSoundPlayedRef.current = false; // Reset for next game
              if (onBombExplode) {
                onBombExplode({ x: target.x, y: target.y });
              }
            }
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
  }, [targetType, playHitSound, playFruitSound, onBombExplode, playBombFuseSound, stopBombFuseSound]);

  const handleMissedFruit = useCallback((livesRef, lostLivesRef) => {

    targetsRef.current = targetsRef.current.filter(target => {

        const onScreen = target.checkOnScreen();
        if(!onScreen){
          if(target.fruitType.name !== 'bomb') {
            // Track which life was lost
            const lifeIndex = 3 - livesRef.current;
            if (!lostLivesRef.current.includes(lifeIndex)) {
              lostLivesRef.current = [...lostLivesRef.current, lifeIndex];
            }
            
            livesRef.current--;
            
            // Trigger dropped fruit animation
            if (onFruitDropped) {
              onFruitDropped(target.fruitType, { x: target.x, y: target.y });
            }
          }
          return false;
        } else {
          return true;
        }
          
    });
  }, [targetType, playHitSound, playFruitSound, onFruitDropped]);

  /**
   * Start spawning targets
   */
  useEffect(() => {
    if (!isActive) return;

    if (targetType === 'fruit') {
      // Dynamic spawn scheduling for fruit mode
      let cancelled = false;
      spawnIntervalRef.current = null;
      const MIN_DELAY = 3000; // 3 second delay for fruit waves

      const computeDelay = () => Math.max(MIN_DELAY, FRUIT_TARGET_SPAWN_INTERVAL - scoreRef.current * 20);

      const scheduleNext = () => {
        if (cancelled) return;
        if (pendingGameOverRef?.current) return; // Don't spawn if game over is pending
        const delay = computeDelay();
        spawnIntervalRef.current = setTimeout(() => {
          if (cancelled) return;
          if (!isPausedRef.current) spawnTarget();
          if (pendingGameOverRef?.current) return; // Double check before spawning
          
          scheduleNext();
        }, delay);
      };

      spawnTarget();
      scheduleNext();

      return () => {
        cancelled = true;
        if (spawnIntervalRef.current) {
          clearTimeout(spawnIntervalRef.current);
          spawnIntervalRef.current = null;
        }
        if(!isPausedRef.current) {
           scoreRef.current = 0; 
           targetsRef.current = [];
        }
      };
    } else {
      // Fixed interval spawning for target mode
      spawnTarget();

      spawnIntervalRef.current = setInterval(() => {
        if (targetsRef.current.length === 0) {
          spawnTarget();
        }
      }, TARGET_SPAWN_INTERVAL);

      return () => {
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
        }
        scoreRef.current = 0; 
        targetsRef.current = [];
      };
    }
  }, [isActive, gameKey, targetType, pendingGameOverRef]);

  useEffect(() => {
    console.log("Effect re-ran");
  }, [isActive, gameKey, targetType, pendingGameOverRef]);

  return{
    targetsRef,
    handleCollisions,
    spawnTarget, 
    handleMissedFruit, 
    scoreRef, 
  };
};
