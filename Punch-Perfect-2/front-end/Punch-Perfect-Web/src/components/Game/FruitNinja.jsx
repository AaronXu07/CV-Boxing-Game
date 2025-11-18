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
  drawUI,
  drawLivesUI,
  drawLossAnimation,
  getPunchText
} from '../../utils/drawingHelpers.js'

//==================== COMPONENT ====================
function FruitNinja(){
  const navigate = useNavigate();

  //===== State & Refs =====
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false); 
  const [gameKey, setGameKey] = useState(0); 
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
    playLoseLifeSound
  } = useSound();
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const livesRef = useRef(3);
  const lostLivesRef = useRef([]); // Track which lives have been lost
  const lossAnimationRef = useRef(null); // Current loss animation state
  const animationFrameRef = useRef(0); // Frame counter for animations
  const pendingGameOverRef = useRef(false); // Track if game over is pending animation completion 

  //===== Custom Hooks =====
  const {videoRef} = useWebcam(isCalibrated, gameKey);
  const {detectPose} = usePoseDetection(isCalibrated, gameKey);
  const {processPunches, resetTracking} = usePunchTracking(playPunchSound);
  const {targetsRef, handleCollisions, scoreRef, handleMissedFruit} = useTargetManager(
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
    pendingGameOverRef
  );

  //Play success sound when calibration is completed
  useEffect(() => {
    if (isCalibrated) {
      playSuccessSound();
    }
  }, [isCalibrated, playSuccessSound]);

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
        
        // Wait for dropped fruit animation to complete
        setTimeout(() => {
          playGameOverSound();
          setIsGameOver(true);
        }, 600); // 30 frame drop animation + buffer
      }
    }
  }, [playBombExplodeSound, playGameOverSound, playLoseLifeSound]);

  //===== Frame Processing =====
  const processFrame = useCallback(async (fps, timestamp) => {
    if(!videoRef.current || !canvasRef.current || isGameOver) {
      console.log('Skipping frame:', { 
        hasVideo: !!videoRef.current, 
        hasCanvas: !!canvasRef.current,
        isGameOver 
      });
      return;
    }

    const canvas = canvasRef.current;
    
    //Initialize canvas and drawing utils if needed
    if(!ctxRef.current){
      console.log('Initializing canvas and drawing utils...');
      ctxRef.current = setupCanvas(videoRef.current, canvas);
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
      console.log('Canvas initialized:', !!ctxRef.current);
      console.log('Drawing utils initialized:', !!drawingUtilsRef.current);
    }

    const ctx = ctxRef.current;
    const drawingUtils = drawingUtilsRef.current;

    // Clear canvas before drawing
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log('Canvas cleared');

    console.log('Drawing miniview...');
    drawMiniview(ctx, videoRef.current);

    //Detect pose
    console.log('Detecting pose...');
    const landmarks = await detectPose(videoRef.current, timestamp);
    console.log('Landmarks detected:', !!landmarks);

    //Process landmarks if detected
    if(landmarks){
      const { punchData, punchStates, handStates, counters } = processPunches(landmarks);
      drawLandmarksInMiniview(ctx, drawingUtils, landmarks, punchStates);

      ctx.save();
      drawFullSizeHandLandmarks(ctx, drawingUtils, landmarks, punchStates);
      handleCollisions(landmarks, punchStates, handStates, setIsGameOver);
      handleMissedFruit(livesRef, lostLivesRef); 
      drawTargets(ctx, targetsRef.current, canvas.width);

      // Don't check for game over here if animation is pending
      if (livesRef.current === 0 && !pendingGameOverRef.current) {
        // Trigger last life lost animation
        const lastLifeIndex = 2; // Third life (0-indexed)
        if (!lostLivesRef.current.includes(lastLifeIndex)) {
          lostLivesRef.current = [...lostLivesRef.current, lastLifeIndex];
          // Animation will be triggered by handleMissedFruit
        }
      }

      const punchText = getPunchText(punchData, punchStates);
      
      // Draw loss animation if active
      if (lossAnimationRef.current) {
        animationFrameRef.current++;
        const elapsed = animationFrameRef.current - lossAnimationRef.current.startFrame;
        
        if (elapsed >= lossAnimationRef.current.duration) {
          lossAnimationRef.current = null;
        } else {
          drawLossAnimation(ctx, lossAnimationRef.current, elapsed);
        }
      }
      
      drawLivesUI(ctx, fps, scoreRef.current, livesRef.current, lostLivesRef.current);
      
      ctx.restore();
      console.log('Frame completed with landmarks');
    } else {
      console.log('No landmarks detected');
    }
    console.log('Frame processing complete');
  }, []);

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
    return (<CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated}/>)
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
        <div key={gameKey} className="app-root">
          <h1>Punch Perfect — Fruit Ninja Mode</h1>

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

export default FruitNinja;
