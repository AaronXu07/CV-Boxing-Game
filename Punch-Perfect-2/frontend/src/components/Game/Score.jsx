import { useNavigate } from 'react-router-dom';
import { useSound } from '../../hooks/useSound.js';
import { CANVAS_SIZE } from '../../utils/constants.js';
import './score.css';

function Score(
  { 
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
  const { playButtonSound } = useSound(); 
  const navigate = useNavigate(); 

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
    setTimeout(() => navigate('/'), 100);
  };

  return (
    <div className="score-container">
      <div className="score-content">
        <h1 className="score-title">Game Over</h1>
        <div className="score-display">
          <span className="score-value">{score}</span>
          {customReset && <span className="score-unit">ms</span>}
        </div>
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
