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
export const drawUI = (ctx, fps, score, lives) => {
  ctx.font = '50px Calibri';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText(`FPS: ${fps}`, 30, 100);
  ctx.fillText(`Score: ${score}`, 1600, 100);
  ctx.fillText(`Lives: ${lives}`, 1600, 150);
  // ctx.fillText(`Punch: ${punchText}`, 30, 150);
  // ctx.fillText(`L Punches: ${lPunchCounter}`, 1600, 100);
  // ctx.fillText(`R Punches: ${rPunchCounter}`, 1600, 150);
  // ctx.fillText(`Left Index Z: ${lz}`, 30, 200);
  // ctx.fillText(`right Index Z: ${rz}`, 30, 250);
  // ctx.fillText(`leftArmExtended: ${leftArmExtended}`, 30, 300);
};

/**
 * Draw UI with visual life indicators (red X's)
 */
export const drawLivesUI = (ctx, fps, score, lives, lostLives) => {
  ctx.font = '50px Calibri';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText(`FPS: ${fps}`, 30, 100);
  ctx.fillText(`Score: ${score}`, 1600, 100);
  
  // Draw lives as red X's in top right
  const startX = 1600;
  const startY = 180;
  const spacing = 80;
  const xSize = 60;
  
  const lostLifePositions = [];
  
  for (let i = 0; i < 3; i++) {
    const x = startX + (i * spacing);
    const y = startY;
    
    if (lostLives.includes(i)) {
      lostLifePositions.push({ x, y, size: xSize });
      
      // Draw red X for lost life
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x - xSize/2, y - xSize/2);
      ctx.lineTo(x + xSize/2, y + xSize/2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x + xSize/2, y - xSize/2);
      ctx.lineTo(x - xSize/2, y + xSize/2);
      ctx.stroke();
    } else {
      // Draw heart outline for remaining life
      ctx.fillStyle = '#e63946';
      drawHeart(ctx, x, y, xSize);
    }
  }
  
  return lostLifePositions;
};

/**
 * Draw a heart shape
 */
const drawHeart = (ctx, x, y, size) => {
  const width = size;
  const height = size;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  const topCurveHeight = height * 0.3;
  ctx.moveTo(0, topCurveHeight);
  // Top left curve
  ctx.bezierCurveTo(
    0, 0,
    -width / 2, 0,
    -width / 2, topCurveHeight
  );
  // Bottom left curve
  ctx.bezierCurveTo(
    -width / 2, (height + topCurveHeight) / 2,
    0, (height + topCurveHeight) / 1.3,
    0, height
  );
  // Bottom right curve
  ctx.bezierCurveTo(
    0, (height + topCurveHeight) / 1.3,
    width / 2, (height + topCurveHeight) / 2,
    width / 2, topCurveHeight
  );
  // Top right curve
  ctx.bezierCurveTo(
    width / 2, 0,
    0, 0,
    0, topCurveHeight
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/**
 * Draw loss animation (dropped fruit or bomb explosion)
 */
export const drawLossAnimation = (ctx, animation, elapsedFrames) => {
  const progress = elapsedFrames / animation.duration;
  
  if (animation.type === 'dropped') {
    // Dropped fruit animation: fruit falls and shatters
    const { position, fruitType } = animation;
    const fallDistance = 200;
    const y = position.y + (fallDistance * progress);
    
    if (progress < 0.7) {
      // Falling phase
      ctx.save();
      ctx.globalAlpha = 1 - (progress / 0.7);
      ctx.translate(position.x, y);
      ctx.rotate(progress * Math.PI * 2);
      
      if (fruitType && fruitType.draw) {
        fruitType.draw(ctx, 80);
      }
      
      ctx.restore();
    } else {
      // Shatter phase
      const shatterProgress = (progress - 0.7) / 0.3;
      const numPieces = 8;
      
      ctx.save();
      ctx.globalAlpha = 1 - shatterProgress;
      
      for (let i = 0; i < numPieces; i++) {
        const angle = (Math.PI * 2 * i) / numPieces;
        const distance = shatterProgress * 150;
        const px = position.x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance + (shatterProgress * 100);
        
        ctx.fillStyle = fruitType?.color || '#ff6b6b';
        ctx.beginPath();
        ctx.arc(px, py, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  } else if (animation.type === 'bomb') {
    // Bomb explosion animation
    const { position } = animation;
    const maxRadius = 300;
    const radius = maxRadius * Math.pow(progress, 0.5);
    
    // Draw multiple expanding circles
    ctx.save();
    
    // Outer blast wave
    ctx.globalAlpha = 0.3 * (1 - progress);
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Middle blast wave
    ctx.globalAlpha = 0.5 * (1 - progress);
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner core
    ctx.globalAlpha = 0.8 * (1 - progress);
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Particles
    const numParticles = 12;
    ctx.globalAlpha = 1 - progress;
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const distance = radius * 1.2;
      const px = position.x + Math.cos(angle) * distance;
      const py = position.y + Math.sin(angle) * distance;
      
      ctx.fillStyle = i % 2 === 0 ? '#ff4444' : '#ff8800';
      ctx.beginPath();
      ctx.arc(px, py, 20 * (1 - progress), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Screen shake effect (optional visual feedback)
    if (progress < 0.3) {
      const shakeAmount = 20 * (1 - progress / 0.3);
      ctx.translate(
        (Math.random() - 0.5) * shakeAmount,
        (Math.random() - 0.5) * shakeAmount
      );
    }
    
    ctx.restore();
  }
};

/**
 * Draw X's moving to center and enlarging (for game over animation)
 */
export const drawGameOverXs = (ctx, elapsedFrames, lostLifePositions, canvasWidth, canvasHeight) => {
  const duration = 40; // frames for the animation
  const progress = Math.min(elapsedFrames / duration, 1);
  
  // Easing function for smooth animation
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easedProgress = easeOutCubic(progress);
  
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Calculate spacing between X's at center
  const finalSpacing = 120;
  const numXs = lostLifePositions.length;
  const totalWidth = (numXs - 1) * finalSpacing;
  
  ctx.save();
  
  lostLifePositions.forEach((pos, index) => {
    // Calculate target position (centered horizontally with spacing)
    const targetX = centerX - totalWidth / 2 + (index * finalSpacing);
    const targetY = centerY;
    
    // Interpolate position
    const currentX = pos.x + (targetX - pos.x) * easedProgress;
    const currentY = pos.y + (targetY - pos.y) * easedProgress;
    
    // Grow size from 60 to 150
    const startSize = pos.size;
    const endSize = 150;
    const currentSize = startSize + (endSize - startSize) * easedProgress;
    
    // Fade in effect
    ctx.globalAlpha = 0.3 + (0.7 * progress);
    
    // Draw the X
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 12 + (8 * easedProgress);
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(currentX - currentSize/2, currentY - currentSize/2);
    ctx.lineTo(currentX + currentSize/2, currentY + currentSize/2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(currentX + currentSize/2, currentY - currentSize/2);
    ctx.lineTo(currentX - currentSize/2, currentY + currentSize/2);
    ctx.stroke();
    
    // Add glow effect that increases with progress
    ctx.shadowColor = '#e63946';
    ctx.shadowBlur = 20 * easedProgress;
    ctx.stroke();
  });
  
  ctx.restore();
};

/**
 * Draw enlarged X animation that fills the screen (for game over)
 */
export const drawEnlargedCenterX = (ctx, elapsedFrames, canvasWidth, canvasHeight) => {
  const duration = 35; // frames for the animation
  const progress = Math.min(elapsedFrames / duration, 1);
  
  // Easing: fast growth then slow down
  const easeOutQuad = (t) => t * (2 - t);
  const easedProgress = easeOutQuad(progress);
  
  // Grow from small to filling most of the screen
  const startSize = 100;
  const endSize = Math.min(canvasWidth, canvasHeight) * 0.8;
  const currentSize = startSize + (endSize - startSize) * easedProgress;
  
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  ctx.save();
  
  // Fade in and then slightly out at the end
  if (progress < 0.8) {
    ctx.globalAlpha = Math.min(progress / 0.2, 1); // Fade in during first 20%
  } else {
    ctx.globalAlpha = 1 - ((progress - 0.8) / 0.2) * 0.3; // Slight fade at end
  }
  
  // Draw the X
  ctx.strokeStyle = '#e63946';
  ctx.lineWidth = 15 + (25 * easedProgress); // Line gets thicker
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(centerX - currentSize/2, centerY - currentSize/2);
  ctx.lineTo(centerX + currentSize/2, centerY + currentSize/2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX + currentSize/2, centerY - currentSize/2);
  ctx.lineTo(centerX - currentSize/2, centerY + currentSize/2);
  ctx.stroke();
  
  // Add glow effect that increases with progress
  ctx.shadowColor = '#e63946';
  ctx.shadowBlur = 40 * easedProgress;
  
  // Redraw with glow
  ctx.beginPath();
  ctx.moveTo(centerX - currentSize/2, centerY - currentSize/2);
  ctx.lineTo(centerX + currentSize/2, centerY + currentSize/2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX + currentSize/2, centerY - currentSize/2);
  ctx.lineTo(centerX - currentSize/2, centerY + currentSize/2);
  ctx.stroke();
  
  ctx.restore();
};

export const drawUIRange = (ctx, fps, punchText, lPunchCounter, rPunchCounter) => {
  ctx.font = '50px Calibri';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText(`FPS: ${fps}`, 30, 100);
  ctx.fillText(`Punch: ${punchText}`, 30, 150);
  ctx.fillText(`L Punches: ${lPunchCounter}`, 1600, 100);
  ctx.fillText(`R Punches: ${rPunchCounter}`, 1600, 150);
  // ctx.fillText(`Left Index Z: ${lz}`, 30, 200);
  // ctx.fillText(`right Index Z: ${rz}`, 30, 250);
  // ctx.fillText(`leftArmExtended: ${leftArmExtended}`, 30, 300);
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
