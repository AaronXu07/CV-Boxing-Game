import { lArm, rArm } from './landmarks.js';

const slope = (landmark1, landmark2) => {
    let yDiff = landmark2.y - landmark1.y; 
    let xDiff = landmark2.x - landmark1.x; 
    console.log(`yDiff: ${yDiff} xDiff: ${xDiff}`); 
    return yDiff / xDiff; 
}

export const detectPunches = (landmarks) => {
    let lSlopeTop; 
    let lSlopeBottom; 
    let rSlopeTop; 
    let rSlopeBottom; 

    try {
        lSlopeTop = slope(landmarks[lArm[0]], landmarks[lArm[1]]); 
        lSlopeBottom = slope(landmarks[lArm[1]], landmarks[lArm[2]]); 

        rSlopeTop = slope(landmarks[rArm[0]], landmarks[rArm[1]]); 
        rSlopeBottom = slope(landmarks[rArm[1]], landmarks[rArm[2]]); 
    } catch (err) {
        console.log(`Error: ${err}`); 
        return false; 
    }
    
    if(Math.abs(lSlopeTop - lSlopeBottom) < 1 || Math.abs(rSlopeTop - rSlopeBottom) < 1) {
        return true; 
    } else {
        return false; 
    }
}