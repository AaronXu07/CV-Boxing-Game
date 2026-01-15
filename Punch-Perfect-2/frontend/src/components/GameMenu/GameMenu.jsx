import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './gamemenu.css';
import Background from '../Background/Background';
import { useSound } from '../../hooks/useSound.js';
import { GiBoxingGlove, GiAppleSeeds, GiPunch } from 'react-icons/gi';
import { IoFlashSharp } from 'react-icons/io5';
import { MdGpsFixed } from 'react-icons/md';

function GameMenu() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [tiltStyle, setTiltStyle] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
  }, []);

  const startRangeMode = () => {
    playButtonSound();
    setTimeout(() => navigate('/range'), 200);
  };

  const startTargetsMode = () => {
    playButtonSound();
    setTimeout(() => navigate('/targets'), 200);
  };

  const startReactionMode = () => {
    playButtonSound();
    setTimeout(() => navigate('/reaction'), 200);
  };

  const startFruitNinja = () => {
    playButtonSound();
    setTimeout(() => navigate('/fruitninja'), 200);
  };

  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 200);
  };

  const handleMouseMove = (e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Tilt up/down (inverted)
    const rotateY = ((x - centerX) / centerX) * 10;  // Tilt left/right
    
    setTiltStyle({
      [cardId]: {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      }
    });
  };

  const handleMouseLeave = (cardId) => {
    setTiltStyle({
      [cardId]: {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }
    });
  };

  const gameModes = [
    {
      id: 'range',
      title: 'Range',
      description: 'Practice your punches freely',
      icon: GiBoxingGlove,
      onClick: startRangeMode
    },
    {
      id: 'targets',
      title: 'Target Test',
      description: 'Hit as many targets as possible',
      icon: MdGpsFixed,
      onClick: startTargetsMode
    },
    {
      id: 'reaction',
      title: 'Reaction Time',
      description: 'Test your reflexes and speed',
      icon: IoFlashSharp,
      onClick: startReactionMode
    },
    {
      id: 'fruitninja',
      title: 'Fruit Ninja',
      description: 'Punch flying fruits with precision',
      icon: GiAppleSeeds,
      onClick: startFruitNinja
    }
  ];

  if (isMobile) {
    return (
      <>
        <div className="outside-buttons">
          <button className="back-button" onClick={back}> ← Back</button>
        </div>
        <div className="mobile-message-container">
          <h1>Please access on desktop to play</h1>
        </div>

      </>
    );
  }

  return (
    <div className="game-menu-container">
      <Background />

      <h1>Select Gamemode</h1>

      <div className="outside-buttons">
        <button className="back-button" onClick={back}> ← Back</button>
      </div>

      <div className="game-cards-grid">
        {gameModes.map((mode) => {
          const IconComponent = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              className="game-card"
              data-mode={mode.id}
              style={tiltStyle[mode.id] || {}}
              onMouseMove={(e) => handleMouseMove(e, mode.id)}
              onMouseLeave={() => handleMouseLeave(mode.id)}
              onClick={mode.onClick}
              aria-label={mode.title}
            >
              <div className="game-card-icon">
                <IconComponent />
              </div>
              <h2 className="game-card-title">{mode.title}</h2>
              <p className="game-card-description">{mode.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GameMenu;