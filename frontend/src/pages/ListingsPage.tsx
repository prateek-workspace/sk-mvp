import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import BookingModal from '../components/BookingModal';
import Pagination from '../components/Pagination';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ListingsService } from '../services/listings.service';

import SEO from '../components/SEO';

const LISTINGS_PER_PAGE = 8;

const ListingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingToBook, setListingToBook] = useState<Listing | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const category = searchParams.get('category');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await ListingsService.getListings();
      setListings(data || []);
    } catch (error: any) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    if (!category) {
      return listings;
    }
    return listings.filter(listing => listing.type === category);
  }, [category, listings]);
  
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
    if (!user || user.role !== 'user') {
      toast.error('Please login as a user to book services');
      navigate('/login');
      return;
    }
    
    setSelectedListing(null);
    setListingToBook(listing);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setListingToBook(null);
    fetchListings(); // Refresh listings
    navigate('/dashboard/user/bookings');
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

  const getCategoryTitle = () => {
    switch (category) {
      case 'coaching': return 'Coaching Centers';
      case 'library': return 'Libraries';
      case 'pg': return 'Hostels & PGs';
      case 'tiffin': return 'Tiffin Services';
      default: return 'Student Services';
    }
  };

  const listingsPageSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${getCategoryTitle()} in Kanpur`,
    "description": `Find verified ${getCategoryTitle().toLowerCase()} in Kanpur, Uttar Pradesh. Best options near IIT Kanpur, CSJM University, HBTU.`,
    "url": `https://skstudentpath.com/listings${category ? `?category=${category}` : ''}`,
    "numberOfItems": filteredListings.length,
    "itemListElement": currentListings.map((listing, index) => ({
      "@type": "ListItem",
      "position": (currentPage - 1) * LISTINGS_PER_PAGE + index + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": listing.name,
        "description": listing.description,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kanpur",
          "addressRegion": "Uttar Pradesh",
          "addressCountry": "IN"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={category ? `Best ${getCategoryTitle()} in Kanpur | Student Prep Hub` : 'All Student Services in Kanpur | Coaching, PG, Hostels, Libraries'}
        description={category ? `Find top-rated ${getCategoryTitle().toLowerCase()} in Kanpur, UP. Verified listings near IIT Kanpur, CSJM University, HBTU. Compare prices, read reviews, book instantly.` : 'Discover verified coaching centers, PG accommodations, hostels, tiffin services & libraries in Kanpur. Kanpur\'s #1 student platform trusted by 2000+ students.'}
        keywords={`${getCategoryTitle().toLowerCase()} Kanpur, ${getCategoryTitle().toLowerCase()} near IIT Kanpur, best ${getCategoryTitle().toLowerCase()} Kanpur, affordable ${getCategoryTitle().toLowerCase()} Kanpur, ${getCategoryTitle().toLowerCase()} Kidwai Nagar, ${getCategoryTitle().toLowerCase()} Kakadeo, student services Kanpur UP`}
        canonical={`https://skstudentpath.com/listings${category ? `?category=${category}` : ''}`}
        schemaMarkup={listingsPageSchema}
        category={getCategoryTitle()}
      />
      <Navbar />

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
              {loading ? 'Loading...' : `Showing ${filteredListings.length} results.`}
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : currentListings.length > 0 ? (
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

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-surface">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground-muted text-sm">
              © 2026 SkStudentPath. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="mailto:info@skstudentpath.com" className="text-foreground-muted hover:text-primary transition-colors">info@skstudentpath.com</a>
              <Link to="/privacy-policy" className="text-foreground-muted hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/refund-policy" className="text-foreground-muted hover:text-primary transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      <ListingDetailsModal 
        listing={selectedListing} 
        onClose={() => setSelectedListing(null)} 
        onBook={handleBookNow}
      />

      {showBookingModal && listingToBook && (
        <BookingModal
          listing={listingToBook}
          onClose={() => {
            setShowBookingModal(false);
            setListingToBook(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ListingsPage;
