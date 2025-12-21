import supabase from '../config/supabase.js'

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

export default verifyToken; 