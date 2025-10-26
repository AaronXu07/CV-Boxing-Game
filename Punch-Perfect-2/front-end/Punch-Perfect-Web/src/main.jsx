import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BasicGame from './BasicGame.jsx'

function Main() {
  const [rightHandPosition, setRightHandPosition] = useState(null)
  const [leftHandPosition, setLeftHandPosition] = useState(null)
  const [isRightPunching, setIsRightPunching] = useState(false)
  const [isLeftPunching, setIsLeftPunching] = useState(false)

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#0f1724'
    }}>
      <App 
        onRightHandPositionUpdate={setRightHandPosition}
        onLeftHandPositionUpdate={setLeftHandPosition}
        onRightPunchUpdate={setIsRightPunching}
        onLeftPunchUpdate={setIsLeftPunching}
      />
      <BasicGame 
        rightHandPosition={rightHandPosition}
        leftHandPosition={leftHandPosition}
        isRightPunching={isRightPunching}
        isLeftPunching={isLeftPunching}
      />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
