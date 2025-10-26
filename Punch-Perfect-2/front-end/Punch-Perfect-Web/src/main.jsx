import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BasicGame from './BasicGame.jsx'

function Main() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#0f1724'
    }}>
      <App />
      <BasicGame />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
