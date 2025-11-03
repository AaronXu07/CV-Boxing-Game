import { useNavigate } from 'react-router-dom';
import './about.css';
import { useSound } from '../../hooks/useSound.js';

function About() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();

  const back = () => {
    playButtonSound();
    setTimeout(() => navigate('/'), 100);
  };

  return (
    <div className="about-container">
      <h1>About</h1>

      <div className="about-buttons">
        <button className="back-button" onClick={back}>◄ Back to Menu</button>
      </div>

      <div className="about-text">
        <p>
             Punch Perfect Web is the evolution of the original Punch Perfect prototype — a computer-vision boxing game first built in Python with OpenCV, Mediapipe, and Pygame. 
             This new version reimagines the concept as a fully web-based experience, powered by JavaScript. 
             No downloads, no setup — just open your browser and start training. 
             Using real-time motion tracking through your webcam, Punch Perfect Web turns your movements into in-game punches, bringing interactive fitness gaming into the browser. 
             This project showcases advanced browser-based machine vision, real-time rendering, and modern full-stack development — all designed to make immersive gameplay more accessible than ever.
        </p>
      </div>
    </div>
  );
}

export default About;