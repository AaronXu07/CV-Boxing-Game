import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './about.css';
import Background from '../Background/Background';
import { useSound } from '../../hooks/useSound.js';

// Icons
import { MdTune, MdTimer, MdFitnessCenter, MdLightbulb } from 'react-icons/md';
import { BiTargetLock } from 'react-icons/bi';
import { GiBoxingGlove, GiAppleSeeds, GiPunch } from 'react-icons/gi';
import { IoFlashSharp } from 'react-icons/io5';
import { FaCut } from 'react-icons/fa';

function About() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [selected, setSelected] = useState(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const back = () => {
    playButtonSound();
    if (selected) {
      // If viewing a detail, go back to tutorial menu
      setSelected(null);
    } else {
      // If viewing overview, go back to main menu
      setTimeout(() => navigate('/'), 200);
    }
  };

  const tutorialSections = [
    {
      id: 'controls',
      title: 'Controls & Setup',
      icon: <MdTune />,
      summary: 'How to position yourself, enable camera, and basic controls.',
      steps: [
        'Position yourself 1-2 meters from the camera so your full upper body is visible.',
        'Make sure the room is well lit and the background is uncluttered.',
        'Allow webcam access when prompted by the browser.',
        'Use the on-screen buttons (back, start, toggle camera) to control the game.',
        'Press Esc or the Settings button in the top right corner to open the pause menu.', 
        'Use the Pause Menu to toggle camera and volume settings, or exit to the main menu.'
      ]
    },
    {
      id: 'targets',
      title: 'Targets Mode',
      icon: <BiTargetLock />,
      summary: 'Punch as many targets as you can in the time limit.',
      steps: [
        'Targets will appear at random locations across the screen.',
        'Punch on targets with the correct hand to score points.',
        'You have 30 seconds.',
        'Left hand will have orange targets while right hand will have purple targets.'
      ],
      route: '/targets'
    },
    {
      id: 'reaction',
      title: 'Reaction Time Test',
      icon: <FaCut />,
      summary: 'Measure how fast you react to a visual cue.',
      steps: [
        'Wait for the READY cue, then punch the indicated hand as fast as possible.',
        'Right hand will have a purple cue while left hand will have an orange cue.',
        'The game will record your reaction time in milliseconds.',
        'Five consecutive tests produce an average score shown at the end.',
        'Lower times are better, practice to improve!' ,
      ],
      route: '/reaction'
    },
    {
      id: 'fruitninja',
      title: 'Fruit Ninja Mode',
      icon: <GiAppleSeeds />,
      summary: 'Slice flying fruits while avoiding misses.',
      steps: [
        'Fruits fly across the screen, punch through them to slice.',
        'Missing fruits reduces lives.',
        'Bombs will end the game.',
        'Hit fruits without missing to start a combo.'
      ],
      route: '/fruitninja'
    },
    {
      id: 'range',
      title: 'Range Mode',
      icon: <GiBoxingGlove />,
      summary: 'Free practice mode to warm up and test your punches.',
      steps: [
        'Use Range to practice punches without scoring pressure.',
        'Focus on form, speed, and reach while watching the miniview.',
        'Try different punch types and observe tracking accuracy.'
      ],
      route: '/range'
    },
    {
      id: 'tips',
      title: 'Training Tips',
      icon: <MdLightbulb />,
      summary: 'Short tips to improve performance and tracking.',
      steps: [
        'Warm up before playing to avoid strain.',
        'Use both hands to train symmetry and speed.',
        'Review your high scores and focus practice on weak modes.',
        'Keep the camera steady and avoid sudden lighting changes.',
        'Wear clothes that will not restrict visibility of your arms.',
        'Make sure to return your hands fully to guard position before punching again.'
      ]
    }
  ];

  const onCardClick = (section) => {
    playButtonSound();
    setSelected(section.id);
  };

  const handleMouseMove = (e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8; // Tilt up/down
    const rotateY = ((x - centerX) / centerX) * 8;  // Tilt left/right

    setTiltStyle(prev => ({
      ...prev,
      [cardId]: {
        transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.035,1.035,1.035)`,
        transition: 'transform 120ms ease'
      }
    }));
  };

  const handleMouseLeave = (cardId) => {
    setTiltStyle(prev => ({
      ...prev,
      [cardId]: {
        transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
        transition: 'transform 220ms ease'
      }
    }));
  };

  const onStartMode = (route) => {
    if (!route) return;
    playButtonSound();
    setTimeout(() => navigate(route), 200);
  };

  return (
    <div className="about-container">
      <Background />

      <h1>Tutorial</h1>

      <button className="back-button" onClick={back}> ← Back</button>

      {!selected && (
        <div className="about-text tutorial-overview">
          <p className="lead">Select a training module to learn more.</p>

          <div className="tutorial-cards">
            {tutorialSections.map((s) => (
              <button
                key={s.id}
                className="tutorial-card"
                onClick={() => onCardClick(s)}
                onMouseMove={(e) => handleMouseMove(e, s.id)}
                onMouseLeave={() => handleMouseLeave(s.id)}
                style={tiltStyle[s.id] || {}}
                type="button"
                aria-label={s.title}
              >
                <div className="tutorial-icon">{s.icon}</div>
                <div className="tutorial-content">
                    <div className="tutorial-title">{s.title}</div>
                    <div className="tutorial-summary">{s.summary}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="about-text tutorial-detail">
          {tutorialSections.filter(s => s.id === selected).map(s => (
            <div key={s.id}>
              <div className="detail-icon-wrapper">{s.icon}</div>
              <h2 className="detail-title">{s.title}</h2>
              <p className="detail-summary">{s.summary}</p>
              <div className="step-list-container">
                <ol className="step-list">
                    {s.steps.map((step, i) => (
                    <li key={i}>
                        <span className="step-number">{i + 1}</span>
                        <span className="step-text">{step}</span>
                    </li>
                    ))}
                </ol>
              </div>
              {s.route && (
                <div className="detail-actions">
                  <button className="start-button" onClick={() => onStartMode(s.route)}>Start {s.title}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default About;
