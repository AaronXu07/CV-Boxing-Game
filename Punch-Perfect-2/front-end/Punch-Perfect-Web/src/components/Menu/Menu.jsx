import { useNavigate } from 'react-router-dom';
import './Menu.css';

function Menu() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/gamemenu');
  };

  const startAbout = () => {
    navigate('/about');
  };

  const startLeaderboard = () => {
    navigate('/leaderboard')
  }

  return (
    <div className="menu-container">
      <h1>Punch Perfect Menu</h1>
      <div className="menu-buttons">
        <button className="start-button" onClick={startGame}>Start Game</button>
        <button>Settings</button>
        <button onClick={startLeaderboard}>Leaderboard</button>
        <button onClick={startAbout}>About</button>
        <button >Account</button>
      </div>
    </div>
  );
}

export default Menu;