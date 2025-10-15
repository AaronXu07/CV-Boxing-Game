import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    let stream = null

    let rafId = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
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

          // When the video starts playing, begin drawing frames into the canvas
          const onPlay = () => {
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')

            // Ensure canvas pixel size matches the actual video frames
            const vw = videoRef.current.videoWidth || 640
            const vh = videoRef.current.videoHeight || 480
            if (canvas.width !== vw || canvas.height !== vh) {
              canvas.width = vw
              canvas.height = vh
              console.log('canvas resized to', vw, vh)
            }

            // Draw a test background so we know the canvas is being updated
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const render = () => {
              if (!videoRef.current) return
              if (videoRef.current.readyState >= 2) {
                // draw the current video frame to the canvas
                try {
                  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
                } catch (err) {
                  // drawImage can throw if video not ready; log for debugging
                  console.warn('drawImage failed:', err)
                }
              } else {
                // not enough data yet — paint a subtle indicator
                ctx.fillStyle = '#111'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
              }
              rafId = requestAnimationFrame(render)
            }

            // kick off the render loop
            if (!rafId) render()
          }

          videoRef.current.addEventListener('play', onPlay, { once: true })
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
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="app-root">
      <h1>Punch Perfect — Webcam</h1>
      <video id="webcam" ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas id="output" ref={canvasRef} width={640} height={480} />
    </div>
  )
}

export default App
