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
  const [gameRanks, setGameRanks] = useState([]); 
  const [userScores, setUserScores] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const scoresPerPage = 10;

  const suffix = (n) => [,'st','nd','rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] || 'th';

  // Pagination calculations
  const totalPages = Math.ceil(userScores.length / scoresPerPage);
  const indexOfLastScore = currentPage * scoresPerPage;
  const indexOfFirstScore = indexOfLastScore - scoresPerPage;
  const currentScores = userScores.slice(indexOfFirstScore, indexOfLastScore);

  const goToPage = (pageNumber) => {
    playButtonSound();
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      playButtonSound();
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      playButtonSound();
      setCurrentPage(currentPage - 1);
    }
  };

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

  const fetchGamemodeRanks = async (session) => {
    try {
      const res_fruit = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/19587430/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }); 

      const fruit_score = await res_fruit.json();

      const res_target = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/48392017/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const target_score = await res_target.json();

      const res_reaction = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/76015482/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const reaction_score = await res_reaction.json();

      const res_fruit_scores = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/19587430`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }); 

      const fruit_scores = await res_fruit_scores.json();

      const res_target_scores = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/48392017`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const target_scores = await res_target_scores.json();

      const res_reaction_scores = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/76015482`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const reaction_scores = await res_reaction_scores.json();


      let ranks = [target_score.rank, reaction_score.rank, fruit_score.rank]; 

      let percentRanks = [
        (target_scores.length - ranks[0] + 1) / target_scores.length,
        (reaction_scores.length - ranks[1] + 1) / reaction_scores.length,
        (fruit_scores.length - ranks[2] + 1) / fruit_scores.length
      ]; 

      const result = percentRanks.map((rank, index) => {
        let percentile = Math.min(99.99, Math.floor(rank * 100));
        return [ranks[index], percentile];
      })

      setGameRanks(result); 
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
        await fetchGamemodeRanks(session); 
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
                    <div className="username-section">
                      <h2>{username}</h2>
                      <button className="logout-button" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                    <div className="stats-card">
                      <div className="stat-label">Total Tests</div>
                      <div className="stat-value">{userScores.length}</div>
                    </div>
                  </div>

                  <div className="stats-section">
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

                  <div className="stats-section">
                    <h2>Leaderboard Ranks</h2>
                    <div className="high-scores-grid">
                      {gameRanks.map((item, index) => (
                        <div key={index} className="score-card rank-card">
                          <div className="score-card-mode">
                            {index === 0 ? 'Targets' : index === 1 ? 'Reaction' : 'Fruit Ninja'}
                          </div>
                          <div className="score-card-value">
                            {!item ? '-' : item[0] + suffix(Number(item[0]))}
                          </div>
                          <div className="percentile-card-value">
                            {!item ? '-' : `${item[1] + suffix(item[1])} Percentile`} 
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="stats-section">
                    <h2>Score History</h2>
                    <div className="scores-table-container">
                      <table className="scores-table">
                        <thead>
                          <tr>
                            <th>Game Mode</th>
                            <th>Score</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userScores.length > 0 ? (
                            currentScores.map((item, index) => (
                              <tr key={index}>
                                <td className="gamemode-cell">{item.gamemode.gamemode_name}</td>
                                <td className="score-cell">{item.score}</td>
                                <td className="date-cell">{new Date(item.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="no-scores">No scores yet. Start playing to see your history!</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {userScores.length > scoresPerPage && (
                      <div className="pagination">
                        <button 
                          className="pagination-btn" 
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                        >
                          ← Previous
                        </button>
                        <div className="pagination-numbers">
                          {[...Array(totalPages)].map((_, index) => (
                            <button
                              key={index + 1}
                              className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                              onClick={() => goToPage(index + 1)}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>
                        <button 
                          className="pagination-btn" 
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next →
                        </button>
                      </div>
                    )}
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
