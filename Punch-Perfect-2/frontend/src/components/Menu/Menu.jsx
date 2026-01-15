import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; 
import './menu.css';
import Background from '../Background/Background';
import Avatar from '../Avatar/Avatar';
import { useSound } from '../../hooks/useSound.js';
import { getCurrentSession } from '../../api/authFunctions.js';
import { supabase } from '../../api/supabase.js';

function Menu() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [ username, setUsername ] = useState(null); 
  const [ avatarUrl, setAvatarUrl ] = useState(null);

  const handleNavigation = (path) => {
    playButtonSound();
    setTimeout(() => navigate(path), 200);
  };

  useEffect(() => {
    const updateProfile = (session) => {
      if(session?.user){
        setUsername(session.user.user_metadata?.display_name);
        setAvatarUrl(session.user.user_metadata?.avatar_url);
      } else {
        setUsername(null);
        setAvatarUrl(null);
      }
    };

    getCurrentSession().then(updateProfile);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      updateProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="menu-container">
      <Background enableTargets={true} />

      <header className="menu-header">
        <div className="menu-logo">
          <img src="/punch-perfect-logo.png" alt="Punch Perfect" />
        </div>

        <div className="menu-title-container">
          <h1 className="menu-page-title">PUNCH PERFECT</h1>
          <p className="menu-page-subtitle">Test your reflexes, accuracy, and speed through fast-paced boxing games.</p>
        </div>

        <button 
          className="profile-button" 
          onClick={() => handleNavigation('/account')} 
          aria-label="Account"
        >
          <span className="profile-name">{username || 'Guest'}</span>
          <Avatar src={avatarUrl} size={32} alt={username || 'Guest'} />
        </button>
      </header>

      {/* Main Navigation Cluster */}
      <main className="menu-cluster">
        <div className="menu-group">
          <button 
            className="menu-item primary" 
            onClick={() => handleNavigation('/gamemenu')}
          >
            <span className="menu-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </span>
            <span className="menu-label">Start Game</span>
          </button>

          <div className="menu-divider"></div>

          <button 
            className="menu-item secondary" 
            onClick={() => handleNavigation('/leaderboard')}
          >
            <span className="menu-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 20V14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="menu-label">Leaderboard</span>
          </button>

          <button 
            className="menu-item secondary" 
            onClick={() => handleNavigation('/about')}
          >
            <span className="menu-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16V12" strokeLinecap="round"/>
                <path d="M12 8H12.01" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="menu-label">Tutorial</span>
          </button>
        </div>
      </main>

      <footer className="menu-footer">
        <span className="version">PUNCH PERFECT v2.0</span>
      </footer>
    </div>
  );
}

export default Menu;