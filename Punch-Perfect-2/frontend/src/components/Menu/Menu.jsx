import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; 
import './Menu.css';
import { useSound } from '../../hooks/useSound.js';
import { getCurrentSession } from '../../lib/authFunctions.js';

function Menu() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [ username, setUsername ] = useState(null); 

  const startGame = () => {
    playButtonSound();
    setTimeout(() => navigate('/gamemenu'), 200);
  };

  const startAbout = () => {
    playButtonSound();
    setTimeout(() => navigate('/about'), 200);
  };

  const startLeaderboard = () => {
    playButtonSound();
    setTimeout(() => navigate('/leaderboard'), 200);
  }

  const startAccount = () => {
    playButtonSound();
    setTimeout(() => navigate('/account'), 200);
  }

  useEffect(() => {
    const setPage = async () => {
      const session = await getCurrentSession(); 
      if(session){
        setUsername(session.user.user_metadata?.display_name);
      } 
    };

    setPage(); 
    
  }, []);

  return (
    <div className="menu-container">
      {username ? 
        <button className="profile-icon-button" onClick={startAccount} aria-label="Account">
          {username}
        </button>
      : 
        <button className="profile-icon-button" onClick={startAccount} aria-label="Account">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      }
      
      
      <img src="/punch-perfect-logo.png" width="350px"/>
      <div className="menu-buttons">
        <button className="start-button" onClick={startGame}>Start Game</button>
        <button onClick={startAbout}>Tutorial</button>
        <button onClick={startLeaderboard}>Leaderboard</button>
        
      </div>
    </div>
  );
}

export default Menu;