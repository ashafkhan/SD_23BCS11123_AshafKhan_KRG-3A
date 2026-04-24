import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';

function ListingsIndex() {
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState('');
  const [showTax, setShowTax] = useState(false);
  const [flash, setFlash] = useState({ success: '', error: '' });
  const { category: categoryParam } = useParams();

  useEffect(() => {
    fetchListings();
  }, [categoryParam]);

  const fetchListings = async () => {
    try {
      let response;
      if (categoryParam) {
        response = await api.get(`/listings/category/${categoryParam}`);
        setCategory(categoryParam);
      } else {
        response = await api.get('/listings');
      }
      console.log('Listings response:', response.data);
      setListings(response.data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setFlash({ error: error.response?.data?.error || 'Failed to load listings' });
    }
  };

  const toggleTax = () => {
    setShowTax(!showTax);
  };

  const categories = [
    { name: 'trending', icon: 'fa-fire', label: 'Trending' },
    { name: 'room', icon: 'fa-bed', label: 'Rooms' },
    { name: 'city', icon: 'fa-city', label: 'Cities' },
    { name: 'mountain', icon: 'fa-mountain', label: 'Mountains' },
    { name: 'arctic', icon: 'fa-snowflake', label: 'Arctic' },
    { name: 'castle', icon: 'fa-fort-awesome', label: 'Castles' },
    { name: 'pool', icon: 'fa-person-swimming', label: 'Pools' },
    { name: 'farm', icon: 'fa-cow', label: 'Farms' },
    { name: 'camping', icon: 'fa-tent', label: 'Camping' },
    { name: 'dome', icon: 'fa-igloo', label: 'Domes' },
    { name: 'ship', icon: 'fa-ship', label: 'Ships' },
  ];

  return (
    <>
      <style>{`
        .filters{
          display: flex;
          width: 100% !important;
          height: 100px !important;
          overflow: scroll;
          margin-top: 2rem !important;
        }
        .filter{
          opacity: 0.7;
          border-radius: 5px;
          min-width: 75px !important;
          text-align: center;
          margin: 0.5rem;
          height: 3.58rem;
        }
        .filters::-webkit-scrollbar{
          display: none;
        }
        .filter p{
          font-size: 0.8rem;
        }
        .filter:hover{
          opacity: 1;
          cursor: pointer;
        }
        .tax-info{
          display: ${showTax ? 'inline' : 'none'};
        }
        .tax-toggle{
          border: 1px solid black;
          border-radius: 1rem;
          height: 3.58rem;
          display: flex;
          align-items: center;
          padding: 1rem;
          margin-left: 2rem;
          min-width: 250px;
          width: fit-content;
        }
        .filter a {
          color: black;
          text-decoration: none;
        }
        .filter i {
          font-size: 1.2rem;
        }
        @media ((min-width: 1200px) and (max-width: 1400px)){
          .card{
            width: 30.5% !important;
          }
        }
        @media ((min-width: 768px) and (max-width: 1199px)){
          .card{
            width: 45.5% !important;
          }
        }
        @media ((min-width: 576px) and (max-width: 768px)){
          .card{
            width: 95% !important;
          }
        }
        @media (max-width: 577px){
          .card{
            width: 93% !important;
          }
          .filter i {
            font-size: 1rem !important;
          }
          footer .about{
            padding: 1rem 2rem !important;
          }
        }
        @media (max-width: 400px){
          .filter i {
            font-size: 0.95rem !important;
          }
          .filter p{
            font-size: 0.75rem !important;
          }
        }
      `}</style>
      <FlashMessage success={flash.success} error={flash.error} onDismiss={(type) => setFlash({ ...flash, [type]: '' })} />
      <div className="filters mt-3">
        {categories.map((cat) => (
          <div key={cat.name} className="filter">
            <Link to={`/listings/category/${cat.name}`}>
              <div><i className={`fa-solid ${cat.icon}`}></i></div>
              <p>{cat.label}</p>
            </Link>
          </div>
        ))}
        <div className="tax-toggle">
          <div className="form-check-reverse form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              role="switch" 
              id="flexSwitchCheckDefault" 
              style={{cursor: 'pointer'}}
              checked={showTax}
              onChange={toggleTax}
            />
            <label className="form-check-label" htmlFor="flexSwitchCheckDefault" style={{cursor: 'pointer'}}>
              Display total after taxes
            </label>
          </div>
        </div>
      </div>
      {listings.length > 0 ? (
        <div className="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 listing-container">
          {listings.map((listing) => (
            <div key={listing._id} className="card col listing-card" style={{width: '30.8%'}}>
              <Link to={`/listings/${listing._id}`}>
                <img src={listing.image.url} className="card-img-top" alt="listing-image" />
              </Link>
              <div className="card-body">
                <p className="card-text">
                  <b>{listing.title}</b><br />
                  &#8377; {listing.price.toLocaleString('en-IN')} / night
                  &nbsp; &nbsp; <i className="tax-info">+18% GST</i>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          <h3 className="mb-3 mt-3 col offset-4">
            {category ? `No Listings related to ${category}` : 'No Listings found'}
          </h3>
        </div>
      )}
    </>
  );
}

export default ListingsIndex;

