import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import Background from '../Background/Background';
import { useSound } from '../../hooks/useSound.js';
import { supabase } from '../../api/supabase.js';
import { getCurrentSession } from '../../api/authFunctions.js'
import { submitUsername, getUsername } from '../../api/profile.js'


function SetUsername() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [username, setUsername] = useState(""); 
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); 

  useEffect(() => {
    const checkDisplay = async () => {
      const session = await getCurrentSession(); 

      if (!session) {
        navigate('/auth');
        return;
      }

      setSession(session); 
    };
    checkDisplay(); 
  }, [navigate]);

  const handleInputChange = (e) => {
    setUsername(e.target.value); 
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playButtonSound();

    setError('');

    const name = username.trim(); 

    if (name.length < 3) {
      setError('username is too short');
      return;
    }

    if (name.length > 30) {
      setError('username is too long');
      return;
    }

    try{

      const currentSession = await getCurrentSession();

      if (!currentSession) {
        navigate('/auth');
        return;
      }

      const data = await submitUsername(currentSession, name); 

      if (data.error) {

        if (data.error === 'Invalid token' || data.error === 'Authentication failed' || data.error === 'No token provided') {
          console.log("Auth error detected, redirecting to login");
          navigate('/auth');
          return;
        }

        setError(data.error);
        return;
      }

      navigate('/account');
    }
    
    catch(err){
      setError('Something went wrong. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <Background />

      <div className="auth-content">
        <div className="auth-card">
          <h1>Set Your Display Name</h1>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username (signup only - display name) */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleInputChange}
                placeholder="Enter your display name"
                autoComplete="username"
              />
            </div>


            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              Set Display Name
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default SetUsername;
