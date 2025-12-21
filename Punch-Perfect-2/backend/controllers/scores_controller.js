import supabase from '../config/supabase.js'

export const submitScore = async (req, res) => {
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
    } catch(error){
        res.status(500).json({error: 'Failed to save score'});
    }
}

export const getUserHighscores = async (req, res) => {
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
            return res.status(500).json({error: scoreError.message});
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
    } catch(error){
        res.status(500).json({error: 'Failed to fetch highscores'});
    }
}

export const getUserScores = async (req, res) => {
    try{
        const userId = req.user.id;

        const {data: scores, error: scoreError} = await supabase
            .from('scores')
            .select(`
                gamemode:gamemode_id (
                    gamemode_name
                ), 
                score, 
                created_at
            `)
            .eq('user_id', userId)
            .order('created_at', {ascending: false});
        
        if(scoreError){
            return res.status(500).json({error: scoreError.message});
        } 
        res.json(scores);
    } catch(error){
        res.status(500).json({error: 'Failed to fetch user scores'});
    }
}