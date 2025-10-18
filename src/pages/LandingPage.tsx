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
  GitCompareArrows,
  Bookmark,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import { mockListings, mockReviews } from '../data/mockData';
import { Listing, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveBooking } from '../utils/storage';

const TestimonialCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-surface p-6 rounded-xl border border-border h-full flex flex-col">
    <div className="flex items-center mb-4">
      <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h4 className="font-semibold text-foreground-default">{review.author}</h4>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
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
      description: 'Every service on our platform is carefully vetted for quality, safety, and reliability, so you can choose with confidence.',
    },
    {
      icon: CalendarCheck,
      title: 'Seamless Booking',
      description: 'Book your spot in just a few clicks. Get instant confirmations and manage all your bookings from one simple dashboard.',
    },
    {
      icon: Star,
      title: 'Genuine Reviews',
      description: 'Make informed decisions with thousands of genuine reviews and ratings from a community of students just like you.',
    },
  ];

  const howItWorksSteps = [
    {
      icon: Search,
      title: '1. Search & Discover',
      description: 'Use our powerful search to find services by category, location, and rating.',
    },
    {
      icon: GitCompareArrows,
      title: '2. Compare & Decide',
      description: 'Easily compare features, prices, and student reviews to find your perfect match.',
    },
    {
      icon: Bookmark,
      title: '3. Book & Secure',
      description: 'Secure your service directly through our platform with a simple and safe booking process.',
    },
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
              Your All-in-One Hub for <span className="text-primary">Student Success.</span>
            </h1>
            <p className="text-xl text-foreground-muted mb-10 max-w-3xl mx-auto">
              Discover top-rated coaching, comfortable hostels, quality tiffin services, and quiet libraries. Everything you need to ace your exams is right here.
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
        
        <section className="py-20 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground-default">Why Student Prep Hub?</h2>
              <p className="text-lg text-foreground-muted mt-2">The ultimate toolkit for your preparation journey.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {whyChooseUsFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-background rounded-full mx-auto mb-4 border border-border">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground-default mb-2">{feature.title}</h3>
                  <p className="text-foreground-muted">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground-default">Get Started in 3 Easy Steps</h2>
            </motion.div>
            <div className="relative flex justify-center">
              <div className="absolute left-1/2 top-8 h-full w-px bg-border hidden md:block" aria-hidden="true"></div>
              <div className="grid md:grid-cols-3 gap-12 max-w-4xl">
                {howItWorksSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-surface rounded-full mb-4 border-2 border-primary z-10">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground-default mb-2">{step.title}</h3>
                    <p className="text-foreground-muted">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground-default">What Our Students Say</h2>
              <p className="text-lg text-foreground-muted mt-2">Real stories from students who found their perfect fit.</p>
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
                    className="mb-8 flex justify-between items-center"
                  >
                    <h2 className="text-3xl font-bold text-foreground-default">{category.title}</h2>
                    <Link
                      to={`/listings?category=${category.id}`}
                      className="px-4 py-2 bg-surface text-primary border border-border rounded-lg text-sm font-semibold hover:bg-primary/10 transition-colors"
                    >
                      View All
                    </Link>
                  </motion.div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryListings.slice(0, 3).map((listing, idx) => (
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

        <section className="py-20">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-foreground-default mb-4">Ready to Find Your Perfect Fit?</h2>
            <p className="text-lg text-foreground-muted mb-8">
              Join thousands of students who have simplified their preparation journey. Explore listings or create an account to get started.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="#coaching"
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Explore Listings
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-surface text-foreground-default border border-border rounded-lg font-semibold hover:bg-white/5 transition-colors"
              >
                Create Account
              </Link>
            </div>
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
