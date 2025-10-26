import { useEffect, useRef } from 'react'
import { initPhaserGame, stopPhaserGame, setRightHandPosition, setLeftHandPosition, setPunching } from './game/phaserGame.js'

function BasicGame({ rightHandPosition, leftHandPosition, isRightPunching, isLeftPunching, webcamDimensions }) {
  const containerRef = useRef(null)
  const gameInitialized = useRef(false)

  useEffect(() => {
    // Add a small delay to ensure container is rendered
    const timer = setTimeout(() => {
      // Initialize game once with responsive dimensions
      if (containerRef.current && !gameInitialized.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        initPhaserGame(containerRef.current, containerWidth, containerHeight)
        gameInitialized.current = true
        console.log('Phaser game initialized with dimensions:', containerWidth, containerHeight)
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      stopPhaserGame()
    }
  }, [])

  useEffect(() => {
    // Update right hand position when it changes
    if (gameInitialized.current && rightHandPosition) {
      setRightHandPosition(rightHandPosition.x, rightHandPosition.y)
    }
  }, [rightHandPosition])

  useEffect(() => {
    // Update left hand position when it changes
    if (gameInitialized.current && leftHandPosition) {
      setLeftHandPosition(leftHandPosition.x, leftHandPosition.y)
    }
  }, [leftHandPosition])

  useEffect(() => {
    // Update punching state when it changes
    if (gameInitialized.current) {
      setPunching(isRightPunching, isLeftPunching)
    }
  }, [isRightPunching, isLeftPunching])

  return (
    <div className="basic-game-section">
      <h2>Phaser Boxing Game</h2>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%',
          maxWidth: '1920px',
          height: 'auto',
          aspectRatio: '16/9',
          border: '2px solid #00ff00',
          borderRadius: '8px',
          backgroundColor: '#1a1a2e',
          margin: '0 auto'
        }}
      ></div>
    </div>
  )
}

export default BasicGame
