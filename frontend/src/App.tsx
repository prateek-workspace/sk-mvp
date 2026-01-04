import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import BookingsPage from './pages/BookingsPage';
import ListingsPage from './pages/ListingsPage';
import ManageListingsPage from './pages/ManageListingsPage';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ListingFormPage from './pages/ListingFormPage';
import SettingsPage from './pages/SettingsPage';

// Admin pages
import AdminListingsPage from './pages/admin/AdminListingsPage';
import ListingDetailPage from './pages/admin/ListingDetailPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import UserDetailPage from './pages/admin/UserDetailPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                duration: 5000,
                style: {
                  background: 'var(--color-background)',
                  color: 'var(--color-foreground-default)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--tw-shadow-md-deep)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/listings" element={<ListingsPage />} />

              <Route element={<ProtectedRoute />}>
                {/* Role-based Dashboards */}
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/hostel" element={<OwnerDashboard />} />
                <Route path="/dashboard/coaching" element={<OwnerDashboard />} />
                <Route path="/dashboard/library" element={<OwnerDashboard />} />
                <Route path="/dashboard/tiffin" element={<OwnerDashboard />} />
                <Route path="/dashboard/:role" element={<Dashboard />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/listings" element={<AdminListingsPage />} />
                <Route path="/admin/listings/:id" element={<ListingDetailPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/:id" element={<UserDetailPage />} />
                
                {/* Common routes */}
                <Route path="/dashboard/:role/bookings" element={<BookingsPage />} />
                <Route path="/dashboard/:role/listings" element={<ManageListingsPage />} />
                <Route path="/dashboard/:role/listings/new" element={<ListingFormPage />} />
                <Route path="/dashboard/:role/listings/edit/:listingId" element={<ListingFormPage />} />
                <Route path="/dashboard/:role/settings" element={<SettingsPage />} />
                
                <Route path="/listings/new" element={<ListingFormPage />} />
                <Route path="/listings/:id/edit" element={<ListingFormPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/manage-listings" element={<ManageListingsPage />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
