import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  setAuth: (token: string, user: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, hydrate auth state from localStorage
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.setToken(storedToken);
        console.log('Auth: Restored session from localStorage', { user: parsedUser.email });
      } catch (e) {
        console.error('Auth: Failed to parse stored user', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const setAuth = (newToken: string, newUser: User) => {
    console.log('Auth: Setting new auth state', { user: newUser.email });
    setToken(newToken);
    setUser(newUser);
    api.setToken(newToken);
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const signOut = async () => {
    console.log('Auth: Signing out');
    setToken(null);
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Force navigation to login will be handled by the component calling signOut
  };

  const value = { token, user, loading, setAuth, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
