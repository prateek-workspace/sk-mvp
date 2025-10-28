import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Home,
  Coffee,
  Library,
  Search,
  MapPin,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import FloatingElements from '../components/FloatingElements';
import { mockListings } from '../data/mockData';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveBooking } from '../utils/storage';
import toast from 'react-hot-toast';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleBookNow = (listing: Listing) => {
    if (!user) {
      toast.error('Please log in to make a booking.');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
        toast.error('Only students can make bookings.');
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
    toast.success('Booking request sent successfully!');
  };

  const categories = [
    { id: 'coaching' as const, icon: BookOpen, title: 'Coaching Centers' },
    { id: 'pg' as const, icon: Home, title: 'Hostels & PG' },
    { id: 'library' as const, icon: Library, title: 'Libraries' },
    { id: 'tiffin' as const, icon: Coffee, title: 'Tiffin Services' },
  ];

  const articles = [
    {
      date: 'May 7, 2025',
      title: 'Top Tips for Finding the Perfect Rental',
      description: 'Discover expert advice on how to find the ideal student rental property that meets your needs and budget.',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
      main: true
    },
    {
      date: 'April 25, 2025',
      title: 'Managing Your Rental Items: A Guide',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&h=150&fit=crop',
    },
    {
      date: 'January 9, 2025',
      title: 'Navigating the Market: Insights for Renters',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=150&fit=crop',
    },
    {
      date: 'April 7, 2025',
      title: 'Maximizing Returns: Strategies for Owners',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=150&fit=crop',
    },
  ];

  const metrics = [
    { value: '500+', label: 'Total Services' },
    { value: '2000+', label: 'Active Students' },
    { value: '30+', label: 'Cities Covered' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ListingDetailsModal listing={selectedListing} onClose={() => setSelectedListing(null)} onBook={handleBookNow} />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen bg-cover bg-center hero-bg-light dark:hero-bg-dark">
          <FloatingElements />
          <div className="relative z-10 flex flex-col items-center justify-center text-center text-foreground-default px-4 min-h-screen">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight"
            >
              Discover Your <span className="text-primary">Perfect</span> Student Hub
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-foreground-muted mb-8 max-w-2xl"
            >
              Find and book top-rated student services in just a few clicks.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-3xl bg-background p-4 rounded-xl shadow-lg border border-border"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input type="text" placeholder="Search for coachings, PGs..." className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="relative w-full md:w-auto">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <select className="w-full md:w-56 h-14 pl-12 pr-8 bg-surface border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Select Location</option>
                    <option>Kota</option>
                    <option>Delhi</option>
                  </select>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto h-14 px-8 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Category Sections */}
        {categories.map((category, index) => {
          const listingsForCategory = mockListings.filter(l => l.type === category.id).slice(0, 3);
          if (listingsForCategory.length === 0) return null;

          return (
            <section key={category.id} className={`py-24 ${index % 2 !== 0 ? 'bg-surface' : 'bg-background'}`}>
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-4 text-foreground-default">Explore Top {category.title}</h2>
                <p className="text-center text-foreground-muted mb-12">Handpicked selections for you.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {listingsForCategory.map((listing, idx) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                    >
                      <ListingCard listing={listing} onViewDetails={handleViewDetails} />
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-16">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link
                      to={`/listings?category=${category.id}`}
                      className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-primary/30"
                    >
                      View More {category.title}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}

        {/* Metrics Section */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {metrics.map((metric, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <p className="text-5xl font-bold text-primary">{metric.value}</p>
                  <p className="text-lg text-gray-300 mt-2">{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section id="articles" className="py-24 bg-surface">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground-default">Important Articles</h2>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {articles.filter(a => a.main).map(article => (
                <motion.div 
                  key={article.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="cursor-pointer group"
                >
                  <div className="rounded-xl overflow-hidden mb-6">
                    <img src={article.image} alt={article.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-sm text-foreground-muted mb-2">{article.date}</p>
                  <h3 className="text-2xl font-bold text-foreground-default mb-3 group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="text-foreground-muted">{article.description}</p>
                </motion.div>
              ))}
              <div className="space-y-8">
                {articles.filter(a => !a.main).map((article, idx) => (
                  <motion.div 
                    key={article.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="flex items-center gap-6 group cursor-pointer"
                  >
                    <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground-muted mb-1">{article.date}</p>
                      <h4 className="font-bold text-foreground-default group-hover:text-primary transition-colors">{article.title}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-gray-400">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
          >
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className="text-xl font-bold text-white mb-4">PrepHub</h3>
                <p className="text-sm mb-4">India's largest platform designed to create an online rental community for students.</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-white mb-4">Navigation</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-primary">About Us</a></li>
                  <li><a href="#" className="hover:text-primary">Blog</a></li>
                  <li><a href="#" className="hover:text-primary">Terms of Use</a></li>
                  <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-white mb-4">Top Categories</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/listings?category=coaching" className="hover:text-primary">Coaching</Link></li>
                  <li><Link to="/listings?category=pg" className="hover:text-primary">Hostels & PG</Link></li>
                  <li><Link to="/listings?category=library" className="hover:text-primary">Libraries</Link></li>
                  <li><Link to="/listings?category=tiffin" className="hover:text-primary">Tiffin</Link></li>
                </ul>
              </div>
              <div className="md:col-span-4">
                <h4 className="font-semibold text-white mb-4">Subscribe to Our Newsletter</h4>
                <p className="text-sm mb-4">Stay updated with the latest listings and rental tips.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600">Subscribe</button>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm">
              <p>© 2025 Student Prep Hub. Designed and Developed by Dualite.</p>
            </div>
          </motion.div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
