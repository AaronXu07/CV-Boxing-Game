import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './leaderboard.css'
import { useSound } from '../../hooks/useSound.js'

// Mock data - will be replaced with backend data later
const mockData = {
  reactionTime: [
    { rank: 1, username: 'SpeedDemon', score: '512 ms', date: '2025-11-01' },
    { rank: 2, username: 'QuickFist', score: '548 ms', date: '2025-10-30' },
    { rank: 3, username: 'ThunderPunch', score: '573 ms', date: '2025-10-29' },
    { rank: 4, username: 'LightningJab', score: '621 ms', date: '2025-10-28' },
    { rank: 5, username: 'FastHands', score: '658 ms', date: '2025-10-27' },
    { rank: 6, username: 'BoxerPro', score: '692 ms', date: '2025-10-26' },
    { rank: 7, username: 'PunchMaster', score: '734 ms', date: '2025-10-25' },
    { rank: 8, username: 'IronFist', score: '781 ms', date: '2025-10-24' },
    { rank: 9, username: 'SwiftStrike', score: '823 ms', date: '2025-10-23' },
    { rank: 10, username: 'ChampionBoxer', score: '897 ms', date: '2025-10-22' },
  ],
  targetTest: [
    { rank: 1, username: 'BullseyeKing', score: '2500', date: '2025-11-01' },
    { rank: 2, username: 'Sharpshooter', score: '2350', date: '2025-10-31' },
    { rank: 3, username: 'AccuratePunch', score: '2280', date: '2025-10-30' },
    { rank: 4, username: 'TargetHunter', score: '2150', date: '2025-10-29' },
    { rank: 5, username: 'PrecisionFist', score: '2080', date: '2025-10-28' },
    { rank: 6, username: 'AimExpert', score: '1950', date: '2025-10-27' },
    { rank: 7, username: 'HitMaster', score: '1890', date: '2025-10-26' },
    { rank: 8, username: 'DeadEye', score: '1820', date: '2025-10-25' },
    { rank: 9, username: 'SnipeKing', score: '1750', date: '2025-10-24' },
    { rank: 10, username: 'AccuracyPro', score: '1680', date: '2025-10-23' },
  ],
  fruitNinja: [
    { rank: 1, username: 'SliceMaster', score: '15,420', date: '2025-11-02' },
    { rank: 2, username: 'FruitDestroyer', score: '14,890', date: '2025-11-01' },
    { rank: 3, username: 'NinjaFist', score: '14,320', date: '2025-10-31' },
    { rank: 4, username: 'ComboKing', score: '13,750', date: '2025-10-30' },
    { rank: 5, username: 'BladeHands', score: '13,280', date: '2025-10-29' },
    { rank: 6, username: 'FruitSlicer', score: '12,950', date: '2025-10-28' },
    { rank: 7, username: 'ChopChamp', score: '12,460', date: '2025-10-27' },
    { rank: 8, username: 'SwipeExpert', score: '11,890', date: '2025-10-26' },
    { rank: 9, username: 'QuickSlice', score: '11,320', date: '2025-10-25' },
    { rank: 10, username: 'FruitNinja99', score: '10,850', date: '2025-10-24' },
  ],
};

function Leaderboard() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [activeTab, setActiveTab] = useState('reactionTime');

  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 100);
  };

  const handleTabChange = (tab) => {
    playButtonSound();
    setActiveTab(tab);
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'reactionTime':
        return mockData.reactionTime;
      case 'targetTest':
        return mockData.targetTest;
      case 'fruitNinja':
        return mockData.fruitNinja;
      default:
        return mockData.reactionTime;
    }
  };

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

  return (
    <div className="leaderboard-container">
      <button className="back-button" onClick={back}>◄ Back to Menu</button>
      
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
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

      {/* Leaderboard Content */}
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
              {getTabData().map((entry) => (
                <tr 
                  key={entry.rank} 
                  className={`leaderboard-row ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}
                >
                  <td className="rank-column">
                    {entry.rank === 1 && '🥇'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                    {entry.rank > 3 && `${entry.rank}`}
                  </td>
                  <td className="username-column">{entry.username}</td>
                  <td className="score-column">{entry.score}</td>
                  <td className="date-column">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Placeholder for user's rank (when backend is connected) */}
        <div className="user-rank-info">
          <p className="info-text">
            Connect your account to see your ranking and compete with others!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
