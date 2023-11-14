import cv2
import mediapipe as mp
import time

mpPose = mp.solutions.pose
pose = mpPose.Pose()
mpDraw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
#cap = cv2.VideoCapture('a.mp4')
pTime = 0

while True:
    success, img = cap.read()
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(imgRGB)
    #print(results.pose_landmarks)

    '''
    if results.pose_landmarks:
        mpDraw.draw_landmarks(img, results.pose_landmarks, mpPose.POSE_CONNECTIONS)
    '''

    landmarks = results.pose_landmarks.landmark[11:17] + results.pose_landmarks.landmark[19:21]

    h, w,c = img.shape

    for id, lm in enumerate(landmarks):
 
        print(id, lm)
        cx, cy = int(lm.x*w), int(lm.y*h)
        cv2.circle(img, (cx, cy), 5, (255,0,0), cv2.FILLED)

    landmarks = results.pose_landmarks.landmark


    cv2.line(img, (int(landmarks[11].x*w), int(landmarks[11].y*h)), (int(landmarks[13].x*w), int(landmarks[13].y*h)), (255,0,0), 2)
    cv2.line(img, (int(landmarks[13].x*w), int(landmarks[13].y*h)), (int(landmarks[15].x*w), int(landmarks[15].y*h)), (255,0,0), 2)
    cv2.line(img, (int(landmarks[15].x*w), int(landmarks[15].y*h)), (int(landmarks[19].x*w), int(landmarks[19].y*h)), (255,0,0), 2)

    cv2.line(img, (int(landmarks[12].x*w), int(landmarks[12].y*h)), (int(landmarks[14].x*w), int(landmarks[14].y*h)), (255,0,0), 2)
    cv2.line(img, (int(landmarks[14].x*w), int(landmarks[14].y*h)), (int(landmarks[16].x*w), int(landmarks[16].y*h)), (255,0,0), 2)
    cv2.line(img, (int(landmarks[16].x*w), int(landmarks[16].y*h)), (int(landmarks[20].x*w), int(landmarks[20].y*h)), (255,0,0), 2)

    cTime = time.time()
    fps = 1/(cTime-pTime)
    pTime = cTime

    cv2.putText(img, str(int(fps)), (50,50), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0), 3)
    cv2.imshow("Image", img)

    if cv2.waitKey(1)==ord('q'):
        break

cv2.destroyAllWindows