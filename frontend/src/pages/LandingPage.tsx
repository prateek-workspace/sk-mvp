import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Home,
  Coffee,
  Library,
  Search,
  Star,
  Quote,
  Heart,
  Send,
  Users,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import FloatingElements from '../components/FloatingElements';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ListingsService } from '../services/listings.service';
import { BookingsService } from '../services/bookings.service';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleBookNow = async (listing: Listing) => {
    if (!user) {
      toast.error('Please log in to make a booking.');
      navigate('/login');
      return;
    }
    if (user.role !== 'student' && user.role !== 'user') {
      toast.error('Only students can make bookings.');
      return;
    }
    
    try {
      const response = await BookingsService.createBooking({
        listing_id: listing.id,
        quantity: 1,
      });

      if (response?.booking) {
        setSelectedListing(null);
        toast.success('Booking request sent successfully!');
        navigate(`/dashboard/${user.role}/bookings`);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your message! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };

  const categories = [
    { id: 'coaching' as const, icon: BookOpen, title: 'Coaching Centers' },
    { id: 'pg' as const, icon: Home, title: 'Hostels & PG' },
    { id: 'library' as const, icon: Library, title: 'Libraries' },
    { id: 'tiffin' as const, icon: Coffee, title: 'Tiffin Services' },
  ];

  const metrics = [
    { value: `${listings.length}+`, label: 'Total Services' },
    { value: '2000+', label: 'Active Students' },
    { value: '30+', label: 'Cities Covered' },
  ];
  
  // Get featured listings (limit to 6)
  const featuredListings = listings.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ListingDetailsModal listing={selectedListing} onClose={() => setSelectedListing(null)} onBook={handleBookNow} />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen bg-cover bg-center hero-bg-light dark:hero-bg-dark">
          <FloatingElements />
          <div className="relative z-10 flex flex-col items-center justify-end text-center text-foreground-default px-4 min-h-screen pb-24">
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
              className="w-full max-w-2xl bg-background p-4 rounded-xl shadow-lg border border-border"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input type="text" placeholder="Search for coachings, PGs, tiffins..." className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 w-full max-w-3xl grid grid-cols-3 gap-8 text-center"
            >
              {metrics.map((metric, idx) => (
                <div key={idx}>
                  <p className="text-3xl md:text-4xl font-bold text-primary">{metric.value}</p>
                  <p className="text-sm md:text-base text-foreground-muted mt-1">{metric.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Dynamic Category Sections */}
        {categories.map((category, index) => {
          const listingsForCategory = listings.filter(l => l.type === category.id).slice(0, 3);
          if (listingsForCategory.length === 0) return null;

          return (
            <section key={category.id} id={index === 0 ? 'categories' : undefined} className={`py-24 ${index % 2 !== 0 ? 'bg-surface' : 'bg-background'}`}>
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

        {/* About Us Section */}
        <section id="about" className="py-24 bg-surface">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground-default mb-4">About PrepHub</h2>
              <p className="text-foreground-muted mb-4">
                Student Prep Hub was born from a simple idea: to make the journey of ambitious students easier. Finding the right coaching, a safe place to stay, and healthy food shouldn't be a hassle.
              </p>
              <p className="text-foreground-muted">
                We are building India's largest online rental community, connecting students with verified service providers. Our mission is to provide a one-stop platform that is trustworthy, convenient, and tailored to the unique needs of students.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="aspect-video rounded-xl overflow-hidden shadow-lg"
            >
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" alt="Team working" className="w-full h-full object-cover"/>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section - Hidden until we have real reviews */}
        {/* 
        <section id="testimonials" className="py-24 bg-background">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground-default">What Our Students Say</h2>
            <p className="text-center text-foreground-muted mb-12 max-w-2xl mx-auto">Real stories from students who found their perfect fit on PrepHub.</p>
            <div className="text-center py-12">
              <p className="text-foreground-muted">Reviews coming soon...</p>
            </div>
          </div>
        </section>
        */}

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-surface">
          <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground-default mb-4">Get In Touch</h2>
            <p className="text-foreground-muted mb-12">Have questions or feedback? We'd love to hear from you.</p>
            <motion.form 
              onSubmit={handleContactSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-background p-8 rounded-xl border border-border shadow-lg space-y-6 text-left"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground-muted">Full Name</label>
                  <input type="text" placeholder="John Doe" required className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground-muted">Email Address</label>
                  <input type="email" placeholder="you@example.com" required className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">Message</label>
                <textarea placeholder="Your message..." rows={5} required className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
              </div>
              <div className="text-right">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center gap-2 shadow-lg shadow-primary/30 inline-flex"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </motion.button>
              </div>
            </motion.form>
          </div>
        </section>


        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400">
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
                  <li><a href="#about" className="hover:text-primary">About Us</a></li>
                  <li><a href="#testimonials" className="hover:text-primary">Testimonials</a></li>
                  <li><a href="#contact" className="hover:text-primary">Contact</a></li>
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
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground-default focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 shadow-lg shadow-primary/30">Subscribe</button>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm">
              <p>© 2025 Student Prep Hub. Designed and Developed with ❤️ by <strong>Prateek Srivastava</strong>.</p>
            </div>
          </motion.div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
