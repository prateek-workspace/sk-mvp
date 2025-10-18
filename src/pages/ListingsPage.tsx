import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import Pagination from '../components/Pagination';
import { mockListings } from '../data/mockData';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveBooking } from '../utils/storage';

const LISTINGS_PER_PAGE = 8;

const ListingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const category = searchParams.get('category');

  const filteredListings = useMemo(() => {
    if (!category) {
      return mockListings;
    }
    return mockListings.filter(listing => listing.type === category);
  }, [category]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const totalPages = Math.ceil(filteredListings.length / LISTINGS_PER_PAGE);

  const currentListings = useMemo(() => {
    const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
    const endIndex = startIndex + LISTINGS_PER_PAGE;
    return filteredListings.slice(startIndex, endIndex);
  }, [currentPage, filteredListings]);

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
    setSelectedListing(null);
    setShowBookingConfirm(true);
    setTimeout(() => setShowBookingConfirm(false), 3000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const getPageTitle = () => {
    if (!category) return "All Services";
    switch (category) {
      case 'coaching': return "Coaching Centers";
      case 'library': return "Libraries";
      case 'pg': return "Hostels & PGs";
      case 'tiffin': return "Tiffin Services";
      default: return "All Services";
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ListingDetailsModal listing={selectedListing} onClose={() => setSelectedListing(null)} onBook={handleBookNow} />
      
      {showBookingConfirm && (
        <div className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Booking request sent successfully!
        </div>
      )}

      <main className="pt-28 pb-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground-default">{getPageTitle()}</h1>
            <p className="text-lg text-foreground-muted mt-2">
              Showing {filteredListings.length} results.
            </p>
          </motion.div>

          {currentListings.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {currentListings.map((listing, idx) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ListingCard listing={listing} onViewDetails={handleViewDetails} />
                  </motion.div>
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-foreground-default">No Listings Found</h2>
              <p className="text-foreground-muted mt-2">There are no listings available in this category at the moment.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-foreground-muted">
            © 2025 Student Prep Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ListingsPage;
