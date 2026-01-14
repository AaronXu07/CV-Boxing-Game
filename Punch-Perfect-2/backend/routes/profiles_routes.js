import express from 'express';
import verifyToken from '../middleware/auth.js';
import { submitUsername, getUsername } from '../controllers/profiles_controller.js'

const router = express.Router(); 

router.use(verifyToken); 

// get username for specific userid
router.get('/username', getUsername);

// submit a username for a user
router.post('/username', submitUsername); 



export default router;