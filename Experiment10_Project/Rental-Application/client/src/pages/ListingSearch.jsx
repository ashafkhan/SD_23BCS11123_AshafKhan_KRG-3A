import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';

function ListingSearch() {
  const [searchParams] = useSearchParams();
  const country = searchParams.get('country');
  const [listings, setListings] = useState([]);
  const [flash, setFlash] = useState({ success: '', error: '' });

  useEffect(() => {
    if (country) {
      fetchSearchResults();
    }
  }, [country]);

  const fetchSearchResults = async () => {
    try {
      const response = await api.get(`/listings/search?country=${encodeURIComponent(country)}`);
      setListings(response.data.listings || []);
    } catch (error) {
      setFlash({ error: 'Failed to load search results' });
    }
  };

  return (
    <>
      <style>{`
        @media ((min-width: 1200px) and (max-width: 1600px)){
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
        }
      `}</style>
      <FlashMessage success={flash.success} error={flash.error} onDismiss={(type) => setFlash({ ...flash, [type]: '' })} />
      {listings.length > 0 ? (
        <div className="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1" style={{marginTop: '2.5rem'}}>
          {listings.map((listing) => (
            <div key={listing._id} className="card col listing-card" style={{width: '20rem'}}>
              <Link to={`/listings/${listing._id}`}>
                <img src={listing.image.url} className="card-img-top" alt="listing-image" />
              </Link>
              <div className="card-body">
                <p className="card-text">
                  <b>{listing.title}</b><br />
                  &#8377; {listing.price.toLocaleString('en-IN')} / night
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row mt-3">
          <h3 className="mb-3 mt-3 col offset-4">No Listings related to {country}</h3>
        </div>
      )}
    </>
  );
}

export default ListingSearch;

