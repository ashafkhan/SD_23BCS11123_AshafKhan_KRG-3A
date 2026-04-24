import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ListingsIndex from './pages/ListingsIndex';
import ListingShow from './pages/ListingShow';
import ListingNew from './pages/ListingNew';
import ListingEdit from './pages/ListingEdit';
import ListingSearch from './pages/ListingSearch';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <UserProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <div className="container" style={{ flex: 1 }}>
            <Routes>
              <Route path="/listings" element={<ListingsIndex />} />
              <Route path="/listings/category/:category" element={<ListingsIndex />} />
              <Route path="/listings/search" element={<ListingSearch />} />
              <Route path="/listings/new" element={<ListingNew />} />
              <Route path="/listings/:id" element={<ListingShow />} />
              <Route path="/listings/:id/edit" element={<ListingEdit />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

