import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { toast } from 'react-hot-toast';
import OwnerDashboard from '../components/dashboard/OwnerDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { BookingsService } from '../services/bookings.service';

const Dashboard: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect to correct role dashboard if URL doesn't match user role
    if (user.role !== role) {
      navigate(`/dashboard/${user.role}`, { replace: true });
      return;
    }

    fetchBookings();
  }, []);  // Run only once on mount

  // Separate effect to handle user/role changes
  useEffect(() => {
    if (user && user.role === role) {
      fetchBookings();
    }
  }, [user?.id, role]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingsService.getBookings();
      setBookings(data || []);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !role) return null;

  if (loading) {
    return (
      <DashboardLayout role={role} pageTitle="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role} pageTitle="Dashboard">
      {user.role === 'user' ? (
        <StudentDashboard user={user} bookings={bookings} />
      ) : (
        <OwnerDashboard user={user} bookings={bookings} onBookingUpdate={fetchBookings} />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
