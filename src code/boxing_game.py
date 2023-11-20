import cv2
import mediapipe as mp
import time
import random
import numpy as np
import pygame

pygame.init()

class Target:
    def __init__(self, hand, x, y, radius): 
        self.hand = hand
        self.radius = radius
        self.x = x
        self.y = y
    
    def drawTarget(self, img, index, scene): 
        if scene == "targets": 
            color = [0, (0, 170, 255), (191, 191, 0)]
            cv2.circle(img, (self.x, self.y), self.radius, color[self.hand], cv2.FILLED) #draws outer circle of target
            cv2.circle(img, (self.x, self.y), int(self.radius * 2 / 3), (255, 255, 255), cv2.FILLED) # draws inner circle of target
            cv2.circle(img, (self.x, self.y), int(self.radius / 3), color[self.hand], cv2.FILLED) # draws most inner circle of target

        elif scene == "menu": 
            text = ["Targets", "Reaction", "Camera", " Exit", "Volume"]

            xDev = 70
            yDev = 20

            cv2.circle(img, (self.x, self.y), self.radius, (255, 255, 255), 5) #draws the targets for menu navigation
            cv2.putText(img, text[index], (self.x-xDev, self.y+yDev), cv2.FONT_HERSHEY_SIMPLEX, 1 , (255, 255, 255), 3) #draws the text inside each target
        
        elif scene == "end": 
            text = ["Retry", "Return to Menu"]

            if index == 0: 
                xDev = 40
            else: 
                xDev = 115
            
            yDev = 20

            cv2.circle(img, (self.x, self.y), self.radius, (255, 255, 255), 5) #draws the target for the 2 options after the targets and reaction modes are finished to either navigate back to menu or redo the current mode
            cv2.putText(img, text[index], (self.x-xDev, self.y+yDev), cv2.FONT_HERSHEY_SIMPLEX,1, (255, 255, 255), 2) #draws the text on each target

        elif scene == "volume":
            text = ["Increase", "   Decrease", "   Menu"]

            if index == 0: 
                xDev = 40
            else: 
                xDev = 115
            
            yDev = 20

            cv2.circle(img, (self.x, self.y), self.radius, (255, 255, 255), 5) #draws the target for the 2 options after the targets and reaction modes are finished to either navigate back to menu or redo the current mode
            cv2.putText(img, text[index], (self.x-xDev, self.y+yDev), cv2.FONT_HERSHEY_SIMPLEX,1, (255, 255, 255), 2) #draws the text on each target


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

logo_h += 150 #logo height
logo_w += 150 #logo width

logo = cv2.resize(logo, (logo_w, logo_h)) #image for logo

pTime = 0

lPunches = 0
rPunches = 0

lState = ""
rState = ""

lPrevState = lState
rPrevState = rState

lPrevStates = []
rPrevStates = []
sLength = 2

lTargetReset = True
rTargetReset = True

curTime = 0
startTime = -1

reactionTime = 0
delay = 0

h = 1080
w = 1920

score = 0

curTarget = createTarget(w, h)

lHandSize = 20
rHandSize = 20

#colour of the left and right hands
lColour = (0, 170, 255)
rColour = (191, 191, 0)

lAfterPunchT = 0
rAfterPunchT = 0

scene = "camera"
prevScene = ""

inArea = True
inAreaTime = 0 
prevInArea = False

b1x = int(w/2 - 300)
b1y = int(h/3)

b2x = int(w/2 + 300)
b2y = h

rad1 = 120
rad2 = 80

#target objects for the options in the main menu, second and third arguments are the x and y coordinates and the fourth is the radius
opt_targets = Target(0, 350, 400, rad1)
opt_reaction = Target(0, 650, 400, rad1)
opt_camera = Target(0, 950, 400, rad1)
opt_vol = Target(0, 1250, 400, rad1)
opt_exit = Target(0, 1550, 400, rad1)


menu_options = [opt_targets, opt_reaction, opt_camera, opt_exit, opt_vol]
menu_strings = ["targets", "reaction", "camera", "exit", "volume"]
menu_hover_l = [False, False, False, False, False]
menu_hover_r = [False, False, False, False, False]

isHover = False
previsHover = False

hoverI = 0

#target objects for the options in the menu after reaction and targets modes are finished
opt_replay = Target(0, int(w/2 - 300), 500, rad1+30)
opt_return = Target(0, int(w/2 + 300), 500, rad1+30)

end_options = [opt_replay, opt_return]
end_hover_l = [False, False]
end_hover_r = [False, False]

opt_delay = -1

isTooEarly = False

curVol = 5

#SOUND EFFECTS
checkCameraSound = pygame.mixer.Sound("positivebeep-sfx.mp3")
hoverSound = pygame.mixer.Sound("hover-sfx.mp3")
punchSound = pygame.mixer.Sound("punch-sfx.mp3")
targetSound = pygame.mixer.Sound("targetbreak.mp3")

volColours = [(0, 0, 0), (0, 0, 0), (0, 0, 0), (0, 0, 0), (0, 0, 0), (0, 0, 0), (0, 0, 0), (0, 0, 0), (0, 0, 0), (0, 0, 0)]

opt_increase = Target(0, 550, 450, rad1)
opt_decrease = Target(0, 950, 450, rad1)
opt_return = Target(0, 1300, 450, rad1)

vol_options = [opt_increase, opt_decrease, opt_return]
vol_strings = ["+", "-", "Menu"]
vol_hover_l = [False, False, False]
vol_hover_r = [False, False, False]

landDetected = True

#main loop
while True:

    landDetected = True

    inArea = True

    curTime = time.time()

    success, img = cap.read()

    img = cv2.resize(img, (w,h))
    img = cv2.flip(img, 1)

    imgPlayer = np.zeros((512,512,3), np.uint8)
    imgPlayer = cv2.resize(imgPlayer, (w,h))

    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(imgRGB)

    try: 
        lm = results.pose_landmarks.landmark[11:17] + results.pose_landmarks.landmark[19:21]
    except: 
        landDetected = False

    if landDetected: 
        error = int(w / 13)

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

        #SET VOLUME
        checkCameraSound.set_volume(curVol/10)
        punchSound.set_volume(curVol/10)
        hoverSound.set_volume(curVol/10)
        targetSound.set_volume(curVol/10)

        #shows user their fps
        cv2.putText(imgPlayer, "fps: " + str(int(fps)), (50,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

        '''
        cv2.putText(imgPlayer, "slope 1 left: " + str(lSlope1), (50,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255, 255, 255), 3)
        cv2.putText(imgPlayer, "slope 2 left: " + str(lSlope2), (50,150), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

        cv2.putText(imgPlayer, "slope 1 right: " + str(rSlope1), (50,300), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
        cv2.putText(imgPlayer, "slope 2 right: " + str(rSlope2), (50,350), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
        '''

        if (abs(lSlope1 - lSlope2) < 1 or (abs(lShould.x*w - lElb.x*w) < error and abs(lShould.y*h - lElb.y*h) < error)) and lWrist.y*h <= 600: 
            lPrevStates.append("punch")
        else: 
            lPrevStates.append("none")
        
        if len(lPrevStates) > sLength: 
            lPrevStates.pop(0)

        if lPrevStates.count("punch") == len(lPrevStates): 
            lState = "punch"

        else: 
            lState = "none"

        if lPrevState == "none" and lState == "punch" and scene != "camera": 
            pygame.mixer.Sound.play(punchSound)

        if lState == "punch": 
            lHandSize = 50

            if scene == "menu": 
                for i, tar in enumerate(menu_options): 

                    if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius and lTargetReset: 
                        if(curTime - lAfterPunchT > 0.3):
                            lColour = (0, 255, 0)
                            lTargetReset = False
                            lAfterPunchT = curTime
                            
                            scene = menu_strings[i]


            elif scene == "targets": 

                if startTime == -1: 
                    startTime = time.time()

                if curTarget.hand == 1: 
                    if curTarget.x - curTarget.radius < lInd.x*w < curTarget.x + curTarget.radius and curTarget.y - curTarget.radius < lInd.y*h < curTarget.y + curTarget.radius and lTargetReset and curTime - startTime < 30: 
                        
                        if(curTime - lAfterPunchT > 0.3):
                            curTarget = createTarget(w, h)
                            lColour = (0, 255, 0)
                            lTargetReset = False
                            lAfterPunchT = curTime
                            pygame.mixer.Sound.play(targetSound)
                            score += 1
                    
                    if curTime - startTime > 30: 
                        if opt_delay == -1: 
                            opt_delay = time.time()
                        if curTime - opt_delay > 0.5: 
                            for i, tar in enumerate(end_options): 

                                if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius and lTargetReset: 
                                    if(curTime - lAfterPunchT > 0.3):
                                        lColour = (0, 255, 0)
                                        lTargetReset = False
                                        lAfterPunchT = curTime
                                        
                                        score = 0 
                                        startTime = -1 
                                        opt_delay = -1

                                        if i == 1: 
                                            scene = "menu"
            
            elif scene == "reaction" and reactionTime != 0: 
                for i, tar in enumerate(end_options): 

                    if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius and lTargetReset: 
                        if(curTime - lAfterPunchT > 0.3):
                            lColour = (0, 255, 0)
                            lTargetReset = False
                            lAfterPunchT = curTime
                            
                            if i == 0: 
                                prevScene = ""
                                reactionTime = 0
                            
                            else: 
                                reactionTime = 0
                                scene = "menu"


            elif scene == "volume": 
                for i, tar in enumerate(vol_options): 

                    if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius and lTargetReset: 
                        if(curTime - lAfterPunchT > 0.3):
                            lColour = (0, 255, 0)
                            lTargetReset = False
                            lAfterPunchT = curTime
                            
                            if lPrevState == "none" and lState == "punch":
                                if vol_strings[i] == "+" and curVol < 10:
                                    curVol+=1
                            
                                if vol_strings[i] == "-" and curVol > 0:
                                    curVol-=1
                            
                                if vol_strings[i] == "Menu" and curVol > 0:
                                    scene = "menu"
                            

        else: 
            lHandSize = 20
            lTargetReset = True

            if scene == "menu": 
                for i, tar in enumerate(menu_options): 

                    if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius: 
                        menu_hover_l[i] = True

                    else:
                        menu_hover_l[i] = False

            if scene == "volume": 
                for i, tar in enumerate(vol_options): 

                    if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius: 
                        vol_hover_l[i] = True

                    else:
                        vol_hover_l[i] = False

            if scene == "targets": 
                for i, tar in enumerate(end_options): 

                    if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius: 
                        end_hover_l[i] = True

                    else:
                        end_hover_l[i] = False

            if scene == "reaction": 
                for i, tar in enumerate(end_options): 

                    if tar.x - tar.radius < lInd.x*w < tar.x + tar.radius and tar.y - tar.radius < lInd.y*h < tar.y + tar.radius: 
                        end_hover_l[i] = True

                    else:
                        end_hover_l[i] = False


        if (abs(rSlope1 - rSlope2) < 1 or (abs(rShould.x*w - rElb.x*w) < error and abs(rShould.y*h - rElb.y*h) < error)) and rWrist.y*h <= 600: 
            rPrevStates.append("punch")
        else: 
            rPrevStates.append("none")
        
        if len(rPrevStates) > sLength: 
            rPrevStates.pop(0)

        if rPrevStates.count("punch") == len(rPrevStates): 
            rState = "punch"

        elif rPrevStates.count("none") == len(rPrevStates): 
            rState = "none"

        if rPrevState == "none" and rState == "punch" and scene!="camera":
            pygame.mixer.Sound.play(punchSound)

        if rState == "punch": 
            rHandSize = 50

            if scene == "menu": 
                for i, tar in enumerate(menu_options): 

                    if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius and rTargetReset: 
                        
                        if(curTime - lAfterPunchT > 0.3):
                            rColour = (0, 255, 0)
                            rTargetReset = False
                            rAfterPunchT = curTime
                        
                            scene = menu_strings[i]

            elif scene == "targets": 

                if startTime == -1: 
                    startTime = time.time()

                if curTarget.hand == 2: 
                    if curTarget.x - curTarget.radius < rInd.x*w < curTarget.x + curTarget.radius and curTarget.y - curTarget.radius < rInd.y*h < curTarget.y + curTarget.radius and rTargetReset and curTime - startTime < 30: 
                        
                        if(curTime - lAfterPunchT > 0.3):
                            curTarget = createTarget(w, h)
                            rColour = (0, 255, 0)
                            rTargetReset = False
                            rAfterPunchT = curTime
                            pygame.mixer.Sound.play(targetSound)
                            score += 1

                if curTime - startTime > 30: 

                    if opt_delay == -1: 
                        opt_delay = time.time()

                    if curTime - opt_delay > 0.5: 
                        for i, tar in enumerate(end_options): 

                            if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius and rTargetReset: 
                                if(curTime - lAfterPunchT > 0.3):
                                    rColour = (0, 255, 0)
                                    rTargetReset = False
                                    rAfterPunchT = curTime

                                    score = 0 
                                    startTime = -1 
                                    opt_delay = -1

                                    if i == 1: 
                                        scene = "menu"
                
            elif scene == "reaction" and reactionTime != 0: 
                for i, tar in enumerate(end_options): 

                    if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius and rTargetReset: 
                        if(curTime - lAfterPunchT > 0.3):
                            rColour = (0, 255, 0)
                            rTargetReset = False
                            rAfterPunchT = curTime
                            
                            if i == 0: 
                                prevScene = ""
                                reactionTime = 0
                            
                            else: 
                                reactionTime = 0
                                scene = "menu"
                
                #delay = curTime + 1

            elif scene == "volume": 
                for i, tar in enumerate(vol_options): 

                    if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius and rTargetReset: 
                        if(curTime - rAfterPunchT > 0.3):
                            rColour = (0, 255, 0)
                            rTargetReset = False
                            rAfterPunchT = curTime
                            
                            if rPrevState == "none" and rState == "punch":
                                if vol_strings[i] == "+" and curVol < 10:
                                    curVol+=1
                            
                                if vol_strings[i] == "-" and curVol > 0:
                                    curVol-=1
                            
                                if vol_strings[i] == "Menu" and curVol > 0:
                                    scene = "menu"

        else: 
            rHandSize = 20
            rTargetReset = True

            if scene == "menu": 
                for i, tar in enumerate(menu_options): 

                    if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius: 
                        menu_hover_r[i] = True  
                    else:
                        menu_hover_r[i] = False
            
            if scene == "volume": 
                for i, tar in enumerate(vol_options): 

                    if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius: 
                        vol_hover_r[i] = True

                    else:
                        vol_hover_r[i] = False

            if scene == "targets": 
                for i, tar in enumerate(end_options): 

                    if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius: 
                        end_hover_r[i] = True

                    else:
                        end_hover_r[i] = False

            if scene == "reaction": 
                for i, tar in enumerate(end_options): 

                    if tar.x - tar.radius < rInd.x*w < tar.x + tar.radius and tar.y - tar.radius < rInd.y*h < tar.y + tar.radius: 
                        end_hover_r[i] = True

                    else:
                        end_hover_r[i] = False
                        
        if(curTime - lAfterPunchT > 0.3): lColour = (0, 170, 255)
        if(curTime - rAfterPunchT > 0.3): rColour = (191, 191, 0)

        '''
        cv2.putText(imgPlayer, "left: " + lState, (1400,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
        cv2.putText(imgPlayer, "right: " + rState, (1650,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

        cv2.putText(imgPlayer, "punches: " + str(lPunches), (1400,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)
        cv2.putText(imgPlayer, "punches: " + str(rPunches), (1650,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255), 3)

        if lState == "punch" and lPrevState == "none": 

            if curTime > delay and delay != 0 and reactionTime == 0 and scene == "reaction": 
                reactionTime = round(curTime - delay, 2)

            lPunches += 1

        if rState == "punch" and rPrevState == "none": 
            if curTime > delay and delay != 0 and reactionTime == 0 and scene == "reaction": 
                reactionTime = round(curTime - delay, 2)

            rPunches += 1
        '''
        
        if scene == "targets": 

            if curTime - startTime > 30 and startTime != -1: 

                imgPlayer[:] = (0, 0, 0)

                cv2.putText(imgPlayer, "score: " + str(score), (650,150), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10) #shows user their final score after 30 seconds has finished

                for i, tar in enumerate(end_options):
                    rad = rad1+30

                    if end_hover_l[i] or end_hover_r[i]:
                        tar.radius = rad + 10
                        hoverI = i
                    else: 
                        tar.radius = rad

                    tar.drawTarget(imgPlayer, i, "end") #draws each target in the main menu screen

                if(end_hover_l[hoverI] or end_hover_r[hoverI]):
                    isHover = True
                else:
                    isHover = False
                
                if(not previsHover and isHover):
                    pygame.mixer.Sound.play(hoverSound)

            else: 
                curTarget.drawTarget(imgPlayer, -1, "targets") #draws the current target the user needs to hit
                cv2.putText(imgPlayer, "score: " + str(score), (750,80), cv2.FONT_HERSHEY_SIMPLEX,3, (255,255,255), 5) #shows the current score while the user is playing
                cv2.putText(imgPlayer, "Time Remaining: " + str(max(round(30 - (curTime - startTime), 2), 0)) + "s", (1500, 50), cv2.FONT_HERSHEY_SIMPLEX,1, (255,255,255), 3) #shows how much time the user has left


        elif scene == "menu": 

            imgPlayer[600:600+logo_h, 750:750+logo_w, :] = logo # draws logo on screen

            for i, tar in enumerate(menu_options):
                if i <= 4: 
                    rad = rad1
                else:
                    rad = rad2

                if menu_hover_l[i] or menu_hover_r[i]:
                    tar.radius = rad + 10
                    hoverI = i
                else: 
                    tar.radius = rad

                tar.drawTarget(imgPlayer, i, "menu") #draws each target in the main menu screen

            if(menu_hover_l[hoverI] or menu_hover_r[hoverI]):
                isHover = True
            else:
                isHover = False
            
            if(not previsHover and isHover):
                pygame.mixer.Sound.play(hoverSound)

            


        elif scene == "reaction": 

            if scene != prevScene: 
                delay = round(time.time() + (random.random() * 5 + 1), 2)

            if isTooEarly:
                curTime = 0
                
                if lPrevState == "none" and lState == "punch":
                    delay = round(time.time() + (random.random() * 5 + 2), 2)
                    isTooEarly = False

                if rPrevState == "none" and rState == "punch":
                    delay = round(time.time() + (random.random() * 5 + 2), 2)
                    isTooEarly = False

            if reactionTime == 0: 

                if curTime < delay: 
                    
                    if not isTooEarly and curTime > 1 and prevScene == "reaction":
                        if lState == "punch" and lPrevState == "none":
                            isTooEarly = True

                        if rState == "punch" and rPrevState == "none":
                            isTooEarly = True

                    if not isTooEarly:
                        imgPlayer[:] = (0, 0, 255) #turns whole screen red
                        cv2.putText(imgPlayer, "Wait", (800,600), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10) #draws wait

                    else:
                        imgPlayer[:] = (255, 0, 0) #blue screen (too soon)
                        cv2.putText(imgPlayer, "Too Soon!", (600,500), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10) #draws wait
                        cv2.putText(imgPlayer, "Punch anywhere to try again.", (300,700), cv2.FONT_HERSHEY_SIMPLEX, 3, (255,255,255), 10)
                
                else: 
                    imgPlayer[:] = (0, 255, 0) #turns whole screen green
                    cv2.putText(imgPlayer, "Punch", (750,500), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10) #draws punch
        
            else: 
                imgPlayer[:] = (255, 0, 0) #turns whole screen blue
                cv2.putText(imgPlayer, str(reactionTime) + "s", (720,150), cv2.FONT_HERSHEY_SIMPLEX,5, (255,255,255), 10) #shows user their reaction time
                
                for i, tar in enumerate(end_options):
                    rad = rad1+30

                    if end_hover_l[i] or end_hover_r[i]:
                        tar.radius = rad + 10
                        hoverI = i
                    else: 
                        tar.radius = rad

                    tar.drawTarget(imgPlayer, i, "end") #draws each target in the main menu screen

                if(end_hover_l[hoverI] or end_hover_r[hoverI]):
                    isHover = True
                else:
                    isHover = False
                
                if(not previsHover and isHover):
                    pygame.mixer.Sound.play(hoverSound)

        
        elif scene == "camera": 

            if inArea: 

                if not prevInArea: 
                    inAreaTime = time.time()

                col = (0, 255, 0)

            else: 

                inAreaTime = time.time()
                col = (0, 0, 255)

            if prevScene != "camera":
                if inArea: 
                    inAreaTime = time.time()
                    col = (0, 255, 0)

            cv2.putText(img, "place arms straight by your side", (470,100), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 5) #draws instructions
            cv2.putText(img, "move so that all blue points lie within the box", (200,200), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 5) #draws instructions
            img = cv2.rectangle(img, (b1x, b1y), (b2x, b2y), col, 5) # draws the rectangle the user needs to be within

            if curTime - inAreaTime > 1: 
                pygame.mixer.Sound.play(checkCameraSound)
                scene = "menu"

            imgPlayer = img

        if lState == "punch" and lPrevState == "none": 

            if curTime > delay and delay != 0 and reactionTime == 0 and scene == "reaction": 
                reactionTime = round(curTime - delay, 2)
                lTargetReset = False

            lPunches += 1

        if rState == "punch" and rPrevState == "none": 
            if curTime > delay and delay != 0 and reactionTime == 0 and scene == "reaction": 
                reactionTime = round(curTime - delay, 2)
                rTargetReset = False

            rPunches += 1
        
        elif scene == "exit": 
            break

        elif scene == "volume": 
            
            for i, tar in enumerate(vol_options):
                if i <= 4: 
                    rad = rad1
                else:
                    rad = rad2

                if vol_hover_l[i] or vol_hover_r[i]:
                    tar.radius = rad + 10
                    hoverI = i
                else: 
                    tar.radius = rad

                tar.drawTarget(imgPlayer, i, "volume") #draws each target in the main menu screen

            if(vol_hover_l[hoverI] or vol_hover_r[hoverI]):
                isHover = True
            else:
                isHover = False
            
            if(not previsHover and isHover):
                pygame.mixer.Sound.play(hoverSound)


            cv2.rectangle(imgPlayer, (640,680), (1270, 770), (255, 255, 255), 3)


            for i in range(curVol):
                volColours[i] = (255, 255, 255)

            for i in range(10-curVol):
                volColours[i+curVol] = (0, 0, 0)


            cv2.rectangle(imgPlayer, (660,700), (710, 750), volColours[0], -1)
            cv2.rectangle(imgPlayer, (720,700), (770, 750), volColours[1], -1)
            cv2.rectangle(imgPlayer, (780,700), (830, 750), volColours[2], -1)
            cv2.rectangle(imgPlayer, (840,700), (890, 750), volColours[3], -1)
            cv2.rectangle(imgPlayer, (900,700), (950, 750), volColours[4], -1)
            cv2.rectangle(imgPlayer, (960,700), (1010, 750), volColours[5], -1)
            cv2.rectangle(imgPlayer, (1020,700), (1070, 750), volColours[6], -1)
            cv2.rectangle(imgPlayer, (1080,700), (1130, 750), volColours[7], -1)
            cv2.rectangle(imgPlayer, (1140,700), (1190, 750), volColours[8], -1)
            cv2.rectangle(imgPlayer, (1200,700), (1250, 750), volColours[9], -1)
            
            
        #img = cv2.resize(img, (640, 360))

        #imgPlayer[720:1080, 0:640, :] = img
        
        if scene != "camera": 
            #draws the circles representing the players hands
            cv2.circle(imgPlayer, (int(lInd.x*w), int(lInd.y*h)), lHandSize, lColour, cv2.FILLED)
            cv2.circle(imgPlayer, (int(rInd.x*w), int(rInd.y*h)), rHandSize, rColour, cv2.FILLED)
    
    else: 
        cv2.putText(img, "place arms straight by your side", (470,100), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 5) #draws instructions
        cv2.putText(img, "move so that all blue points lie within the box", (200,200), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 5) #draws instructions
        img = cv2.rectangle(img, (b1x, b1y), (b2x, b2y), (0, 0, 255), 5) # draws the rectangle the user needs to be within

        imgPlayer = img

    #draw the image
    cv2.imshow("Image Player", imgPlayer)

    lPrevState = lState
    rPrevState = rState

    prevScene = scene
    prevInArea = inArea

    previsHover = isHover

    if cv2.waitKey(1)==ord('q'):
        break

cv2.destroyAllWindows()
