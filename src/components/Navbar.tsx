import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/dashboard/${user.role}`;
  };

  return (
    <header className="fixed w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="var(--color-accent)"/>
              <path d="M16.0002 7.99999C18.1219 7.99999 19.8335 9.71158 19.8335 11.8333C19.8335 13.955 18.1219 15.6667 16.0002 15.6667C13.8784 15.6667 12.1668 13.955 12.1668 11.8333C12.1668 9.71158 13.8784 7.99999 16.0002 7.99999Z" fill="white"/>
              <path d="M22.1668 21.3333C22.1668 24 19.8335 24 16.0002 24C12.1668 24 9.8335 24 9.8335 21.3333C9.8335 18.6667 12.1668 17 16.0002 17C19.8335 17 22.1668 18.6667 22.1668 21.3333Z" fill="white"/>
            </svg>
            <span className="text-xl font-bold text-accent hidden sm:inline">
              PrepHub
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#coaching" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Coaching
            </Link>
            <Link to="/#library" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Library
            </Link>
            <Link to="/#pg" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Hostels & PG
            </Link>
            <Link to="/#tiffin" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Tiffin
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
               <div className="flex items-center gap-2">
                <Link to={getDashboardLink()} className="flex items-center gap-2 p-2 rounded-full border border-border hover:shadow-md transition-shadow">
                    <Menu className="w-5 h-5 text-foreground-muted" />
                    <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-8 h-8 rounded-full" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-foreground-muted hover:text-accent transition-colors rounded-full hover:bg-surface"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
