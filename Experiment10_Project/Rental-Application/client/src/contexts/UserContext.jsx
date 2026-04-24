import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/current');
      if (response.data && response.data.user) {
        setCurrUser(response.data.user);
      } else {
        setCurrUser(null);
      }
    } catch (error) {
      setCurrUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await api.get('/logout');
      setCurrUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UserContext.Provider value={{ currUser, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

