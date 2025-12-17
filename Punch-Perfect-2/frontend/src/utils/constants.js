//Game Configuration Constants

export const VIDEO_CONFIG = {
  width: {ideal: 1920},
  height: {ideal: 1080}
};

export const CANVAS_SIZE = {
  width: 1920,
  height: 1080
};

export const MINIVIEW_SIZE = {
  width: 640,
  height: 360
};

export const MINIVIEW_POSITION = {
  x: CANVAS_SIZE.width - MINIVIEW_SIZE.width,
  y: CANVAS_SIZE.height - MINIVIEW_SIZE.height
};

export const TARGET_FPS = 30;
export const FRAME_TIME = 1000 / TARGET_FPS;
export const SMOOTH_FACTOR = 0.3; //0 = no smoothing, 1 = very stable but laggy
export const VISIBILITY_THRESHOLD = 0.5;
export const FRUIT_TARGET_SPAWN_INTERVAL = 2000; //Check every 2000ms
export const TARGET_SPAWN_INTERVAL = 100; //Check every 2000ms

export const DRAWING_OPTIONS = {
  connector: {
    color: '#0059ffff',
    lineWidth: 10,
  },
  landmark: {
    fillColor: '#ff0000ff',
    radius: 30,
  },
  LpunchLandmark: {
    fillColor: '#ffa200ff',
    color: '#00ff00ff',  
    lineWidth: 6,
    radius: 50,
  },
  RpunchLandmark: {
    fillColor: '#ae00ffff',
    color: '#00ff00ff',    
    lineWidth: 6,
    radius: 50,
  },
  leftHand: {
    fillColor: '#ffa200aa',
    radius: 30,
  },
  rightHand: {
    fillColor: '#ae00ffaa',
    radius: 30,
  }
};
