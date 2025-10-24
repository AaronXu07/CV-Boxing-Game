// selected arm landmarks

export const lShoulder = 12; 
export const lElbow = 14; 
export const lWrist = 16; 
export const lIndex = 20; 

export const rShoulder = 11; 
export const rElbow = 13; 
export const rWrist = 15; 
export const rIndex = 19; 

export const lArm = [lShoulder, lElbow, lWrist, lIndex];
export const rArm = [rShoulder, rElbow, rWrist, rIndex];

// arm landmark connections
const leftArmConnections = [
    {start:12, end:14}, 
    {start:14, end:16}, 
    {start:16, end:20}
]; 

const rightArmConnections = [
    {start:11, end:13}, 
    {start:13, end:15}, 
    {start:15, end:19}
]; 

export const selectedLandmarks = [lArm, rArm].flat(); 
export const selectedConnections = [leftArmConnections, rightArmConnections].flat();