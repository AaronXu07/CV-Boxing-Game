import { useEffect, useRef, useState, useCallback } from 'react'
import './Range.css'
import { DrawingUtils } from '@mediapipe/tasks-vision' 
import CamCalibration from './CamCalibration.jsx'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound.js'
import { useWebcam } from '../../hooks/useWebcam.js'
import { usePoseDetection } from '../../hooks/usePoseDetection.js'
import { usePunchTracking } from '../../hooks/usePunchTracking.js'
import { useGameLoop } from '../../hooks/useGameLoop.js'
import { CANVAS_SIZE, MINIVIEW_POSITION, MINIVIEW_SIZE } from '../../utils/constants.js'
import {
  setupCanvas,
  drawMiniview,
  drawLandmarksInMiniview,
  drawFullSizeHandLandmarks,
  getPunchText
} from '../../utils/drawingHelpers.js'

//==================== GAME STATES ====================
const GAME_STATE = {
  WAITING: 'waiting',      
  READY: 'ready',          
  RESULT: 'result',        
  TOO_EARLY: 'too_early'  
};

//==================== COMPONENT ====================
function Reaction(){
  const navigate = useNavigate();

  //===== State & Refs =====
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [gameState, setGameState] = useState(GAME_STATE.WAITING);
  const [requiredHand, setRequiredHand] = useState(null); // 'left' or 'right'
  const [reactionTime, setReactionTime] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  
  const { playPunchSound, playButtonSound, playSuccessSound, playHitSound } = useSound();
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const waitTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const hasPunchedRef = useRef(false);
  const hasStartedRef = useRef(false);

  //===== Custom Hooks =====
  const {videoRef} = useWebcam(isCalibrated, gameKey);
  const {detectPose} = usePoseDetection(isCalibrated, gameKey);
  const {processPunches, resetTracking} = usePunchTracking(playPunchSound);

  //===== Game Logic =====
  const startWaitingPhase = useCallback(() => {
    setGameState(GAME_STATE.WAITING);
    hasPunchedRef.current = false;
    
    const delay = Math.random() * 5000 + 3000;
    
    waitTimerRef.current = setTimeout(() => {
      startReadyPhase();
    }, delay);
  }, []);

  const startReadyPhase = useCallback(() => {
    const hand = Math.random() < 0.5 ? 'left' : 'right';
    setRequiredHand(hand);
    setGameState(GAME_STATE.READY);
    startTimeRef.current = performance.now();
    hasPunchedRef.current = false;
  }, []);

  useEffect(() => {
    if(isCalibrated && !hasStartedRef.current){
      hasStartedRef.current = true;
      playSuccessSound();
      startWaitingPhase();
    }
  }, [isCalibrated, playSuccessSound, startWaitingPhase]);

  useEffect(() => {
    if(gameKey > 0){
      hasStartedRef.current = false;
    }
  }, [gameKey]);

  const handlePunchDetected = useCallback((punchStates, handStates) => {
    const { lPunchState, rPunchState } = punchStates;
    const { leftHandCanHit, rightHandCanHit, setLeftHandCanHit, setRightHandCanHit } = handStates;

    const validLeftPunch = lPunchState && leftHandCanHit;
    const validRightPunch = rPunchState && rightHandCanHit;

    if(!validLeftPunch && !validRightPunch) return;

    if(gameState === GAME_STATE.READY && validLeftPunch && validRightPunch){
      return; 
    }

    if(validLeftPunch){
      setLeftHandCanHit(false);
    }
    if(validRightPunch){
      setRightHandCanHit(false);
    }

    if(hasPunchedRef.current) return;

    if(gameState === GAME_STATE.WAITING){
      hasPunchedRef.current = true;
      if(waitTimerRef.current){
        clearTimeout(waitTimerRef.current);
      }
      setGameState(GAME_STATE.TOO_EARLY);
      
      setTimeout(() => {
        hasPunchedRef.current = false;
      }, 1000);
    } 
    else if(gameState === GAME_STATE.TOO_EARLY){
      // Punch anywhere to retry after punching too early
      if(!hasPunchedRef.current){
        hasPunchedRef.current = true;
        setTimeout(() => {
          hasPunchedRef.current = false;
          startWaitingPhase();
        }, 100);
      }
    }
    else if(gameState === GAME_STATE.READY){
      const punchedWithCorrectHand = 
        (requiredHand === 'left' && validLeftPunch) || 
        (requiredHand === 'right' && validRightPunch);

      if(punchedWithCorrectHand){
        hasPunchedRef.current = true;
        const endTime = performance.now();
        const reactionMs = Math.round(endTime - startTimeRef.current);
        setReactionTime(reactionMs);
        setGameState(GAME_STATE.RESULT);
        playHitSound();
        
        setTimeout(() => {
          hasPunchedRef.current = false;
        }, 1000);
      }
    }
    else if(gameState === GAME_STATE.RESULT){
      if(!hasPunchedRef.current){
        hasPunchedRef.current = true;
        setTimeout(() => {
          hasPunchedRef.current = false;
          startWaitingPhase();
        }, 100);
      }
    }
  }, [gameState, requiredHand, playHitSound, startWaitingPhase]);

  //===== Navigation =====
  const back = () => {
    playButtonSound();
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
    }
    setTimeout(() => navigate('/gamemenu'), 100);
  };

  //===== Drawing Functions =====
  const drawReactionOverlay = (ctx, fps) => {
    const canvas = canvasRef.current;
    if(!canvas) return;

    let text = '';
    let textColor = 'white';
    let fontSize = 80;
    let showSubtext = false;

    switch(gameState) {
      case GAME_STATE.WAITING:
        text = 'WAIT';
        break;
      case GAME_STATE.READY:
        text = requiredHand === 'left' ? 'LEFT!' : 'RIGHT!';
        break;
      case GAME_STATE.TOO_EARLY:
        text = 'TOO EARLY!';
        showSubtext = true;
        textColor = 'black';
        break;
      case GAME_STATE.RESULT:
        text = `${reactionTime}ms`;
        fontSize = 100;
        showSubtext = true;
        break;
    }

    if(text){
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 - (showSubtext ? 50 : 0));
      
      if(showSubtext){
        ctx.font = '40px Arial';
        ctx.fillText('Punch to retry', canvas.width / 2, canvas.height / 2 + 50);
      }
      
      ctx.restore();
    }

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.font = '30px Calibri';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`FPS: ${fps}`, 30, 100);
    ctx.restore();
  };

  const getBackgroundColor = () => {
    switch(gameState){
      case GAME_STATE.WAITING:
        return '#AA0000'; 
      case GAME_STATE.READY:
        return requiredHand === 'left' ? '#FF8C00' : '#8B4FBF'; 
      case GAME_STATE.TOO_EARLY:
        return '#FFD700';
      case GAME_STATE.RESULT:
        return '#4685c8ff';
      default:
        return 'black';
    }
  };

  //===== Frame Processing =====
  const processFrame = async (fps, timestamp) => {
    if(!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    if(!ctxRef.current){
      ctxRef.current = setupCanvas(videoRef.current, canvas);
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
    }

    const ctx = ctxRef.current;
    const drawingUtils = drawingUtilsRef.current;

    ctx.fillStyle = getBackgroundColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(
      videoRef.current, 
      MINIVIEW_POSITION.x, 
      MINIVIEW_POSITION.y, 
      MINIVIEW_SIZE.width, 
      MINIVIEW_SIZE.height
    );

    const landmarks = await detectPose(videoRef.current, timestamp);

    if(landmarks){
      const { punchData, punchStates, handStates, counters } = processPunches(landmarks);
  
      drawLandmarksInMiniview(ctx, drawingUtils, landmarks, punchStates);

      ctx.save();
      drawFullSizeHandLandmarks(ctx, drawingUtils, landmarks, punchStates);
      ctx.restore();

      handlePunchDetected(punchStates, handStates);
    }

    drawReactionOverlay(ctx, fps);
  };

  //===== Game Loop =====
  useGameLoop(isCalibrated, gameKey, processFrame);

  //===== Cleanup =====
  useEffect(() => {
    return () => {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
      }
    };
  }, []);

  if(!isCalibrated) {
    return (<CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated}/>)
  }
  
  //===== Render =====
  return (
    <>
      <div key={gameKey} className="app-root">
        <h1>Punch Perfect — Reaction Mode</h1>

        <div className="outside-buttons">
          <button className="back-button" onClick={back}>◄ Back to Menu</button>
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

export default Reaction
