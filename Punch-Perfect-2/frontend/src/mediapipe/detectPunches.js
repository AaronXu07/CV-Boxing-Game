import { lArm, rArm } from './landmarks.js';

const punchState = {
    leftExtendedStartTime: null,
    leftForwardStartTime: null,
    rightExtendedStartTime: null,
    rightForwardStartTime: null,
    requiredDuration: 10 //in milliseconds
};

const punchInstant = {
    angle: 115,
    hDistance: 0.10,
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
    return xDiff;
}
const verticalDistance = (landmark1, landmark2) => {
    let yDiff = Math.abs(landmark1.y-landmark2.y);
    return yDiff;
}

const slope = (landmark1, landmark2) => {

    return (landmark2.y-landmark1.y) / Math.abs(landmark2.x-landmark1.x);
}

const inOrderX = (arm) => {
    return arm[0].x < arm[1].x && arm[1].x < arm[2].x || arm[0].x > arm[1].x && arm[1].x > arm[2].x; 
}

const inOrderY = (arm) => {
    let correctOrder = arm[0].y < arm[1].y && arm[1].y < arm[2].y || arm[0].y > arm[1].y && arm[1].y > arm[2].y; 
    let closeEnough = Math.abs(arm[0].y - arm[1].y) < 0.12; 
    return correctOrder || closeEnough; 
}

// Detect if arm is in guard position (bent, close to body)
const isInGuardPosition = (arm) => {
    const angle = angleBetweenSegments(arm[0], arm[1], arm[2]);
    const shoulderWristClose = Math.abs(arm[0].x - arm[2].x) < 0.12; 
    const shoulderElbowDist = Math.sqrt(
        Math.pow(arm[0].x - arm[1].x, 2) + 
        Math.pow(arm[0].y - arm[1].y, 2)
    );
    const shoulderElbowFarEnough = shoulderElbowDist > 0.20; 
    const armBent = angle < 87;
    
    return armBent && shoulderWristClose && shoulderElbowFarEnough;
}

export const detectPunches = (landmarks) => {

    let l = [landmarks[lArm[0]], landmarks[lArm[1]], landmarks[lArm[2]]]; 
    let r = [landmarks[rArm[0]], landmarks[rArm[1]], landmarks[rArm[2]]]; 

    let lSlope1 = slope(l[0], l[1]); 
    let lSlope2 = slope(l[1], l[2]); 

    let lShouldElbCloseX = Math.abs(l[0].x - l[1].x) < 0.07; 
    let lShouldElbCloseY = Math.abs(l[0].y - l[1].y) < 0.20; 

    let lShouldWristCloseX = Math.abs(l[0].x - l[2].x) < 0.12; 

    let lAngle = angleBetweenSegments(l[0], l[1], l[2]);

    let rSlope1 = slope(r[0], r[1]); 
    let rSlope2 = slope(r[1], r[2]); 

    let rShouldElbCloseX = Math.abs(r[0].x - r[1].x) < 0.07; 
    let rShouldElbCloseY = Math.abs(r[0].y - r[1].y) < 0.20; 

    let rShouldWristCloseX = Math.abs(r[0].x - r[2].x) < 0.12;

    let rAngle = angleBetweenSegments(r[0], r[1], r[2]);

    let lCond1 = Math.abs(lSlope1 - lSlope2) < 1 && !lShouldWristCloseX; 
    let lCond2 = lShouldElbCloseX && lShouldElbCloseY && lAngle > 80; 
    let lCond3 = lAngle > 160; 
    let lCond4 = lShouldElbCloseX && lShouldElbCloseY && lShouldWristCloseX; 

    let rCond1 = Math.abs(rSlope1 - rSlope2) < 1 && !rShouldWristCloseX; 
    let rCond2 = rShouldElbCloseX && rShouldElbCloseY && rAngle > 80; 
    let rCond3 = rAngle > 160; 
    let rCond4 = rShouldElbCloseX && rShouldElbCloseY && rShouldWristCloseX; 

    let leftPunch = ((lCond1 || lCond2) && inOrderX(l) && inOrderY(l)) || lCond3 || (lCond4 && inOrderY(l));  
    let rightPunch = ((rCond1 || rCond2) && inOrderX(r) && inOrderY(r)) || rCond3 || (rCond4 && inOrderY(r));  

    // Detect guard position
    let leftInGuard = isInGuardPosition(l);
    let rightInGuard = isInGuardPosition(r);

    //leftPunch = leftPunch || (landmarks[lArm[2]].y-landmarks[lArm[0]].y > 0.15 && lElbWristCloseX && lShouldElbCloseX);
    //rightPunch = rightPunch || (landmarks[rArm[2]].y-landmarks[rArm[0]].y > 0.15 && rElbWristCloseX && rShouldElbCloseX); 

    //leftPunch = leftPunch || (Math.abs(lSlope1 - lSlope2) < 2.5 && landmarks[lArm[2]].y > 0.5); 
    //rightPunch = rightPunch || (Math.abs(rSlope1 - rSlope2) < 2.5 && landmarks[rArm[2]].y > 0.5); 

    return {
         detected: leftPunch || rightPunch,
         leftZ: l[2].z,
         rightZ: r[2].z, 
         leftArm: leftPunch,
         rightArm: rightPunch,
         leftInGuard: leftInGuard,
         rightInGuard: rightInGuard,
         //leftArmForward: leftArmForward
    };
}

// export const detectPunches = (landmarks) => {
//     let lAngle;
//     let rAngle;

//     try {
//         lAngle = angleBetweenSegments(
//             landmarks[lArm[0]],
//             landmarks[lArm[1]], 
//             landmarks[lArm[2]]  
//         );

//         rAngle = angleBetweenSegments(
//             landmarks[rArm[0]],
//             landmarks[rArm[1]], 
//             landmarks[rArm[2]]  
//         );

//     } catch (err) {
//         return { detected: false, leftArm: false, rightArm: false }; 
//     }
    
//     // indexes: 0 - shoulder, 1 - elbow, 2 - wrist
//     let lHorizontalTop = horizontalDistance(landmarks[lArm[0]], landmarks[lArm[1]]); 
//     let lHorizontalBottom = horizontalDistance(landmarks[lArm[1]], landmarks[lArm[2]]); 

//     let rHorizontalTop = horizontalDistance(landmarks[rArm[0]], landmarks[rArm[1]]); 
//     let rHorizontalBottom = horizontalDistance(landmarks[rArm[1]], landmarks[rArm[2]]); 

//     let lVerticalTop = verticalDistance(landmarks[lArm[0]], landmarks[lArm[1]]); 
//     let lVerticalBottom = verticalDistance(landmarks[lArm[1]], landmarks[lArm[2]]); 

//     let rVerticalTop = verticalDistance(landmarks[rArm[0]], landmarks[rArm[1]]); 
//     let rVerticalBottom = verticalDistance(landmarks[rArm[1]], landmarks[rArm[2]]);

//     // Check instant conditions
//     const leftArmExtended = lAngle > punchInstant.angle; 
//     let leftArmForward = lHorizontalTop < punchInstant.hDistance && lHorizontalBottom < punchInstant.hDistance && lVerticalTop < punchInstant.vDistance && lVerticalBottom < punchInstant.vDistance && landmarks[lArm[2]].z < -0.3;
//     const rightArmExtended = rAngle > punchInstant.angle;
//     let rightArmForward = rHorizontalTop < punchInstant.hDistance && rHorizontalBottom < punchInstant.hDistance && rVerticalTop < punchInstant.vDistance && rVerticalBottom < punchInstant.vDistance && landmarks[rArm[2]].z < -0.3;

//     if(lAngle <= punchReturn.angle){
//         punchReturn.leftReturned = true;
//     }
//     if(rAngle <= punchReturn.angle){
//         punchReturn.rightReturned = true;
//     }

//     if(leftArmExtended){
//         if (punchState.leftExtendedStartTime === null){
//             punchState.leftExtendedStartTime = performance.now();
//         }
//     } 
//     else{
//         punchState.leftExtendedStartTime = null;
//     }

//     if(leftArmForward){
//         if (punchState.leftForwardStartTime === null){
//             punchState.leftForwardStartTime = performance.now();
//         }
//     } 
//     else{
//         punchState.leftForwardStartTime = null;
//     }

//     if(rightArmExtended){
//         if (punchState.rightExtendedStartTime === null){
//             punchState.rightExtendedStartTime = performance.now();
//         }
//     } 
//     else{
//         punchState.rightExtendedStartTime = null;
//     }

//     if(rightArmForward){
//         if (punchState.rightForwardStartTime === null){
//             punchState.rightForwardStartTime = performance.now();
//         }
//     } 
//     else{
//         punchState.rightForwardStartTime = null;
//     }

//     const leftExtendedLongEnough = punchState.leftExtendedStartTime !== null && performance.now() - punchState.leftExtendedStartTime >= punchState.requiredDuration;
//     const leftForwardLongEnough = punchState.leftForwardStartTime !== null && performance.now() - punchState.leftForwardStartTime >= punchState.requiredDuration;
    
//     const rightExtendedLongEnough = punchState.rightExtendedStartTime !== null && performance.now() - punchState.rightExtendedStartTime >= punchState.requiredDuration;
//     const rightForwardLongEnough = punchState.rightForwardStartTime !== null && performance.now() - punchState.rightForwardStartTime >= punchState.requiredDuration;

//     // LEFT ARM LOGIC
//     const islInstantPunch = leftExtendedLongEnough || leftForwardLongEnough;
    
//     const lExtendedTooLong = punchState.leftExtendedStartTime !== null && performance.now() - punchState.leftExtendedStartTime >= punchReturn.punchTime;
//     const lForwardTooLong = punchState.leftForwardStartTime !== null && performance.now() - punchState.leftForwardStartTime >= punchReturn.punchTime;
//     const lPunchExpired = lExtendedTooLong || lForwardTooLong;

//     //const leftPunch = islInstantPunch && punchReturn.leftReturned && !lPunchExpired;
//     let leftPunch; 
//     if(landmarks[lArm[2]].y < 0.3) {
//        leftPunch = islInstantPunch && landmarks[lArm[2]].z < 0; 
//     } else {
//        leftPunch = islInstantPunch && landmarks[lArm[2]].z < 0 && landmarks[lArm[1]].visibility > 0.5; 
//     }
    
//     if (lPunchExpired) {
//         punchReturn.leftReturned = false;
//     }

//     // RIGHT ARM LOGIC
//     const isrInstantPunch = rightExtendedLongEnough || rightForwardLongEnough;
    
//     const rExtendedTooLong = punchState.rightExtendedStartTime !== null && performance.now() - punchState.rightExtendedStartTime >= punchReturn.punchTime;
//     const rForwardTooLong = punchState.rightForwardStartTime !== null && performance.now() - punchState.rightForwardStartTime >= punchReturn.punchTime;
//     const rPunchExpired = rExtendedTooLong || rForwardTooLong;

//     //const rightPunch = isrInstantPunch && punchReturn.rightReturned && !rPunchExpired;

//     let rightPunch; 
//     if(landmarks[rArm[2]].y < 0.3) {
//        rightPunch = isrInstantPunch && landmarks[rArm[2]].z < 0; 
//     } else {
//        rightPunch = isrInstantPunch && landmarks[rArm[2]].z < 0 && landmarks[rArm[1]].visibility > 0.5; 
//     }

//     if (rPunchExpired) {
//         punchReturn.rightReturned = false;
//     }

//     return {
//         detected: leftPunch || rightPunch,
//         leftZ: landmarks[lArm[2]].z,
//         rightZ: landmarks[rArm[2]].z, 
//         leftArm: leftPunch,
//         rightArm: rightPunch,
//         leftArmForward: leftArmForward
//     };
// }