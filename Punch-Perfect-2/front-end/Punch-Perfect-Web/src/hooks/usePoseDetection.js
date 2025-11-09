import { useRef, useEffect } from 'react';
import { initPoseLandmarker } from '../mediapipe/poseLandmarker.js';
import { SMOOTH_FACTOR } from '../utils/constants.js';
import { VISIBILITY_THRESHOLD } from '../utils/constants.js';

/**
 * Smooth landmarks to reduce jitter
 */
const smoothLandmarks = (prevLandmarks, newLandmarks) => {
  if(!prevLandmarks){
    return newLandmarks;
  }

  return newLandmarks.map((newLm, i) => {

    if(newLm.visibility < VISIBILITY_THRESHOLD && newLm.y > 0.5) {
      return { ...prevLandmarks[i]}
    } else {
      return {
        x: SMOOTH_FACTOR * prevLandmarks[i].x + (1 - SMOOTH_FACTOR) * newLm.x,
        y: SMOOTH_FACTOR * prevLandmarks[i].y + (1 - SMOOTH_FACTOR) * newLm.y,
        z: SMOOTH_FACTOR * prevLandmarks[i].z + (1 - SMOOTH_FACTOR) * newLm.z,
        visibility: SMOOTH_FACTOR * prevLandmarks[i].visibility + (1 - SMOOTH_FACTOR) * newLm.visibility
      }
    }
  });
};

/**
 * Custom hook for pose detection
 */
export const usePoseDetection = (isActive = true, gameKey) => {
  const poseLandmarkerRef = useRef(null);
  const smoothedLandmarksRef = useRef(null);

  useEffect(() => {
    if(!isActive) return;

    let isMounted = true;

    const initDetector = async () => {
      try {
        const landmarker = await initPoseLandmarker();
        if(isMounted){
          poseLandmarkerRef.current = landmarker;
        }
      } catch(err) {
        console.error('Failed to initialize pose landmarker:', err);
      }
    };

    initDetector();

    return () => {
      isMounted = false;
      poseLandmarkerRef.current = null;
      smoothedLandmarksRef.current = null;
    };
  }, [isActive, gameKey]);

  /**
   * Detect pose from video frame
   */
  const detectPose = async (video, timestamp) => {
    if (!poseLandmarkerRef.current || !video || video.readyState < 2) {
      return null;
    }

    try{
      const results = await poseLandmarkerRef.current.detectForVideo(video, timestamp);
      
      if(results && results.landmarks[0]){
        smoothedLandmarksRef.current = smoothLandmarks(
          smoothedLandmarksRef.current, 
          results.landmarks[0]
        );
        return smoothedLandmarksRef.current;
      }
      
      return null;
    } 
    catch (err){
      console.error('Pose detection failed:', err);
      return null;
    }
  };

  return{detectPose, poseLandmarkerRef};
};
