import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
    {children}
  </a>
);

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/dashboard/${user.role}`;
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
             <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="var(--color-primary)"/>
              <path d="M16.0002 7.99999C18.1219 7.99999 19.8335 9.71158 19.8335 11.8333C19.8335 13.955 18.1219 15.6667 16.0002 15.6667C13.8784 15.6667 12.1668 13.955 12.1668 11.8333C12.1668 9.71158 13.8784 7.99999 16.0002 7.99999Z" fill="white"/>
              <path d="M22.1668 21.3333C22.1668 24 19.8335 24 16.0002 24C12.1668 24 9.8335 24 9.8335 21.3333C9.8335 18.6667 12.1668 17 16.0002 17C19.8335 17 22.1668 18.6667 22.1668 21.3333Z" fill="white"/>
            </svg>
            <span className="text-xl font-bold text-foreground-default hidden sm:inline">
              PrepHub
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/listings" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Browse Listings
            </Link>
            <NavLink href="/#categories">Categories</NavLink>
            <NavLink href="/#about">About Us</NavLink>
            <NavLink href="/#testimonials">Testimonials</NavLink>
            <NavLink href="/#contact">Contact</NavLink>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
               <div className="flex items-center gap-4">
                <Link to={getDashboardLink()} className="flex items-center gap-2 text-sm font-semibold text-foreground-default hover:text-primary transition-colors">
                    <UserIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full hover:bg-surface"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-foreground-default rounded-lg text-sm font-semibold hover:bg-surface transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-rose-600 transition-colors flex items-center gap-2 shadow-lg shadow-primary/30"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Post Listing</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
