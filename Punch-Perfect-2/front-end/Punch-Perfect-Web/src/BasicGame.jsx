import { useEffect, useRef } from 'react'
import { initBasicGame, stopBasicGame, setHandPosition, setLeftHandPosition, setPunching } from './game/basicGame.js'

function BasicGame({ rightHandPosition, leftHandPosition, isRightPunching, isLeftPunching }) {
  const containerRef = useRef(null)
  const gameInitialized = useRef(false)

  useEffect(() => {
    // Add a small delay to ensure container is rendered
    const timer = setTimeout(() => {
      // Initialize game once
      if (containerRef.current && !gameInitialized.current) {
        initBasicGame(containerRef.current)
        gameInitialized.current = true
        console.log('Basic game initialized')
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      stopBasicGame()
    }
  }, [])

  useEffect(() => {
    // Update right hand position when it changes
    if (gameInitialized.current && rightHandPosition) {
      setHandPosition(rightHandPosition.x, rightHandPosition.y)
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
      <h2>Basic Three.js Game</h2>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '800px', 
          border: '2px solid #00ff00',
          borderRadius: '8px',
          backgroundColor: '#000'
        }}
      ></div>
    </div>
  )
}

export default BasicGame
