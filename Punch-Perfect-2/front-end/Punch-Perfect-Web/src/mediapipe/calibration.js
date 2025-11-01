import { lArm, rArm } from "./landmarks.js"; 

const winWidth = 1920;
const winHeight = 1080;

const calibration_box = {
    width: 600, 
    height: 700, 
}

const bounds = {
    left:(winWidth/2 - calibration_box.width/2)/winWidth,
    right:(winWidth/2 + calibration_box.width/2)/winWidth, 
    top:(winHeight - calibration_box.height)/winHeight, 
    bottom: winHeight/winHeight
}

export const checkBox = (ctx, landmarks) => {
    let within = true; 

    try {
        for (const lm of lArm) {
             if(!landmarks[lm]) {
                within = false; 
                break; 
            }

            if(landmarks[lm].x <= bounds.right && landmarks[lm].x >= bounds.left && landmarks[lm].y >= bounds.top && landmarks[lm].y <= bounds.bottom) {
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
                    break
                }

                if(landmarks[lm].x <= bounds.right && landmarks[lm].x >= bounds.left && landmarks[lm].y >= bounds.top && landmarks[lm].y <= bounds.bottom) {
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
    winHeight - calibration_box.height,
    calibration_box.width,
    calibration_box.height
    );
}