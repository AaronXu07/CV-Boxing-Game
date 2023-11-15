import cv2
import mediapipe as mp
import time
import math

mpPose = mp.solutions.pose
pose = mpPose.Pose()
mpDraw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
#cap = cv2.VideoCapture('a.mp4')
pTime = 0



def slope(land1, land2):
    # Calculate the slopes of the lines

    slope = (land2.y*h - land1.y*h) / abs(land2.x*w - land1.x*w)

    return round(slope, 2)


while True:
    success, img = cap.read()
    img = cv2.resize(img, (1920,1080))
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(imgRGB)
    #print(results.pose_landmarks)

    '''
    if results.pose_landmarks:
        mpDraw.draw_landmarks(img, results.pose_landmarks, mpPose.POSE_CONNECTIONS)
    '''

    lm = results.pose_landmarks.landmark[11:17] + results.pose_landmarks.landmark[19:21]

    h, w,c = img.shape
    error = int(w / 13)

    for id, lm in enumerate(lm):
 
        print(id, lm)
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

    cv2.putText(img, str(int(fps)), (50,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    cv2.putText(img, "slope 1 left: " + str(lSlope1), (50,100), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    cv2.putText(img, "slope 2 left: " + str(lSlope2), (50,150), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)


    cv2.putText(img, "slope 1 left: " + str(rSlope1), (50,300), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    cv2.putText(img, "slope 2 left: " + str(rSlope2), (50,350), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)

    if abs(lSlope1 - lSlope2) < 1 or (abs(lShould.x*w - lElb.x*w) < error and abs(lShould.y*h - lElb.y*h) < error): 
        cv2.putText(img, "left: punch", (200,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    else: 
        cv2.putText(img, "left: bent", (200,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)

    if abs(rSlope1 - rSlope2) < 1 or (abs(rShould.x*w - rElb.x*w) < error and abs(rShould.y*h - rElb.y*h) < error): 
        cv2.putText(img, "right: punch", (400,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    else: 
        cv2.putText(img, "right: bent", (400,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)

    cv2.imshow("Image", img)

    if cv2.waitKey(1)==ord('q'):
        break

cv2.destroyAllWindows
