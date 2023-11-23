# CV-Boxing-Game
Created for school stem hacks

## Inspiration
The inspiration behind our computer vision boxing game came from a desire to combine the excitement of gaming with the health benefits of exercise. We wanted to create an interactive and engaging experience that motivates users to stay active while having fun. We also wanted to create an accessible, and entertaining exercise tool / game which uses minimal equipment.

## Final Result
Our computer vision boxing game uses advanced image processing techniques to track the user's movements and translate them into in-game actions. Players can throw punches with each hand providing a dynamic boxing experience. There are sound effects and game modes to choose from. For example, the game mode "targets" spawns random targets across the screen in which the user must punch with their right hand, or left hand depending on the colour of the target. Their goal is to try to hit as many targets as possible before the time runs out. Another game mode "reaction" trains the user's reflexes by testing how fast they can react to an opportunity to punch.

## Building Process
We first brainstormed what exactly our boxing game was going to be like and came to the conclusion that there were two basic boxing techniques we could try to train: reflexes, and accuracy. As a result, we decided to make a reaction time game mode and a target punching accuracy based game mode. These were simple to learn for everyone yet fun to play. We then changed our scope to detecting the player's fists/punches with computer vision. Libraries we used include: OpenCV library for computer vision, Mediapipe library for pose detection, Python time library for timing-related functions, Python random library for generating random numbers, NumPy library for numerical operations and array processing, and lastly Pygame library for sound effects. We were able to detect an estimation of when the user punches based on the position of their arms and hands. Then we looked at the position of the player's hands detected by the camera to directly map the position to their hands into the game. With these inputs, we were able to make the basic, but effective and engaging games for the user.

## Challenges
One of the main challenges we faced was fine-tuning the computer vision algorithms to accurately and quickly track the user's movements. Having the computer detect the variants of motions occurring during a punch under different lighting conditions also posed challenges that required extensive testing and optimization to get consistent. Additionally, the code that placed the landmarks on the player's joints and arms would always cause the code to crash if it could not find them, or if the player stepped out of the frame. To combat this, we implemented a try and except function which stopped the program from crashing on this occurrence.

## Accomplishments 
We're proud of achieving a high level of accuracy in motion tracking, creating a responsive and realistic boxing experience. The overall user interface design has exceeded our initial expectations. In the end the game was much more enjoyable and effective than expected. The simplicity of the game made it easy to learn, and fun to play at any time. Our collaborative effort in overcoming technical challenges, and delivering a product providing fun exercises anywhere, was a significant accomplishment for our team.

## Learning Experience
Throughout the development process, we gained valuable insights into computer vision techniques, game development, and app development. We honed our problem-solving skills by addressing challenges related to motion tracking precision and optimizing performance. Additionally, we learned the importance of user experience design in creating a compelling and enjoyable fitness game.

## Next Steps for Punch Perfect
Looking ahead, we plan to enhance the game by adding more features such as multiplayer mode, customizable workouts, and additional boxing techniques such as dodging or blocking, and workout tracker. We also aim to integrate machine learning algorithms to adapt the game's difficulty based on the user's skill level and fitness goals. Moreover, we envision expanding the game to support different exercise routines, making it a versatile tool for fitness enthusiasts of all levels.
