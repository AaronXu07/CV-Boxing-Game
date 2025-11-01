import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import Menu from './components/Menu/Menu.jsx'
import App from './components/Game/App.jsx'
import About from './components/About/About.jsx'
import GameMenu from './components/GameMenu/GameMenu.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/gamemenu" element={<GameMenu />} />
        <Route path="/game" element={<App />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
