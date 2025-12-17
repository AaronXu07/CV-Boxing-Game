import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './settings.css';
import { useSound } from '../../hooks/useSound.js';

function Settings() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  
  // Load settings from localStorage or use defaults
  const [leftHandColor, setLeftHandColor] = useState(() => 
    localStorage.getItem('leftHandColor') || '#FF8C00'
  );
  const [rightHandColor, setRightHandColor] = useState(() => 
    localStorage.getItem('rightHandColor') || '#8B4FBF'
  );
  const [modelType, setModelType] = useState(() => 
    localStorage.getItem('modelType') || 'heavy'
  );
  const [volume, setVolume] = useState(() => 
    parseInt(localStorage.getItem('volume') || '70')
  );

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('leftHandColor', leftHandColor);
  }, [leftHandColor]);

  useEffect(() => {
    localStorage.setItem('rightHandColor', rightHandColor);
  }, [rightHandColor]);

  useEffect(() => {
    localStorage.setItem('modelType', modelType);
  }, [modelType]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  const handleBack = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 100);
  };

  const handleReset = () => {
    playButtonSound();
    setLeftHandColor('#FF8C00');
    setRightHandColor('#8B4FBF');
    setModelType('heavy');
    setVolume(70);
  };

  return (
    <div className="settings-container">
      <button className="back-button" onClick={handleBack}> ← Back</button>
      
      <h1>Settings</h1>

      <div className="settings-content">
        {/* Hand Colors Section */}
        <div className="settings-section">
          <h2>Hand Colors</h2>
          
          <div className="setting-item">
            <label htmlFor="leftHandColor">
              <span className="setting-label">Left Hand Color</span>
              <span className="color-preview" style={{ backgroundColor: leftHandColor }}></span>
            </label>
            <input
              type="color"
              id="leftHandColor"
              value={leftHandColor}
              onChange={(e) => setLeftHandColor(e.target.value)}
              className="color-picker"
            />
          </div>

          <div className="setting-item">
            <label htmlFor="rightHandColor">
              <span className="setting-label">Right Hand Color</span>
              <span className="color-preview" style={{ backgroundColor: rightHandColor }}></span>
            </label>
            <input
              type="color"
              id="rightHandColor"
              value={rightHandColor}
              onChange={(e) => setRightHandColor(e.target.value)}
              className="color-picker"
            />
          </div>
        </div>

        {/* Model Type Section */}
        <div className="settings-section">
          <h2>Pose Detection Model</h2>
          <p className="setting-description">
            Choose the model complexity. Lite is faster, Heavy is more accurate.
          </p>
          
          <div className="model-options">
            <button
              className={`model-option ${modelType === 'lite' ? 'active' : ''}`}
              onClick={() => setModelType('lite')}
            >
              <span className="model-name">Lite</span>
              <span className="model-desc">Fastest, lower accuracy</span>
            </button>
            
            <button
              className={`model-option ${modelType === 'full' ? 'active' : ''}`}
              onClick={() => setModelType('full')}
            >
              <span className="model-name">Full</span>
              <span className="model-desc">Balanced</span>
            </button>
            
            <button
              className={`model-option ${modelType === 'heavy' ? 'active' : ''}`}
              onClick={() => setModelType('heavy')}
            >
              <span className="model-name">Heavy</span>
              <span className="model-desc">Slowest, best accuracy (recommended)</span>
            </button>
          </div>
        </div>

        {/* Volume Section */}
        <div className="settings-section">
          <h2>Volume</h2>
          
          <div className="setting-item volume-item">
            <label htmlFor="volume">
              <span className="setting-label">Master Volume</span>
              <span className="volume-value">{volume}%</span>
            </label>
            <input
              type="range"
              id="volume"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="volume-slider"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="settings-actions">
          <button className="reset-button" onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
