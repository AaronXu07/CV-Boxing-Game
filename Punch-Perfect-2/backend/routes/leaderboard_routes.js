import express from 'express';
import verifyToken from '../middleware/auth.js'; 
import { getLeaderboard, getRank } from '../controllers/leaderboard_controller.js'

const router = express.Router(); 

//get leaderboard for a specific game mode
router.get('/:gamemodeId', getLeaderboard)

//get leaderboard for a specific game mode
router.get('/:gamemodeId/me', verifyToken, getRank)

export default router;