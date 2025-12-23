import { useEffect, useRef, useState } from 'react'
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
import { usePause } from '../../hooks/usePause.js'
import { useGameLoop } from '../../hooks/useGameLoop.js'
import { CANVAS_SIZE } from '../../utils/constants.js'
import {
  setupCanvas,
  drawMiniview,
  drawLandmarksInMiniview,
  drawFullSizeHandLandmarks,
  drawTargets,
  drawUIRange,
  getPunchText
} from '../../utils/drawingHelpers.js'
import { useGameContext } from '../../context/GameContext'
import { toggleFullScreen } from '../../utils/functions.js'
import { checkShould } from '../../mediapipe/calibration.js'

//==================== COMPONENT ====================
function Range(){
  const navigate = useNavigate();

  //===== State & Refs =====

  const { isMiniviewEnabled, toggleMiniview, 
          isFullScreen, setIsFullScreen,  
          gameKey} = useGameContext();
  const [ isCalibrated, setIsCalibrated ] = useState(false); 
  const [ gameStarted, setGameStarted ] = useState(false); 
  const [ outOfBounds, setOutOfBounds ] = useState(false); 
  // Pause handled by usePause hook now
  const { playPunchSound, playHitSound, playButtonSound, playCountdownSound, stopCountdownSound, toggleMute, isMuted } = useSound();
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const containerRef = useRef(null); 
  // Replace local pause state with reusable hook
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
    onToggle: (paused) => playButtonSound(),
    onCountdownStart: () => playCountdownSound(),
    onCountdownStop: () => stopCountdownSound(),
    allowPause: () => true
  });

  //===== Custom Hooks =====
  const {videoRef} = useWebcam(isCalibrated);
  const {detectPose} = usePoseDetection(isCalibrated);
  const {processPunches} = usePunchTracking(playPunchSound);
  const {targetsRef, handleCollisions} = useTargetManager('target', isCalibrated, gameKey, playHitSound, null);
  const initialCountdownStartedRef = useRef(false);

  const pause = () => pauseHook(canvasRef, ctxRef);
  const resume = () => resumeHook(canvasRef, ctxRef);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') pause();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playButtonSound]);

  //Calibration completed
  useEffect(() => {
    if (isCalibrated) {
      // Success sound now plays in CamCalibration component
    }
  }, [isCalibrated]);

  useEffect(() => {
    const handler = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  //===== Navigation =====
  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/gamemenu'), 200);
  };

  //===== Frame Processing =====
  const processFrame = async (fps, timestamp) => {
    if (!videoRef.current || !canvasRef.current) return;

    // Fully paused (not counting down): show frozen frame
    if (isPausedRef.current && !isResuming) {
      if (lastFrameRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.putImageData(lastFrameRef.current, 0, 0);
      }
      return;
    }
    // During countdown we intentionally do NOT advance game; keep frame static
    if (isResuming) {
      if (lastFrameRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.putImageData(lastFrameRef.current, 0, 0);
      }
      return;
    }
    const canvas = canvasRef.current;
    
    //Initialize canvas and drawing utils if needed
    if(!ctxRef.current){
      ctxRef.current = setupCanvas(videoRef.current, canvas);
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
    }

    const ctx = ctxRef.current;
    const drawingUtils = drawingUtilsRef.current;

    if(isMiniviewEnabled) {
      drawMiniview(ctx, videoRef.current);
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
    }
    
    //Detect pose
    const landmarks = await detectPose(videoRef.current, timestamp);

    if(!checkShould(landmarks)) {
        pause(); 
        ctxRef.current = null; 
        drawingUtilsRef.current = null; 
        setOutOfBounds(true); 
      }

    //Process landmarks if detected
    if(landmarks){
  
      const { punchData, punchStates, handStates, counters } = processPunches(landmarks);
      
      
      isMiniviewEnabled && drawLandmarksInMiniview(ctx, drawingUtils, landmarks, punchStates);

      ctx.save();
      drawFullSizeHandLandmarks(ctx, drawingUtils, landmarks, punchStates);

      handleCollisions(landmarks, punchStates, handStates);

      drawTargets(ctx, targetsRef.current, canvas.width);

      const punchText = getPunchText(punchData, punchStates);
      drawUIRange(ctx, fps, punchText, counters.left, counters.right);
      
      ctx.restore();
    }

    // Do not capture frame each render; only on pause
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
  useGameLoop(isCalibrated && !isResuming && !isPausedRef.current, gameKey, processFrame);

  // Reset countdown flag when going back to calibration
  useEffect(() => {
    if (!isCalibrated) {
      initialCountdownStartedRef.current = false;
    }
  }, [isCalibrated]);

  // Initial countdown at calibration completion before practice begins
  useEffect(() => {
    if (isCalibrated && !initialCountdownStartedRef.current) {
      initialCountdownStartedRef.current = true;
      pauseHook(canvasRef, ctxRef);
      resumeHook(canvasRef, ctxRef);
    }
  }, [isCalibrated, pauseHook, resumeHook]);

  if(!isCalibrated) {
    return (<CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} gameMode="The Range" gameStarted={gameStarted} setGameStarted={setGameStarted}/>)
  }
  
  //===== Render =====
  return (
    <>
      <div ref={containerRef} className="app-root">
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
                <h2>The Range</h2>
                {outOfBounds && <h2 className="out-of-bounds-message"> Out of bounds! Face the camera at roughly 1 m away and press Resume. </h2>}
                <div className="pause-buttons">
                  <button onClick={() => { setOutOfBounds(false); playButtonSound(); resume(); }}>Resume</button>
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

export default Range