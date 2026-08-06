import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Save } from 'lucide-react';
import api from '../api/axios';
import './Auth.css';

const Login = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const response = await api.post('/login/', {
        username,
        password
      });
      
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/forgot-password/', {
        username,
        new_password: password
      });
      
      setMessage(response.data.message || 'Password reset successfully.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setPassword('');
        setConfirmPassword('');
        setMessage('');
      }, 2000);
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h2>{isForgotPassword ? 'Reset Password' : 'ERP System Login'}</h2>
          <p>
            {isForgotPassword 
              ? 'Enter your username and your new password below.' 
              : 'Please enter your credentials to access the system.'}
          </p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{isForgotPassword ? 'New Password' : 'Password'}</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isForgotPassword ? "Enter new password" : "Enter your password"}
              required 
            />
          </div>

          {isForgotPassword && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required 
              />
            </div>
          )}

          {!isForgotPassword && (
            <div className="forgot-password-link" onClick={() => {
              setIsForgotPassword(true);
              setError('');
              setMessage('');
              setPassword('');
            }}>
              Forgot Password?
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {isForgotPassword ? (
              <>
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Password'}
              </>
            ) : (
              <>
                <LogIn size={18} />
                {loading ? 'Logging in...' : 'Login'}
              </>
            )}
          </button>
          
          {isForgotPassword && (
            <button 
              type="button" 
              className="btn btn-secondary back-btn" 
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
                setMessage('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
