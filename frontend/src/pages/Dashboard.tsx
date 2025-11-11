import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../utils/storage';
import { mockListings } from '../data/mockData';
import { Booking } from '../types';
import OwnerDashboard from '../components/dashboard/OwnerDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const Dashboard: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user || user.role !== role) {
      navigate('/login');
      return;
    }

    const allBookings = getBookings();
    if (user.role === 'student') {
      setBookings(allBookings.filter((b) => b.userId === user.id));
    } else {
      const myListings = mockListings
        .filter((l) => l.ownerId === user.id)
        .map((l) => l.id);
      setBookings(allBookings.filter((b) => myListings.includes(b.listingId)));
    }
  }, [user, role, navigate]);

  if (!user || !role) return null;

  return (
    <DashboardLayout role={role} pageTitle="Dashboard">
      {user.role === 'student' ? (
        <StudentDashboard user={user} bookings={bookings} />
      ) : (
        <OwnerDashboard user={user} bookings={bookings} />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
