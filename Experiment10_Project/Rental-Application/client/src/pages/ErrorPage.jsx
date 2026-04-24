import { Link } from 'react-router-dom';

function ErrorPage() {
  return (
    <div className="row mt-5">
      <div className="col-8 offset-2 text-center">
        <h1>404</h1>
        <h2>Page NOT Found!!</h2>
        <p className="mt-3">The page you are looking for does not exist.</p>
        <Link to="/listings" className="btn btn-primary mt-3">Go to Home</Link>
      </div>
    </div>
  );
}

export default ErrorPage;

