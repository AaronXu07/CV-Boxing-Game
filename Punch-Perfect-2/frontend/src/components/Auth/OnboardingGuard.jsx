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
    };
    checkUsername(); 
    return; 
  }, [location.pathname, navigate]);

  return null;
}
