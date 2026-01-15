import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './leaderboard.css'
import Background from '../Background/Background'
import Avatar from '../Avatar/Avatar'
import { useSound } from '../../hooks/useSound.js'
import { BarLoader } from 'react-spinners'
import { getCurrentSession } from '../../api/authFunctions.js'

function Leaderboard() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [activeTab, setActiveTab] = useState('reactionTime');
  const [isLoading, setIsLoading] = useState(true); 
  const [leaderboard, setLeaderboard] = useState([]); 
  const [userRank, setUserRank] = useState(null); 
  const [loggedIn, setLoggedIn ] = useState(false); 
  const [currentUserAvatar, setCurrentUserAvatar] = useState(null); 

  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 200);
  };

  const handleTabChange = (tab) => {
    playButtonSound();
    setActiveTab(tab);
  };

  const gamemodeMap = {
    reactionTime: 76015482,
    targetTest: 48392017,
    fruitNinja: 19587430,
  };

  const fetchData = async (gamemodeId) => {
      const session = await getCurrentSession();

      try {
        // Fetch leaderboard and user rank in parallel
        const leaderboardPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/${gamemodeId}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            return res.json();
          });

        if(session) {
          setLoggedIn(true);
          setCurrentUserAvatar(session.user.user_metadata?.avatar_url);
          const userRankPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/${gamemodeId}/me`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          });

          const [leaderboardData, userRankData] = await Promise.all([leaderboardPromise, userRankPromise]);
          setLeaderboard(leaderboardData);
          if(userRankData) {
            setUserRank(userRankData);
          }
        } else {
          setLoggedIn(false);
          const leaderboardData = await leaderboardPromise;
          setLeaderboard(leaderboardData);
        } 
        
      } catch (err) {
        console.error("Error occured: ", err); 
      } 
    }

  useEffect(() => {
    const update = async () => {
      setIsLoading(true); 
      const gamemodeId = gamemodeMap[activeTab]; 
      await fetchData(gamemodeId); 
      setIsLoading(false); 
    }

    update(); 
    
  }, [activeTab])

  const getTabTitle = () => {
    switch (activeTab) {
      case 'reactionTime':
        return 'Reaction Time Test';
      case 'targetTest':
        return 'Target Test';
      case 'fruitNinja':
        return 'Fruit Ninja Test';
      default:
        return 'Leaderboard';
    }
  };

  const getScoreLabel = () => {
    switch (activeTab) {
      case 'reactionTime':
        return 'Time';
      case 'targetTest':
        return 'Score';
      case 'fruitNinja':
        return 'Score';
      default:
        return 'Score';
    }
  };

  // Calculate ranks with proper tie handling (1, 1, 3, 4, 4, 6...)
  const calculateRanks = (leaderboardData) => {
    const rankedData = [];
    let currentRank = 1;

    for (let i = 0; i < leaderboardData.length; i++) {
      if (i > 0 && leaderboardData[i].score !== leaderboardData[i - 1].score) {
        currentRank = i + 1;
      }
      rankedData.push({
        ...leaderboardData[i],
        rank: currentRank
      });
    }
    return rankedData;
  };

  const rankedLeaderboard = calculateRanks(leaderboard);

  return (
    <div className="leaderboard-container">
      <Background />

      <button className="back-button" onClick={back}> ← Back</button>
      
      <div className="leaderboard-header">
        <h1>Leaderboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'reactionTime' ? 'active' : ''}`}
          onClick={() => handleTabChange('reactionTime')}
        >
          Reaction Time
        </button>
        <button
          className={`tab-button ${activeTab === 'targetTest' ? 'active' : ''}`}
          onClick={() => handleTabChange('targetTest')}
        >
          Target Test
        </button>
        <button
          className={`tab-button ${activeTab === 'fruitNinja' ? 'active' : ''}`}
          onClick={() => handleTabChange('fruitNinja')}
        >
          Fruit Ninja
        </button>
      </div>

      {isLoading ? <div className="spinner"><BarLoader color="#ed0c2e" width={200} height={8}/></div> :
      <div className="leaderboard-content">
        <h2>{getTabTitle()}</h2>
        
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-column">Rank</th>
                <th className="username-column">Username</th>
                <th className="score-column">{getScoreLabel()}</th>
                <th className="date-column">Date</th>
              </tr>
            </thead>
            <tbody>
              {rankedLeaderboard.map((entry, index) => (
                <tr 
                  key={index} 
                  className={`leaderboard-row ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}
                >
                  <td className="rank-column">
                    {entry.rank}
                  </td>
                  <td className="username-column">
                    <div className="username-body">
                      <Avatar src={entry.user.avatar_url} size={30} alt={entry.user.display_name} />
                      {entry.user.display_name}
                    </div>
                  </td>
                  <td className="score-column">{entry.score}{activeTab === 'reactionTime' ? ' ms' : ''}</td>
                  <td className="date-column">{new Date(entry.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Placeholder for user's rank (when backend is connected) */}
        <div className="user-rank-info">
            {!loggedIn ? <p className="info-text">Connect your account to see your ranking and compete with others!</p> : 
              <table className="leaderboard-table">
                <tbody>
                  {!userRank || !userRank.display_name ? <tr className='leaderboard-row'>
                                  <td className="rank-column"> - </td>
                                  <td className="username-column">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <Avatar src={currentUserAvatar} size={30} alt="Me" />
                                      You
                                    </div>
                                  </td>
                                  <td className="score-column"> - </td>
                                  <td className="date-column"> - </td>
                                </tr> : 
                  <tr 
                    className={`leaderboard-row ${userRank.rank <= 3 ? `rank-${userRank.rank}` : ''}`}
                  >
                    <td className="rank-column">
                      {userRank.rank}
                    </td>
                    <td className="username-column">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={userRank.avatar_url} size={30} alt={userRank.display_name} />
                        {userRank.display_name} (You)
                      </div>
                    </td>
                    <td className="score-column">{userRank.score}{activeTab === 'reactionTime' ? ' ms' : ''}</td>
                    <td className="date-column">{new Date(userRank.created_at).toLocaleDateString()}</td>
                  </tr>
                  }
                </tbody>

              </table>
            }
        </div>

      </div>}
    </div>
  );
}

export default Leaderboard;
