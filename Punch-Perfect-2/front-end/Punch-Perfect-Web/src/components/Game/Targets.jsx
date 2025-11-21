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
  drawUIRange,
  getPunchText
} from '../../utils/drawingHelpers.js'

//==================== COMPONENT ====================
function Targets(){
  const navigate = useNavigate();

  //===== State & Refs =====
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const { playPunchSound, playHitSound, playButtonSound, playSuccessSound } = useSound();
  const [ gameKey, setGameKey ] = useState(0); 
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const hasPlayedSuccessSoundRef = useRef(false);
  const lastFlashTimeRef = useRef(null);

  //===== Custom Hooks =====
  const {videoRef} = useWebcam(isCalibrated, gameKey);
  const {detectPose} = usePoseDetection(isCalibrated, gameKey);
  const {processPunches, resetTracking} = usePunchTracking(playPunchSound);
  const {targetsRef, handleCollisions, scoreRef} = useTargetManager('target', isCalibrated, gameKey, playHitSound, null);

  useEffect(() => {
    if (isCalibrated && !hasPlayedSuccessSoundRef.current) {
      playSuccessSound();
      hasPlayedSuccessSoundRef.current = true;
    }
    
    if (!isCalibrated) {
      hasPlayedSuccessSoundRef.current = false;
    }
  }, [isCalibrated, playSuccessSound]);

  //===== Timer Logic =====
  useEffect(() => {
    if (!isCalibrated || isGameOver) return;

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        if (prev <= 6) {
          lastFlashTimeRef.current = Date.now();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isCalibrated, isGameOver]);

  //===== Navigation =====
  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/gamemenu'), 100);
  };

  //===== Frame Processing =====
  const processFrame = useCallback(async (fps, timestamp) => {
    if(!videoRef.current || !canvasRef.current || isGameOver) return;

    const canvas = canvasRef.current;
    
    if(!ctxRef.current){
      ctxRef.current = setupCanvas(videoRef.current, canvas);
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
    }

    const ctx = ctxRef.current;
    const drawingUtils = drawingUtilsRef.current;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMiniview(ctx, videoRef.current);

    const landmarks = await detectPose(videoRef.current, timestamp);

    if(landmarks){
  
      const { punchData, punchStates, handStates, counters } = processPunches(landmarks);
      
      drawLandmarksInMiniview(ctx, drawingUtils, landmarks, punchStates);

      ctx.save();
      drawFullSizeHandLandmarks(ctx, drawingUtils, landmarks, punchStates);

      handleCollisions(landmarks, punchStates, handStates);

      drawTargets(ctx, targetsRef.current, canvas.width);

      const punchText = getPunchText(punchData, punchStates);
      
      ctx.font = '50px Calibri';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.fillText(`FPS: ${fps}`, 30, 100);
      ctx.fillText(`Score: ${scoreRef.current}`, 1600, 100);
      ctx.fillText(`Time: ${timeRemaining}s`, 1600, 150);
      
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

  //===== Game Loop =====
  useGameLoop(isCalibrated && !isGameOver, gameKey, processFrame);

  if(!isCalibrated) {
    return (<CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} gameMode="Target Mode"/>)
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
        setTimeRemaining={setTimeRemaining}
      />
    );
  }
  
  //===== Render =====
  return (
    <>
      <div key={gameKey} className="app-root">
        <h1>Timed Targets</h1>

        <div className="outside-buttons">
          <button className="back-button" onClick={back}> ← Back</button>
        </div> 

        <video 
          id="webcam" 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ display: 'none' }} 
        />
        <canvas 
          key={`canvas-${gameKey}`}
          id="output" 
          ref={canvasRef} 
          width={CANVAS_SIZE.width} 
          height={CANVAS_SIZE.height} 
        />
      </div>
      
    </>
  );
}

export default Targets
