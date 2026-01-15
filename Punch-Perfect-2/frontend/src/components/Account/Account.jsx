import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './account.css'
import Avatar from '../Avatar/Avatar'
import Background from '../Background/Background';
import { useSound } from '../../hooks/useSound.js'
import { supabase } from '../../api/supabase.js'
import { getCurrentSession } from '../../api/authFunctions.js'
import { getUsername } from '../../api/profile.js'
import { BarLoader } from 'react-spinners'; 
import { MdGpsFixed } from 'react-icons/md';
import { IoFlashSharp } from 'react-icons/io5';
import { GiAppleSeeds } from 'react-icons/gi';

function Account() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
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

  // Calculate visible page numbers
  const maxPageButtons = 10;
  const startPage = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
  const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

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

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setHighScores(data);
    } catch (err) {
      console.error("Error occured: ", err); 
    } 
  }

  const fetchGamemodeRanks = async (session) => {
    try {
      // Fetch all data in parallel
      const [fruit_score, target_score, reaction_score, fruit_scores, target_scores, reaction_scores] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/19587430/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP error! status: ${res.status}`))),
        
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/48392017/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP error! status: ${res.status}`))),
        
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/76015482/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP error! status: ${res.status}`))),
        
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/19587430`)
          .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP error! status: ${res.status}`))),
        
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/48392017`)
          .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP error! status: ${res.status}`))),
        
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/76015482`)
          .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP error! status: ${res.status}`)))
      ]);


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

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUserScores(data); 
    } catch (err) {
      console.error("Error occured: ", err); 
    } 
  }

  const loadUserData = async (session) => {
    try {
      setIsLoggedIn(true);
      setAvatarUrl(session.user.user_metadata?.avatar_url);
      const [usernameData] = await Promise.all([
        getUsername(session),
        fetchHighScores(session),
        fetchUserScores(session),
        fetchGamemodeRanks(session)
      ]);
      setUsername(usernameData.username);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const session = await getCurrentSession();
      if (session) {
        loadUserData(session);
      } else {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserData(session);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUsername('');
        setHighScores([]);
        setGameRanks([]);
        setUserScores([]);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
      <Background />

      <button className="back-button" onClick={handleBack}> ← Back</button>

      {isLoading ? <div className="spinner"><BarLoader color="#ed0c2e" width={200} height={8}/></div>
        : <>
            <h1>Profile</h1>

            <div className="account-content">
              {isLoggedIn ? (
                <>
                  <div className="user-info">
                    <div className="username-section">
                      <div className="username-body">
                        <Avatar src={avatarUrl} size={100} alt={username} />
                        <div className="username-profile">
                          <h2>{username}</h2>
                          <button className="logout-button" onClick={handleLogout}>
                            Logout
                          </button>
                        </div>
                      </div>
                      
                    </div>
                    <div className="stats-card">
                      <div className="stat-label">Total Tests</div>
                      <div className="stat-value">{userScores.length}</div>
                    </div>
                  </div>

                  <div className="dashboard-grid">
                    <div className="stats-section full-width">
                      <h2>Performance Overview</h2>
                      <div className="performance-list">
                        {[
                          { id: 48392017, name: 'Targets', icon: MdGpsFixed, rankIndex: 0 },
                          { id: 76015482, name: 'Reaction', icon: IoFlashSharp, rankIndex: 1 },
                          { id: 19587430, name: 'Fruit Ninja', icon: GiAppleSeeds, rankIndex: 2 }
                        ].map((mode) => {
                          const highScoreItem = highScores.find(h => h.gamemode_id === mode.id) || {};
                          const rankItem = gameRanks[mode.rankIndex] || [];
                          const Icon = mode.icon;

                          return (
                            <div key={mode.id} className="performance-card">
                              <div className="perf-left">
                                <div className="perf-icon">
                                  <Icon size={28} />
                                </div>
                                <span className="perf-mode">{mode.name}</span>
                              </div>
                              
                              <div className="perf-center">
                                <span className="perf-label">Personal Best</span>
                                <span className="perf-value">
                                  {!highScoreItem.highscore ? '-' : highScoreItem.highscore}
                                  {mode.name === 'Reaction' && highScoreItem.highscore ? ' ms' : ''}
                                </span>
                              </div>

                              <div className="perf-right">
                                <span className="perf-label">Global Rank</span>
                                <div className="perf-rank-group">
                                  <span className="perf-rank-hash">#</span>
                                  <span className="perf-rank-value">{!rankItem[0] ? '-' : rankItem[0]}</span>
                                  {Number.isFinite(rankItem[1]) && rankItem[1] > 0 && (
                                    <span className="perf-percentile">
                                      Top {Number((100 - rankItem[1]).toFixed(2))}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                            currentScores.map((item, index) => {
                              const name = item.gamemode.gamemode_name;
                              const Icon = name.includes('Target') ? MdGpsFixed : 
                                           name.includes('Reaction') ? IoFlashSharp :
                                           name.includes('Fruit') ? GiAppleSeeds : null;
                              
                              return (
                                <tr key={index}>
                                  <td className="gamemode-cell">
                                    {Icon && <span className="history-icon"><Icon /></span>}
                                    {name}
                                  </td>
                                  <td className="score-cell">{item.score}</td>
                                  <td className="date-cell">{new Date(item.created_at).toLocaleDateString()}</td>
                                </tr>
                              );
                            })
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
                          {pageNumbers.map((number) => (
                            <button
                              key={number}
                              className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                              onClick={() => goToPage(number)}
                            >
                              {number}
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
