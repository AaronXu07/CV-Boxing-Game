import { useEffect, useRef } from 'react'
import './App.css'
import { initPoseLandmarker } from './mediapipe/poseLandmarker'
import { DrawingUtils, PoseLandmarker} from '@mediapipe/tasks-vision' 
import { selectedLandmarks, selectedConnections } from './mediapipe/landmarks.js'
import { detectPunches } from './mediapipe/detectPunches.js'

function App() {
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
          }

          // Draw a test background so we know the canvas is being updated
          ctx.fillStyle = 'black'
          ctx.fillRect(0, 0, canvas.width, canvas.height); 

          const processFrame = async () => {
            if (!videoRef.current || !poseLandmarkRef.current) return
            if (videoRef.current.readyState >= 2) {
              const startTimeMS = performance.now()
              let results = null
              try {
                results = await poseLandmarkRef.current.detectForVideo(videoRef.current, startTimeMS)
              } catch (err) {
                console.error('Pose detection failed:', err)
              }

              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

              if (results && results.landmarks) {
                for (let i = 0; i < results.landmarks.length; i++) {
                  let cur_body = results.landmarks[i]; 
                  selectedLandmarks.forEach((lm) => {
                    drawingUtils.drawLandmarks([cur_body[lm]], { color: 'red', fillColor: 'red', radius: 7})
                  })

                  drawingUtils.drawConnectors(cur_body, selectedConnections, { color: 'blue'})
                }
              }

              // Draw text on top of video + landmarks
              ctx.save();

              // Move origin to the right edge of the canvas
              ctx.translate(canvas.width, 0);

              // Flip horizontally
              ctx.scale(-1, 1);

              // Draw text
              ctx.font = '20px Calibri';
              ctx.fillStyle = 'black';
              ctx.textAlign = 'left';
              ctx.fillText(`FPS: ${(1000 / (performance.now() - startTimeMS)).toFixed(0)}`, 30, 100); 
              ctx.fillText(`Punches: ${detectPunches(results.landmarks[0])}`, 30, 130); 

              ctx.restore();
            }
          }

          const render = async () => {
            await processFrame()
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