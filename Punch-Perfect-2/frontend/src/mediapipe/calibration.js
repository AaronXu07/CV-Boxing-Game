import { lArm, rArm } from "./landmarks.js"; 

const winWidth = 1920;
const winHeight = 1080;

const calibration_box = {
    width: 600, 
    height: 400, 
    from_top: 280, 
}

const bounds = {
    left:(winWidth/2 - calibration_box.width/2)/winWidth,
    right:(winWidth/2 + calibration_box.width/2)/winWidth, 
    top: calibration_box.from_top/winHeight, 
    bottom: (calibration_box.from_top + calibration_box.height)/winHeight
}

const bounds_game = {
    left:bounds.left-0.1,
    right:bounds.right+0.1,
    top:bounds.top-0.1, 
    bottom:bounds.bottom+0.1, 
}

const lWithin = (lm, landmarks, bounds) => {
    return landmarks[lm].x <= bounds.right && landmarks[lm].x >= bounds.left && landmarks[lm].y >= bounds.top && landmarks[lm].y <= bounds.bottom; 
}

export const checkShould = (landmarks) => {
    let within = false; 

    try {
        if(landmarks[lArm[0]] && landmarks[rArm[0]]) {
            if(lWithin(lArm[0], landmarks, bounds_game) && lWithin(rArm[0], landmarks, bounds_game)) {
                within = true; 
            } 
        }

        
    } catch(err) {
        console.log(err); 
    }

    return within; 
}

export const checkBox = (ctx, landmarks) => {
    let within = false; 

    try {
        for (const lm of lArm) {
             if(!landmarks[lm]) {
                within = false; 
                break; 
            }

            if(lWithin(lm, landmarks, bounds)) {
                within = true; 
            } else {
                within = false; 
                //console.log("not within:", lm); 
                break; 
            }
        }

        if(within) {
            for (const lm of rArm) {
                if(!landmarks[lm]) {
                    within = false; 
                    break;
                }

                if(lWithin(lm, landmarks, bounds)) {
                    within = true; 
                } else {
                    within = false; 
                    //console.log("not within:", lm);
                    break; 
                }
            }
        } 

        
    } catch(err) {
        console.log(err); 
    }

    if(within) {
        drawBox(ctx, "green"); 
        return true; 
    } else {
        drawBox(ctx, "red"); 
        return false; 
    }
}

export const drawBox = (ctx, colour) => {
    ctx.strokeStyle = colour;  // outline color
    ctx.lineWidth = 7;        // optional: outline thickness
    ctx.strokeRect(
    winWidth / 2 - calibration_box.width / 2,
    calibration_box.from_top,
    calibration_box.width,
    calibration_box.height
    );
}