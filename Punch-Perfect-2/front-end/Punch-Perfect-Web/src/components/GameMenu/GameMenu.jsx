import { useNavigate } from 'react-router-dom';
import './gamemenu.css';

function GameMenu() {
  const navigate = useNavigate();

  const startTargetMode = () => {
    navigate('/game');
  };

  const back = () => {
    navigate('/');
  };

  return (
    <div className="game-menu-container">
      <h1>Select Gamemode</h1>

      <div className="about-buttons">
        <button className="back-button" onClick={back}>◄ Back to Menu</button>
      </div>

      <div className="game-menu-buttons">
        <button onClick={startTargetMode}>Range</button>
        <button>Target Test</button>
        <button>Reaction Time Test</button>
        <button>Fruit Ninja</button>
      </div>
    </div>
  );
}

export default GameMenu;