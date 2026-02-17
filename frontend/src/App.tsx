import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';

// Import ProtectedRoute normally (it's small and needed frequently)
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all page components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const ListingsPage = lazy(() => import('./pages/ListingsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const ManageListingsPage = lazy(() => import('./pages/ManageListingsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const ListingFormPage = lazy(() => import('./pages/ListingFormPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Admin pages - lazy loaded
const AdminListingsPage = lazy(() => import('./pages/admin/AdminListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/admin/ListingDetailPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const UserDetailPage = lazy(() => import('./pages/admin/UserDetailPage'));
const AdminTransactionsPage = lazy(() => import('./pages/admin/AdminTransactionsPage'));
const AdminPaymentSettingsPage = lazy(() => import('./pages/admin/AdminPaymentSettingsPage'));
const AdminPaymentVerificationPage = lazy(() => import('./pages/AdminPaymentVerificationPage'));

// Loading component - simple spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-rose-200 dark:border-rose-900 border-t-rose-500 rounded-full animate-spin" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

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
            
            {/* Wrap all routes with Suspense */}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />

                {/* Protected routes */}
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
                  <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                  <Route path="/admin/payment-settings" element={<AdminPaymentSettingsPage />} />
                  <Route path="/admin/payment-verification" element={<AdminPaymentVerificationPage />} />
                  
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
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;