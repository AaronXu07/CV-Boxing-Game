import { useEffect, useRef } from 'react';
import punchSoundFile from '../assets/sounds/punch.mp3';
import targetHit1 from '../assets/sounds/target-hits/punchtarget1.mp3';
import targetHit2 from '../assets/sounds/target-hits/punchtarget2.mp3';
import targetHit3 from '../assets/sounds/target-hits/punchtarget3.mp3';
import targetHit4 from '../assets/sounds/target-hits/punchtarget4.mp3';
import targetHit5 from '../assets/sounds/target-hits/punchtarget5.mp3';
import successSoundFile from '../assets/sounds/success.mp3';
import buttonSoundFile from '../assets/sounds/button.mp3';

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

  useEffect(() => {
    punchSoundRef.current = new Audio(punchSoundFile);
    successSoundRef.current = new Audio(successSoundFile);
    buttonSoundRef.current = new Audio(buttonSoundFile);
    
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

    const preloadSounds = () => {
      punchSoundRef.current.load();
      successSoundRef.current.load();
      buttonSoundRef.current.load();
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

  return {
    playPunchSound,
    playHitSound,
    playSuccessSound,
    playButtonSound,
    playFruitSound
  };
};