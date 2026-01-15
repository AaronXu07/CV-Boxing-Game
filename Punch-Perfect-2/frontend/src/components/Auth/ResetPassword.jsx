import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import Background from '../Background/Background';
import { useSound } from '../../hooks/useSound.js';
import { supabase } from '../../api/supabase.js';

function ResetPassword() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [password, setPassword] = useState(""); 
  const [confirmPass, setConfirmPass] = useState(""); 
  const [error, setError] = useState('');

const handleBack = () => {
    playButtonSound();
    setTimeout(() => navigate('/auth'), 200);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(

        (event, session) => {
            console.log(event); 
            if (event === 'SIGNED_OUT' || !session) {
                navigate('/auth');
            }
        }
    );

    return () => {
        listener.subscription.unsubscribe();
    };
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    playButtonSound();

    setError('');

    if (password != confirmPass) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try{

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message);
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
      <button className="back-button" onClick={handleBack}> ← Back</button>

      <div className="auth-content">
        <div className="auth-card">
          <h1>Reset Password</h1>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                placeholder="Enter Password"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value.replace(/\s/g, ""))}
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button">
              Set Password
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
