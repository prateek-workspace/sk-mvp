import React from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../Sidebar';
import { useSidebar } from '../../context/SidebarContext';
import ThemeToggle from '../ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, pageTitle }) => {
  const { isCollapsed, setMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar role={role} />
      <main className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="flex items-center justify-between h-20 px-4 sm:px-8 border-b border-border bg-background sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-foreground-muted"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground-default">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm text-foreground-muted hidden sm:block">
              {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
