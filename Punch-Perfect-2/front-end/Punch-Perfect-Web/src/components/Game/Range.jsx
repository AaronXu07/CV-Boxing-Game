import { useEffect, useRef, useState } from 'react'
import './Range.css'
import { DrawingUtils } from '@mediapipe/tasks-vision' 
import CamCalibration from './CamCalibration.jsx'
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
  getPunchText
} from '../../utils/drawingHelpers.js'

//==================== COMPONENT ====================
function Range(){
  const navigate = useNavigate();

  //===== State & Refs =====
  const [isCalibrated, setIsCalibrated] = useState(false);
  const { playPunchSound, playHitSound, playButtonSound, playSuccessSound } = useSound();
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingUtilsRef = useRef(null);

  //===== Custom Hooks =====
  const {videoRef} = useWebcam(isCalibrated);
  const {detectPose} = usePoseDetection(isCalibrated);
  const {processPunches} = usePunchTracking(playPunchSound);
  const {targetsRef, handleCollisions} = useTargetManager('target', isCalibrated, playHitSound, null);

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

  //===== Frame Processing =====
  const processFrame = async (fps, timestamp) => {
    if(!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    //Initialize canvas and drawing utils if needed
    if(!ctxRef.current){
      ctxRef.current = setupCanvas(videoRef.current, canvas);
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
    }

    const ctx = ctxRef.current;
    const drawingUtils = drawingUtilsRef.current;

    drawMiniview(ctx, videoRef.current);

    //Detect pose
    const landmarks = await detectPose(videoRef.current, timestamp);

    //Process landmarks if detected
    if(landmarks){
  
      const { punchData, punchStates, handStates, counters } = processPunches(landmarks);

      drawLandmarksInMiniview(ctx, drawingUtils, landmarks, punchStates);

      ctx.save();
      drawFullSizeHandLandmarks(ctx, drawingUtils, landmarks, punchStates);

      handleCollisions(landmarks, punchStates, handStates);

      drawTargets(ctx, targetsRef.current, canvas.width);

      const punchText = getPunchText(punchData, punchStates);
      drawUI(ctx, fps, punchText, counters.left, counters.right, punchData.leftZ, punchData.rightZ, punchData.leftArmForward);
      
      ctx.restore();
    }
  };

  //===== Game Loop =====
  useGameLoop(isCalibrated, processFrame);

  //===== Render =====
  return (
    <>
      {!isCalibrated ? (
        <CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated}/>
      ) : (
        <div className="app-root">
          <h1>Punch Perfect — Range Mode</h1>

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
            id="output" 
            ref={canvasRef} 
            width={CANVAS_SIZE.width} 
            height={CANVAS_SIZE.height} 
          />
        </div>
      )}
    </>
  );
}

export default Range
