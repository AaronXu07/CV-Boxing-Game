import express from 'express';
import verifyToken from '../middleware/auth.js'; 
import { submitScore, getUserHighscores, getUserScores } from '../controllers/scores_controller.js'
const router = express.Router(); 

router.use(verifyToken);

//input new score
router.post('/', submitScore);

//get highscores for all gamemodes for a user
router.get('/highscores', getUserHighscores);

//get all the scores for a user
router.get('/me', getUserScores); 

export default router;