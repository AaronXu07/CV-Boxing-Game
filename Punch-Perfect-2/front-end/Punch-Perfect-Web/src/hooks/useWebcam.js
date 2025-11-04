import { useRef, useEffect } from 'react';
import { VIDEO_CONFIG } from '../utils/constants.js';

/**
 * Custom hook for managing webcam access and stream
 */
export const useWebcam = (isActive = true) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if(!isActive) return;

    let isMounted = true;

    const startCamera = async () => {
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONFIG });
        
        if (!isMounted || !videoRef.current) return;
        
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        try{
          await videoRef.current.play();
        } 
        catch(playErr){
          console.warn('video.play() failed or is deferred:', playErr);
        }
      } 
      catch(err) {
        console.error('Error accessing webcam:', err);
        alert('Could not access webcam. Please allow camera permissions.');
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if(streamRef.current){
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive]);

  return { videoRef, streamRef };
};
