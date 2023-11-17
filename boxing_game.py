import cv2
import mediapipe as mp
import time
import random
import numpy as np

class Target:
    def __init__(self, hand, x, y, radius): 
        self.hand = hand
        self.radius = radius
        self.x = x
        self.y = y
    
    def drawTarget(self, img, menu): 
        if (self.hand == 1 or self.hand == 2) and menu == -1: 
            color = [0, (0, 170, 255), (191, 191, 0)]
            cv2.circle(img, (self.x, self.y), self.radius, color[self.hand], cv2.FILLED)
            cv2.circle(img, (self.x, self.y), int(self.radius * 2 / 3), (255, 255, 255), cv2.FILLED)
            cv2.circle(img, (self.x, self.y), int(self.radius / 3), color[self.hand], cv2.FILLED)

        else: 
            text = ["Targets", "Reaction", "Camera", "exit", "vol"]

            xDev = 70
            yDev = 20

            if menu > 2: 
                xDev = 20
                yDev = 0


            cv2.circle(img, (self.x, self.y), self.radius, (255, 255, 255), 5)


            cv2.putText(img, text[menu], (self.x-xDev, self.y+yDev), cv2.FONT_HERSHEY_SIMPLEX,1, (255, 255, 255), 3)



def slope(land1, land2):
    # Calculate the slopes of the lines

    slope = (land2.y*h - land1.y*h) / abs(land2.x*w - land1.x*w)

    return round(slope, 2)

def createTarget(w, h):
    randHand = random.randint(1, 2)

    if randHand == 1: 
        randX = random.randint(w/2-100, w/2+500)
        randY = random.randint(300, h/2-200)
    else: 
        randX = random.randint(w/2-500, w/2+100)
        randY = random.randint(300, h/2-200)

    tar = Target(randHand, randX, randY, 150)

    return tar

mpPose = mp.solutions.pose
pose = mpPose.Pose()
mpDraw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

logo = cv2.imread("Logo.png", cv2.IMREAD_COLOR)
logo_h, logo_w, c = logo.shape

logo_h *= 2
logo_w *= 2

logo = cv2.resize(logo, (logo_w, logo_h))

pTime = 0

lPunches = 0
rPunches = 0

lState = ""
rState = ""

lPrevState = ""
rPrevState = ""

lTargetReset = True
rTargetReset = True

curTime = 0
startTime = time.time()

reactionTime = 0
delay = 0

h = 1080
w = 1920

score = 0

curTarget = createTarget(w, h)

lHandSize = 20
rHandSize = 20

lColour = (0, 170, 255)
rColour = (191, 191, 0)

lAfterPunchT = 0
rAfterPunchT = 0

scene = "camera"
prevScene = ""

opt_targets = Target(0, 800, 350, 150)
opt_reaction = Target(0, 1200, 350, 150)
opt_camera = Target(0, 1600, 350, 150)
opt_exit = Target(0, 1000, 100, 75)
opt_vol = Target(0, 1400, 100, 75)

inArea = True
inAreaTime = 0 
prevInArea = False

b1x = int(w/2 - 300)
b1y = int(h/3)

b2x = int(w/2 + 300)
b2y = h

menu_options = [opt_targets, opt_reaction, opt_camera, opt_exit, opt_vol]
menu_strings = ["targets", "reaction", "camera", "exit", "vol"]

#main loop
while True:
    inArea = True

    curTime = time.time()

    success, img = cap.read()

    img = cv2.resize(img, (w,h))
    img = cv2.flip(img, 1)

    imgPlayer = np.zeros((512,512,3), np.uint8)
    imgPlayer = cv2.resize(imgPlayer, (w,h))

    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(imgRGB)

    lm = results.pose_landmarks.landmark[11:17] + results.pose_landmarks.landmark[19:21]

    error = int(w / 15)


    for lm in lm:
 
        x, y = int(lm.x*w), int(lm.y*h)
        cv2.circle(img, (x, y), 15, (255,0,0), cv2.FILLED)

        if not (b1x < x < b2x and b1y < y < b2y): 
            inArea = False


    lm = results.pose_landmarks.landmark

    lShould = lm[12]
    lElb = lm[14]
    lWrist = lm[16]
    lInd = lm[20]

    rShould = lm[11]
    rElb = lm[13]
    rWrist = lm[15]
    rInd = lm[19]

    cv2.line(img, (int(lShould.x*w), int(lShould.y*h)), (int(lElb.x*w), int(lElb.y*h)), (255,0,0), 5)
    cv2.line(img, (int(lElb.x*w), int(lElb.y*h)), (int(lWrist.x*w), int(lWrist.y*h)), (255,0,0), 5)
    cv2.line(img, (int(lWrist.x*w), int(lWrist.y*h)), (int(lInd.x*w), int(lInd.y*h)), (255,0,0), 5)

    cv2.line(img, (int(rShould.x*w), int(rShould.y*h)), (int(rElb.x*w), int(rElb.y*h)), (255,0,0), 5)
    cv2.line(img, (int(rElb.x*w), int(rElb.y*h)), (int(rWrist.x*w), int(rWrist.y*h)), (255,0,0), 5)
    cv2.line(img, (int(rWrist.x*w), int(rWrist.y*h)), (int(rInd.x*w), int(rInd.y*h)), (255,0,0), 5)

    cTime = time.time()
    fps = 1/(cTime-pTime)
    pTime = cTime

    lSlope1 = slope(lShould, lElb)
    lSlope2 = slope(lElb, lWrist)

    rSlope1 = slope(rShould, rElb)
    rSlope2 = slope(rElb, rWrist)

    cv2.putText(imgPlayer, "fps: " + str(int(fps)), (50,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    '''
    cv2.putText(imgPlayer, "slope 1 left: " + str(lSlope1), (50,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255, 255, 255), 3)
    cv2.putText(imgPlayer, "slope 2 left: " + str(lSlope2), (50,150), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    cv2.putText(imgPlayer, "slope 1 right: " + str(rSlope1), (50,300), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    cv2.putText(imgPlayer, "slope 2 right: " + str(rSlope2), (50,350), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    '''

    if (abs(lSlope1 - lSlope2) < 1 or (abs(lShould.x*w - lElb.x*w) < error and abs(lShould.y*h - lElb.y*h) < error)) and lWrist.y*h <= 600: 
        lHandSize = 50
        lState = "punch"

        if scene == "menu": 
            for i, tar in enumerate(menu_options): 

                if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius and lTargetReset: 
                    if(curTime - lAfterPunchT > 0.3):
                        lColour = (0, 255, 0)
                        lTargetReset = False
                        lAfterPunchT = curTime
                        score += 1
                        
                        scene = menu_strings[i]


        elif scene == "targets": 
            if curTarget.hand == 1: 
                if curTarget.x - curTarget.radius < lInd.x*w < curTarget.x + curTarget.radius and curTarget.y - curTarget.radius < lInd.y*h < curTarget.y + curTarget.radius and lTargetReset and curTime - startTime < 30: 
                    
                    if(curTime - lAfterPunchT > 0.3):
                        curTarget = createTarget(w, h)
                        lColour = (0, 255, 0)
                        lTargetReset = False
                        lAfterPunchT = curTime
                        score += 1


    else: 
        lHandSize = 20
        lTargetReset = True
        lState = "none"

    if (abs(rSlope1 - rSlope2) < 1 or (abs(rShould.x*w - rElb.x*w) < error and abs(rShould.y*h - rElb.y*h) < error)) and rWrist.y*h <= 600: 
        rHandSize = 50
        rState = "punch"

        if scene == "menu": 
            for i, tar in enumerate(menu_options): 

                if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius and rTargetReset: 
                    
                    if(curTime - lAfterPunchT > 0.3):
                        rColour = (0, 255, 0)
                        rTargetReset = False
                        rAfterPunchT = curTime
                        score += 1
                    

                        scene = menu_strings[i]

        if curTarget.hand == 2: 
            if curTarget.x - curTarget.radius < rInd.x*w < curTarget.x + curTarget.radius and curTarget.y - curTarget.radius < rInd.y*h < curTarget.y + curTarget.radius and rTargetReset and curTime - startTime < 30: 
                
                if(curTime - lAfterPunchT > 0.3):
                    curTarget = createTarget(w, h)
                    rColour = (0, 255, 0)
                    rTargetReset = False
                    rAfterPunchT = curTime
                    score += 1

    else: 
        rHandSize = 20
        rTargetReset = True
        rState = "none"


    if(curTime - lAfterPunchT > 0.3): lColour = (0, 170, 255)
    if(curTime - rAfterPunchT > 0.3): rColour = (191, 191, 0)

    '''
    cv2.putText(imgPlayer, "left: " + lState, (1400,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    cv2.putText(imgPlayer, "right: " + rState, (1650,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    cv2.putText(imgPlayer, "punches: " + str(lPunches), (1400,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    cv2.putText(imgPlayer, "punches: " + str(rPunches), (1650,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    '''

    if lState == "punch" and lPrevState == "none": 

        if curTime > delay and delay != 0: 
            reactionTime = round(curTime - delay, 2)

        lPunches += 1

    if rState == "punch" and rPrevState == "none": 
        if curTime > delay and delay != 0: 
            reactionTime = round(curTime - delay, 2)

        rPunches += 1
    
    if scene == "targets": 
        curTarget.drawTarget(imgPlayer, -1)
        cv2.putText(imgPlayer, "score: " + str(score), (800,100), cv2.FONT_HERSHEY_SIMPLEX,3, (255,255,255), 3)
        cv2.putText(imgPlayer, "Time Remaining: " + str(max(round(30 - (curTime - startTime), 2), 0)) + "s", (1500, 300), cv2.FONT_HERSHEY_SIMPLEX,1, (255,255,255), 3)

    elif scene == "menu": 
        for i, tar in enumerate(menu_options):
            tar.drawTarget(imgPlayer, i)

        imgPlayer[100:100+logo_h, 30:30+logo_w, :] = logo
    elif scene == "reaction": 
        if scene != prevScene: 
            delay = round(time.time() + (random.random() * 5 + 1), 2)
        
        if reactionTime == 0: 

            if curTime < delay: 
                imgPlayer[:] = (0, 0, 255)
                cv2.putText(imgPlayer, "Wait", (800,600), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10)
            else: 
                imgPlayer[:] = (0, 255, 0)
                cv2.putText(imgPlayer, "Punch", (750,500), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10)

        else: 
            imgPlayer[:] = (255, 0, 0)
            cv2.putText(imgPlayer, str(reactionTime) + "s", (650,500), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10)
    
    elif scene == "camera": 

        if inArea: 

            if not prevInArea: 
                inAreaTime = time.time()

            col = (0, 255, 0)

        else: 

            inAreaTime = time.time()
            col = (0, 0, 255)

        cv2.putText(img, "place arms straight by your side", (470,100), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 5)
        cv2.putText(img, "move so that all blue points lie within the box", (200,200), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 5)
        img = cv2.rectangle(img, (b1x, b1y), (b2x, b2y), col, 5)

        if curTime - inAreaTime > 1: 
            scene = "menu"

        imgPlayer = img

    
    elif scene == "exit": 
        break

    elif scene == "volume": 
        pass


    #img = cv2.resize(img, (640, 360))

    #imgPlayer[720:1080, 0:640, :] = img
    if scene != "camera": 
        cv2.circle(imgPlayer, (int(lInd.x*w), int(lInd.y*h)), lHandSize, lColour, cv2.FILLED)
        cv2.circle(imgPlayer, (int(rInd.x*w), int(rInd.y*h)), rHandSize, rColour, cv2.FILLED)

    cv2.imshow("Image Player", imgPlayer)

    lPrevState = lState
    rPrevState = rState

    prevScene = scene
    prevInArea = inArea

    if cv2.waitKey(1)==ord('q'):
        break

cv2.destroyAllWindows()
