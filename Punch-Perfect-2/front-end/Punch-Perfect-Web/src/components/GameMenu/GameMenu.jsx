import { useNavigate } from 'react-router-dom';
import './gamemenu.css';
import { useSound } from '../../hooks/useSound.js';

function GameMenu() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();

  const startTargetMode = () => {
    playButtonSound();
    setTimeout(() => navigate('/game'), 100);
  };

  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 100);
  };

  return (
    <div className="game-menu-container">
      <h1>Select Gamemode</h1>

      <div className="about-buttons">
        <button className="back-button" onClick={back}>◄ Back to Menu</button>
      </div>

      <div className="game-menu-buttons">
        <button onClick={startTargetMode}>Range</button>
        <button onClick={() => playButtonSound()}>Target Test</button>
        <button onClick={() => playButtonSound()}>Reaction Time Test</button>
        <button onClick={() => playButtonSound()}>Fruit Ninja</button>
      </div>
    </div>
  );
}

export default GameMenu;