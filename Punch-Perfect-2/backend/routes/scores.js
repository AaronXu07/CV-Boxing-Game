import express from 'express';
import supabase from '../config/supabase.js';
const router = express.Router(); 

//get leaderboard for a specific game mode
router.get('/leaderboard/:gamemodeId', async (req, res) => {
    try {
        
        const gamemodeId = Number(req.params.gamemodeId); 

        const isAscending = gamemodeId === 76015482 ? true : false; 

        const {data, error: err} = await supabase
            .from('scores')
            .select(`
                user_id,
                score,
                created_at
            `)
            .eq('gamemode_id', gamemodeId)
            .order('score', { ascending: isAscending}); 
        
        if(err){
            console.log("supabase error"); 
            return res.status(500).json({error: err.message});
        }

        const {data:{users}, error} = await supabase.auth.admin.listUsers(); 

        if(error) {
            console.log("error getting usernames"); 
            return res.status(500).json({error: error}); 
        }

        const userMap = {}; 
        users.forEach(user => {
            userMap[user.id] = user.user_metadata?.display_name; 
        })

        const leaderboard = []; 
        const seen = new Set(); 
        console.log("reached loop"); 
        
        for(const score of data) {
            if(!seen.has(score.user_id)) {
                leaderboard.push({
                    user: { display_name: userMap[score.user_id]},
                    score: score.score,
                    created_at: score.created_at
                }); 
                seen.add(score.user_id); 
                if(leaderboard.length === 10) {
                    break; 
                }
            }
        }

        res.json(leaderboard);

    } catch (error) {
        res.status(500).json({error: 'Failed to fetch leaderboard'}); 
    }
})

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

//get highscores for all gamemodes for a user
router.get('/highscores', async(req, res) => {
    try{
        const userId = req.user.id;

        const {data: gamemodes, error: gmError} = await supabase
            .from('game_modes')
            .select('id, gamemode_name');
        
        if(gmError){
            return res.status(500).json({error: gmError.message});
        }

        const {data: scores, error: scoreError} = await supabase
            .from('scores')
            .select('gamemode_id, score')
            .eq('user_id', userId);
        
        if(scoreError){
            return res.status.json({error: scoreError.message});
        }

        const highscores = gamemodes.map((mode) => {
            const modeScores = scores
                .filter(s => s.gamemode_id === mode.id)
                .map(s => s.score);

            // Reaction Time
            let hs = null; 
            if(mode.id === 76015482) {
                hs = modeScores.length? Math.min(...modeScores) : null; 
            } else {
                hs = modeScores.length? Math.max(...modeScores) : null; 
            }
            
            return{
                gamemode_id: mode.id,
                mode: mode.gamemode_name,
                highscore: hs
            };
        });

        res.json(highscores);
    }
    catch(error){
        res.status(500).json({error: 'Failed to fetch highscores'});
    }
});

//get leaderboard for a specific game mode
router.get('/leaderboard/:gamemodeId/me', async (req, res) => {
    try {
        const gamemodeId = Number(req.params.gamemodeId); 

        const isAscending = gamemodeId === 76015482 ? true : false; 

        const {data, error: err} = await supabase
            .from('scores')
            .select(`
                user_id,
                score,
                created_at
            `)
            .eq('gamemode_id', gamemodeId)
            .order('score', { ascending: isAscending}); 
        
        if(err){
            console.log("supabase error"); 
            return res.status(500).json({error: err.message});
        }

        const {data:user, error} = await supabase.auth.admin.getUserById(req.user.id)

        if(error) {
            console.log("error getting username"); 
            return res.status(500).json({error: error}); 
        }

        let info = {}; 
        const seen = new Set(); 
        console.log("reached loop"); 

        let rank = 0; 
        
        for(const score of data) {
            if(!seen.has(score.user_id)) {
                seen.add(score.user_id); 
                rank++; 
                if(score.user_id == req.user.id) {
                    info = {
                        rank: rank, 
                        display_name: user.user.user_metadata?.display_name,
                        score: score.score,
                        created_at: score.created_at
                    }
                }
                
            }
        }

        res.json(info || null);
        
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch user best score'}); 
    }
})

export default router;