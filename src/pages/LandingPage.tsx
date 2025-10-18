import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Home,
  Coffee,
  Library,
  Search,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import { mockListings } from '../data/mockData';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveBooking } from '../utils/storage';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleBookNow = (listing: Listing) => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    
    const booking = {
      id: `BK${Date.now()}`,
      listingId: listing.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      amount: listing.price,
    };

    saveBooking(booking);
    setSelectedListing(null); // Close the modal
    setShowBookingConfirm(true);
    setTimeout(() => setShowBookingConfirm(false), 3000);
  };

  const categories = [
    { id: 'coaching', icon: BookOpen, title: 'Coaching Centers' },
    { id: 'library', icon: Library, title: 'Libraries' },
    { id: 'pg', icon: Home, title: 'Hostels & PG' },
    { id: 'tiffin', icon: Coffee, title: 'Tiffin Services' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ListingDetailsModal listing={selectedListing} onClose={() => setSelectedListing(null)} onBook={handleBookNow} />
      
      {showBookingConfirm && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Booking request sent successfully!
        </div>
      )}

      <main>
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground-default">
              Domains that Define Your{' '}
              <span className="text-primary">Identity.</span>
            </h1>
            <p className="text-xl text-foreground-muted mb-10 max-w-3xl mx-auto">
              Find the best coaching centers, libraries, hostels, and tiffin services
              all in one place. Your preparation journey starts here.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for your-dream-service..."
                  className="w-full pl-6 pr-28 py-4 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-primary text-white rounded-md font-medium hover:opacity-90 transition-opacity">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {categories.map((category) => {
              const categoryListings = mockListings.filter((l) => l.type === category.id);
              return (
                <section key={category.id} id={category.id} className="mb-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="mb-8"
                  >
                    <h2 className="text-3xl font-bold text-foreground-default">{category.title}</h2>
                  </motion.div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryListings.map((listing, idx) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <ListingCard listing={listing} onViewDetails={handleViewDetails} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-foreground-muted">
            © 2025 Student Prep Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
