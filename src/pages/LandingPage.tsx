import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Home,
  Coffee,
  Library,
  Search,
  ShieldCheck,
  CalendarCheck,
  Star,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import { mockListings, mockReviews } from '../data/mockData';
import { Listing, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveBooking } from '../utils/storage';

const TestimonialCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-background p-6 rounded-xl border border-border h-full flex flex-col shadow-subtle">
    <div className="flex items-center mb-4">
      <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h4 className="font-semibold text-foreground-default">{review.author}</h4>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
          ))}
        </div>
      </div>
    </div>
    <p className="text-foreground-muted text-sm italic">"{review.comment}"</p>
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleBookNow = (listing: Listing) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
        alert("Only students can make bookings.");
        return;
    }
    
    const booking = {
      id: `BK${Date.now()}`,
      listingId: listing.id,
      userId: user.id,
      userName: user.full_name || 'Student',
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

  const categories = [
    { id: 'coaching', icon: BookOpen, title: 'Coaching Centers' },
    { id: 'library', icon: Library, title: 'Libraries' },
    { id: 'pg', icon: Home, title: 'Hostels & PG' },
    { id: 'tiffin', icon: Coffee, title: 'Tiffin Services' },
  ];

  const whyChooseUsFeatures = [
    {
      icon: ShieldCheck,
      title: 'Verified Listings',
      description: 'Every service is vetted for quality and safety, so you can choose with confidence.',
    },
    {
      icon: CalendarCheck,
      title: 'Seamless Booking',
      description: 'Book your spot in just a few clicks and manage everything from one simple dashboard.',
    },
    {
      icon: Star,
      title: 'Genuine Reviews',
      description: 'Make informed decisions with thousands of genuine reviews from students like you.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ListingDetailsModal listing={selectedListing} onClose={() => setSelectedListing(null)} onBook={handleBookNow} />
      
      {showBookingConfirm && (
        <div className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Booking request sent successfully!
        </div>
      )}

      <main className="pt-20">
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-foreground-default">
              Find Your Focus. Fuel Your Future.
            </h1>
            <p className="text-lg text-foreground-muted mb-10 max-w-3xl mx-auto">
              The best student services, all in one place. Discover top-rated coaching, comfortable hostels, quality tiffin, and quiet libraries.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative shadow-md-deep rounded-full">
                <input
                  type="text"
                  placeholder="Search for coaching, PGs, tiffin..."
                  className="w-full pl-6 pr-32 py-4 bg-background border border-border rounded-full text-foreground-default placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-primary text-white rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </motion.div>
        </section>
        
        <section className="py-20 bg-surface">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              {whyChooseUsFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground-default mb-2">{feature.title}</h3>
                  <p className="text-foreground-muted">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-xl mx-auto">
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
                    <p className="text-foreground-muted mt-1">Handpicked selections for you.</p>
                  </motion.div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {categoryListings.slice(0, 4).map((listing, idx) => (
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
                  <div className="mt-8">
                    <Link
                      to={`/listings?category=${category.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground-default border border-border rounded-lg text-sm font-semibold hover:bg-surface transition-colors shadow-sm"
                    >
                      Show all {category.title}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="py-20 bg-surface">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground-default">What Our Students Say</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockReviews.slice(0, 3).map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TestimonialCard review={review} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border mt-10">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-foreground-muted">
            © 2025 Student Prep Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
