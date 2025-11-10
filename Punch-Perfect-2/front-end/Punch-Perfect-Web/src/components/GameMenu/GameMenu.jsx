import { useNavigate } from 'react-router-dom';
import './gamemenu.css';
import { useSound } from '../../hooks/useSound.js';

function GameMenu() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();

  const startRangeMode = () => {
    playButtonSound();
    setTimeout(() => navigate('/range'), 100);
  };

  const startTargetsMode = () => {
    playButtonSound();
    setTimeout(() => navigate('/targets'), 100);
  };

  const startReactionMode = () => {
    playButtonSound();
    setTimeout(() => navigate('/reaction'), 100);
  };

  const startFruitNinja = () => {
    playButtonSound();
    setTimeout(() => navigate('/fruitninja'), 100);
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
        <button onClick={startRangeMode}>Range</button>
        <button onClick={startTargetsMode}>Target Test</button>
        <button onClick={startReactionMode}>Reaction Time Test</button>
        <button onClick={startFruitNinja}>Fruit Ninja</button>
      </div>
    </div>
  );
}

export default GameMenu;