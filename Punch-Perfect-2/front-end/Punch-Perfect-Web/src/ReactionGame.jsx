import { useEffect, useRef } from 'react'
import { initReactionGame, stopReactionGame, setPunchingReaction } from './game/reactionGame.js'

function ReactionGame({ isRightPunching, isLeftPunching, webcamDimensions }) {
  const containerRef = useRef(null)
  const gameInitialized = useRef(false)

  useEffect(() => {
    // Add a small delay to ensure container is rendered
    const timer = setTimeout(() => {
      // Initialize game once with responsive dimensions
      if (containerRef.current && !gameInitialized.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        initReactionGame(containerRef.current, containerWidth, containerHeight)
        gameInitialized.current = true
        console.log('Reaction game initialized with dimensions:', containerWidth, containerHeight)
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      stopReactionGame()
      gameInitialized.current = false
    }
  }, [])

  useEffect(() => {
    // Update punching state when it changes
    if (gameInitialized.current) {
      setPunchingReaction(isRightPunching, isLeftPunching)
    }
  }, [isRightPunching, isLeftPunching])

  return (
    <div className="reaction-game-section">
      <h2>Reaction Time Test</h2>
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

export default ReactionGame
