import supabase from '../config/supabase.js'

export const getLeaderboard = async (req, res) => {
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
}

export const getRank = async (req, res) => {
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
}