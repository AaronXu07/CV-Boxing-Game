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
    //console.log(`xDiff: ${xDiff}`);
    return xDiff;
}
const verticalDistance = (landmark1, landmark2) => {
    let yDiff = Math.abs(landmark1.y-landmark2.y);
    //console.log(`yDiff: ${yDiff}`);
    return yDiff;
}

const slope = (landmark1, landmark2) => {

    return (landmark2.y-landmark1.y) / Math.abs(landmark2.x-landmark1.x);
}



export const detectPunches = (landmarks) => {

    let lSlope1 = slope(landmarks[lArm[0]], landmarks[lArm[1]]); 
    let lSlope2 = slope(landmarks[lArm[1]], landmarks[lArm[2]]); 

    let lShouldElbCloseX = Math.abs(landmarks[lArm[0]].x - landmarks[lArm[1]].x) < 0.10; 
    let lShouldElbCloseY = Math.abs(landmarks[lArm[0]].y - landmarks[lArm[1]].y) < 0.10; 

    let lShouldWristCloseX = Math.abs(landmarks[lArm[0]].x - landmarks[lArm[2]].x) < 0.10; 
    let lShouldWristCloseY = Math.abs(landmarks[lArm[0]].y - landmarks[lArm[2]].y) < 0.10; 

    let lAngle = angleBetweenSegments(landmarks[lArm[0]], landmarks[lArm[1]], landmarks[lArm[2]]); 

    let rSlope1 = slope(landmarks[rArm[0]], landmarks[rArm[1]]); 
    let rSlope2 = slope(landmarks[rArm[1]], landmarks[rArm[2]]); 

    let rShouldElbCloseX = Math.abs(landmarks[rArm[0]].x - landmarks[rArm[1]].x) < 0.10; 
    let rShouldElbCloseY = Math.abs(landmarks[rArm[0]].y - landmarks[rArm[1]].y) < 0.10; 

    let rShouldWristCloseX = Math.abs(landmarks[rArm[0]].x - landmarks[rArm[2]].x) < 0.10;
    let rShouldWristCloseY = Math.abs(landmarks[rArm[0]].y - landmarks[rArm[2]].y) < 0.10; 

    let rAngle = angleBetweenSegments(landmarks[rArm[0]], landmarks[rArm[1]], landmarks[rArm[2]]); 

    let lCond1 = Math.abs(lSlope1 - lSlope2) < 1 && !lShouldWristCloseX; 
    let lCond2 = lShouldElbCloseX && lShouldElbCloseY && lAngle > 90; 
    let lCond3 = lAngle > 160; 
    let lCond4 = lShouldElbCloseX && lShouldElbCloseY && lShouldWristCloseX && lShouldWristCloseY; 

    let rCond1 = Math.abs(rSlope1 - rSlope2) < 1 && !rShouldWristCloseX; 
    let rCond2 = rShouldElbCloseX && rShouldElbCloseY && rAngle > 90; 
    let rCond3 = rAngle > 160; 
    let rCond4 = rShouldElbCloseX && rShouldElbCloseY && rShouldWristCloseX && rShouldWristCloseY; 

    let leftPunch = lCond1 || lCond2 || lCond3 || lCond4;  
    let rightPunch = rCond1 || rCond2 || rCond3 || rCond4; 

    console.log({
        "lSlopeDiff": Math.abs(lSlope1 - lSlope2), 
        "rSlopeDiff": Math.abs(rSlope1 - rSlope2), 
        "lShouldWristDistX": Math.abs(landmarks[lArm[0]].x - landmarks[lArm[2]].x), 
        "rShouldWristDistX": Math.abs(landmarks[rArm[0]].x - landmarks[rArm[2]].x), 
        "lShouldElbCloseX": Math.abs(landmarks[lArm[0]].x - landmarks[lArm[1]].x), 
        "rShouldElbCloseX": Math.abs(landmarks[rArm[0]].x - landmarks[rArm[1]].x),
        "lShouldElbCloseY": Math.abs(landmarks[lArm[0]].y - landmarks[lArm[1]].y), 
        "rShouldElbCloseY": Math.abs(landmarks[rArm[0]].y - landmarks[rArm[1]].y),
        "lShouldWristCloseY": Math.abs(landmarks[lArm[0]].y - landmarks[lArm[2]].y), 
        "lAngle": lAngle, 
        "rAngle": rAngle
    })
    //leftPunch = leftPunch || (landmarks[lArm[2]].y-landmarks[lArm[0]].y > 0.15 && lElbWristCloseX && lShouldElbCloseX);
    //rightPunch = rightPunch || (landmarks[rArm[2]].y-landmarks[rArm[0]].y > 0.15 && rElbWristCloseX && rShouldElbCloseX); 

    //leftPunch = leftPunch || (Math.abs(lSlope1 - lSlope2) < 2.5 && landmarks[lArm[2]].y > 0.5); 
    //rightPunch = rightPunch || (Math.abs(rSlope1 - rSlope2) < 2.5 && landmarks[rArm[2]].y > 0.5); 

    return {
         detected: leftPunch || rightPunch,
         leftZ: landmarks[lArm[2]].z,
         rightZ: landmarks[rArm[2]].z, 
         leftArm: leftPunch,
         rightArm: rightPunch,
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

//         //console.log(`Left arm angle: ${lAngle.toFixed(1)}°, Right arm angle: ${rAngle.toFixed(1)}°`);
//     } catch (err) {
//         //console.log(`Error: ${err}`); 
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