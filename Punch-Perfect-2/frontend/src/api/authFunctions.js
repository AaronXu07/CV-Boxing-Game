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

export const sendPasswordResetEmail = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending reset email:', error.message);
    return { data: null, error };
  }
};