import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../../api/authFunctions.js';
import { getUsername } from '../../api/profile.js';
import { supabase } from '../../api/supabase.js';

const WHITELIST = ['/set-username', '/auth'];

export default function OnboardingGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const session = await getCurrentSession();
        if (!session) return;

        const data = await getUsername(session); 

        // Handle bad token (401 from backend)
        if (data && (data.error === 'Invalid token' || data.error === 'Authentication failed')) {
            console.log("Invalid token detected in guard, signing out");
            await supabase.auth.signOut();
            navigate('/auth');
            return;
        }

        const isWhitelisted = WHITELIST.includes(location.pathname);

        if (!isWhitelisted && !data.error && !data.username) {
          console.log("navigating to set-username", data); 
          navigate('/set-username');
        } else if (isWhitelisted && data.username) {
          navigate('/account'); 
        }
      } catch (err) {
        console.error("Error checking username:", err);
        // If token is invalid, clear session and redirect to auth
        if (err.message?.includes('401') || err.message?.includes('Invalid token')) {
          await supabase.auth.signOut();
          navigate('/auth');
        }
      }
    };
    checkUsername(); 
    return; 
  }, [location.pathname, navigate]);

  return null;
}
