import{ 
  CANVAS_SIZE, 
  MINIVIEW_SIZE, 
  MINIVIEW_POSITION, 
  VISIBILITY_THRESHOLD, 
  DRAWING_OPTIONS 
} from './constants.js';
import {selectedLandmarks, selectedConnections, lIndex, rIndex} from '../mediapipe/landmarks.js';

/**
 * Setup canvas with proper dimensions
 */
export const setupCanvas = (video, canvas) => {
  const vw = video.videoWidth || CANVAS_SIZE.width;
  const vh = video.videoHeight || CANVAS_SIZE.height;
  
  if(canvas.width !== vw || canvas.height !== vh){
    canvas.width = vw;
    canvas.height = vh;
  }

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  return ctx;
};

/**
 * Draw miniview of video feed
 */
export const drawMiniview = (ctx, video) => {
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

/**
 * Draw landmarks in the miniview
 */
export const drawLandmarksInMiniview = (ctx, drawingUtils, landmarks, punchStates) => {
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

    //if (!visible) return;

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

/**
 * Draw full-size hand landmarks
 */
export const drawFullSizeHandLandmarks = (ctx, drawingUtils, landmarks, punchStates) => {
  const {lPunchState, rPunchState} = punchStates;

  // Left hand
  const leftOptions = lPunchState ? DRAWING_OPTIONS.LpunchLandmark : DRAWING_OPTIONS.leftHand;
  drawingUtils.drawLandmarks([landmarks[lIndex]], leftOptions);

  // Right hand
  const rightOptions = rPunchState ? DRAWING_OPTIONS.RpunchLandmark : DRAWING_OPTIONS.rightHand;
  drawingUtils.drawLandmarks([landmarks[rIndex]], rightOptions);
};

/**
 * Draw targets on canvas (with mirroring)
 */
export const drawTargets = (ctx, targets, canvasWidth) => {
  ctx.translate(canvasWidth, 0);
  ctx.scale(-1, 1);
  targets.forEach(target => target.draw(ctx));
};

/**
 * Draw UI information (FPS, punch counters, etc.)
 */
export const drawUI = (ctx, fps, punchText, lPunchCounter, rPunchCounter, lz, rz, leftArmExtended) => {
  ctx.font = '50px Calibri';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText(`FPS: ${fps}`, 30, 100);
  ctx.fillText(`Punch: ${punchText}`, 30, 150);
  ctx.fillText(`L Punches: ${lPunchCounter}`, 1600, 100);
  ctx.fillText(`R Punches: ${rPunchCounter}`, 1600, 150);
  ctx.fillText(`Left Index Z: ${lz}`, 30, 200);
  ctx.fillText(`right Index Z: ${rz}`, 30, 250);
  ctx.fillText(`leftArmExtended: ${leftArmExtended}`, 30, 300);
};

/**
 * Get punch text for UI display
 */
export const getPunchText = (punchData, punchStates) => {
  const {lPunchState, rPunchState} = punchStates;

  if (!punchData.detected) return 'None';
  if (lPunchState && rPunchState) return 'Both Arms!';
  if (lPunchState) return 'Left Arm';
  if (rPunchState) return 'Right Arm';
  return 'None';
};
