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
    
    def drawTarget(self, img): 
        if self.hand == 1: 
            color = (255, 0, 0)
        else:
            color = (0, 0, 255)

        cv2.circle(img, (self.x, self.y), self.radius, color, 5)
        cv2.putText(img, str(self.hand), (self.x-50, self.y+40), cv2.FONT_HERSHEY_SIMPLEX,5, color, 3)

def slope(land1, land2):
    # Calculate the slopes of the lines

    slope = (land2.y*h - land1.y*h) / abs(land2.x*w - land1.x*w)

    return round(slope, 2)

def createTarget(w, h):
    randHand = random.randint(1, 2)

    if randHand == 1: 
        randX = random.randint(w/2-500, w/2+500)
        randY = random.randint(300, h/2-200)
    else: 
        randX = random.randint(w/2-500, w/2+500)
        randY = random.randint(300, h/2-200)

    tar = Target(randHand, randX, randY, 150)

    return tar

mpPose = mp.solutions.pose
pose = mpPose.Pose()
mpDraw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
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

h = 1080
w = 1920

score = 0

curTarget = createTarget(w, h)

lHandSize = 20
rHandSize = 20

#main loop
while True:

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

    for id, lm in enumerate(lm):
 
        cx, cy = int(lm.x*w), int(lm.y*h)
        cv2.circle(img, (cx, cy), 15, (255,0,0), cv2.FILLED)

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

    cv2.putText(imgPlayer, "slope 1 left: " + str(lSlope1), (50,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255, 255, 255), 3)
    cv2.putText(imgPlayer, "slope 2 left: " + str(lSlope2), (50,150), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    cv2.putText(imgPlayer, "slope 1 right: " + str(rSlope1), (50,300), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    cv2.putText(imgPlayer, "slope 2 right: " + str(rSlope2), (50,350), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    if (abs(lSlope1 - lSlope2) < 1 or (abs(lShould.x*w - lElb.x*w) < error and abs(lShould.y*h - lElb.y*h) < error)) and lWrist.y*h <= h/2: 
        lHandSize = 40
        lState = "punch"

        if curTarget.hand == 1: 
            if curTarget.x - curTarget.radius < lInd.x*w < curTarget.x + curTarget.radius and curTarget.y - curTarget.radius < lInd.y*h < curTarget.y + curTarget.radius and lTargetReset and curTime - startTime < 30: 
                curTarget = createTarget(w, h)
                lTargetReset = False
                score += 1

    else: 
        lHandSize = 20
        lTargetReset = True
        lState = "none"

    if (abs(rSlope1 - rSlope2) < 1 or (abs(rShould.x*w - rElb.x*w) < error and abs(rShould.y*h - rElb.y*h) < error)) and rWrist.y*h <= h/2: 
        rHandSize = 40
        rState = "punch"

        if curTarget.hand == 2: 
            if curTarget.x - curTarget.radius < rInd.x*w < curTarget.x + curTarget.radius and curTarget.y - curTarget.radius < rInd.y*h < curTarget.y + curTarget.radius and rTargetReset and curTime - startTime < 30: 
                curTarget = createTarget(w, h)
                rTargetReset = False
                score += 1
    else: 
        rHandSize = 20
        rTargetReset = True
        rState = "none"

    cv2.putText(imgPlayer, "left: " + lState, (1400,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    cv2.putText(imgPlayer, "right: " + rState, (1650,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    cv2.putText(imgPlayer, "punches: " + str(lPunches), (1400,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    cv2.putText(imgPlayer, "punches: " + str(rPunches), (1650,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    cv2.putText(imgPlayer, "score: " + str(score), (800,100), cv2.FONT_HERSHEY_SIMPLEX,3, (255,255,255), 3)

    cv2.putText(imgPlayer, "Time Remaining: " + str(max(round(30 - (curTime - startTime), 2), 0)) + "s", (1500, 300), cv2.FONT_HERSHEY_SIMPLEX,1, (255,255,255), 3)

    if lState == "punch" and lPrevState == "none": 
        lPunches += 1

    if rState == "punch" and rPrevState == "none": 
        rPunches += 1
    
    cv2.circle(imgPlayer, (int(lInd.x*w), int(lInd.y*h)), lHandSize, (255, 0, 0), cv2.FILLED)
    cv2.circle(imgPlayer, (int(rInd.x*w), int(rInd.y*h)), rHandSize, (0, 0, 255), cv2.FILLED)

    curTarget.drawTarget(imgPlayer)

    img = cv2.resize(img, (640, 360))

    imgPlayer[720:1080, 0:640, :] = img

    cv2.imshow("Image Player", imgPlayer)

    lPrevState = lState
    rPrevState = rState

    if cv2.waitKey(1)==ord('q'):
        break

cv2.destroyAllWindows()
