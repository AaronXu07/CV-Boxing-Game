import { useEffect, useRef, useState } from 'react'
import './Range.css'
import { initPoseLandmarker } from '../../mediapipe/poseLandmarker'
import { DrawingUtils, PoseLandmarker} from '@mediapipe/tasks-vision' 
import { selectedLandmarks, selectedConnections, lIndex, rIndex } from '../../mediapipe/landmarks.js'
import { drawBox, checkBox } from '../../mediapipe/calibration.js'
import { useSound } from '../../hooks/useSound.js'
import { useGameContext } from '../../context/GameContext.jsx'
import { useNavigate } from 'react-router-dom'
import { toggleFullScreen } from '../../utils/functions.js'

function CamCalibration({isCalibrated, setIsCalibrated, gameMode}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseLandmarkRef = useRef(null)
  const containerRef = useRef(null); 
  let rafId = useRef(null); 

  const [ gameStarted, setGameStarted ] = useState(false); 

  const { isFullScreen, setIsFullScreen } = useGameContext(); 

  const navigate = useNavigate();
  const { playButtonSound, playSuccessSound } = useSound();
  
  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/gamemenu'), 100);
  };

  useEffect(() => {
    const handler = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    let stream = null
    let hasPlayedSuccessSound = false;

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

          const processFrame = async () => {
            if (!videoRef.current || !poseLandmarkRef.current) return
            if (!gameStarted) return
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
              let within = checkBox(ctx, results.landmarks[0]); 

              if(within && !hasPlayedSuccessSound) {
                hasPlayedSuccessSound = true;
                setTimeout(() => setIsCalibrated(true), 100);
              }
              

              const connectorDrawingOptions = {
                color: '#0059ffff',
                lineWidth: 10,
              };
              const landmarkDrawingOptions = {
                fillColor: '#ff0000ff',
                radius: 20,
              };
              
              let cur_body; 

              if (results && results.landmarks) {
                for (let i = 0; i < results.landmarks.length; i++) {
                  cur_body = results.landmarks[i]; 
                  selectedLandmarks.forEach((lm) => {
                    drawingUtils.drawLandmarks([cur_body[lm]], landmarkDrawingOptions);
                  })

                  drawingUtils.drawConnectors(cur_body, selectedConnections, connectorDrawingOptions);
                }
              }

              ctx.restore(); 
              // Draw text on top of video + landmarks
              ctx.save();

              // Move origin to the right edge of the canvas
              ctx.translate(canvas.width, 0);

              // Flip horizontally
              ctx.scale(-1, 1);

              // Draw text
              ctx.font = '50px Calibri';
              ctx.fillStyle = 'white';
              ctx.textAlign = 'left';
              ctx.fillText(`FPS: ${actualFPS}`, 30, 100); 
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
  }, [gameStarted])

  return (
    <div ref={containerRef} className="app-root">

       <div className="video-wrap">
          {gameStarted && (
            <div className="outside-buttons">
              <button onClick={back}> ← Back</button>
            </div>
          )}

          <video id="webcam" ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
          <canvas id="output" ref={canvasRef} width={1920} height={1080} />
      </div>

      {!gameStarted && 
        <div className="center-button-container">
            <h1>{gameMode}</h1>
            <button className="start-button" onClick={() => (setGameStarted(true))}>Start</button>
        </div>
      }
    </div>
  )
}

export default CamCalibration