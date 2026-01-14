import { supabase } from './supabase.js'

export const getCurrentSession = async () => {
    try {
        const { data, error } = await supabase.auth.getSession(); 

        if (error) {
            console.error('Error finding session:', error.message); 
            return null; 
        }

        return data.session; 
    } catch (err) {
        console.error('error getting session', err); 
        return null; 
    }
}