import cv2
import mediapipe as mp
import time
import random
import numpy as np

class Target:
    def __init__(self, hand, x, y, width): 
        self.hand = hand
        self.width = width
        self.x = x
        self.y = y
    
    def drawTarget(self, img): 

        cv2.circle(img, (self.x, self.y), self.width, (0,0,255), 5)
        cv2.putText(img, str(self.hand), (self.x, self.y), cv2.FONT_HERSHEY_SIMPLEX,1, (0,0,255), 3)

def slope(land1, land2):
    # Calculate the slopes of the lines

    slope = (land2.y*h - land1.y*h) / abs(land2.x*w - land1.x*w)

    return round(slope, 2)

def createTarget(w, h):
    randHand = random.randint(1, 2)

    if randHand == 1: 
        randX = random.randint(w/2-300, w/2+300)
        randY = random.randint(300, h/2-200)
    else: 
        randX = random.randint(w/2-300, w/2+300)
        randY = random.randint(300, h/2-200)

    tar = Target(randHand, randX, randY, 200)

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

h = 1080
w = 1920

score = 0

curTarget = createTarget(w, h)

while True:

    success, img = cap.read()
    img = cv2.resize(img, (w,h))
    imgPlayer = np.zeros((512,512,3), np.uint8)
    imgPlayer = cv2.resize(imgPlayer, (w,h))
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(imgRGB)

    lm = results.pose_landmarks.landmark[11:17] + results.pose_landmarks.landmark[19:21]

    error = int(w / 10)

    for id, lm in enumerate(lm):
 
        cx, cy = int(lm.x*w), int(lm.y*h)
        cv2.circle(img, (cx, cy), 5, (255,0,0), cv2.FILLED)

    lm = results.pose_landmarks.landmark

    lShould = lm[11]
    lElb = lm[13]
    lWrist = lm[15]
    lInd = lm[19]

    rShould = lm[12]
    rElb = lm[14]
    rWrist = lm[16]
    rInd = lm[20]

    cv2.line(img, (int(lShould.x*w), int(lShould.y*h)), (int(lElb.x*w), int(lElb.y*h)), (255,0,0), 2)
    cv2.line(img, (int(lElb.x*w), int(lElb.y*h)), (int(lWrist.x*w), int(lWrist.y*h)), (255,0,0), 2)
    cv2.line(img, (int(lWrist.x*w), int(lWrist.y*h)), (int(lInd.x*w), int(lInd.y*h)), (255,0,0), 2)

    cv2.line(img, (int(rShould.x*w), int(rShould.y*h)), (int(rElb.x*w), int(rElb.y*h)), (255,0,0), 2)
    cv2.line(img, (int(rElb.x*w), int(rElb.y*h)), (int(rWrist.x*w), int(rWrist.y*h)), (255,0,0), 2)
    cv2.line(img, (int(rWrist.x*w), int(rWrist.y*h)), (int(rInd.x*w), int(rInd.y*h)), (255,0,0), 2)

    cTime = time.time()
    fps = 1/(cTime-pTime)
    pTime = cTime

    lSlope1 = slope(lShould, lElb)
    lSlope2 = slope(lElb, lWrist)

    rSlope1 = slope(rShould, rElb)
    rSlope2 = slope(rElb, rWrist)

    cv2.putText(img, "fps: " + str(int(fps)), (50,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    cv2.putText(img, "slope 1 left: " + str(lSlope1), (50,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255, 255, 255), 3)
    cv2.putText(img, "slope 2 left: " + str(lSlope2), (50,150), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    cv2.putText(img, "slope 1 right: " + str(rSlope1), (50,300), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
    cv2.putText(img, "slope 2 right: " + str(rSlope2), (50,350), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

    if (abs(lSlope1 - lSlope2) < 1 or (abs(lShould.x*w - lElb.x*w) < error and abs(lShould.y*h - lElb.y*h) < error)) and lWrist.y*h <= h/2: 
        lState = "punch"

        if curTarget.hand == 1: 
            if curTarget.x - curTarget.width/2 < lInd.x*w < curTarget.x + curTarget.width/2 and lTargetReset: 
                curTarget = createTarget(w, h)
                lTargetReset = False
                score += 1

    else: 
        lTargetReset = True
        lState = "none"

    if (abs(rSlope1 - rSlope2) < 1 or (abs(rShould.x*w - rElb.x*w) < error and abs(rShould.y*h - rElb.y*h) < error)) and rWrist.y*h <= h/2: 
        rState = "punch"

        if curTarget.hand == 2: 
            if curTarget.x - curTarget.width/2 < rInd.x*w < curTarget.x + curTarget.width/2 and rTargetReset: 
                curTarget = createTarget(w, h)
                rTargetReset = False
                score += 1
    else: 
        rTargetReset = True
        rState = "none"

    cv2.putText(img, "left: " + lState, (1400,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    cv2.putText(img, "right: " + rState, (1650,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)

    cv2.putText(img, "punches: " + str(lPunches), (1400,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    cv2.putText(img, "punches: " + str(rPunches), (1650,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)

    cv2.putText(img, "score: " + str(score), (800,100), cv2.FONT_HERSHEY_SIMPLEX,3, (255,255,255), 3)

    if lState == "punch" and lPrevState == "none": 
        cv2.circle(imgPlayer, (int(lInd.x*w), int(lInd.y*h)), 50, (255,255,255), cv2.FILLED)
        lPunches += 1

    if rState == "punch" and rPrevState == "none": 
        rPunches += 1
    
    cv2.circle(imgPlayer, (int(lInd.x*w), int(lInd.y*h)), 50, (255, 0, 0), cv2.FILLED)
    cv2.circle(imgPlayer, (int(rInd.x*w), int(rInd.y*h)), 50, (0, 0, 255), cv2.FILLED)

    imgPlayer = cv2.flip(imgPlayer, 1)

    curTarget.drawTarget(img)

    cv2.imshow("Image", img)
    cv2.imshow("Image Player", imgPlayer)

    lPrevState = lState
    rPrevState = rState

    if cv2.waitKey(1)==ord('q'):
        break

cv2.destroyAllWindows()
