import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import Background from '../Background/Background';
import { useSound } from '../../hooks/useSound.js';
import { sendPasswordResetEmail } from '../../api/authFunctions.js';

function ForgotPassword() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    playButtonSound();
    setTimeout(() => navigate('/auth'), 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playButtonSound();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    const { data, error } = await sendPasswordResetEmail(email);
    setIsLoading(false);

    if (error) {
      setError(error.message || 'Failed to send reset email');
    } else {
      setMessage('If an account exists for this email, you will receive a reset link.');
    }
  };

  return (
    <>
      <Background />
      <div className="auth-container">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>

        <div className="auth-content">
          <div className="auth-card">
            <h1>Reset Password</h1>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}

              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
