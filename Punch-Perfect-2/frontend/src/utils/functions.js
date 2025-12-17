export const toggleFullScreen = async (containerRef) => {
    if (!containerRef.current) return; 

    if(!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (e) {
        console.warn('Full Screen Failed', e); 
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (e) {
        console.warn('Exit Full Screen Failed', e); 
      }
    }
  }; 