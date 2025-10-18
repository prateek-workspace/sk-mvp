import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const ownerMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: `/dashboard/${role}`,
    },
    {
      icon: FileText,
      label: 'My Listings',
      path: `/dashboard/${role}/listings`,
    },
    {
      icon: Users,
      label: 'Bookings',
      path: `/dashboard/${role}/bookings`,
    },
    {
      icon: Settings,
      label: 'Settings',
      path: `/dashboard/${role}/settings`,
    },
  ];

  const studentMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: `/dashboard/${role}`,
    },
    {
      icon: Users,
      label: 'My Bookings',
      path: `/dashboard/${role}/bookings`,
    },
    {
      icon: Settings,
      label: 'Settings',
      path: `/dashboard/${role}/settings`,
    },
  ];

  const menuItems = role === 'student' ? studentMenuItems : ownerMenuItems;

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen fixed left-0 top-0 flex flex-col">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground-default">
            Student Prep Hub
          </span>
        </Link>
      </div>

      <nav className="flex-grow p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path.includes('listings') && location.pathname.includes('listings'));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground-muted hover:bg-white/5 hover:text-foreground-default'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt={user?.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold text-sm text-foreground-default">{user?.name}</p>
            <p className="text-xs text-foreground-muted capitalize">{user?.role} Account</p>
          </div>
          <button onClick={logout} className="ml-auto text-foreground-muted hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
