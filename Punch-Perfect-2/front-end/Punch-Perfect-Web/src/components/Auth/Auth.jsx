import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import { useSound } from '../../hooks/useSound.js';

function Auth() {
  const navigate = useNavigate();
  const { playButtonSound } = useSound();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleBack = () => {
    playButtonSound();
    navigate('/account');
  };

  const handleToggleMode = () => {
    playButtonSound();
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    playButtonSound();

    if (!formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin) {
      if (!formData.email) {
        setError('Email is required');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    // Mock authentication - store username in localStorage
    localStorage.setItem('username', formData.username);
    
    // Navigate to account page
    navigate('/account');
  };

  return (
    <div className="auth-container">
      <button className="back-button" onClick={handleBack}>← Back</button>

      <div className="auth-content">
        <div className="auth-card">
          <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            {/* Email (Sign up only) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            )}

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {/* Confirm Password (Sign up only) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle between Login/Signup */}
          <div className="toggle-auth">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={handleToggleMode} 
                className="toggle-link"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
