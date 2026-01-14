import supabase from '../config/supabase.js';
import { Filter } from 'bad-words'; 

const filter = new Filter(); 

export const submitUsername = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const { username } = req.body;

    if(filter.isProfane(username)) {
        return res.status(400).json({ error: "Username contains inappropriate language", profile: null });
    }

    if (!user_id || !username) {
      return res.status(400).json({ error: "Missing user_id or username", profile: null});
    }

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Username already taken", profile: null });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id, username })
      .select(); 

    if (error) throw error;

    return res.status(201).json({ error: null, profile: data[0]});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", profile: null});
  }
};

export const getUsername = async (req, res) => {
    const user_id = req.user.id; 

    try {
        if(!user_id) {
            return res.status(400).json({ error: "Missing user_id", username: null}); 
        }

        const {data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user_id)
        .single(); 
        
        if(error) {
            console.error(error); 
            return res.status(200).json({error:null, username:null}); 
        }

        if(!data) {
            return res.status(200).json({error: null, username: null}); 
        }

        return res.status(200).json({ error: null, username: data.username}); 
    } catch (err) {
        console.error(err); 
        return res.status(500).json({ error: "Internal server error", username:null}); 
    }
}
