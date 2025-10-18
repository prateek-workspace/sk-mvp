import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground-default">
              Student Prep Hub
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/#coaching" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                Coaching
              </Link>
              <Link to="/#library" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                Library
              </Link>
              <Link to="/#pg" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                Hostels
              </Link>
              <Link to="/#tiffin" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                Tiffin
              </Link>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 text-foreground-muted hover:text-primary transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-foreground-muted hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
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
