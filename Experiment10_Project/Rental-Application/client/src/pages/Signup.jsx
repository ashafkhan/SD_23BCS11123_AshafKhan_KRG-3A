import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';
import { useUser } from '../contexts/UserContext';

function Signup() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [flash, setFlash] = useState({ success: '', error: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/signup', {
        user: formData
      });
      
      // Refresh user context to update navbar
      refreshUser();
      
      setFlash({ success: response.data.message || 'Welcome to WanderLust' });
      
      // Get redirect URL from backend response or sessionStorage
      const redirectUrl = response.data.redirectUrl || sessionStorage.getItem('redirectAfterLogin') || '/listings';
      sessionStorage.removeItem('redirectAfterLogin');
      
      setTimeout(() => navigate(redirectUrl, { replace: true }), 1000);
    } catch (error) {
      setFlash({ error: error.response?.data?.error || error.response?.data?.message || 'Signup failed' });
    }
  };

  return (
    <>
      <FlashMessage success={flash.success} error={flash.error} onDismiss={(type) => setFlash({ ...flash, [type]: '' })} />
      <div className="row mb-3 mt-3">
        <div className="col-6 offset-3">
          <h1 className="mb-3 mt-3">SignUp to Wanderlust</h1>
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
              <div className="valid-feedback">Looks Good</div>
              <div className="invalid-feedback">Invalid Username!</div>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-control" 
                placeholder="E-mail" 
                required
                value={formData.email}
                onChange={handleChange}
              />
              <div className="invalid-feedback">Invalid Email!</div>
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
              <div className="invalid-feedback">Please give a strong password</div>
            </div>
            <button type="submit" className="btn btn-success">SignUp</button>
          </form>
          <br /><br />
          <div>
            <span>Already have an account? </span>
            <Link to="/login">
              <button className="btn btn-outline-danger ms-3">Log in</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;

