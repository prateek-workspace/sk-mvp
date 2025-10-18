import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BookingsPage from './pages/BookingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/:role" element={<Dashboard />} />
          <Route path="/dashboard/:role/bookings" element={<BookingsPage />} />
          <Route
            path="/dashboard/:role/listings"
            element={<Dashboard />} // Placeholder, can be a new component
          />
          <Route
            path="/dashboard/:role/settings"
            element={<Dashboard />} // Placeholder, can be a new component
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
