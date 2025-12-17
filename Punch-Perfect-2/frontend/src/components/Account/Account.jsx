import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './account.css'
import { useSound } from '../../hooks/useSound.js'

// Mock data - will be replaced with backend data later
const mockData = {
  highScores: [
    { mode: 'Fruit Ninja', score: '101' },
    { mode: 'Targets', score: '35' },
    { mode: 'Reaction', score: '895 ms' }
  ]
};

function Account() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Check if user is logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if(storedUser){
      setIsLoggedIn(true);
      setUsername(storedUser);
    }
  }, []);

  const handleBack = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 100);
  };

  const handleLogin = () => {
    playButtonSound();
    setTimeout(() => navigate('/auth'), 100);
  };

  const handleLogout = () => {
    playButtonSound();
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <div className="account-container">
      <button className="back-button" onClick={handleBack}> ← Back</button>

      <h1>Account</h1>

      <div className="account-content">
        {isLoggedIn ? (
          <>
            <div className="user-info">
              <h2>{username}</h2>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>

            {/* High Scores Section */}
            <div className="high-scores-section">
              <h2>Your High Scores</h2>
              <div className="high-scores-grid">
                {mockData.highScores.map((item, index) => (
                  <div key={index} className="score-card">
                    <div className="score-card-mode">{item.mode}</div>
                    <div className="score-card-value">{item.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="not-logged-in">
              <div className="login-prompt">
                <h2>Sign in to track your progress</h2>
                <p>Create an account or log in to save your high scores and compete on the leaderboard.</p>
                <button className="login-button" onClick={handleLogin}>
                  Login / Sign Up
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Account;
