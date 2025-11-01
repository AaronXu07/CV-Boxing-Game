import { useNavigate } from 'react-router-dom';
import './Menu.css';

function Menu() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/game');
  };

  const startAbout = () => {
    navigate('/about');
  };

  return (
    <div className="menu-container">
      <h1>Punch Perfect Menu</h1>
      <div className="menu-buttons">
        <button className="start-button" onClick={startGame}>Start Game</button>
        <button>Settings</button>
        <button>Leaderboard</button>
        <button onClick={startAbout}>About</button>
      </div>
    </div>
  );
}

export default Menu;