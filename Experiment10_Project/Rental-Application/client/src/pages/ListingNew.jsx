import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';
import { useUser } from '../contexts/UserContext';

function ListingNew() {
  const navigate = useNavigate();
  const { currUser, loading } = useUser();

  useEffect(() => {
    // Wait for user context to finish loading before checking authentication
    if (!loading && currUser === null) {
      // Save redirect URL via API
      api.get(`/auth/check-route?path=/listings/new`).then(response => {
        if (response.data.requiresAuth) {
          sessionStorage.setItem('redirectAfterLogin', '/listings/new');
          sessionStorage.setItem('loginFlash', response.data.message || 'You need to be logged in first!');
          navigate('/login');
        }
      }).catch(() => {
        // Fallback
        sessionStorage.setItem('redirectAfterLogin', '/listings/new');
        sessionStorage.setItem('loginFlash', 'You need to be logged in first!');
        navigate('/login');
      });
    }
  }, [currUser, loading, navigate]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    country: '',
    location: '',
    category: 'trending',
    image: null
  });
  const [flash, setFlash] = useState({ success: '', error: '' });

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('listing[title]', formData.title);
      data.append('listing[description]', formData.description);
      data.append('listing[price]', formData.price);
      data.append('listing[country]', formData.country);
      data.append('listing[location]', formData.location);
      data.append('listing[category]', formData.category);
      if (formData.image) {
        data.append('listing[image][url]', formData.image);
      }

      await api.post('/listings', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFlash({ success: 'New Listing Created' });
      setTimeout(() => navigate('/listings'), 1000);
    } catch (error) {
      setFlash({ error: error.response?.data?.message || 'Failed to create listing' });
    }
  };

  return (
    <>
      <FlashMessage success={flash.success} error={flash.error} onDismiss={(type) => setFlash({ ...flash, [type]: '' })} />
      <div className="row mt-3">
        <div className="col-8 offset-2">
          <h3 className="mb-3">Create New Listing</h3>
          <form onSubmit={handleSubmit} className="needs-validation" encType="multipart/form-data">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input 
                type="text" 
                name="title" 
                className="form-control" 
                placeholder="Give a Catchy title" 
                required
                value={formData.title}
                onChange={handleChange}
              />
              <div className="valid-feedback">Title Looks Good</div>
              <div className="invalid-feedback">Title is Required</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea 
                type="text" 
                name="description" 
                className="form-control" 
                placeholder="Enter description" 
                required
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              <div className="invalid-feedback">Please Enter a short Description</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="image" className="form-label">Upload Image</label>
              <input 
                type="file" 
                name="image" 
                className="form-control" 
                required
                onChange={handleChange}
              />
              <div className="invalid-feedback">Image is required</div>
            </div>
            
            <div className="row">
              <div className="mb-3 col-md-4">
                <label htmlFor="price" className="form-label">Price</label>
                <input 
                  name="price" 
                  className="form-control" 
                  placeholder="1500" 
                  required 
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">Price Should be Valid</div>
              </div>

              <div className="mb-3 col-md-8">
                <label htmlFor="country" className="form-label">Country</label>
                <input 
                  type="text" 
                  name="country" 
                  className="form-control" 
                  placeholder="India" 
                  required
                  value={formData.country}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">Country Should be Valid</div>
              </div>
            </div>
            
            <div className="row">
              <div className="mb-3 col-md-6">
                <label htmlFor="location" className="form-label">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  className="form-control" 
                  placeholder="Mumbai, Pune, Hyderabad..." 
                  required
                  value={formData.location}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">Location Should be Valid</div>
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="category" className="form-label">Choose Category</label>
                <select 
                  id="category" 
                  className="form-control" 
                  required 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="trending">Trending</option>
                  <option value="mountain">Mountain</option>
                  <option value="room">Room</option>
                  <option value="city">City</option>
                  <option value="pool">Pool</option>
                  <option value="arctic">Arctic</option>
                  <option value="castle">Castle</option>
                  <option value="farm">Farm</option>
                  <option value="camping">Camping</option>
                  <option value="dome">Dome</option>
                  <option value="ship">Ship</option>
                </select>
              </div>
            </div>
          
            <button type="submit" className="btn btn-dark add-btn mt-3 mb-3">Add Listing</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ListingNew;

