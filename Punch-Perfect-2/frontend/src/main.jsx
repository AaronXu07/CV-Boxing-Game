import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import Menu from './components/Menu/Menu.jsx'
import Range from './components/Game/Range.jsx'
import FruitNinja from './components/Game/FruitNinja.jsx'
import About from './components/About/About.jsx'
import GameMenu from './components/GameMenu/GameMenu.jsx'
import CamCalibration from './components/Game/CamCalibration.jsx'
import Leaderboard from './components/Leaderboard/Leaderboard.jsx'
import Reaction from './components/Game/Reaction.jsx'
import Targets from './components/Game/Targets.jsx'
import Account from './components/Account/Account.jsx'
import Auth from './components/Auth/Auth.jsx'
import ResetPassword from './components/Auth/ResetPassword.jsx'
import ForgotPassword from './components/Auth/ForgotPassword.jsx'
import SetUsername from './components/Auth/SetUsername.jsx'
import OnboardingGuard from './components/Auth/OnboardingGuard.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GameProvider>
        <OnboardingGuard />
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/gamemenu" element={<GameMenu />} />
          <Route path="/range" element={<Range />} />
          <Route path="/reaction" element={<Reaction />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/fruitninja" element={<FruitNinja />} />
          <Route path="/about" element={<About />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-username" element={<SetUsername />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
    <Analytics />
  </StrictMode>,
)