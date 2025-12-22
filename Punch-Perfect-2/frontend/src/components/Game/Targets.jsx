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
import { CANVAS_SIZE } from '../../utils/constants.js'
import {
  setupCanvas,
  drawMiniview,
  drawLandmarksInMiniview,
  drawFullSizeHandLandmarks,
  drawTargets,
  drawUITargetTest
} from '../../utils/drawingHelpers.js'
import { useGameContext } from '../../context/GameContext.jsx'
import { usePause } from '../../hooks/usePause.js'

//==================== COMPONENT ====================
function Targets(){
  const navigate = useNavigate();

  //===== State & Refs =====
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const { playPunchSound, playHitSound, playButtonSound, playCountdownSound, stopCountdownSound, toggleMute, isMuted } = useSound();
  // Pause handled by reusable hook
  const { isMiniviewEnabled, toggleMiniview, 
          gameKey, setGameKey} = useGameContext();
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const hasPlayedSuccessSoundRef = useRef(false);
  const lastFlashTimeRef = useRef(null);
  const {
    isPaused,
    isResuming,
    resumeCountdown,
    pause: pauseHook,
    resume: resumeHook,
    isPausedRef,
    lastFrameRef
  } = usePause({
    countdownSeconds: 3,
    enableCountdown: true,
    onToggle: () => playButtonSound(),
    onCountdownStart: () => playCountdownSound(),
    onCountdownStop: () => stopCountdownSound(),
    allowPause: () => !isGameOver
  });

  //===== Custom Hooks =====
  const {videoRef} = useWebcam(isCalibrated, gameKey);
  const {detectPose} = usePoseDetection(isCalibrated, gameKey);
  const {processPunches, resetTracking} = usePunchTracking(playPunchSound);
  const isResumingRef = useRef(false);
  useEffect(() => { isResumingRef.current = isResuming; }, [isResuming]);
  const initialCountdownStartedRef = useRef(false);
  const {targetsRef, handleCollisions, scoreRef} = useTargetManager('target', isCalibrated, gameKey, playHitSound, null, null, null, null, null, null, null, null, isPausedRef, null, isResumingRef);

  const pause = () => pauseHook(canvasRef, ctxRef);
  const resume = () => resumeHook(canvasRef, ctxRef);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') pause(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playButtonSound]);

  useEffect(() => {
    if (isCalibrated && !hasPlayedSuccessSoundRef.current) {
      hasPlayedSuccessSoundRef.current = true;
    }
    
    if (!isCalibrated) {
      hasPlayedSuccessSoundRef.current = false;
    }
  }, [isCalibrated]);

  //===== Timer Logic =====
  useEffect(() => {
    if (!isCalibrated || isGameOver) return;
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { setIsGameOver(true); return 0; }
        if (prev <= 6) lastFlashTimeRef.current = Date.now();
        // Do not decrement during pause or countdown
        if (!isPausedRef.current && !isResuming) return prev - 1;
        return prev;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isCalibrated, isGameOver, isPausedRef, isResuming]);

  //===== Navigation =====
  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/gamemenu'), 200);
  };

  //===== Frame Processing =====
  const processFrame = useCallback(async (fps, timestamp) => {
    if(!videoRef.current || !canvasRef.current || isGameOver) return;

    if (isPausedRef.current && !isResuming) {
      if (lastFrameRef.current) {
        const pausedCtx = canvasRef.current.getContext('2d');
        pausedCtx.putImageData(lastFrameRef.current, 0, 0);
      }
      return;
    }
    if (isResuming) {
      if (lastFrameRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.putImageData(lastFrameRef.current, 0, 0);
      }
      return;
    }

    const canvas = canvasRef.current;
    
    if(!ctxRef.current){
      ctxRef.current = setupCanvas(videoRef.current, canvas);
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
    }

    const ctx = ctxRef.current;
    const drawingUtils = drawingUtilsRef.current;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    isMiniviewEnabled && drawMiniview(ctx, videoRef.current);

    const landmarks = await detectPose(videoRef.current, timestamp);

    if(landmarks){
  
      const { punchData, punchStates, handStates, counters } = processPunches(landmarks);
      
      isMiniviewEnabled && drawLandmarksInMiniview(ctx, drawingUtils, landmarks, punchStates);

      ctx.save();
      drawFullSizeHandLandmarks(ctx, drawingUtils, landmarks, punchStates);

      handleCollisions(landmarks, punchStates, handStates);

      drawTargets(ctx, targetsRef.current, canvas.width);

      drawUITargetTest(ctx, scoreRef.current, timeRemaining, canvas);
      
      if (timeRemaining <= 5 && timeRemaining > 0 && lastFlashTimeRef.current) {
        const timeSinceFlash = Date.now() - lastFlashTimeRef.current;
        const flashDuration = 500; // Flash lasts 500ms
        
        if (timeSinceFlash < flashDuration) {
          const fadeProgress = timeSinceFlash / flashDuration;
          const opacity = 1 - fadeProgress;
          
          ctx.strokeStyle = `rgba(255, 0, 0, ${opacity})`;
          ctx.lineWidth = 20;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        }
      }
      
      ctx.restore();
    }
  }, [isGameOver, timeRemaining]);

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
  useGameLoop(isCalibrated && !isGameOver && !isResuming && !isPausedRef.current, gameKey, processFrame);

  // Reset countdown flag when going back to calibration
  useEffect(() => {
    if (!isCalibrated) {
      initialCountdownStartedRef.current = false;
    }
  }, [isCalibrated]);

  // Initial countdown before first target spawns after calibration
  useEffect(() => {
    if (isCalibrated && !isGameOver && !initialCountdownStartedRef.current) {
      initialCountdownStartedRef.current = true;
      pauseHook(canvasRef, ctxRef);
      resumeHook(canvasRef, ctxRef);
    }
  }, [isCalibrated, isGameOver, pauseHook, resumeHook]);

  if(!isCalibrated) {
    return (<CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} gameMode="Target Mode"/>)
  }

  if (isGameOver) {
    return (
      <Score 
        gamemode_id={48392017}
        score={scoreRef.current} 
        resetTracking={resetTracking}
        ctxRef={ctxRef}
        drawingUtilsRef={drawingUtilsRef}
        setGameKey={setGameKey} 
        setIsGameOver={setIsGameOver} 
        setIsCalibrated={setIsCalibrated}
        setTimeRemaining={setTimeRemaining}
      />
    );
  }
  
  //===== Render =====
  return (
    <>
      <div key={gameKey} className="app-root">
        <button className="menu-button" onClick={pause}>
          <img src="/icons/menu.png" width="25" height="25" alt="Menu" />
        </button>
        {(isPaused || isResuming) && (
          <div className="center-button-container">
              {isResuming ? (
              <>
                  <h1>GET READY</h1>
                  <h2>{initialCountdownStartedRef.current ? 'Starting In' : 'Resuming In'}</h2>
                <h1>{resumeCountdown}</h1>
                <div className="pause-buttons">
                  <button onClick={() => { playButtonSound(); pause(); }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h1>PAUSED</h1>
                <h2>Timed Targets</h2>
                <div className="pause-buttons">
                  <button onClick={() => { playButtonSound(); resume(); }}>Resume</button>
                  <button onClick={back}>Back to Menu</button>
                  <button
                    onClick={() => { playButtonSound(); toggleMiniview(); }}
                    style={isMiniviewEnabled ? { borderColor: 'green' } : { borderColor: '#e63946' }}
                  >
                    Toggle Camera
                  </button>
                  <button
                    onClick={() => { playButtonSound(); toggleMute(); }}
                    style={isMuted ? { borderColor: '#e63946' } : { borderColor: 'green' }}
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
          className={isPaused ? 'blurred' : ''}
          width={CANVAS_SIZE.width} 
          height={CANVAS_SIZE.height} 
        />
      </div>
      
    </>
  );
}

export default Targets
