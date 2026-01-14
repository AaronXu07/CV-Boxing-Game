import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../../api/authFunctions.js';
import { getUsername } from '../../api/profile.js';

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

        const isWhitelisted = WHITELIST.includes(location.pathname);

        if (!isWhitelisted && !data.username) {
          console.log("navigating to set-username", data); 
          navigate('/set-username');
        } else if (isWhitelisted && data.username) {
          navigate('/account'); 
        }
      } catch (err) {
        console.error("Error checking username:", err);
        if (err.message?.includes('401') || err.message?.includes('Invalid token')) {
          navigate('/auth');
        }
      }
    };
    checkUsername(); 
    return; 
  }, [location.pathname, navigate]);

  return null;
}
