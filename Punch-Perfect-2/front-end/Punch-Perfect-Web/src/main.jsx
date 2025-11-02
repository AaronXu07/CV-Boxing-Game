import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import Menu from './components/Menu/Menu.jsx'
import Range from './components/Game/Range.jsx'
import About from './components/About/About.jsx'
import GameMenu from './components/GameMenu/GameMenu.jsx'
import CamCalibration from './components/Game/CamCalibration.jsx'
import Leaderboard from './components/Leaderboard/Leaderboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/gamemenu" element={<GameMenu />} />
        <Route path="/game" element={<Range />} />
        <Route path="/about" element={<About />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
