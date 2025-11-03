import { useEffect, useRef } from 'react';
import punchSoundFile from '../assets/sounds/punch.mp3';
import targetHit1 from '../assets/sounds/target-hits/punchtarget1.mp3';
import targetHit2 from '../assets/sounds/target-hits/punchtarget2.mp3';
import targetHit3 from '../assets/sounds/target-hits/punchtarget3.mp3';
import targetHit4 from '../assets/sounds/target-hits/punchtarget4.mp3';
import targetHit5 from '../assets/sounds/target-hits/punchtarget5.mp3';
import successSoundFile from '../assets/sounds/success.mp3';
import buttonSoundFile from '../assets/sounds/button.mp3';

const targetHitSounds = [targetHit1, targetHit2, targetHit3, targetHit4, targetHit5];

export const useSound = () => {
  const punchSoundRef = useRef(null);
  const hitSoundRefs = useRef([]);
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

    punchSoundRef.current.volume = 0.1;
    successSoundRef.current.volume = 0.6;
    buttonSoundRef.current.volume = 0.4;

    const preloadSounds = () => {
      punchSoundRef.current.load();
      successSoundRef.current.load();
      buttonSoundRef.current.load();
      hitSoundRefs.current.forEach(audio => audio.load());
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

  return {
    playPunchSound,
    playHitSound,
    playSuccessSound,
    playButtonSound
  };
};