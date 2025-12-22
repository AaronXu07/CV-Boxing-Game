import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './account.css'
import { useSound } from '../../hooks/useSound.js'
import { supabase } from '../../lib/supabase.js'
import { getCurrentSession } from '../../lib/authFunctions.js'
import { BarLoader } from 'react-spinners'; 

function Account() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true); 

  const [highScores, setHighScores] = useState([]);
  const [userScores, setUserScores] = useState([]); 

  const fetchHighScores = async (session) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scores/highscores`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const data = await res.json();
      setHighScores(data);
    } catch (err) {
      console.error("Error occured: ", err); 
    } 
  }

  const fetchUserScores = async (session) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scores/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const data = await res.json();
      setUserScores(data); 
    } catch (err) {
      console.error("Error occured: ", err); 
    } 
  }

  // Check if user is logged in
  useEffect(() => {
    const setPage = async () => {
      const session = await getCurrentSession(); 
      if(session){
        setIsLoggedIn(true);
        setUsername(session.user.user_metadata?.display_name);
        await fetchHighScores(session);
        await fetchUserScores(session); 
        setIsLoading(false); 
      } else {
        setIsLoading(false); 
      }
    };

    setPage(); 
    
  }, []);

  const handleBack = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 200);
  };

  const handleLogin = () => {
    playButtonSound();
    setTimeout(() => navigate('/auth'), 200);
  };

  const handleLogout = async () => {
    playButtonSound();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        return; 
      }
      setIsLoggedIn(false);
      setUsername('');
      setHighScores([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="account-container">
      <button className="back-button" onClick={handleBack}> ← Back</button>

      {isLoading ? <div className="spinner"><BarLoader color="#ed0c2e" width={200} height={8}/></div>
        : <>
            <h1>Profile</h1>

            <div className="account-content">
              {isLoggedIn ? (
                <>
                  <div className="user-info">
                    <div>
                      <h2>{username}</h2>
                      <button className="logout-button" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                    <div className="count-section">
                      <div>Tests Taken</div>
                      <div>{userScores.length}</div>
                    </div>
                  </div>

                  <div className="high-scores-section">
                    <h2>Your High Scores</h2>
                    <div className="high-scores-grid">
                      {highScores.map((item, index) => (
                        <div key={index} className="score-card">
                          <div className="score-card-mode">{item.mode}</div>
                          <div className="score-card-value">
                            {!item.highscore ? '-' : item.highscore }
                            {item.mode === 'Reaction' && item.highscore ? ' ms' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="user-scores">
                    <h2>Your Scores</h2>
                    <div className="high-scores-grid">
                      <table>
                        <thead></thead>
                        <tbody>
                          {userScores.map((item, index) => (
                            <tr key={index}>
                              <td>{item.gamemode.gamemode_name}</td>
                              <td>{item.score}</td>
                              <td>{new Date(item.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
          </>}
    </div>
  );
}

export default Account;
