import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../utils/storage';
import { mockListings } from '../data/mockData';
import { Booking } from '../types';
import OwnerDashboard from '../components/dashboard/OwnerDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';

const Dashboard: React.FC = () => {
  const { role } = useParams();
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role || ''} />

      <main className="ml-64">
        <header className="flex items-center justify-between h-16 px-8 border-b border-border">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="text-sm text-foreground-muted">
                {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </header>
        <div className="p-8">
          {user.role === 'student' ? (
            <StudentDashboard user={user} bookings={bookings} />
          ) : (
            <OwnerDashboard user={user} bookings={bookings} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
