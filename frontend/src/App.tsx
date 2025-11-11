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
import ListingFormPage from './pages/ListingFormPage';

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
                <Route path="/dashboard/:role" element={<Dashboard />} />
                <Route path="/dashboard/:role/bookings" element={<BookingsPage />} />
                <Route path="/dashboard/:role/listings" element={<ManageListingsPage />} />
                <Route path="/dashboard/:role/listings/new" element={<ListingFormPage />} />
                <Route path="/dashboard/:role/listings/edit/:listingId" element={<ListingFormPage />} />
                <Route
                  path="/dashboard/:role/settings"
                  element={<Dashboard />} // Placeholder
                />
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
