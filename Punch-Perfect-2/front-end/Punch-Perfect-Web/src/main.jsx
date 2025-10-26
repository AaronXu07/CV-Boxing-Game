import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BasicGame from './BasicGame.jsx'
import ReactionGame from './ReactionGame.jsx'

function Main() {
  const [rightHandPosition, setRightHandPosition] = useState(null)
  const [leftHandPosition, setLeftHandPosition] = useState(null)
  const [isRightPunching, setIsRightPunching] = useState(false)
  const [isLeftPunching, setIsLeftPunching] = useState(false)
  const [webcamDimensions, setWebcamDimensions] = useState({ width: 1920, height: 1080 })
  const [gameMode, setGameMode] = useState(null) // null, 'boxing', or 'reaction'

  // Menu component
  const GameMenu = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '30px',
      backgroundColor: '#0f1724'
    }}>
      <h1 style={{ color: '#00ff00', fontSize: '48px', marginBottom: '20px' }}>
        Punch Perfect
      </h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={() => setGameMode('boxing')}
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🥊 Boxing Game
        </button>
        <button
          onClick={() => setGameMode('reaction')}
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            backgroundColor: '#0066ff',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ⚡ Reaction Test
        </button>
      </div>
    </div>
  )

  // Show menu if no game mode selected
  if (!gameMode) {
    return <GameMenu />
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#0f1724'
    }}>
      {/* Back to Menu Button */}
      <button
        onClick={() => setGameMode(null)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#666666',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 1000
        }}
      >
        ← Back to Menu
      </button>

      <App 
        onRightHandPositionUpdate={setRightHandPosition}
        onLeftHandPositionUpdate={setLeftHandPosition}
        onRightPunchUpdate={setIsRightPunching}
        onLeftPunchUpdate={setIsLeftPunching}
        onWebcamDimensionsUpdate={setWebcamDimensions}
      />
      
      {gameMode === 'boxing' && (
        <BasicGame 
          rightHandPosition={rightHandPosition}
          leftHandPosition={leftHandPosition}
          isRightPunching={isRightPunching}
          isLeftPunching={isLeftPunching}
          webcamDimensions={webcamDimensions}
        />
      )}

      {gameMode === 'reaction' && (
        <ReactionGame 
          isRightPunching={isRightPunching}
          isLeftPunching={isLeftPunching}
          webcamDimensions={webcamDimensions}
        />
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
