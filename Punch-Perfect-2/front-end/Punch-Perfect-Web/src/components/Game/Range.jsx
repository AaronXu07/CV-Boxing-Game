import { useEffect, useRef, useState } from 'react'
import './Range.css'
import { initPoseLandmarker } from '../../mediapipe/poseLandmarker'
import { DrawingUtils } from '@mediapipe/tasks-vision' 
import { selectedLandmarks, selectedConnections, lIndex, rIndex } from '../../mediapipe/landmarks.js'
import { detectPunches } from '../../mediapipe/detectPunches.js'
import CamCalibration from './CamCalibration.jsx'
import { useNavigate } from 'react-router-dom'
import { Target } from './Target.js'

//==================== SOUNDS =======================
import punchSound from '../../assets/sounds/punch.mp3'
import targetBreakSound from '../../assets/sounds/target-break.mp3'
//==================== CONSTANTS ====================
const VIDEO_CONFIG = {
  width: { ideal: 1920 },
  height: { ideal: 1080 }
};

const CANVAS_SIZE = {
  width: 1920,
  height: 1080
};

const MINIVIEW_SIZE = {
  width: 640,
  height: 360
};

const MINIVIEW_POSITION = {
  x: CANVAS_SIZE.width - MINIVIEW_SIZE.width,
  y: CANVAS_SIZE.height - MINIVIEW_SIZE.height
};

const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS;
const SMOOTH_FACTOR = 0.38; // 0 = no smoothing, 1 = very stable but laggy
const VISIBILITY_THRESHOLD = 0.3;
const TARGET_SPAWN_INTERVAL = 100; // Check every 100ms

const DRAWING_OPTIONS = {
  connector: {
    color: '#0059ffff',
    lineWidth: 10,
  },
  landmark: {
    fillColor: '#ff0000ff',
    radius: 30,
  },
  LpunchLandmark: {
    fillColor: '#ffa200ff',
    color: '#00ff00ff',  
    lineWidth: 6,
    radius: 50,
  },
  RpunchLandmark: {
    fillColor: '#ae00ffff',
    color: '#00ff00ff',    
    lineWidth: 6,
    radius: 50,
  },
  leftHand: {
    fillColor: '#ffa200aa',
    radius: 30,
  },
  rightHand: {
    fillColor: '#ae00ffaa',
    radius: 30,
  }
};

// ==================== COMPONENT ====================
function Range() {
  const navigate = useNavigate();

  // ===== State & Refs =====
  const [isCalibrated, setIsCalibrated] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkRef = useRef(null);
  const rafId = useRef(null);
  const targetsRef = useRef([]);

  // ===== Sound Refs =====
  const punchAudioRef = useRef(null);
  const targetBreakAudioRef = useRef(null);

  // ===== Initialize Sounds =====
  useEffect(() => {
    // Create audio elements
    punchAudioRef.current = new Audio(punchSound);
    targetBreakAudioRef.current = new Audio(targetBreakSound);
    
    // Configure audio (optional)
    punchAudioRef.current.volume = 0.5; // 50% volume
    targetBreakAudioRef.current.volume = 0.5; // 75% volume

    // Preload sounds
    punchAudioRef.current.load();
    targetBreakAudioRef.current.load();
  }, []);

  // ===== Sound Playing Functions =====
  const playPunchSound = () => {
    if (punchAudioRef.current) {
      const sound = punchAudioRef.current.cloneNode();
      sound.playBackRate = 1.2; //1.2x speed
      sound.play().catch(err => console.warn('Punch sound failed:', err));
    }
  };

  const playTargetBreakSound = () => {
    if (targetBreakAudioRef.current) {
      const sound = targetBreakAudioRef.current.cloneNode();
      sound.playBackRate = 1.2; //1.2x speed
      sound.play().catch(err => console.warn('Target Break sound failed:', err));
    }
  };

  // ===== Navigation =====
  const back = () => {
    navigate('/');
  };

  // ===== Target Management =====
  const spawnTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newTarget = new Target(canvas.width, canvas.height);
    targetsRef.current = [...targetsRef.current, newTarget];
  };

  // ===== Canvas Setup =====
  const setupCanvas = (video, canvas) => {
    const vw = video.videoWidth || CANVAS_SIZE.width;
    const vh = video.videoHeight || CANVAS_SIZE.height;
    
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return ctx;
  };

  // ===== Landmark Smoothing =====
  const smoothLandmarks = (prevLandmarks, newLandmarks) => {
    if (!prevLandmarks) {
      return newLandmarks;
    }

    return newLandmarks.map((newLm, i) => ({
      x: SMOOTH_FACTOR * prevLandmarks[i].x + (1 - SMOOTH_FACTOR) * newLm.x,
      y: SMOOTH_FACTOR * prevLandmarks[i].y + (1 - SMOOTH_FACTOR) * newLm.y,
      z: SMOOTH_FACTOR * prevLandmarks[i].z + (1 - SMOOTH_FACTOR) * newLm.z,
      visibility: SMOOTH_FACTOR * prevLandmarks[i].visibility + (1 - SMOOTH_FACTOR) * newLm.visibility
    }));
  };

  // ===== Drawing Functions =====
  const drawMiniview = (ctx, video) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
    ctx.drawImage(
      video, 
      MINIVIEW_POSITION.x, 
      MINIVIEW_POSITION.y, 
      MINIVIEW_SIZE.width, 
      MINIVIEW_SIZE.height
    );
  };

  const drawLandmarksInMiniview = (ctx, drawingUtils, landmarks, punchStates) => {
    ctx.save();
    ctx.translate(MINIVIEW_POSITION.x, MINIVIEW_POSITION.y);
    ctx.scale(1/3, 1/3);

    const { lPunchState, rPunchState } = punchStates;

    selectedLandmarks.forEach((lm) => {
      const isLeftHand = lm === 19;
      const isRightHand = lm === 20;
      const landmark = landmarks[lm];
      const visible = landmark.visibility !== undefined 
        ? landmark.visibility > VISIBILITY_THRESHOLD 
        : true;

      if (!visible) return;

      let options = DRAWING_OPTIONS.landmark;
      if(lPunchState && isLeftHand){
        options = DRAWING_OPTIONS.LpunchLandmark;
      }
      if(rPunchState && isRightHand){
        options = DRAWING_OPTIONS.RpunchLandmark;
      }

      drawingUtils.drawLandmarks([landmark], options);
    });

    drawingUtils.drawConnectors(landmarks, selectedConnections, DRAWING_OPTIONS.connector);
    ctx.restore();
  };

  const drawFullSizeHandLandmarks = (ctx, drawingUtils, landmarks, punchStates) => {
    const { lPunchState, rPunchState } = punchStates;

    // Left hand
    const leftOptions = lPunchState ? DRAWING_OPTIONS.LpunchLandmark : DRAWING_OPTIONS.leftHand;
    drawingUtils.drawLandmarks([landmarks[lIndex]], leftOptions);

    // Right hand
    const rightOptions = rPunchState ? DRAWING_OPTIONS.RpunchLandmark : DRAWING_OPTIONS.rightHand;
    drawingUtils.drawLandmarks([landmarks[rIndex]], rightOptions);
  };

  const drawTargets = (ctx, canvasWidth) => {
    ctx.translate(canvasWidth, 0);
    ctx.scale(-1, 1);
    targetsRef.current.forEach(target => target.draw(ctx));
  };

  const drawUI = (ctx, fps, punchText, lPunchCounter, rPunchCounter) => {
    ctx.font = '50px Calibri';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`FPS: ${fps}`, 30, 100);
    ctx.fillText(`Punch: ${punchText}`, 30, 150);
    ctx.fillText(`L Punches: ${lPunchCounter}`, 1600, 100);
    ctx.fillText(`R Punches: ${rPunchCounter}`, 1600, 150);
  };

  // ===== Collision Detection =====
  const handleCollisions = (landmarks, punchStates) => {
    const { lPunchState, rPunchState } = punchStates;

    if (lPunchState) {
      const leftHand = { 
        x: CANVAS_SIZE.width - (landmarks[lIndex].x * CANVAS_SIZE.width), 
        y: landmarks[lIndex].y * CANVAS_SIZE.height 
      };
      
      targetsRef.current = targetsRef.current.filter(target => {
        const hitByLeft = target.checkCollisionLeft(leftHand.x, leftHand.y);
        if (hitByLeft) {
          console.log('Left hand target hit!', { target, leftHand });
          target.hit();
          playTargetBreakSound();
          return false;
        }
        return true;
      });
    }
    
    if (rPunchState) {
      const rightHand = { 
        x: CANVAS_SIZE.width - (landmarks[rIndex].x * CANVAS_SIZE.width), 
        y: landmarks[rIndex].y * CANVAS_SIZE.height 
      };
      
      targetsRef.current = targetsRef.current.filter(target => {
        const hitByRight = target.checkCollisionRight(rightHand.x, rightHand.y);
        if (hitByRight) {
          console.log('Right hand target hit!', { target, rightHand });
          target.hit();
          playTargetBreakSound();
          return false;
        }
        return true;
      });
    }
  };

  // ===== Punch Text =====
  const getPunchText = (punchData, punchStates) => {
    const { lPunchState, rPunchState } = punchStates;

    if (!punchData.detected) return 'None';
    if (lPunchState && rPunchState) return 'Both Arms!';
    if (lPunchState) return 'Left Arm';
    if (rPunchState) return 'Right Arm';
    return 'None';
  };

  // ===== Main Effect =====
  useEffect(() => {
    if (!isCalibrated) return;

    let stream = null;
    let spawnInterval = null;

    async function startCamera() {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONFIG });
        
        if (!videoRef.current) return;
        
        videoRef.current.srcObject = stream;

        // Start video playback
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('video.play() failed or is deferred:', playErr);
        }

        // Initialize pose landmarker
        poseLandmarkRef.current = await initPoseLandmarker();

        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = setupCanvas(videoRef.current, canvas);
        const drawingUtils = new DrawingUtils(ctx);

        // ===== Frame Processing Variables =====
        let lastFrameTime = performance.now();
        let actualFPS = 0;
        let frameCount = 0;
        let fpsUpdateTime = performance.now();

        // Punch tracking
        let lPunchCounter = 0;
        let rPunchCounter = 0;
        let lPrevPunch = false;
        let rPrevPunch = false;
        let lPrevPunchState = false;
        let rPrevPunchState = false;

        // Landmark smoothing
        let smoothedLandmarks = null;

        // ===== Frame Processing Function =====
        const processFrame = async () => {
          if (!videoRef.current || !poseLandmarkRef.current) return;
          if (videoRef.current.readyState < 2) return;

          const startTimeMS = performance.now();
          
          // Calculate FPS
          frameCount++;
          const timeSinceLastUpdate = startTimeMS - fpsUpdateTime;
          if (timeSinceLastUpdate >= 1000) {
            actualFPS = Math.round((frameCount * 1000) / timeSinceLastUpdate);
            frameCount = 0;
            fpsUpdateTime = startTimeMS;
          }
          
          // Detect pose
          let results = null;
          try {
            results = await poseLandmarkRef.current.detectForVideo(videoRef.current, startTimeMS);
          } catch (err) {
            console.error('Pose detection failed:', err);
            return;
          }

          // Draw miniview
          drawMiniview(ctx, videoRef.current);

          // Process landmarks if detected
          if (results && results.landmarks[0]) {
            smoothedLandmarks = smoothLandmarks(smoothedLandmarks, results.landmarks[0]);
            
            // Detect punches
            const punchData = detectPunches(results.landmarks[0]);
            
            // Determine punch states
            const lPunchState = punchData.leftArm && lPrevPunch;
            const rPunchState = punchData.rightArm && rPrevPunch;
            const punchStates = { lPunchState, rPunchState };

            // Draw landmarks and connections in miniview
            drawLandmarksInMiniview(ctx, drawingUtils, smoothedLandmarks, punchStates);

            // Draw full-size hand landmarks
            ctx.save();
            drawFullSizeHandLandmarks(ctx, drawingUtils, smoothedLandmarks, punchStates);

            // Handle target collisions
            handleCollisions(smoothedLandmarks, punchStates);

            // Draw targets (mirrored)
            drawTargets(ctx, canvas.width);

            // Update punch counters
            if (lPunchState && !lPrevPunchState) {
              lPunchCounter++;
              playPunchSound();
            }
            if (rPunchState && !rPrevPunchState) {
              rPunchCounter++;
              playPunchSound();
            }

            // Update previous states
            lPrevPunchState = lPunchState;
            rPrevPunchState = rPunchState;
            lPrevPunch = punchData.leftArm;
            rPrevPunch = punchData.rightArm;

            // Draw UI
            const punchText = getPunchText(punchData, punchStates);
            drawUI(ctx, actualFPS, punchText, lPunchCounter, rPunchCounter);
            
            ctx.restore();
          }
        };

        // ===== Render Loop =====
        const render = async () => {
          const now = performance.now();
          const delta = now - lastFrameTime;

          if (delta >= FRAME_TIME) {
            lastFrameTime = now - (delta % FRAME_TIME);
            await processFrame();
          }

          rafId.current = requestAnimationFrame(render);
        };

        render();

        // Start spawning targets
        spawnTarget();
        spawnInterval = setInterval(() => {
          if (targetsRef.current.length === 0) {
            spawnTarget();
          }
        }, TARGET_SPAWN_INTERVAL);

      } catch (err) {
        console.error('Error accessing webcam:', err);
        alert('Could not access webcam. Please allow camera permissions.');
      }
    }

    startCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (spawnInterval) {
        clearInterval(spawnInterval);
      }
    };
  }, [isCalibrated]);

  // ===== Render =====
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
