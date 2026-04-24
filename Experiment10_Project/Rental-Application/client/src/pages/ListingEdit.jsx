import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';
import { useUser } from '../contexts/UserContext';

function ListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currUser, loading } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    country: '',
    location: '',
    category: 'trending',
    image: null
  });
  const [originalUrl, setOriginalUrl] = useState('');
  const [flash, setFlash] = useState({ success: '', error: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for user context to finish loading before checking authentication
    if (!loading && currUser === null) {
      // Save redirect URL via API
      api.get(`/auth/check-route?path=/listings/${id}/edit`).then(response => {
        if (response.data.requiresAuth) {
          sessionStorage.setItem('redirectAfterLogin', `/listings/${id}/edit`);
          sessionStorage.setItem('loginFlash', response.data.message || 'You need to be logged in first!');
          navigate('/login');
        }
      }).catch(() => {
        sessionStorage.setItem('redirectAfterLogin', `/listings/${id}/edit`);
        sessionStorage.setItem('loginFlash', 'You need to be logged in first!');
        navigate('/login');
      });
    } else if (!loading && currUser) {
      fetchListing();
    }
  }, [id, currUser, loading, navigate]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/listings/${id}/edit`);
      const listing = response.data.listing;
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        country: listing.country,
        location: listing.location,
        category: listing.category,
        image: null
      });
      setOriginalUrl(response.data.originalUrl || listing.image.url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching listing for edit:', error);
      setIsLoading(false);
      if (error.response?.status === 401) {
        setFlash({ error: 'You need to be logged in first!' });
        sessionStorage.setItem('redirectAfterLogin', `/listings/${id}/edit`);
        sessionStorage.setItem('loginFlash', 'You need to be logged in first!');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setFlash({ error: 'You are not the owner of this listing!' });
        navigate(`/listings/${id}`);
      } else {
        setFlash({ error: error.response?.data?.error || 'Failed to load listing' });
      }
    }
  };

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

      const response = await api.put(`/listings/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFlash({ success: response.data.message || 'Listing Updated Successfully' });
      setTimeout(() => navigate(`/listings/${id}`), 1000);
    } catch (error) {
      console.error('Error updating listing:', error);
      if (error.response?.status === 401) {
        setFlash({ error: 'You need to be logged in first!' });
        sessionStorage.setItem('redirectAfterLogin', `/listings/${id}/edit`);
        navigate('/login');
      } else if (error.response?.status === 403) {
        setFlash({ error: 'You are not the owner of this listing!' });
        navigate(`/listings/${id}`);
      } else {
        setFlash({ error: error.response?.data?.error || error.response?.data?.message || 'Failed to update listing' });
      }
    }
  };

  if (isLoading || loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <>
      <FlashMessage success={flash.success} error={flash.error} onDismiss={(type) => setFlash({ ...flash, [type]: '' })} />
      <div className="row mt-3">
        <div className="col-8 offset-2">
          <h3 className="mb-3">Edit Your Listing</h3>
          <form onSubmit={handleSubmit} className="needs-validation" encType="multipart/form-data">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input 
                type="text" 
                name="title" 
                className="form-control" 
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
                required
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              <div className="invalid-feedback">Please Enter a short Description</div>
            </div>
            
            {originalUrl && (
              <div className="mb-3">
                Original Listing Image <br />
                <img src={originalUrl} width="200px" height="150px" alt="original" style={{borderRadius: '0.5rem'}} />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="image" className="form-label">Upload Image</label>
              <input 
                type="file" 
                name="image" 
                className="form-control"
                onChange={handleChange}
              />
            </div>
            
            <div className="row">
              <div className="mb-3 col-md-4">
                <label htmlFor="price" className="form-label">Price</label>
                <input 
                  type="number" 
                  name="price" 
                  className="form-control" 
                  required
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
                  <option value={formData.category}>{formData.category}</option>
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

            <button type="submit" className="btn btn-dark add-btn mt-3 mb-3">Edit Listing</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ListingEdit;

