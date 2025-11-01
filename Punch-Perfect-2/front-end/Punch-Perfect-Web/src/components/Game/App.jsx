import { useEffect, useRef, useState } from 'react'
import './App.css'
import { initPoseLandmarker } from '../../mediapipe/poseLandmarker'
import { DrawingUtils, PoseLandmarker} from '@mediapipe/tasks-vision' 
import { selectedLandmarks, selectedConnections, lIndex, rIndex } from '../../mediapipe/landmarks.js'
import { detectPunches } from '../../mediapipe/detectPunches.js'
import CamCalibration from './CamCalibration.jsx'
import { useNavigate } from 'react-router-dom';
import { Target } from './Target.js'

function App() {
  const navigate = useNavigate();
  const back = () => {
    navigate('/');
  };

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseLandmarkRef = useRef(null)
  let rafId = useRef(null)
  const [isCalibrated, setIsCalibrated] = useState(false);

  const targetsRef = useRef([]);

  // Helper function to spawn a new target
  const spawnTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newTarget = new Target(canvas.width, canvas.height);
    targetsRef.current = [...targetsRef.current, newTarget];
  };

  useEffect(() => {

    if(!isCalibrated) return;

    let stream = null
    let spawnInterval = null

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

          //console.log('webcam stream attached to video element', stream)
          //console.log('video element readyState', videoRef.current.readyState)
          //console.log('initial canvas size', canvasRef.current?.width, canvasRef.current?.height)

          // try to start playback (some browsers require an explicit play call)
          try {
            await videoRef.current.play()
            //console.log('video.play() succeeded')
          } catch (playErr) {
            console.warn('video.play() failed or is deferred:', playErr)
          }

          poseLandmarkRef.current = await initPoseLandmarker()
          //console.log('PoseLandmarker loaded')

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
            //console.log('canvas resized to', vw, vh)
          }

          // Draw a test background so we know the canvas is being updated
          ctx.fillStyle = 'black'
          ctx.fillRect(0, 0, canvas.width, canvas.height); 

          const targetFPS = 30;
          const frameTime = 1000 / targetFPS;
          let lastFrameTime = performance.now();
          let actualFPS = 0;
          let frameCount = 0;
          let fpsUpdateTime = performance.now();

          let lPunchCounter = 0; 
          let lPrevPunch; 

          let rPunchCounter = 0; 
          let rPrevPunch; 

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

              //ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
              ctx.fillStyle = "black";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(videoRef.current, 1920-640, 1080-360, 640, 360); 
              
              // Detect punches
              const punchData = detectPunches(results.landmarks[0]);

              const connectorDrawingOptions = {
                color: '#0059ffff',
                lineWidth: 10,
              };
              const landmarkDrawingOptions = {
                fillColor: '#ff0000ff',
                radius: 30,
              };
              const punchLandmarkOptions = {
                fillColor: '#00ff00ff',
                radius: 45,
              };
              const leftHandOptions = {
                fillColor: '#ffa200ff', 
                radius: 45,
              };
              const rightHandOptions = {
                fillColor: '#0000ffff', 
                radius: 45,
              };

              ctx.save(); 
              ctx.translate(1920-640, 1080-360); 
              ctx.scale(1/3, 1/3);
              
              let cur_body; 

              if (results && results.landmarks) {
                for (let i = 0; i < results.landmarks.length; i++) {
                  cur_body = results.landmarks[i]; 
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


              ctx.restore(); 
              // Draw text on top of video + landmarks
              ctx.save();
              
              if(cur_body) {

                //draw left and right hand landmark 
                if(punchData.leftArm) {
                  drawingUtils.drawLandmarks([cur_body[lIndex]], punchLandmarkOptions);
                } 
                else {
                  drawingUtils.drawLandmarks([cur_body[lIndex]], leftHandOptions);
                }

                if(punchData.rightArm) {
                  drawingUtils.drawLandmarks([cur_body[rIndex]], punchLandmarkOptions);
                } 
                else {
                  drawingUtils.drawLandmarks([cur_body[rIndex]], rightHandOptions);
                }

                if (punchData.leftArm) {
                  const leftHand = { x: 1920 - (cur_body[lIndex].x * 1920), y: cur_body[lIndex].y * 1080 };
                  
                  targetsRef.current = targetsRef.current.filter(target => {
                    const hitByLeft = target.checkCollisionLeft(leftHand.x, leftHand.y);
                    
                    if (hitByLeft) {
                      console.log('Left hand target hit!', { target, leftHand });
                      target.hit();
                      return false; // Remove target
                    }
                    return true; // Keep target
                  });
                }
                
                if (punchData.rightArm) {
                  const rightHand = { x: 1920 - (cur_body[rIndex].x * 1920), y: cur_body[rIndex].y * 1080 };
                  
                  targetsRef.current = targetsRef.current.filter(target => {
                    const hitByRight = target.checkCollisionRight(rightHand.x, rightHand.y);
                    
                    if (hitByRight) {
                      console.log('Right hand target hit!', { target, rightHand });
                      target.hit();
                      return false; // Remove target
                    }
                    return true; // Keep target
                  });
                }

              }
              
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);

              targetsRef.current.forEach(target => {
                target.draw(ctx);
              });

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

              if(punchData.leftArm && !lPrevPunch){
                lPunchCounter++;
              }
              if(punchData.rightArm && !rPrevPunch){
                rPunchCounter++;
              }
              lPrevPunch = punchData.leftArm;
              rPrevPunch = punchData.rightArm;

              // Draw text
              ctx.font = '50px Calibri';
              ctx.fillStyle = 'white';
              ctx.textAlign = 'left';
              ctx.fillText(`FPS: ${actualFPS}`, 30, 100); 
              ctx.fillText(`Punch: ${punchText}`, 30, 150); 
              ctx.fillText(`L Punches: ${lPunchCounter}`, 1600, 100); 
              ctx.fillText(`R Punches: ${rPunchCounter}`, 1600, 150); 
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

          render()
        
          spawnTarget();
          
          spawnInterval = setInterval(() => {
            if (targetsRef.current.length === 0) {
              spawnTarget();
            }
          }, 100); // Check every 100ms
          
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
      if (spawnInterval) clearInterval(spawnInterval)
    }
  }, [isCalibrated])

  return (
    <>
    {!isCalibrated ? (<CamCalibration isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated}/>) :
    (<div className="app-root">
      <h1>Punch Perfect — Range Mode</h1>

      <div className="outside-buttons">
        <button className="back-button" onClick={back}>◄ Back to Menu</button>
      </div>

      <video id="webcam" ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas id="output" ref={canvasRef} width={1920} height={1080} />
    </div>)}
    </>
  )
}

export default App