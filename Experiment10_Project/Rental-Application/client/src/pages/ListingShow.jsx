import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';
import { useUser } from '../contexts/UserContext';

function ListingShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currUser } = useUser();
  const [listing, setListing] = useState(null);
  const [review, setReview] = useState({ rating: 1, comment: '' });
  const [flash, setFlash] = useState({ success: '', error: '' });
  const [mapToken, setMapToken] = useState('');

  useEffect(() => {
    fetchListing();
    fetchMapToken();
  }, [id]);

  useEffect(() => {
    if (listing && mapToken) {
      initializeMap();
    }
  }, [listing, mapToken]);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data.listing);
    } catch (error) {
      setFlash({ error: 'Failed to load listing' });
    }
  };


  const fetchMapToken = async () => {
    try {
      const response = await api.get('/auth/map-token');
      setMapToken(response.data.token);
    } catch (error) {
      console.error('Failed to fetch map token');
    }
  };

  const initializeMap = () => {
    if (window.mapboxgl && listing && listing.geometry) {
      window.mapboxgl.accessToken = mapToken;
      const map = new window.mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: listing.geometry.coordinates,
        zoom: 9
      });
      const marker = new window.mapboxgl.Marker({ color: 'red' })
        .setLngLat(listing.geometry.coordinates)
        .addTo(map)
        .setPopup(new window.mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3><b>${listing.title}</b></h3>Exact Location will be provided after booking.`));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/listings/${id}`);
        setFlash({ success: 'Listing Deleted Successfully' });
        setTimeout(() => navigate('/listings'), 1000);
      } catch (error) {
        setFlash({ error: 'Failed to delete listing' });
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/listings/${id}/reviews`, { review });
      setReview({ rating: 1, comment: '' });
      setFlash({ success: 'New Review Created' });
      fetchListing();
    } catch (error) {
      setFlash({ error: 'Failed to create review' });
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/listings/${id}/reviews/${reviewId}`);
        setFlash({ success: 'Review Deleted Successfully' });
        fetchListing();
      } catch (error) {
        setFlash({ error: 'Failed to delete review' });
      }
    }
  };

  if (!listing) {
    return <div>Loading...</div>;
  }

  const isOwner = currUser && listing.owner && currUser._id === listing.owner._id;

  return (
    <>
      <FlashMessage success={flash.success} error={flash.error} onDismiss={(type) => setFlash({ ...flash, [type]: '' })} />
      <div className="row mt-3 mb-3">
        <div className="col-6 offset-3 mb-3">
          <h2 className="mb-3 mt-3">{listing.title}</h2>
          <div className="card listing-card">
            <img src={listing.image.url} className="card-img-top show-img" alt="listing-image" />
            <div className="card-body">
              <p className="card-text">
                <p><small>Owned By</small> : <i>{listing.owner?.username}</i></p>
                {listing.description} <br />
                &#8377; {listing.price.toLocaleString('en-IN')} / night <br />
                {listing.location}<br />
                {listing.country}<br />
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="show-btns">
              <Link to={`/listings/${listing._id}/edit`} className="btn btn-dark add-btn show-btn">Edit</Link>
              <button className="btn btn-dark show-btn" onClick={handleDelete}>Delete</button>
            </div>
          )}
          <hr />
        </div>
        <div className="col-6 offset-3 mb-3">
          {currUser && (
            <>
              <h4 className="mb-3">Leave a review</h4>
              <form onSubmit={handleReviewSubmit} className="needs-validation mt-3">
                <div>
                  <label htmlFor="rating" className="form-label">Rating</label>
                  <fieldset className="starability-grow">
                    <input type="radio" id="no-rate" className="input-no-rate" name="rating" value="1" defaultChecked aria-label="No rating." />
                    <input type="radio" id="first-rate1" name="rating" value="1" checked={review.rating === 1} onChange={(e) => setReview({ ...review, rating: 1 })} />
                    <label htmlFor="first-rate1" title="Terrible">1 star</label>
                    <input type="radio" id="first-rate2" name="rating" value="2" checked={review.rating === 2} onChange={(e) => setReview({ ...review, rating: 2 })} />
                    <label htmlFor="first-rate2" title="Not good">2 stars</label>
                    <input type="radio" id="first-rate3" name="rating" value="3" checked={review.rating === 3} onChange={(e) => setReview({ ...review, rating: 3 })} />
                    <label htmlFor="first-rate3" title="Average">3 stars</label>
                    <input type="radio" id="first-rate4" name="rating" value="4" checked={review.rating === 4} onChange={(e) => setReview({ ...review, rating: 4 })} />
                    <label htmlFor="first-rate4" title="Very good">4 stars</label>
                    <input type="radio" id="first-rate5" name="rating" value="5" checked={review.rating === 5} onChange={(e) => setReview({ ...review, rating: 5 })} />
                    <label htmlFor="first-rate5" title="Amazing">5 stars</label>
                  </fieldset>
                </div>
                <div className="mb-3">
                  <label htmlFor="comment" className="form-label">Comment</label>
                  <textarea 
                    id="comment" 
                    placeholder="Give a comment" 
                    className="form-control" 
                    rows="4" 
                    required
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  ></textarea>
                  <div className="invalid-feedback">Please give a short comment</div>
                </div>
                <button type="submit" className="btn btn-outline-dark mb-3 mt-3">Submit</button>
              </form>
              <hr />
            </>
          )}
          <h4><b>All Reviews</b></h4>
          {listing.reviews && listing.reviews.length > 0 ? (
            <div className="row">
              {listing.reviews.map((rev) => (
                <div key={rev._id} className="card col-5 ms-3 mb-3">
                  <div className="card-body">
                    <h5 className="card-title">@{rev.author?.username}</h5>
                    {currUser && currUser._id === rev.author?._id && <small>(You)</small>}
                    <p className="starability-result card-text" data-rating={rev.rating}></p>
                    <p className="card-text">{rev.comment}</p>
                  </div>
                  {currUser && currUser._id === rev.author?._id && (
                    <button className="btn btn-sm btn-danger ms-3 mb-3 mt-3" onClick={() => handleReviewDelete(rev._id)}>
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>No Reviews yet</div>
          )}
          <hr />
        </div>
        <div className="col-6 offset-3 mb-3">
          <h3>Where you'll be</h3>
          <div id="map" style={{ height: '400px', width: '100%' }}></div>
        </div>
      </div>
    </>
  );
}

export default ListingShow;

