import express from 'express';
import supabase from '../config/supabase.js';
const router = express.Router(); 

//verify user token from frontend
const verifyToken = async (req, res, next) => {
    console.log("attempted to verify"); 
    try {
         
        const token = req.headers.authorization?.replace('Bearer ', '');

        if(!token){
            return res.status(401).json({error: 'No token provided'});
        }
        console.log('has token'); 
        const {data: {user}, error } = await supabase.auth.getUser(token);

        if(error || !user){
            return res.status(401).json({error: 'Invalid token'});
        }

        req.user = user;
        next();
    }
    catch(error){
        res.status(401).json({error: 'Authentication failed'});
    }
}

router.use(verifyToken);

//input new score
router.post('/', async(req, res) => {
    try{
        const{gamemode_id, score} = req.body;
        const userId = req.user.id;
    
    
        if(!gamemode_id || score === undefined){
            return res.status(400).json({error: 'Missing required fields'});
        }

        const validGamemodes = [19587430, 48392017, 76015482];
        if(!validGamemodes.includes(gamemode_id)){
            return res.status(400).json({error: 'Invalid gamemode'});
        }

        const{data, error} = await supabase
            .from('scores')
            .insert({
                user_id: userId,
                gamemode_id: gamemode_id,
                score: score
            })
            .select();
        
        if(error){
            return res.status(500).json({error: error.message});
        }

        res.status(201).json({success: true, data: data[0]})
    }
    catch(error){
        res.status(500).json({error: 'Failed to save score'});
    }
});

//get high score
router.get('/:gamemode_id/high', async(req, res) => {
    try{
        const{gamemode_id} = req.params;
        const userId = req.user.id;

        const{data, error} = await supabase
            .from('scores')
            .select('score')
            .eq('user_id', userId)
            .eq('gamemode_id', parseInt(gamemode_id))
            .order('score', {ascending: false})
            .limit(1)
            .single();
        
            if(error && error.code !== 'PGRST116'){
                return res.status(500).json({error: error.message});
            }

            res.json({highscore: data?.score || 0});
    }
    catch(error){
        res.status(500).json({error: 'Failed to fetch high score'});
    }
});

export default router;