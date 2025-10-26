import { useEffect, useRef } from 'react'
import './App.css'
import { initPoseLandmarker } from './mediapipe/poseLandmarker'
import { DrawingUtils, PoseLandmarker} from '@mediapipe/tasks-vision' 
import { selectedLandmarks, selectedConnections } from './mediapipe/landmarks.js'
import { detectPunches } from './mediapipe/detectPunches.js'

function App({ onRightHandPositionUpdate, onLeftHandPositionUpdate, onRightPunchUpdate, onLeftPunchUpdate, onWebcamDimensionsUpdate }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseLandmarkRef = useRef(null)
  let rafId = useRef(null)

  useEffect(() => {
    let stream = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream

          console.log('webcam stream attached to video element', stream)
          console.log('video element readyState', videoRef.current.readyState)
          console.log('initial canvas size', canvasRef.current?.width, canvasRef.current?.height)

          // try to start playback (some browsers require an explicit play call)
          try {
            await videoRef.current.play()
            console.log('video.play() succeeded')
          } catch (playErr) {
            console.warn('video.play() failed or is deferred:', playErr)
          }

          poseLandmarkRef.current = await initPoseLandmarker()
          console.log('PoseLandmarker loaded')

          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          const drawingUtils = new DrawingUtils(ctx)

          // Ensure canvas pixel size matches the actual video frames
          const vw = videoRef.current.videoWidth || 1920
          const vh = videoRef.current.videoHeight || 1080
          if (canvas.width !== vw || canvas.height !== vh) {
            canvas.width = vw
            canvas.height = vh
            console.log('canvas resized to', vw, vh)
            // Send dimensions to parent
            if (onWebcamDimensionsUpdate) {
              onWebcamDimensionsUpdate({ width: vw, height: vh })
            }
          }

          // Draw a test background so we know the canvas is being updated
          ctx.fillStyle = 'black'
          ctx.fillRect(0, 0, canvas.width, canvas.height); 

          const targetFPS = 60;
          const frameTime = 1000 / targetFPS;
          let lastFrameTime = performance.now();
          let actualFPS = 0;
          let frameCount = 0;
          let fpsUpdateTime = performance.now();

          let LpunchCounter = 0;
          let LprevPunch;

          let RpunchCounter = 0;
          let RprevPunch;

          const processFrame = async () => {
            if (!videoRef.current || !poseLandmarkRef.current) return
            if (videoRef.current.readyState >= 2) {
              const startTimeMS = performance.now()
              
              // Calculate actual FPS
              frameCount++
              const timeSinceLastUpdate = startTimeMS - fpsUpdateTime
              if (timeSinceLastUpdate >= 1000) {
                actualFPS = Math.round((frameCount * 1000) / timeSinceLastUpdate)
                frameCount = 0
                fpsUpdateTime = startTimeMS
              }
              
              let results = null
              try {
                results = await poseLandmarkRef.current.detectForVideo(videoRef.current, startTimeMS)
              } catch (err) {
                console.error('Pose detection failed:', err)
              }

              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
              
              // Detect punches
              const punchData = detectPunches(results.landmarks[0]);

              // Send data to game
              if (results && results.landmarks && results.landmarks[0]) {
                // Right hand position (index landmark 20)
                const rightFist = results.landmarks[0][20];
                if (rightFist && onRightHandPositionUpdate) {
                  // Send raw normalized coordinates (0-1) for exact mapping
                  onRightHandPositionUpdate({ x: rightFist.x, y: rightFist.y });
                }

                // Left hand position (index landmark 19)
                const leftFist = results.landmarks[0][19];
                if (leftFist && onLeftHandPositionUpdate) {
                  // Send raw normalized coordinates (0-1) for exact mapping
                  onLeftHandPositionUpdate({ x: leftFist.x, y: leftFist.y });
                }

                // Send individual punch states
                if (onRightPunchUpdate) {
                  onRightPunchUpdate(punchData.rightArm);
                }
                if (onLeftPunchUpdate) {
                  onLeftPunchUpdate(punchData.leftArm);
                }
              }

              const connectorDrawingOptions = {
                color: '#0059ffff',
                lineWidth: 10,
              };
              const landmarkDrawingOptions = {
                fillColor: '#ff0000ff',
                radius: 15,
              };
              const punchLandmarkOptions = {
                fillColor: '#00ff00ff',
                radius: 45,
              };

              if (results && results.landmarks) {
                for (let i = 0; i < results.landmarks.length; i++) {
                  let cur_body = results.landmarks[i]; 
                  selectedLandmarks.forEach((lm) => {
                    // Check if this is a hand landmark (wrist or index finger) and a punch is detected
                    const isLeftHand = (lm === 19); // lWrist or lIndex
                    const isRightHand = (lm === 20); // rWrist or rIndex
                    
                    if ((isLeftHand && punchData.leftArm) || (isRightHand && punchData.rightArm)) {
                      drawingUtils.drawLandmarks([cur_body[lm]], punchLandmarkOptions);
                    } else {
                      drawingUtils.drawLandmarks([cur_body[lm]], landmarkDrawingOptions);
                    }
                  })

                  drawingUtils.drawConnectors(cur_body, selectedConnections, connectorDrawingOptions);
                }
              }

              // Draw text on top of video + landmarks
              ctx.save();

              // Move origin to the right edge of the canvas
              ctx.translate(canvas.width, 0);

              // Flip horizontally
              ctx.scale(-1, 1);

              // Display punch info
              let punchText = 'None';
              if (punchData.detected) {
                if (punchData.leftArm && punchData.rightArm) {
                  punchText = 'Both Arms!';
                } else if (punchData.leftArm) {
                  punchText = 'Left Arm';
                } else if (punchData.rightArm) {
                  punchText = 'Right Arm';
                }
              }

              if(LprevPunch && !punchData.leftArm){
                LpunchCounter++;
              }
              if(RprevPunch && !punchData.rightArm){
                RpunchCounter++;
              }
              LprevPunch = punchData.leftArm;
              RprevPunch = punchData.rightArm;

              // Draw text
              ctx.font = '50px Calibri';
              ctx.fillStyle = 'black';
              ctx.textAlign = 'left';
              ctx.fillText(`FPS: ${actualFPS}`, 30, 100); 
              ctx.fillText(`Punch: ${punchText}`, 30, 150); 
              ctx.fillText(`L Punches: ${LpunchCounter}`, 1600, 100); 
              ctx.fillText(`R Punches: ${RpunchCounter}`, 1600, 150); 
              ctx.restore();
            }
          }

          const render = async () => {
            const now = performance.now()
            const delta = now - lastFrameTime

            if (delta >= frameTime) {
              lastFrameTime = now - (delta % frameTime)
              await processFrame()
            }

            rafId.current = requestAnimationFrame(render)
          }

          // kick off the render loop
          render()
          
        }
      } catch (err) {
        console.error('Error accessing webcam:', err)
        alert('Could not access webcam. Please allow camera permissions.')
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="app-root">
      <h1>Punch Perfect — Webcam</h1>
      <video id="webcam" ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas id="output" ref={canvasRef} width={1920} height={1080} />
    </div>
  )
}

export default App