import { lArm, rArm } from './landmarks.js';

const punchState = {
    leftExtendedStartTime: null,
    leftForwardStartTime: null,
    rightExtendedStartTime: null,
    rightForwardStartTime: null,
    requiredDuration: 80 //in milliseconds
};

const punchInstant = {
    angle: 115,
    hDistance: 0.13,
    vDistance: 0.15
};

const punchReturn = {
    angle: 100,
    punchTime: 300,
    leftReturned: true,
    rightReturned: true,
}

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

    // Check instant conditions
    const leftArmExtended = lAngle > punchInstant.angle; 
    const leftArmForward = lHorizontalTop < punchInstant.hDistance && lHorizontalBottom < punchInstant.hDistance && lVerticalTop < punchInstant.vDistance && lVerticalBottom < punchInstant.vDistance;
    const rightArmExtended = rAngle > punchInstant.angle; 
    const rightArmForward = rHorizontalTop < punchInstant.hDistance && rHorizontalBottom < punchInstant.hDistance && rVerticalTop < punchInstant.vDistance && rVerticalBottom < punchInstant.vDistance;

    if(lAngle <= punchReturn.angle){
        punchReturn.leftReturned = true;
    }
    if(rAngle <= punchReturn.angle){
        punchReturn.rightReturned = true;
    }

    if(leftArmExtended){
        if (punchState.leftExtendedStartTime === null){
            punchState.leftExtendedStartTime = performance.now();
        }
    } 
    else{
        punchState.leftExtendedStartTime = null;
    }

    if(leftArmForward){
        if (punchState.leftForwardStartTime === null){
            punchState.leftForwardStartTime = performance.now();
        }
    } 
    else{
        punchState.leftForwardStartTime = null;
    }

    if(rightArmExtended){
        if (punchState.rightExtendedStartTime === null){
            punchState.rightExtendedStartTime = performance.now();
        }
    } 
    else{
        punchState.rightExtendedStartTime = null;
    }

    if(rightArmForward){
        if (punchState.rightForwardStartTime === null){
            punchState.rightForwardStartTime = performance.now();
        }
    } 
    else{
        punchState.rightForwardStartTime = null;
    }

    const leftExtendedLongEnough = punchState.leftExtendedStartTime !== null && performance.now() - punchState.leftExtendedStartTime >= punchState.requiredDuration;
    const leftForwardLongEnough = punchState.leftForwardStartTime !== null && performance.now() - punchState.leftForwardStartTime >= punchState.requiredDuration;
    
    const rightExtendedLongEnough = punchState.rightExtendedStartTime !== null && performance.now() - punchState.rightExtendedStartTime >= punchState.requiredDuration;
    const rightForwardLongEnough = punchState.rightForwardStartTime !== null && performance.now() - punchState.rightForwardStartTime >= punchState.requiredDuration;

    // LEFT ARM LOGIC
    const islInstantPunch = leftExtendedLongEnough || leftForwardLongEnough;
    
    const lExtendedTooLong = punchState.leftExtendedStartTime !== null && performance.now() - punchState.leftExtendedStartTime >= punchReturn.punchTime;
    const lForwardTooLong = punchState.leftForwardStartTime !== null && performance.now() - punchState.leftForwardStartTime >= punchReturn.punchTime;
    const lPunchExpired = lExtendedTooLong || lForwardTooLong;

    const leftPunch = islInstantPunch && punchReturn.leftReturned && !lPunchExpired;

    if (lPunchExpired) {
        punchReturn.leftReturned = false;
    }

    // RIGHT ARM LOGIC
    const isrInstantPunch = rightExtendedLongEnough || rightForwardLongEnough;
    
    const rExtendedTooLong = punchState.rightExtendedStartTime !== null && performance.now() - punchState.rightExtendedStartTime >= punchReturn.punchTime;
    const rForwardTooLong = punchState.rightForwardStartTime !== null && performance.now() - punchState.rightForwardStartTime >= punchReturn.punchTime;
    const rPunchExpired = rExtendedTooLong || rForwardTooLong;

    const rightPunch = isrInstantPunch && punchReturn.rightReturned && !rPunchExpired;

    if (rPunchExpired) {
        punchReturn.rightReturned = false;
    }

    return {
        detected: leftPunch || rightPunch,
        leftArm: leftPunch,
        rightArm: rightPunch
    };
}