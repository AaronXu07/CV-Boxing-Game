import { useEffect, useRef, useState, useCallback } from 'react'
import './Range.css'
import { DrawingUtils } from '@mediapipe/tasks-vision' 
import CamCalibration from './CamCalibration.jsx'
import Score from './Score.jsx'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound.js'
import { useWebcam } from '../../hooks/useWebcam.js'
import { usePoseDetection } from '../../hooks/usePoseDetection.js'
import { usePunchTracking } from '../../hooks/usePunchTracking.js'
import { useTargetManager } from '../../hooks/useTargetManager.js'
import { useGameLoop } from '../../hooks/useGameLoop.js'
import { useGameContext } from '../../context/GameContext.jsx'
import { CANVAS_SIZE } from '../../utils/constants.js'
import {
  setupCanvas,
  drawMiniview,
  drawLandmarksInMiniview,
  drawFullSizeHandLandmarks,
  drawTargets,
  drawUI,
  drawLivesUI,
  drawLossAnimation,
  getPunchText,
  drawComboPopups
} from '../../utils/drawingHelpers.js'

//==================== COMPONENT ====================
function FruitNinja(){
  const navigate = useNavigate();


  //===== State & Refs =====
  const { isMiniviewEnabled, toggleMiniview, 
            isFullScreen, setIsFullScreen,  
            gameKey, setGameKey} = useGameContext();
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false); 
  const { 
    playPunchSound, 
    playButtonSound, 
    playSuccessSound, 
    playFruitSound,
    playBombFuseSound,
    stopBombFuseSound,
    playGameOverSound,
    playLaunchBombSound,
    playLaunchFruitSound,
    playBombExplodeSound,
    playLoseLifeSound,
    playComboSound
  } = useSound();
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null); 
  const ctxRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const livesRef = useRef(3);
  const lostLivesRef = useRef([]); // Track which lives have been lost
  const lossAnimationRef = useRef(null); // Current loss animation state
  const animationFrameRef = useRef(0); // Frame counter for animations
  const pendingGameOverRef = useRef(false); // Track if game over is pending animation completion 
  const isPausedRef = useRef(false); 
  const lastFrameRef = useRef(null); 
  const poseInFlightRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastTsRef = useRef(0);
  const DEBUG_THROTTLE = 60; // log every 60 frames
  const debugLog = (...msg) => {
    if (frameCountRef.current % DEBUG_THROTTLE === 0) {
      console.log('[FruitNinja]', ...msg);
    }
  };

  const [isPaused, setIsPaused] = useState(false); 


  //===== Custom Hooks =====
  const {videoRef} = useWebcam(isCalibrated, gameKey);
  const {detectPose} = usePoseDetection(isCalibrated, gameKey);
  const {processPunches, resetTracking} = usePunchTracking(playPunchSound);
  const {targetsRef, handleCollisions, scoreRef, handleMissedFruit, comboPopupsRef, clearSpawnInterval} = useTargetManager(
    'fruit', 
    isCalibrated, 
    gameKey, 
    null, 
    playFruitSound,
    (fruitType, position) => triggerLossAnimation('dropped', fruitType, position),
    (position) => triggerLossAnimation('bomb', null, position),
    playLaunchFruitSound,
    playLaunchBombSound,
    playBombFuseSound,
    stopBombFuseSound,
    pendingGameOverRef,
    isPausedRef,
    playComboSound
  );

  

  const resume = () => {
    playButtonSound(); 
    isPausedRef.current = false; 
    setIsPaused(false);
    
    // Check if there's a bomb on screen and resume fuse sound
    const hasBomb = targetsRef.current.some(target => target.fruitType?.name === 'bomb');
    if (hasBomb) {
      playBombFuseSound();
    }
  }

  const pause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    playButtonSound();

    // Stop bomb fuse sound when pausing
    if (isPausedRef.current) {
      stopBombFuseSound();
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        pause(); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playButtonSound, stopBombFuseSound]);

  //Calibration completed
  useEffect(() => {
    if (isCalibrated) {
      // Success sound now plays in CamCalibration component
    }
  }, [isCalibrated]);

  //===== Navigation =====
  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/gamemenu'), 100);
  };

  //===== Loss Animation =====
  const triggerLossAnimation = useCallback((type, fruitType, position) => {
    const duration = type === 'bomb' ? 60 : 30; // frames
    
    lossAnimationRef.current = {
      type, // 'dropped' or 'bomb'
      fruitType,
      position,
      startFrame: animationFrameRef.current,
      duration
    };

    // Play appropriate sound
    if (type === 'bomb') {
      playBombExplodeSound();
      pendingGameOverRef.current = true;
      targetsRef.current = [];
      isPausedRef.current = false; 
      setIsPaused(false);
      clearSpawnInterval(); // Stop spawning immediately 
      
      // Bomb explosion is 60 frames (~1000ms at 60fps)
      // Play game over sound near the end
      setTimeout(() => {
        playGameOverSound();
      }, 800);
      
      // Set actual game over after animation completes
      setTimeout(() => {
        setIsGameOver(true);
      }, 1100); // 60 frames + small buffer
    } else if (type === 'dropped') {

      playLoseLifeSound();
      
      if (livesRef.current === 0) {
        pendingGameOverRef.current = true;
        targetsRef.current = [];
        isPausedRef.current = false; 
        setIsPaused(false);
        clearSpawnInterval(); // Stop spawning immediately 
        
        // Wait for dropped fruit animation to complete
        setTimeout(() => {
          playGameOverSound();
          setIsGameOver(true);
        }, 600); // 30 frame drop animation + buffer
      }
    }
  }, [playBombExplodeSound, playGameOverSound, playLoseLifeSound]);

  //===== Frame Processing =====
  const processFrame = async (fps, timestamp) => {
    if (!videoRef.current || !canvasRef.current || isGameOver) return;

    frameCountRef.current++;
    const delta = timestamp - lastTsRef.current;
    lastTsRef.current = timestamp;
    if (delta > 120) debugLog('Long frame delta', delta);

    // If paused, redraw stored frame only
    if (isPausedRef.current) {
      if (lastFrameRef.current) {
        const pausedCtx = canvasRef.current.getContext('2d');
        pausedCtx.putImageData(lastFrameRef.current, 0, 0);
      }
      return;
    }

    // Ensure video is producing frames
    if (videoRef.current.readyState < 2) {
      debugLog('Video not ready', videoRef.current.readyState);
      return;
    }

    const canvas = canvasRef.current;
    // Initialize or reinitialize if canvas node changed
    if (!ctxRef.current || ctxRef.current.canvas !== canvas) {
      ctxRef.current = setupCanvas(videoRef.current, canvas);
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
      debugLog('Context (re)initialized');
    }

    const ctx = ctxRef.current;
    const drawingUtils = drawingUtilsRef.current;

    // Clear background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isMiniviewEnabled) {
      drawMiniview(ctx, videoRef.current);
    }

    let landmarks = await detectPose(videoRef.current, timestamp);

    if (landmarks) {
      const { punchData, punchStates, handStates } = processPunches(landmarks);
      if (isMiniviewEnabled) {
        drawLandmarksInMiniview(ctx, drawingUtils, landmarks, punchStates);
      }
      ctx.save();
      drawFullSizeHandLandmarks(ctx, drawingUtils, landmarks, punchStates);
      handleCollisions(landmarks, punchStates, handStates, setIsGameOver);
      handleMissedFruit(livesRef, lostLivesRef);
      drawTargets(ctx, targetsRef.current, canvas.width);

      // Loss animation update
      if (lossAnimationRef.current) {
        animationFrameRef.current++;
        const elapsed = animationFrameRef.current - lossAnimationRef.current.startFrame;
        if (elapsed >= lossAnimationRef.current.duration) {
          lossAnimationRef.current = null;
        } else {
          drawLossAnimation(ctx, lossAnimationRef.current, elapsed);
        }
      }

      // Draw combo popups
      drawComboPopups(ctx, comboPopupsRef);

      const lostLifePositions = drawLivesUI(ctx, fps, scoreRef.current, livesRef.current, lostLivesRef.current, canvas);
      ctx.restore();
    } else {
      debugLog('No landmarks');
    }
  }; 

  // Capture a static frame ONLY when entering pause (avoid per-frame getImageData cost)
  useEffect(() => {
    if (isPaused && ctxRef.current && canvasRef.current) {
      try {
        lastFrameRef.current = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      } catch (e) {
        debugLog('Pause capture failed', e.message);
      }
    }
  }, [isPaused]);

  //===== Game Loop =====
  useEffect(() => {
    console.log('Game status:', {
      isCalibrated,
      isGameOver,
      gameKey,
      hasVideo: !!videoRef.current,
      hasCanvas: !!canvasRef.current
    });
  }, [isCalibrated, isGameOver, gameKey]);

  // Move game loop after all hooks and state declarations
  // Keep the loop running during animations (pendingGameOver doesn't stop it anymore)
  useGameLoop(isCalibrated && !isGameOver, gameKey, processFrame);

  // Reset state when showing game over screen
  useEffect(() => {
    if (isGameOver) {
      livesRef.current = 3;
      lostLivesRef.current = [];
      lossAnimationRef.current = null;
      pendingGameOverRef.current = false;
      animationFrameRef.current = 0;
      // Stop bomb fuse sound if it's playing
      stopBombFuseSound();
    }
  }, [isGameOver, stopBombFuseSound]);

  if (!isCalibrated) {
    return (<CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} gameMode="Fruit Ninja"/>)
  }

  if (isGameOver) {
    return (
      <Score 
        score={scoreRef.current} 
        resetTracking={resetTracking}
        ctxRef={ctxRef}
        drawingUtilsRef={drawingUtilsRef}
        setGameKey={setGameKey} 
        setIsGameOver={setIsGameOver} 
        setIsCalibrated={setIsCalibrated}
      />
    );
  }
  //===== Render =====
  return (
    <>
        <div ref={containerRef} className="app-root">
          <button className="menu-button" onClick={pause}>
            <img src="/icons/menu.png" width="25" height="25" alt="Menu" />
          </button>
          {isPaused && 
          <div className="center-button-container">
              <h1>PAUSED</h1>
              <h2>Fruit Ninja</h2>
              <div className="pause-buttons">
                <button onClick={() => { playButtonSound(); resume(); }}>Resume</button>
                <button onClick={back}>Back to Menu</button>
                <button
                  onClick={() => { playButtonSound(); toggleMiniview(); }}
                  style={isMiniviewEnabled ? { borderColor: "green" } : { borderColor: "#e63946" }}
                >
                  Toggle Camera
                </button>
              </div>
          </div>}

          <video 
            id="webcam" 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ display: 'none' }} 
          />
          <canvas 
            id="output" 
            ref={canvasRef} 
            className = {isPaused ? 'blurred' : ''}
            width={CANVAS_SIZE.width} 
            height={CANVAS_SIZE.height} 
          />
        </div>
    </>
  );
}

export default FruitNinja;
