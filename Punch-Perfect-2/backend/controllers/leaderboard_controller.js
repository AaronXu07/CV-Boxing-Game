import supabase from '../config/supabase.js'

const getUserProfile = async (user_id) => {
  const [profileRes, authRes] = await Promise.all([
    supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user_id)
        .single(),
    supabase.auth.admin.getUserById(user_id)
  ]);

  const profileUsername = !profileRes.error && profileRes.data ? profileRes.data.username : null;
  const authUser = !authRes.error ? authRes.data.user : null;
  const authMeta = authUser?.user_metadata || {};

  return {
    display_name: profileUsername || authMeta.display_name || "Anonymous",
    avatar_url: authMeta.avatar_url || null
  };
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
        const scoresToProcess = [];
        
        for(const score of data) {
            if(!seen.has(score.user_id)) {
                seen.add(score.user_id); 
                scoresToProcess.push(score);
                if(scoresToProcess.length === 10) {
                    break; 
                }
            }
        }

        const profiles = await Promise.all(scoresToProcess.map(score => getUserProfile(score.user_id)));

        profiles.forEach((profile, index) => {
            leaderboard.push({
                user: profile,
                score: scoresToProcess[index].score,
                created_at: scoresToProcess[index].created_at
            });
        });

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
                    const userProfile = await getUserProfile(score.user_id);
                    info = {
                        rank: rank, 
                        display_name: userProfile.display_name,
                        avatar_url: userProfile.avatar_url,
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