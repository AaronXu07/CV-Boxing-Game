import { useEffect, useRef } from 'react';
import punchSoundFile from '../assets/sounds/punch.mp3';
import targetHit1 from '../assets/sounds/target-hits/punchtarget1.mp3';
import targetHit2 from '../assets/sounds/target-hits/punchtarget2.mp3';
import targetHit3 from '../assets/sounds/target-hits/punchtarget3.mp3';
import targetHit4 from '../assets/sounds/target-hits/punchtarget4.mp3';
import targetHit5 from '../assets/sounds/target-hits/punchtarget5.mp3';
import successSoundFile from '../assets/sounds/success.mp3';
import buttonSoundFile from '../assets/sounds/button.mp3';
import bombFuseSoundFile from '../assets/sounds/bombfuse.wav';
import gameOverSoundFile from '../assets/sounds/gameover.wav';
import launchBombSoundFile from '../assets/sounds/launchbomb.wav';
import launchFruitSoundFile from '../assets/sounds/launchfruit.wav';
import bombExplodeSoundFile from '../assets/sounds/bombexplode.wav';
import loseLifeSoundFile from '../assets/sounds/loselife.mp3';

// Fruit hit sounds
import appleSoundFile from '../assets/sounds/fruit-hits/apple.wav';
import bananaSoundFile from '../assets/sounds/fruit-hits/banana.wav';
import coconutSoundFile from '../assets/sounds/fruit-hits/coconut.wav';
import kiwiSoundFile from '../assets/sounds/fruit-hits/kiwi.wav';
import orangeSoundFile from '../assets/sounds/fruit-hits/orange.wav';
import pineappleSoundFile from '../assets/sounds/fruit-hits/pineapple.wav';
import plumSoundFile from '../assets/sounds/fruit-hits/plum.wav';
import strawberrySoundFile from '../assets/sounds/fruit-hits/strawberry.wav';
import watermelonSoundFile from '../assets/sounds/fruit-hits/watermelon.wav';

const targetHitSounds = [targetHit1, targetHit2, targetHit3, targetHit4, targetHit5];

// Map fruit names to sound files
const fruitSoundMap = {
  'watermelon': watermelonSoundFile,
  'mango': plumSoundFile, // No mango sound, using plum
  'pineapple': pineappleSoundFile,
  'coconut': coconutSoundFile,
  'strawberry': strawberrySoundFile,
  'greenApple': appleSoundFile,
  'redApple': appleSoundFile,
  'kiwi': kiwiSoundFile,
  'banana': bananaSoundFile,
  'lemon': plumSoundFile, // No lemon sound, using plum
  'lime': plumSoundFile, // No lime sound, using plum
  'orange': orangeSoundFile,
  'plum': plumSoundFile,
  'pear': plumSoundFile, // No pear sound, using plum
  'passionFruit': plumSoundFile, // No passionFruit sound, using plum
  'peach': plumSoundFile, // No peach sound, using plum
  'cherry': plumSoundFile // No cherry sound, using plum
};

export const useSound = () => {
  const punchSoundRef = useRef(null);
  const hitSoundRefs = useRef([]);
  const fruitSoundRefs = useRef({});
  const successSoundRef = useRef(null);
  const buttonSoundRef = useRef(null);
  const bombFuseSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);
  const launchBombSoundRef = useRef(null);
  const launchFruitSoundRef = useRef(null);
  const bombExplodeSoundRef = useRef(null);
  const loseLifeSoundRef = useRef(null);

  useEffect(() => {
    punchSoundRef.current = new Audio(punchSoundFile);
    successSoundRef.current = new Audio(successSoundFile);
    buttonSoundRef.current = new Audio(buttonSoundFile);
    bombFuseSoundRef.current = new Audio(bombFuseSoundFile);
    gameOverSoundRef.current = new Audio(gameOverSoundFile);
    launchBombSoundRef.current = new Audio(launchBombSoundFile);
    launchFruitSoundRef.current = new Audio(launchFruitSoundFile);
    bombExplodeSoundRef.current = new Audio(bombExplodeSoundFile);
    loseLifeSoundRef.current = new Audio(loseLifeSoundFile);
    
    hitSoundRefs.current = targetHitSounds.map(sound => {
      const audio = new Audio(sound);
      audio.volume = 0.5; // 50% volume
      return audio;
    });

    // Load fruit sounds
    Object.entries(fruitSoundMap).forEach(([fruitName, soundFile]) => {
      const audio = new Audio(soundFile);
      audio.volume = 0.6;
      fruitSoundRefs.current[fruitName] = audio;
    });

    punchSoundRef.current.volume = 0.1;
    successSoundRef.current.volume = 0.6;
    buttonSoundRef.current.volume = 0.4;
    bombFuseSoundRef.current.volume = 0.5;
    bombFuseSoundRef.current.loop = true; // Make bomb fuse loop
    gameOverSoundRef.current.volume = 0.7;
    launchBombSoundRef.current.volume = 0.4;
    launchFruitSoundRef.current.volume = 0.3;
    bombExplodeSoundRef.current.volume = 0.8;
    loseLifeSoundRef.current.volume = 0.6;

    const preloadSounds = () => {
      punchSoundRef.current.load();
      successSoundRef.current.load();
      buttonSoundRef.current.load();
      bombFuseSoundRef.current.load();
      gameOverSoundRef.current.load();
      launchBombSoundRef.current.load();
      launchFruitSoundRef.current.load();
      bombExplodeSoundRef.current.load();
      loseLifeSoundRef.current.load();
      hitSoundRefs.current.forEach(audio => audio.load());
      Object.values(fruitSoundRefs.current).forEach(audio => audio.load());
    };

    preloadSounds();

    return () => {
      if (punchSoundRef.current) {
        punchSoundRef.current.pause();
        punchSoundRef.current = null;
      }
      if (successSoundRef.current) {
        successSoundRef.current.pause();
        successSoundRef.current = null;
      }
      if (buttonSoundRef.current) {
        buttonSoundRef.current.pause();
        buttonSoundRef.current = null;
      }
      if (bombFuseSoundRef.current) {
        bombFuseSoundRef.current.pause();
        bombFuseSoundRef.current = null;
      }
      if (gameOverSoundRef.current) {
        gameOverSoundRef.current.pause();
        gameOverSoundRef.current = null;
      }
      if (launchBombSoundRef.current) {
        launchBombSoundRef.current.pause();
        launchBombSoundRef.current = null;
      }
      if (launchFruitSoundRef.current) {
        launchFruitSoundRef.current.pause();
        launchFruitSoundRef.current = null;
      }
      if (bombExplodeSoundRef.current) {
        bombExplodeSoundRef.current.pause();
        bombExplodeSoundRef.current = null;
      }
      if (loseLifeSoundRef.current) {
        loseLifeSoundRef.current.pause();
        loseLifeSoundRef.current = null;
      }
      hitSoundRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      hitSoundRefs.current = [];
      
      Object.values(fruitSoundRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      fruitSoundRefs.current = {};
    };
  }, []); 

  const playPunchSound = () => {
    if (punchSoundRef.current) {
      punchSoundRef.current.currentTime = 0; 
      punchSoundRef.current.play();
      console.log("punch sound played");
    }
  };

  const playHitSound = () => {
    if (hitSoundRefs.current.length > 0) {
      const randomIndex = Math.floor(Math.random() * hitSoundRefs.current.length);
      const selectedSound = hitSoundRefs.current[randomIndex];
      selectedSound.currentTime = 0; 
      selectedSound.play();
      console.log(`hit sound played (variant ${randomIndex + 1})`);
    }
  };

  const playSuccessSound = () => {
    if (successSoundRef.current) {
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play();
      console.log("success sound played");
    }
  };

  const playButtonSound = () => {
    if (buttonSoundRef.current) {
      buttonSoundRef.current.currentTime = 0;
      buttonSoundRef.current.play();
      console.log("button sound played");
    }
  };

  const playFruitSound = (fruitName) => {
    if (fruitSoundRefs.current[fruitName]) {
      fruitSoundRefs.current[fruitName].currentTime = 0;
      fruitSoundRefs.current[fruitName].play();
      console.log(`fruit sound played: ${fruitName}`);
    } else {
      console.warn(`No sound found for fruit: ${fruitName}`);
    }
  };

  const playBombFuseSound = () => {
    if (bombFuseSoundRef.current) {
      bombFuseSoundRef.current.currentTime = 0;
      bombFuseSoundRef.current.play();
      console.log('bomb fuse sound played');
    }
  };

  const stopBombFuseSound = () => {
    if (bombFuseSoundRef.current) {
      bombFuseSoundRef.current.pause();
      bombFuseSoundRef.current.currentTime = 0;
      console.log('bomb fuse sound stopped');
    }
  };

  const playGameOverSound = () => {
    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.currentTime = 0;
      gameOverSoundRef.current.play();
      console.log('game over sound played');
    }
  };

  const playLaunchBombSound = () => {
    if (launchBombSoundRef.current) {
      launchBombSoundRef.current.currentTime = 0;
      launchBombSoundRef.current.play();
      console.log('launch bomb sound played');
    }
  };

  const playLaunchFruitSound = () => {
    if (launchFruitSoundRef.current) {
      launchFruitSoundRef.current.currentTime = 0;
      launchFruitSoundRef.current.play();
      console.log('launch fruit sound played');
    }
  };

  const playBombExplodeSound = () => {
    if (bombExplodeSoundRef.current) {
      bombExplodeSoundRef.current.currentTime = 0;
      bombExplodeSoundRef.current.play();
      console.log('bomb explode sound played');
    }
  };

  const playLoseLifeSound = () => {
    if (loseLifeSoundRef.current) {
      loseLifeSoundRef.current.currentTime = 0;
      loseLifeSoundRef.current.play();
      console.log('lose life sound played');
    }
  };

  return {
    playPunchSound,
    playHitSound,
    playSuccessSound,
    playButtonSound,
    playFruitSound,
    playBombFuseSound,
    stopBombFuseSound,
    playGameOverSound,
    playLaunchBombSound,
    playLaunchFruitSound,
    playBombExplodeSound,
    playLoseLifeSound
  };
};