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
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  
  // FPS label and value
  ctx.font = '50px Rajdhani, sans-serif';
  ctx.fillText('FPS: ', 30, 100);
  ctx.font = '50px Orbitron, monospace';
  const fpsLabelWidth = ctx.measureText('FPS: ').width;
  ctx.fillText(`${fps}`, 30 + fpsLabelWidth, 100);
  
  // Score label and value
  ctx.font = '50px Rajdhani, sans-serif';
  ctx.fillText('Score: ', 1600, 100);
  ctx.font = '50px Orbitron, monospace';
  const scoreLabelWidth = ctx.measureText('Score: ').width;
  ctx.fillText(`${score}`, 1600 + scoreLabelWidth, 100);
  
  // Lives label and value
  ctx.font = '50px Rajdhani, sans-serif';
  ctx.fillText('Lives: ', 1600, 150);
  ctx.font = '50px Orbitron, monospace';
  const livesLabelWidth = ctx.measureText('Lives: ').width;
  ctx.fillText(`${lives}`, 1600 + livesLabelWidth, 150);
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
export const drawLivesUI = (ctx, fps, score, lives, lostLives, canvas) => {
  ctx.fillStyle = 'white';
  
  // Score - centered at top with label
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 4;
  
  ctx.font = 'bold 60px Rajdhani, sans-serif';
  const scoreLabel = 'SCORE: ';
  const scoreLabelWidth = ctx.measureText(scoreLabel).width;
  
  ctx.font = 'bold 80px Orbitron, monospace';
  const scoreValue = `${score}`;
  const scoreValueWidth = ctx.measureText(scoreValue).width;
  const scoreTotalWidth = scoreLabelWidth + scoreValueWidth;
  
  // Draw score label
  ctx.font = 'bold 60px Rajdhani, sans-serif';
  ctx.strokeText(scoreLabel, canvas.width/2 - scoreTotalWidth/2 + scoreLabelWidth/2, 90);
  ctx.fillText(scoreLabel, canvas.width/2 - scoreTotalWidth/2 + scoreLabelWidth/2, 90);
  
  // Draw score value
  ctx.font = 'bold 80px Orbitron, monospace';
  ctx.strokeText(scoreValue, canvas.width/2 - scoreTotalWidth/2 + scoreLabelWidth + scoreValueWidth/2, 90);
  ctx.fillText(scoreValue, canvas.width/2 - scoreTotalWidth/2 + scoreLabelWidth + scoreValueWidth/2, 90);
  
  // Draw lives centered at top below score with better spacing and visuals
  const heartSize = 70;
  const spacing = 100;
  const totalWidth = (3 - 1) * spacing;
  const startX = (canvas.width / 2) - (totalWidth / 2);
  const startY = 160;
  
  const lostLifePositions = [];
  
  for (let i = 0; i < 3; i++) {
    const x = startX + (i * spacing);
    const y = startY;
    
    if (lostLives.includes(i)) {
      lostLifePositions.push({ x, y, size: heartSize });
      
      // Draw stylized X for lost life
      ctx.save();
      ctx.translate(x, y);
      const xSize = heartSize * 0.4; // Reduced from 0.6 to 0.4
      
      // Shadow/Glow for the X
      ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
      ctx.shadowBlur = 15;
      
      ctx.strokeStyle = '#ff3333'; // Bright red
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      
      // Draw X
      ctx.beginPath();
      ctx.moveTo(-xSize, -xSize);
      ctx.lineTo(xSize, xSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(xSize, -xSize);
      ctx.lineTo(-xSize, xSize);
      ctx.stroke();
      
      ctx.restore();
    } else {
      // Draw heart with glow effect for remaining life
      ctx.save();
      
      // Glow effect
      ctx.shadowColor = '#ff4d5a';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ff4d5a';
      drawHeart(ctx, x, y, heartSize);
      
      // Inner highlight (glossy look)
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      // Small oval highlight on top left
      ctx.ellipse(x - heartSize * 0.2, y - heartSize * 0.2, heartSize * 0.1, heartSize * 0.05, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  return lostLifePositions;
};

/**
 * Draw a heart shape centered at (x, y)
 */
const drawHeart = (ctx, x, y, size) => {
  ctx.save();
  ctx.translate(x, y);
  
  // Scale to fit size (assuming base path fits in ~100x100 box)
  const scale = size / 100;
  ctx.scale(scale * 1.2, scale * 0.9); // Wider (1.2x) and slightly shorter (0.9x)
  
  ctx.beginPath();
  // Improved heart shape centered at 0,0
  // Starting from top center dip
  ctx.moveTo(0, -20);
  
  // Right lobe
  // cp1, cp2, end
  ctx.bezierCurveTo(30, -55, 70, -15, 0, 55);
  
  // Left lobe
  ctx.bezierCurveTo(-70, -15, -30, -55, 0, -20);
  
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
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  
  // FPS label and value
  ctx.font = '50px Rajdhani, sans-serif';
  ctx.fillText('FPS: ', 30, 100);
  ctx.font = '50px Orbitron, monospace';
  const fpsLabelWidth = ctx.measureText('FPS: ').width;
  ctx.fillText(`${fps}`, 30 + fpsLabelWidth - 10, 100);
  
  // Punch text (just Rajdhani since it's text like "Left Arm")
  ctx.font = '50px Rajdhani, sans-serif';
  ctx.fillText(`Punch: ${punchText}`, 30, 180);
  
  // L Punches label and value (right side)
  ctx.textAlign = 'right';
  ctx.font = '50px Orbitron, monospace';
  ctx.fillText(`${lPunchCounter}`, 1890, 100);
  ctx.font = '50px Rajdhani, sans-serif';
  const lPunchValueWidth = ctx.measureText(`${lPunchCounter}`).width;
  ctx.fillText('L Punches: ', 1890 - lPunchValueWidth - 20, 100);
  
  // R Punches label and value (right side)
  ctx.font = '50px Orbitron, monospace';
  ctx.fillText(`${rPunchCounter}`, 1890, 180);
  ctx.font = '50px Rajdhani, sans-serif';
  const rPunchValueWidth = ctx.measureText(`${rPunchCounter}`).width;
  ctx.fillText('R Punches: ', 1890 - rPunchValueWidth - 20, 180);
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

/**
 * Update and draw combo popups
 * Popups fade out over 2 seconds and float upward
 */
export const drawComboPopups = (ctx, comboPopupsRef) => {
  const now = Date.now();
  const POPUP_DURATION = 2000; // 2 seconds
  
  // Update and filter popups
  comboPopupsRef.current = comboPopupsRef.current.filter(popup => {
    const elapsed = now - popup.createdAt;
    
    if (elapsed > POPUP_DURATION) {
      return false; // Remove old popups
    }
    
    // Update opacity and position
    popup.opacity = 1 - (elapsed / POPUP_DURATION);
    popup.y -= 1; // Float upward
    
    // Draw the popup
    ctx.save();
    ctx.globalAlpha = popup.opacity;
    
    ctx.fillStyle = '#ff4d5a';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.textAlign = 'center';
    
    // Draw "COMBO" label in Rajdhani
    ctx.font = 'bold 56px Rajdhani, sans-serif';
    const comboLabel = 'COMBO ';
    const comboLabelWidth = ctx.measureText(comboLabel).width;
    
    // Draw combo number in Orbitron
    ctx.font = 'bold 72px Orbitron, monospace';
    const comboNumber = `${popup.combo}`;
    const comboNumberWidth = ctx.measureText(comboNumber).width;
    const totalWidth = comboLabelWidth + comboNumberWidth;
    
    // Draw label
    ctx.font = 'bold 56px Rajdhani, sans-serif';
    ctx.strokeText(comboLabel, popup.x - totalWidth/2 + comboLabelWidth/2, popup.y);
    ctx.fillText(comboLabel, popup.x - totalWidth/2 + comboLabelWidth/2, popup.y);
    
    // Draw number
    ctx.font = 'bold 72px Orbitron, monospace';
    ctx.strokeText(comboNumber, popup.x - totalWidth/2 + comboLabelWidth + comboNumberWidth/2, popup.y);
    ctx.fillText(comboNumber, popup.x - totalWidth/2 + comboLabelWidth + comboNumberWidth/2, popup.y);
    
    // Draw "+X" bonus text below (all numbers, use Orbitron)
    ctx.font = 'bold 56px Orbitron, monospace';
    ctx.fillStyle = '#ffff00';
    const bonusText = `+${popup.bonus}`;
    ctx.strokeText(bonusText, popup.x, popup.y + 65);
    ctx.fillText(bonusText, popup.x, popup.y + 65);
    
    ctx.restore();
    
    return true; // Keep this popup
  });
};

/**
 * Draw UI for target test mode (centered score and timer)
 */
export const drawUITargetTest = (ctx, score, timeRemaining, canvas) => {
  ctx.save();
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 4;
  
  // Timer - top left
  ctx.textAlign = 'left';
  ctx.font = '50px Rajdhani, sans-serif';
  ctx.strokeText('TIME: ', 30, 80);
  ctx.fillText('TIME: ', 30, 80);
  
  ctx.font = '50px Orbitron, monospace';
  const timerLabelWidth = ctx.measureText('TIME: ').width;
  ctx.strokeText(`${timeRemaining}s`, 30 + timerLabelWidth, 80);
  ctx.fillText(`${timeRemaining}s`, 30 + timerLabelWidth, 80);
  
  // Score - centered at top with label
  ctx.textAlign = 'center';
  
  ctx.font = 'bold 60px Rajdhani, sans-serif';
  const scoreLabel = 'SCORE: ';
  const scoreLabelWidth = ctx.measureText(scoreLabel).width;
  
  ctx.font = 'bold 70px Orbitron, monospace';
  const scoreValue = `${score}`;
  const scoreValueWidth = ctx.measureText(scoreValue).width;
  const totalWidth = scoreLabelWidth + scoreValueWidth;
  
  // Draw score label
  ctx.font = 'bold 60px Rajdhani, sans-serif';
  ctx.strokeText(scoreLabel, canvas.width/2 - totalWidth/2 + scoreLabelWidth/2, 90);
  ctx.fillText(scoreLabel, canvas.width/2 - totalWidth/2 + scoreLabelWidth/2, 90);
  
  // Draw score value
  ctx.font = 'bold 70px Orbitron, monospace';
  ctx.strokeText(scoreValue, canvas.width/2 - totalWidth/2 + scoreLabelWidth + scoreValueWidth/2, 90);
  ctx.fillText(scoreValue, canvas.width/2 - totalWidth/2 + scoreLabelWidth + scoreValueWidth/2, 90);
  
  ctx.restore();
};
