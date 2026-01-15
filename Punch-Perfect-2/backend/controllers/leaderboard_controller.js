import supabase from '../config/supabase.js'

const getUsernameById = async (user_id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user_id)
    .single();

  if (!error && data?.username) {
    return data.username;
  }

  const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(user_id);
  
  if (!authError && user?.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }

  return "Anonymous";
};

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
            return res.status(500).json({error: err.message});
        }

        const leaderboard = []; 
        const seen = new Set(); 
        
        for(const score of data) {
            if(!seen.has(score.user_id)) {
                leaderboard.push({
                    user: { display_name: await getUsernameById(score.user_id)},
                    score: score.score,
                    created_at: score.created_at
                }); 
                seen.add(score.user_id); 
                if(leaderboard.length === 10) {
                    break; 
                }
            }
        }

        res.status(200).json(leaderboard);

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
            return res.status(500).json({error: err.message});
        }

        let info = {}; 
        const seen = new Set(); 

        let rank = 0; 
        let prevScore = null;
        let position = 0;
        
        for(const score of data) {
            if(!seen.has(score.user_id)) {
                seen.add(score.user_id); 
                position++;
                
                if (prevScore === null || score.score !== prevScore) {
                    rank = position;
                    prevScore = score.score;
                }
                
                if(score.user_id == req.user.id) {
                    info = {
                        rank: rank, 
                        display_name: await getUsernameById(score.user_id),
                        score: score.score,
                        created_at: score.created_at
                    }
                }
                
            }
        }

        res.status(200).json(info || null);
        
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch user best score'}); 
    }
}