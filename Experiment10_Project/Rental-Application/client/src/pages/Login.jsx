import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';
import { useUser } from '../contexts/UserContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [flash, setFlash] = useState({ success: '', error: '' });

  useEffect(() => {
    // Check for flash message from redirect
    const flashMessage = sessionStorage.getItem('loginFlash');
    if (flashMessage) {
      setFlash({ error: flashMessage });
      sessionStorage.removeItem('loginFlash');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('password', formData.password);
      
      const response = await api.post('/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Refresh user context to update navbar
      refreshUser();
      
      setFlash({ success: response.data.message || 'Welcome Back to WanderLust!' });
      
      // Get redirect URL from backend response or sessionStorage
      const redirectUrl = response.data.redirectUrl || sessionStorage.getItem('redirectAfterLogin') || '/listings';
      sessionStorage.removeItem('redirectAfterLogin');
      
      setTimeout(() => navigate(redirectUrl, { replace: true }), 1000);
    } catch (error) {
      setFlash({ error: error.response?.data?.error || 'Login failed' });
    }
  };

  return (
    <>
      <FlashMessage success={flash.success} error={flash.error} onDismiss={(type) => setFlash({ ...flash, [type]: '' })} />
      <div className="row mb-3 mt-3">
        <div className="col-6 offset-3">
          <h1 className="mb-3 mt-3">Login to Wanderlust</h1>
          <form onSubmit={handleSubmit} className="needs-validation">
            <div className="mb-3 mt-3">
              <label htmlFor="username" className="form-label mt-3">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                className="form-control" 
                placeholder="username" 
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                className="form-control" 
                placeholder="Password" 
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-success">Login</button>
          </form>
          <br /><br />
          <div>
            <span>Don't have an account? </span>
            <Link to="/signup">
              <button className="btn btn-outline-danger ms-3">Sign Up</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

