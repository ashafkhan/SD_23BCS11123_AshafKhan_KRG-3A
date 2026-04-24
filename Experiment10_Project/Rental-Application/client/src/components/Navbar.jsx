import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import api from '../services/api';

function Navbar() {
  const { currUser, logout } = useUser();
  const [searchCountry, setSearchCountry] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCountry.trim()) {
      navigate(`/listings/search?country=${encodeURIComponent(searchCountry)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/listings');
  };

  const handleAirbnbClick = async (e) => {
    if (!currUser) {
      e.preventDefault();
      // Save the intended destination in session via API
      try {
        const response = await api.get(`/auth/check-route?path=/listings/new`);
        if (response.data.requiresAuth) {
          // Save redirect URL in sessionStorage as backup
          sessionStorage.setItem('redirectAfterLogin', '/listings/new');
          // Show flash message
          sessionStorage.setItem('loginFlash', response.data.message || 'You need to be logged in first!');
          navigate('/login');
        }
      } catch (error) {
        // Fallback if API fails
        sessionStorage.setItem('redirectAfterLogin', '/listings/new');
        sessionStorage.setItem('loginFlash', 'You need to be logged in first!');
        navigate('/login');
      }
    }
  };

  return (
    <>
      <style>{`
        .search-btn{
          background-color: #bd4168;
          color: #fff;
        }
        .search-btn:hover{
          background-color: #bd4168;
          color: #fff;
        }
        .search-btn{
          display: flex;
          align-items: center;
          text-align: center;
          border-radius: 25px;
        }
        .search-btn i {
          margin-right: 0.5rem;
          font-size: 0.9rem;
        }
        .search-inp{
          font-size: 0.9rem;
          border-radius: 25px;
          padding: 0 2rem 0 3rem;
          opacity: 0.9;
        }
        .shubh{
          color: #bd4168 !important;
        }
      `}</style>
      <nav className="navbar navbar-expand-md bg-body-light border-bottom sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/listings">
            <i className="fa-solid fa-paper-plane"></i>
          </Link>
          <div className="navbar-nav me-auto">
            <Link className="nav-link shubh" to="/listings" style={{fontSize: '1.25rem', fontWeight: '600'}}>
              Shubh Yatra
            </Link>
          </div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav search ms-auto">
              <form className="d-flex" role="search" onSubmit={handleSearch}>
                <input 
                  className="form-control me-2 search-inp" 
                  type="search" 
                  placeholder="Search By Country" 
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                />
                <button className="btn search-btn" type="submit">
                  <i className="fa-solid fa-magnifying-glass"></i>Search
                </button>
              </form>
            </div>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" to="/listings/new" onClick={handleAirbnbClick}><b>Airbnb your home</b></Link>
              {!currUser && (
                <>
                  <Link className="nav-link" to="/signup"><b>Sign up</b></Link>
                  <Link className="nav-link" to="/login"><b>Log in</b></Link>
                </>
              )}
              {currUser && (
                <button className="nav-link btn btn-link" onClick={handleLogout} style={{border: 'none', background: 'none', padding: '0.5rem 1rem'}}>
                  <b>Log out</b>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;

