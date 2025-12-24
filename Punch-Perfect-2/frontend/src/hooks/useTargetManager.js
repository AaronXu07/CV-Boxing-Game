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
  isPausedRef,
  playComboSound,
  isResumingRef // optional ref tracking countdown resume phase
) => {
  const targetsRef = useRef([]);
  const spawnIntervalRef = useRef(null);
  const scoreRef = useRef(0);
  const bombFuseSoundPlayedRef = useRef(false);
  const comboCountRef = useRef(0);
  const consecutiveHitsRef = useRef(0);
  const comboPopupsRef = useRef([]); // Track combo popups: [{combo, bonus, x, y, opacity, createdAt}] 

  /**
   * Spawn a new target (for fruit mode, randomly spawns 1-3 targets)
   */
  const spawnTarget = useCallback(() => {
    // Don't spawn if game is over
    if (pendingGameOverRef?.current) return;

    if(targetType === 'fruit'){
      // Randomly spawn 1-3 fruits/bombs at once
      const numTargets = Math.floor(Math.random() * 3) + 1; // 1-3 targets
      const newTargets = [];
      
      for (let i = 0; i < numTargets; i++) {
        const newTarget = new FruitTarget(CANVAS_SIZE.width, CANVAS_SIZE.height);
        newTargets.push(newTarget);
        
        // Play appropriate launch sound only if game is not over
        if (!pendingGameOverRef?.current) {
          if (newTarget.fruitType.name === 'bomb' && playLaunchBombSound) {
            playLaunchBombSound();
          } else if (playLaunchFruitSound) {
            playLaunchFruitSound();
          }
        }
      }
      
      targetsRef.current = [...targetsRef.current, ...newTargets];
    } 
    else if(targetType === 'target'){
      const newTarget = new StaticTarget(CANVAS_SIZE.width, CANVAS_SIZE.height);
      if(newTarget){
        targetsRef.current = [...targetsRef.current, newTarget];
      }
    }
  }, [targetType, playLaunchFruitSound, playLaunchBombSound, pendingGameOverRef]);

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
      
      // Check if there's a bomb on screen and play fuse sound (only if not paused)
      const hasBomb = targetsRef.current.some(target => target.fruitType?.name === 'bomb');
      const isPaused = isPausedRef?.current || false;
      const isResuming = isResumingRef?.current || false;
      
      if (hasBomb && !bombFuseSoundPlayedRef.current && playBombFuseSound && !isPaused && !isResuming) {
        playBombFuseSound();
        bombFuseSoundPlayedRef.current = true;
      } else if ((!hasBomb || isPaused || isResuming) && bombFuseSoundPlayedRef.current) {
        // Stop the bomb fuse sound when bomb leaves screen or game is paused
        if (stopBombFuseSound) {
          stopBombFuseSound();
        }
        bombFuseSoundPlayedRef.current = false;
      } else if (hasBomb && !isPaused && !isResuming && !bombFuseSoundPlayedRef.current && playBombFuseSound) {
        // Resume bomb fuse sound when unpausing if bomb is still on screen
        playBombFuseSound();
        bombFuseSoundPlayedRef.current = true;
      }
    }
    
    // Check left hand collision
    if(lPunchState && leftHandCanHit){
      const leftHand = { 
        x: CANVAS_SIZE.width - (landmarks[lIndex].x * CANVAS_SIZE.width), 
        y: landmarks[lIndex].y * CANVAS_SIZE.height 
      };
      
      let hitSomething = false;
      targetsRef.current = targetsRef.current.filter(target => {
        const hitByLeft = target.checkCollisionLeft(leftHand.x, leftHand.y);
        if(hitByLeft){
          hitSomething = true;
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
              // Reset combo on bomb hit
              consecutiveHitsRef.current = 0;
              comboCountRef.current = 0;
            } else {
              scoreRef.current += 1; 
              // Only increment combo for actual fruits (not bombs)
              consecutiveHitsRef.current++;
              if (consecutiveHitsRef.current >= 3) {
                comboCountRef.current = consecutiveHitsRef.current;
                const comboBonus = comboCountRef.current;
                scoreRef.current += comboBonus; // Add bonus score equal to combo number
                
                // Create combo popup in safe zone (avoid edges)
                const popupX = 200 + Math.random() * (CANVAS_SIZE.width - 400);
                const popupY = 150 + Math.random() * (CANVAS_SIZE.height - 400);
                comboPopupsRef.current.push({
                  combo: comboCountRef.current,
                  bonus: comboBonus,
                  x: popupX,
                  y: popupY,
                  opacity: 1,
                  createdAt: Date.now()
                });
                
                if (playComboSound) {
                  playComboSound(comboCountRef.current);
                }
              }
            }
            playFruitSound(target.fruitType.name);
          } else {
            scoreRef.current += 1; 
            playHitSound();
          }
          
          setLeftHandCanHit(false);
          return false;
        }
        return true;
      });
      
      // If punch didn't hit anything, reset combo
      if (!hitSomething && targetType === 'fruit') {
        if (consecutiveHitsRef.current > 0) {
        }
        consecutiveHitsRef.current = 0;
        comboCountRef.current = 0;
        setLeftHandCanHit(false);
      }
    }
    
    // Check right hand collision
    if(rPunchState && rightHandCanHit){
      const rightHand = { 
        x: CANVAS_SIZE.width - (landmarks[rIndex].x * CANVAS_SIZE.width), 
        y: landmarks[rIndex].y * CANVAS_SIZE.height 
      };
      
      let hitSomething = false;
      targetsRef.current = targetsRef.current.filter(target => {
        const hitByRight = target.checkCollisionRight(rightHand.x, rightHand.y);
        if(hitByRight){
          hitSomething = true;
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
              // Reset combo on bomb hit
              consecutiveHitsRef.current = 0;
              comboCountRef.current = 0;
            } else {
              scoreRef.current += 1; 
              // Only increment combo for actual fruits (not bombs)
              consecutiveHitsRef.current++;
              if (consecutiveHitsRef.current >= 3) {
                comboCountRef.current = consecutiveHitsRef.current;
                const comboBonus = comboCountRef.current;
                scoreRef.current += comboBonus; // Add bonus score equal to combo number
                
                // Create combo popup in safe zone (avoid edges)
                const popupX = 200 + Math.random() * (CANVAS_SIZE.width - 400);
                const popupY = 150 + Math.random() * (CANVAS_SIZE.height - 400);
                comboPopupsRef.current.push({
                  combo: comboCountRef.current,
                  bonus: comboBonus,
                  x: popupX,
                  y: popupY,
                  opacity: 1,
                  createdAt: Date.now()
                });
                
                if (playComboSound) {
                  playComboSound(comboCountRef.current);
                }
              }
            }
            playFruitSound(target.fruitType.name);
          } else {
            scoreRef.current += 1; 
            playHitSound();
          }
          
          setRightHandCanHit(false);
          return false;
        }
        return true;
      });
      
      // If punch didn't hit anything, reset combo
      if (!hitSomething && targetType === 'fruit') {
        if (consecutiveHitsRef.current > 0) {
        }
        consecutiveHitsRef.current = 0;
        comboCountRef.current = 0;
        setRightHandCanHit(false);
      }
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
            
            // Reset combo when fruit is dropped
            if (consecutiveHitsRef.current > 0) {
            }
            consecutiveHitsRef.current = 0;
            comboCountRef.current = 0;
            
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
          const paused = isPausedRef?.current || false;
          const resuming = isResumingRef?.current || false;
          if (!paused && !resuming) spawnTarget();
          if (pendingGameOverRef?.current) return; // Double check before spawning
          
          scheduleNext();
        }, delay);
      };

      // Initial spawn only if not paused/resuming
      // Add a 2-second delay before the first spawn
      const initialDelay = 2000;
      spawnIntervalRef.current = setTimeout(() => {
        if (cancelled) return;
        if (!(isPausedRef?.current || isResumingRef?.current)) {
          spawnTarget();
        }
        scheduleNext();
      }, initialDelay);

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
      if (!(isPausedRef?.current || isResumingRef?.current)) {
        spawnTarget();
      }

      spawnIntervalRef.current = setInterval(() => {
        const paused = isPausedRef?.current || false;
        const resuming = isResumingRef?.current || false;
        if (!paused && !resuming && targetsRef.current.length === 0) {
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
  }, [isActive, gameKey, targetType, pendingGameOverRef]);

  const clearSpawnInterval = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearTimeout(spawnIntervalRef.current);
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
  }, []);

  return{
    targetsRef,
    handleCollisions,
    spawnTarget, 
    handleMissedFruit, 
    scoreRef,
    comboPopupsRef,
    clearSpawnInterval,
  };
};
