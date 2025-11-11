import { useNavigate } from 'react-router-dom';
import './Menu.css';
import { useSound } from '../../hooks/useSound.js';

function Menu() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();

  const startGame = () => {
    playButtonSound();
    setTimeout(() => navigate('/gamemenu'), 100);
  };

  const startAbout = () => {
    playButtonSound();
    setTimeout(() => navigate('/about'), 100);
  };

  const startLeaderboard = () => {
    playButtonSound();
    setTimeout(() => navigate('/leaderboard'), 100);
  }

  const startAccount = () => {
    playButtonSound();
    setTimeout(() => navigate('/account'), 100);
  }

  return (
    <div className="menu-container">
      <h1>Punch Perfect Menu</h1>
      <div className="menu-buttons">
        <button className="start-button" onClick={startGame}>Start Game</button>
        <button onClick={() => playButtonSound()}>Settings</button>
        <button onClick={startLeaderboard}>Leaderboard</button>
        <button onClick={startAbout}>About</button>
        <button onClick={startAccount}>Account</button>
      </div>
    </div>
  );
}

export default Menu;