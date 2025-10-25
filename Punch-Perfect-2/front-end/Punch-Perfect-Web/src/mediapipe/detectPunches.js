import { lArm, rArm } from './landmarks.js';

/*
const slope = (landmark1, landmark2) => {
    let yDiff = landmark2.y - landmark1.y; 
    let xDiff = landmark2.x - landmark1.x; 
    console.log(`yDiff: ${yDiff} xDiff: ${xDiff}`); 
    return yDiff / xDiff; 
}
*/

const angleBetweenSegments = (point1, joint, point2) => {
    const v1x = point1.x - joint.x;
    const v1y = point1.y - joint.y;
    
    const v2x = point2.x - joint.x;
    const v2y = point2.y - joint.y;
    
    const dotProduct = v1x * v2x + v1y * v2y;
    
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
    
    const angleRad = Math.acos(dotProduct / (mag1 * mag2));
    
    const angleDeg = angleRad * (180 / Math.PI);
    
    return angleDeg;
}

const horizontalDistance = (landmark1, landmark2) => {
    let xDiff = Math.abs(landmark1.x-landmark2.x);
    console.log(`xDiff: ${xDiff}`);
    return xDiff;
}
const verticalDistance = (landmark1, landmark2) => {
    let yDiff = Math.abs(landmark1.y-landmark2.y);
    console.log(`yDiff: ${yDiff}`);
    return yDiff;
}

export const detectPunches = (landmarks) => {
    let lAngle;
    let rAngle;

    try {
        lAngle = angleBetweenSegments(
            landmarks[lArm[0]],
            landmarks[lArm[1]], 
            landmarks[lArm[2]]  
        );

        rAngle = angleBetweenSegments(
            landmarks[rArm[0]],
            landmarks[rArm[1]], 
            landmarks[rArm[2]]  
        );

        console.log(`Left arm angle: ${lAngle.toFixed(1)}°, Right arm angle: ${rAngle.toFixed(1)}°`);
    } catch (err) {
        console.log(`Error: ${err}`); 
        return { detected: false, leftArm: false, rightArm: false }; 
    }
    
    let lHorizontalTop;
    let lHorizontalBottom;
    let rHorizontalTop;
    let rHorizontalBottom;
    let lVerticalTop;
    let lVerticalBottom;
    let rVerticalTop;
    let rVerticalBottom;
    lHorizontalTop = horizontalDistance(landmarks[lArm[0]], landmarks[lArm[1]]); 
    lHorizontalBottom = horizontalDistance(landmarks[lArm[1]], landmarks[lArm[2]]); 

    rHorizontalTop = horizontalDistance(landmarks[rArm[0]], landmarks[rArm[1]]); 
    rHorizontalBottom = horizontalDistance(landmarks[rArm[1]], landmarks[rArm[2]]); 

    lVerticalTop = verticalDistance(landmarks[lArm[0]], landmarks[lArm[1]]); 
    lVerticalBottom = verticalDistance(landmarks[lArm[1]], landmarks[lArm[2]]); 

    rVerticalTop = verticalDistance(landmarks[rArm[0]], landmarks[rArm[1]]); 
    rVerticalBottom = verticalDistance(landmarks[rArm[1]], landmarks[rArm[2]]);


    const leftArmExtended = lAngle > 110; 
    const leftArmForward = lHorizontalTop < 0.13 && lHorizontalBottom < 0.13 && lVerticalTop < 0.15 && lVerticalBottom < 0.15;
    const leftPunch = leftArmForward || leftArmExtended;

    const rightArmExtended = rAngle > 110; 
    const rightArmForward = rHorizontalTop < 0.13 && rHorizontalBottom < 0.13 && rVerticalTop < 0.15 && rVerticalBottom < 0.15;
    const rightPunch = rightArmForward || rightArmExtended;

    return {
        detected: leftPunch || rightPunch,
        leftArm: leftPunch,
        rightArm: rightPunch
    };
}