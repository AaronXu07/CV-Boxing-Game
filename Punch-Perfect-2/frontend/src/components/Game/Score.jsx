import { useNavigate } from 'react-router-dom';
import { useSound } from '../../hooks/useSound.js';
import { CANVAS_SIZE } from '../../utils/constants.js';
import './score.css';
import { useEffect, useRef, useState } from 'react';
import { getCurrentSession } from '../../lib/authFunctions.js';

function Score(
  { 
    gamemode_id,
    score, 
    resetTracking, 
    ctxRef, 
    drawingUtilsRef,
    setGameKey,
    setIsGameOver,
    setIsCalibrated,
    setTimeRemaining,
    customReset,
  }
) {
  const { playButtonSound, playHighscoreSound } = useSound(); 
  const navigate = useNavigate();

  const hasRanRef = useRef(false);
  const [highScore, setHighScore] = useState(null);
  const [rank, setRank] = useState(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if(hasRanRef.current) return; 
   
    hasRanRef.current = true; 

    const saveScoreAndFetchStats = async () => {
      const session = await getCurrentSession(); 

      if(!session) {
        console.log("user not logged in, not saving score"); 
        setIsLoading(false);
        return null; 
      }

      try {
        // First, get user's previous high scores for all gamemodes
        const highscoresResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scores/highscores`, {
          method: 'GET',
          headers: {
             'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!highscoresResponse.ok) {
          throw new Error('Failed to fetch highscores');
        }

        const highscoresData = await highscoresResponse.json();
        const currentGamemodeHighscore = highscoresData.find(hs => hs.gamemode_id === gamemode_id);
        const previousHighScore = currentGamemodeHighscore?.highscore || 0;
        setHighScore(previousHighScore);

        // Check if current score beats previous high score
        // For reaction time (76015482), lower is better; for others, higher is better
        const isReactionMode = gamemode_id === 76015482;
        const beatsHighScore = isReactionMode 
          ? (previousHighScore === 0 || score < previousHighScore)
          : score > previousHighScore;
        if (beatsHighScore) {
          setIsNewRecord(true);
        }

        // Save the new score using backend endpoint
        console.log("sending post request"); 
        const saveResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scores/`, {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ score, gamemode_id })
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save score');
        }

        // Fetch updated rank after saving using the getRank endpoint
        const rankResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard/${gamemode_id}/me`, {
          method: 'GET',
          headers: {
             'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!rankResponse.ok) {
          throw new Error('Failed to fetch rank');
        }

        const rankData = await rankResponse.json();
        if (rankData && rankData.rank) {
          setRank(rankData.rank);
        }

        // Fetch updated high score after saving
        const updatedHighscoresResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scores/highscores`, {
          method: 'GET',
          headers: {
             'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (updatedHighscoresResponse.ok) {
          const updatedHighscoresData = await updatedHighscoresResponse.json();
          const updatedGamemodeHighscore = updatedHighscoresData.find(hs => hs.gamemode_id === gamemode_id);
          const newHighScore = updatedGamemodeHighscore?.highscore || score;
          setHighScore(newHighScore);
        }

        setIsLoading(false);
        
        // Only play highscore sound if they beat their previous record
        if (beatsHighScore) {
          playHighscoreSound();
        }

      } catch (err) {
        console.error('error occurred: ', err); 
        setIsLoading(false);
      }
    }

    saveScoreAndFetchStats(); 
  }, [score, gamemode_id, playHighscoreSound]);

  const restart = () => {
    playButtonSound();
    // Use the centralized reset function
    console.log('Resetting game...');
    // Reset all game states first
    resetTracking();

    // Clear refs
    ctxRef.current.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
    ctxRef.current = null;
    drawingUtilsRef.current = null;

    // Reset timer if applicable
    if (setTimeRemaining) {
      setTimeRemaining(30);
    }

    // Call custom reset if provided (for reaction mode)
    if (customReset) {
      customReset();
    }

    // Force remount by updating key
    setGameKey(prev => {
      console.log('Updating game key from', prev, 'to', prev + 1);
      return prev + 1;
    });

    setIsCalibrated(false); 

    // Reset game state last
    setIsGameOver(false);
    console.log('Game reset complete');
  };

  const navHome = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 200);
  };

  return (
    <div className="score-container">
      <div className="score-content">
        {!isLoading && isNewRecord && (
          <div className="new-record-banner">
            <h2 className="record-text">NEW HIGH SCORE!</h2>
          </div>
        )}
        <h1 className="score-title">Game Over</h1>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your stats...</p>
          </div>
        ) : (
          <div className="score-stats-grid">
            <div className="stat-card current-score">
              <div className="stat-label">Current Score</div>
              <div className="stat-value-wrapper">
                <span className="stat-value">{score}</span>
                {customReset && <span className="stat-unit">ms</span>}
              </div>
            </div>

            {highScore !== null && (
              <div className="stat-card high-score">
                <div className="stat-label">High Score</div>
                <div className="stat-value-wrapper">
                  <span className="stat-value">
                    {gamemode_id === 76015482 
                      ? (highScore === 0 ? score : Math.min(score, highScore))
                      : Math.max(score, highScore)
                    }
                  </span>
                  {customReset && <span className="stat-unit">ms</span>}
                </div>
              </div>
            )}

            {rank !== null && (
              <div className="stat-card rank-card">
                <div className="stat-label">Leaderboard Rank</div>
                <div className="stat-value-wrapper">
                  <span className="rank-value">#{rank}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="score-buttons">
          <button className="score-button restart-button" onClick={restart} type="button">
            Restart
          </button>
          <button className="score-button home-button" onClick={navHome} type="button">
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  ); 
}

export default Score;
