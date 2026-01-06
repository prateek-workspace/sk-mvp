import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCog,
  User as UserIcon,
  Home,
  Search,
  DollarSign,
  QrCode,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { motion } from 'framer-motion';

interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const ownerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/${role}` },
    { icon: FileText, label: 'My Listings', path: `/dashboard/${role}/listings` },
    { icon: Users, label: 'Bookings', path: `/dashboard/${role}/bookings` },
    { icon: Settings, label: 'Settings', path: `/dashboard/${role}/settings` },
  ];

  const userMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/${role}` },
    { icon: Users, label: 'My Bookings', path: `/dashboard/${role}/bookings` },
    { icon: Settings, label: 'Profile', path: `/dashboard/${role}/settings` },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Building2, label: 'Manage Listings', path: '/admin/listings' },
    { icon: UserCog, label: 'Manage Users', path: '/admin/users' },
    { icon: CheckCircle, label: 'Payment Verification', path: '/admin/payment-verification' },
    { icon: DollarSign, label: 'Transactions', path: '/admin/transactions' },
    { icon: QrCode, label: 'Payment Settings', path: '/admin/payment-settings' },
    { icon: Settings, label: 'Settings', path: `/dashboard/${role}/settings` },
  ];

  // Admin gets special menu, regular users don't have listings, service owners do
  const menuItems = role === 'admin' ? adminMenuItems : (role === 'user' ? userMenuItems : ownerMenuItems);
  
  const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '5rem' },
  };
  
  const textVariants = {
    open: { opacity: 1, display: 'inline' },
    closed: { opacity: 0, display: 'none' },
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <motion.aside
        animate={isCollapsed ? 'closed' : 'open'}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 h-screen bg-background border-r border-border z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center h-20 px-6 border-b border-border flex-shrink-0 overflow-hidden">
          <Link to="/" className="flex items-center space-x-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="var(--color-accent)"/>
              <path d="M16.0002 7.99999C18.1219 7.99999 19.8335 9.71158 19.8335 11.8333C19.8335 13.955 18.1219 15.6667 16.0002 15.6667C13.8784 15.6667 12.1668 13.955 12.1668 11.8333C12.1668 9.71158 13.8784 7.99999 16.0002 7.99999Z" fill="white"/>
              <path d="M22.1668 21.3333C22.1668 24 19.8335 24 16.0002 24C12.1668 24 9.8335 24 9.8335 21.3333C9.8335 18.6667 12.1668 17 16.0002 17C19.8335 17 22.1668 18.6667 22.1668 21.3333Z" fill="white"/>
            </svg>
            <motion.span variants={textVariants} className="text-xl font-bold text-accent whitespace-nowrap">
              SkStudentPath
            </motion.span>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {/* Navigation Links */}
          <div className="pb-2 mb-2 border-b border-border space-y-2">
            <Link
              to="/"
              title={isCollapsed ? 'Home' : ''}
              className={`flex items-center space-x-3 rounded-lg text-sm font-semibold transition-all overflow-hidden ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'} ${
                location.pathname === '/'
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground-muted hover:bg-surface hover:text-foreground-default'
              }`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <motion.span variants={textVariants} className="whitespace-nowrap">Home</motion.span>
            </Link>
            <Link
              to="/listings"
              title={isCollapsed ? 'Browse Listings' : ''}
              className={`flex items-center space-x-3 rounded-lg text-sm font-semibold transition-all overflow-hidden ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'} ${
                location.pathname === '/listings'
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground-muted hover:bg-surface hover:text-foreground-default'
              }`}
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              <motion.span variants={textVariants} className="whitespace-nowrap">Browse Listings</motion.span>
            </Link>
          </div>

          {/* Dashboard Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={`flex items-center space-x-3 rounded-lg text-sm font-semibold transition-all overflow-hidden ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'} ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground-muted hover:bg-surface hover:text-foreground-default'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <motion.span variants={textVariants} className="whitespace-nowrap">{item.label}</motion.span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center">
              {user?.profile_image ? (
                <img src={user.profile_image} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-primary" />
              )}
            </div>
            <motion.div variants={textVariants} className="leading-tight whitespace-nowrap">
              <p className="font-semibold text-sm text-foreground-default">{user?.name}</p>
              <p className="text-xs text-foreground-muted capitalize">{user?.role} Account</p>
            </motion.div>
            <motion.button 
              variants={textVariants} 
              onClick={handleSignOut} 
              className="ml-auto text-foreground-muted hover:text-accent"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
          <button onClick={toggleCollapse} className="hidden lg:flex items-center justify-center w-full mt-2 p-2 rounded-lg text-foreground-muted hover:bg-surface hover:text-primary">
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
